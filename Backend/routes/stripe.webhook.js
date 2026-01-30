const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const admin = require('../firebaseAdmin');
const db = admin.firestore();

const paymentLogger = require('../config/payment.logger');
const { confirmacionReserva } = require('../services/mailer');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/* ======================================================
   HELPERS
====================================================== */

const isoDate = (value) => {
  // Firestore Timestamp
  if (value && typeof value.toDate === 'function') {
    return value.toDate().toISOString().split('T')[0];
  }
  // JS Date
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  // String already (e.g. "2026-01-20")
  if (typeof value === 'string') return value;
  return 'Sin fecha';
};

/**
 * Confirma la reserva (premium) en Firestore y envía email 1 sola vez.
 * Devuelve true si se envió el email, false si ya se había enviado.
 */
const confirmarReservaYEnviarEmail = async (reservaId, pagoUpdate = {}, fallbackEmail = null) => {
  const ref = db.collection('reservas').doc(reservaId);

  const tx = await db.runTransaction(async (t) => {
    const snap = await t.get(ref);

    if (!snap.exists) return { exists: false };

    const data = snap.data() || {};
    const alreadySent = !!data?.notificaciones?.emailConfirmacionEnviado;

    const updateData = {
      estado: 'confirmada',
      updatedAt: new Date(),
      ...pagoUpdate,
    };

    // Para evitar duplicados por reintentos del webhook
    if (!alreadySent) {
      updateData['notificaciones.emailConfirmacionEnviado'] =
        admin.firestore.FieldValue.serverTimestamp();
    }

    t.update(ref, updateData);

    return { exists: true, alreadySent, data };
  });

  if (!tx.exists) {
    paymentLogger.warn(`Reservation not found | reservationId=${reservaId}`);
    return false;
  }

  if (tx.alreadySent) {
    paymentLogger.info(`Email already sent (skipping) | reservationId=${reservaId}`);
    return false;
  }

  const reserva = tx.data || {};

  // Fallbacks por si faltan campos en la reserva
  const userEmail = reserva.userEmail || fallbackEmail;
  if (!userEmail) {
    paymentLogger.warn(`Missing userEmail, cannot send confirmation | reservationId=${reservaId}`);
    return false;
  }

  await confirmacionReserva(
    {
      userEmail,
      userNombre: reserva.userNombre || userEmail.split('@')[0],
      laboratorioNombre: reserva.laboratorioNombre || 'Laboratorio',
      fecha: isoDate(reserva.fecha),
      horaInicio: Number(reserva.horaInicio),
      horaFin: Number(reserva.horaFin),
      reservaId,
    },
    true
  );

  paymentLogger.info(`Confirmation email sent | reservationId=${reservaId} to=${userEmail}`);
  return true;
};

/* ======================================================
   STRIPE WEBHOOK
====================================================== */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const requestId = `stripe-${Date.now()}`;
    const sig = req.headers['stripe-signature'];
    let event;

    if (!endpointSecret) {
      paymentLogger.error('Missing STRIPE_WEBHOOK_SECRET', { requestId });
      return res.status(500).send('Webhook not configured');
    }

    // Verify Stripe signature
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      paymentLogger.error('Stripe webhook signature verification failed', {
        requestId,
        stack: err.stack,
      });
      return res.status(400).send('Invalid signature');
    }

    paymentLogger.info(`Stripe webhook received | type=${event.type}`, { requestId });

    try {
      /* =======================
         CHECKOUT COMPLETED
         (Stripe Checkout flow)
      ======================= */
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const reservaId = session.metadata?.reservaId;

        if (!reservaId) {
          paymentLogger.warn('Checkout completed without reservaId', { requestId });
          return res.status(200).json({ received: true });
        }

        await confirmarReservaYEnviarEmail(
          reservaId,
          {
            'pago.estado': 'pagado',
            'pago.transactionId': session.payment_intent,
            'pago.metodo': 'stripe_checkout',
          },
          session.customer_email
        );

        return res.status(200).json({ received: true });
      }

      /* =======================
         PAYMENT SUCCEEDED
         (PaymentIntent flow)
      ======================= */
      if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object;
        const reservaId = intent.metadata?.reservaId;

        if (!reservaId) {
          paymentLogger.warn('payment_intent.succeeded without reservaId', { requestId });
          return res.status(200).json({ received: true });
        }

        await confirmarReservaYEnviarEmail(
          reservaId,
          {
            'pago.estado': 'pagado',
            'pago.transactionId': intent.id,
            'pago.metodo': 'payment_intent',
          },
          intent.receipt_email
        );

        return res.status(200).json({ received: true });
      }

      /* =======================
         PAYMENT FAILED
      ======================= */
      if (event.type === 'payment_intent.payment_failed') {
        const intent = event.data.object;
        const reservaId = intent.metadata?.reservaId;

        const failureMessage =
          intent.last_payment_error?.message || 'Payment failed';

        if (!reservaId) {
          paymentLogger.warn('Payment failed without reservaId', { requestId });
          return res.status(200).json({ received: true });
        }

        await db.collection('reservas').doc(reservaId).update({
          estado: 'cancelada_pago_fallido',
          'pago.estado': 'fallido',
          'pago.error': failureMessage,
          updatedAt: new Date(),
        });

        paymentLogger.warn(`Payment failed | reservationId=${reservaId}`, { requestId });

        return res.status(200).json({ received: true });
      }

      // Ignore other events
      return res.status(200).json({ received: true });
    } catch (err) {
      paymentLogger.error('Error processing stripe webhook', {
        requestId,
        stack: err.stack,
      });
      return res.status(500).send('Webhook error');
    }
  }
);

module.exports = router;
