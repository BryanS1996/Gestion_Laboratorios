const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const admin = require('../firebaseAdmin');
const db = admin.firestore();
const paymentLogger = require('../config/payment.logger');

/* ======================================================
   CREATE CHECKOUT SESSION (Stripe)
====================================================== */
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const {
      laboratorioId,
      laboratorioNombre,
      fecha,
      horaInicio,
      horaFin,
      precio = 5.0,
    } = req.body;

    const { uid, email } = req.user;

    // Log checkout creation attempt
    paymentLogger.info(
      `Checkout session creation attempt | user=${uid} lab=${laboratorioId} date=${fecha} time=${horaInicio}-${horaFin} price=${precio}`,
      { requestId: req.requestId }
    );

    const nuevaReserva = {
      userId: uid,
      userEmail: email,
      laboratorioId,
      laboratorioNombre: laboratorioNombre || 'Laboratorio',
      fecha,
      horaInicio,
      horaFin,
      tipoAcceso: 'premium',
      estado: 'pendiente',
      pago: {
        requerido: true,
        monto: precio,
        estado: 'pendiente',
      },
      expiraEn: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 15 * 60 * 1000)
      ),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Log reservation draft creation
    paymentLogger.info(
      `Pending premium reservation created | user=${uid}`,
      { requestId: req.requestId }
    );

    const reservaRef = await db.collection('reservas').add(nuevaReserva);
    const reservaId = reservaRef.id;

    // Log Firestore reservation ID
    paymentLogger.info(
      `Reservation stored for payment | reservationId=${reservaId}`,
      { requestId: req.requestId }
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Reserva Premium: ${laboratorioNombre || 'Lab'}`,
              description: `Fecha: ${fecha} | ${horaInicio}:00 - ${horaFin}:00`,
            },
            unit_amount: Math.round(precio * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5173/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/catalogo?payment=cancelled`,
      metadata: {
        reservaId,
        userId: uid,
        laboratorioId,
      },
    });

    // Log Stripe session creation
    paymentLogger.info(
      `Stripe checkout session created | sessionId=${session.id} reservationId=${reservaId}`,
      { requestId: req.requestId }
    );

    await reservaRef.update({
      'pago.stripeSessionId': session.id,
      'pago.estado': 'pendiente',
    });

    // Log reservation update with Stripe session
    paymentLogger.info(
      `Reservation updated with Stripe session | reservationId=${reservaId}`,
      { requestId: req.requestId }
    );

    res.json({ url: session.url });

  } catch (error) {
    // Log payment flow error and delegate to global error handler
    paymentLogger.error(
      'Error while creating Stripe checkout session',
      { requestId: req.requestId, stack: error.stack }
    );
    next(error);
  }
};
