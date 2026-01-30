// Backend/routes/stripe.routes.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const admin = require("../firebaseAdmin");
const db = admin.firestore();

const paymentLogger = require("../config/payment.logger");

/* ----------------------------- Helpers ----------------------------- */

// Safe ISO ("YYYY-MM-DD") -> Date (midday avoids timezone day shift)
function isoToSafeDate(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

// Day start Timestamp (align with reservasController approach)
function dayStartTimestampFromISO(iso) {
  const base = isoToSafeDate(iso);
  base.setHours(0, 0, 0, 0);
  return admin.firestore.Timestamp.fromDate(base);
}

// Server-side price (never trust client price)
async function getPremiumPrice(laboratorioId) {
  const DEFAULT_PRICE = 5.0;

  try {
    const labSnap = await db.collection("laboratorios").doc(laboratorioId).get();
    if (!labSnap.exists) return DEFAULT_PRICE;

    const lab = labSnap.data() || {};
    // Adjust these keys to your real schema
    if (typeof lab.precioPremium === "number") return lab.precioPremium;
    if (typeof lab.premiumPrice === "number") return lab.premiumPrice;

    return DEFAULT_PRICE;
  } catch {
    return DEFAULT_PRICE;
  }
}

// Stable unique key to prevent duplicate pending reservations
function buildUniqueKey({ uid, laboratorioId, fechaISO, horaInicio, horaFin }) {
  return `${uid}__${laboratorioId}__${fechaISO}__${horaInicio}-${horaFin}`;
}

/* ======================================================
   POST /api/stripe/checkout
   - Uses uniqueKey to find/reuse pending reservation
   - Avoids reusing an expired Stripe session
   - Stores fecha as Timestamp (start of day)
====================================================== */
router.post(
  "/checkout",
  authMiddleware(["student", "professor"]),
  async (req, res, next) => {
    try {
      const {
        laboratorioId,
        laboratorioNombre,
        fecha, // "YYYY-MM-DD"
        horaInicio,
        horaFin,
      } = req.body;

      const { uid, email } = req.user;

      paymentLogger.info(
        `Checkout request | user=${uid} lab=${laboratorioId} date=${fecha} ${horaInicio}-${horaFin}`,
        { requestId: req.requestId }
      );

      // Minimal validation
      if (!laboratorioId || !fecha || horaInicio == null || horaFin == null) {
        return res.status(400).json({ error: "Incomplete data for checkout" });
      }

      // Compute consistent Timestamp for fecha
      const fechaTs = dayStartTimestampFromISO(fecha);

      // Resolve price from DB (server-side)
      const precio = await getPremiumPrice(laboratorioId);

      // Build a stable unique key (prevents duplicates)
      const uniqueKey = buildUniqueKey({
        uid,
        laboratorioId,
        fechaISO: fecha,
        horaInicio,
        horaFin,
      });

      // Find an existing pending reservation by uniqueKey
      const existingPending = await db
        .collection("reservas")
        .where("uniqueKey", "==", uniqueKey)
        .where("estado", "==", "pendiente")
        .limit(1)
        .get();

      let reservaRef;
      let reservaData = null;

      if (!existingPending.empty) {
        reservaRef = existingPending.docs[0].ref;
        reservaData = existingPending.docs[0].data() || {};

        paymentLogger.warn(
          `Reusing existing pending reservation | reservationId=${reservaRef.id}`,
          { requestId: req.requestId }
        );

        // If a previous Stripe session exists, check its status before creating a new one
        const oldSessionId = reservaData?.pago?.stripeSessionId;
        if (oldSessionId) {
          try {
            const oldSession = await stripe.checkout.sessions.retrieve(oldSessionId);

            // If already paid, don't create a new session
            if (oldSession.payment_status === "paid") {
              paymentLogger.info(
                `Stripe session already paid | sessionId=${oldSessionId} reservationId=${reservaRef.id}`,
                { requestId: req.requestId }
              );
              return res.status(200).json({
                status: "paid",
                reservaId: reservaRef.id,
                sessionId: oldSessionId,
              });
            }

            // If still open, reuse the same checkout URL
            if (oldSession.status === "open" && oldSession.url) {
              paymentLogger.info(
                `Reusing open Stripe session URL | sessionId=${oldSessionId} reservationId=${reservaRef.id}`,
                { requestId: req.requestId }
              );
              return res.json({ url: oldSession.url });
            }

            // If expired/complete/canceled, we will create a fresh session
            paymentLogger.warn(
              `Old Stripe session not reusable | status=${oldSession.status} payment_status=${oldSession.payment_status} sessionId=${oldSessionId}`,
              { requestId: req.requestId }
            );
          } catch (e) {
            // If retrieval fails, fallback to creating a new session
            paymentLogger.warn(
              `Failed to retrieve old Stripe session | sessionId=${oldSessionId} reservationId=${reservaRef.id}`,
              { requestId: req.requestId }
            );
          }
        }
      } else {
        // Create a new pending reservation with uniqueKey
        reservaRef = await db.collection("reservas").add({
          uniqueKey, // used to detect duplicates
          userId: uid,
          userEmail: email,
          laboratorioId,
          laboratorioNombre,
          fecha: fechaTs, // Timestamp (consistent)
          horaInicio,
          horaFin,
          estado: "pendiente",
          tipoAcceso: "premium",
          pago: {
            requerido: true,
            monto: precio,
            estado: "pendiente",
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          expiraEn: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 15 * 60 * 1000) // 15 min TTL
          ),
        });

        paymentLogger.info(
          `New pending reservation created | reservationId=${reservaRef.id}`,
          { requestId: req.requestId }
        );
      }

      // Make idempotency unique per attempt to avoid reusing an expired session
      const idempotencyKey = `${reservaRef.id}:${Date.now()}`;

      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          payment_method_types: ["card"],
          customer_email: email,

          // Session metadata used by checkout.session.completed webhook
          metadata: {
            reservaId: reservaRef.id,
            userId: uid,
            laboratorioId,
          },

          // PaymentIntent metadata used by payment_intent.succeeded webhook
          payment_intent_data: {
            metadata: {
              reservaId: reservaRef.id,
              userId: uid,
              laboratorioId,
            },
          },

          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Premium Reservation: ${laboratorioNombre || laboratorioId}`,
                  description: `Date: ${fecha} | ${horaInicio}:00 - ${horaFin}:00`,
                },
                unit_amount: Math.round(precio * 100),
              },
              quantity: 1,
            },
          ],

          // Include session_id to allow verify fallback in the success page
          success_url: `${process.env.CLIENT_URL}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.CLIENT_URL}/catalogo?payment=cancelled`,
        },
        { idempotencyKey }
      );

      // Store Stripe session id on the reservation
      await reservaRef.update({
        "pago.stripeSessionId": session.id,
        "pago.estado": "pendiente",
        "pago.updatedAt": admin.firestore.FieldValue.serverTimestamp(),
      });

      paymentLogger.info(
        `Stripe checkout session created | sessionId=${session.id} reservationId=${reservaRef.id}`,
        { requestId: req.requestId }
      );

      return res.json({ url: session.url });
    } catch (error) {
      paymentLogger.error("Error while creating Stripe checkout session", {
        requestId: req.requestId,
        stack: error.stack,
      });
      next(error);
    }
  }
);

router.get(
  "/verify",
  authMiddleware(["student", "professor"]),
  async (req, res) => {
    try {
      const sessionId = req.query.session_id;
      if (!sessionId) return res.status(400).json({ error: "Missing session_id" });

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== "paid") {
        return res.json({ ok: true, status: "pending" });
      }

      const reservaId = session.metadata?.reservaId;
      if (!reservaId) return res.status(400).json({ error: "Missing reservaId in metadata" });

      // Idempotent confirm: only updates if still not confirmed
      const ref = db.collection("reservas").doc(reservaId);
      const snap = await ref.get();
      if (snap.exists) {
        const data = snap.data() || {};
        if (data.estado !== "confirmada") {
          await ref.update({
            estado: "confirmada",
            "pago.estado": "pagado",
            "pago.stripeSessionId": session.id,
            "pago.paymentIntentId": session.payment_intent || null,
            "pago.confirmedAt": admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      return res.json({ ok: true, status: "confirmed", reservaId });
    } catch (e) {
      return res.status(500).json({ error: "Verify failed", details: e.message });
    }
  }
);

module.exports = router;
