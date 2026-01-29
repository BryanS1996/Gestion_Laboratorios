const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const admin = require('../firebaseAdmin');
const db = admin.firestore();
const paymentLogger = require('../config/payment.logger');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/* ======================================================
   STRIPE WEBHOOK (TEST MODE READY)
====================================================== */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {

    // Stripe webhooks do not include our requestId
    const requestId = `stripe-${Date.now()}`;

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );

      paymentLogger.info(
        `Stripe webhook received | type=${event.type}`,
        { requestId }
      );

    } catch (err) {
      paymentLogger.error(
        'Stripe webhook signature verification failed',
        { requestId, stack: err.stack }
      );
      return res.status(400).send('Invalid signature');
    }

    /* =======================
       CHECKOUT COMPLETED
    ======================= */
    if (event.type === 'checkout.session.completed') {
      try {
        const session = event.data.object;

        const reservaId = session.metadata?.reservaId;
        const userId = session.metadata?.userId;
        const paymentIntentId = session.payment_intent;

        if (!reservaId) {
          paymentLogger.warn(
            'Checkout completed without reservationId',
            { requestId }
          );
          return res.status(200).json({ received: true });
        }

        await db.collection('reservas').doc(reservaId).update({
          estado: 'confirmada',
          'pago.estado': 'pagado',
          'pago.transactionId': paymentIntentId,
          'pago.metodo': 'stripe_checkout',
          updatedAt: new Date(),
        });

        paymentLogger.info(
          `Checkout completed | reservationId=${reservaId} paymentIntent=${paymentIntentId}`,
          { requestId }
        );

        return res.status(200).json({ received: true });

      } catch (err) {
        paymentLogger.error(
          'Error processing checkout.session.completed',
          { requestId, stack: err.stack }
        );
        return res.status(500).send('Webhook error');
      }
    }

    /* =======================
       PAYMENT FAILED
    ======================= */
    if (event.type === 'payment_intent.payment_failed') {
      try {
        const intent = event.data.object;
        const reservaId = intent.metadata?.reservaId;

        const failureMessage =
          intent.last_payment_error?.message || 'Payment failed';

        if (!reservaId) {
          paymentLogger.warn(
            'Payment failed without reservationId',
            { requestId }
          );
          return res.status(200).json({ received: true });
        }

        await db.collection('reservas').doc(reservaId).update({
          estado: 'cancelada_pago_fallido',
          'pago.estado': 'fallido',
          'pago.error': failureMessage,
          updatedAt: new Date(),
        });

        paymentLogger.warn(
          `Payment failed | reservationId=${reservaId} reason="${failureMessage}"`,
          { requestId }
        );

        return res.status(200).json({ received: true });

      } catch (err) {
        paymentLogger.error(
          'Error processing payment_intent.payment_failed',
          { requestId, stack: err.stack }
        );
        return res.status(500).send('Webhook error');
      }
    }

    /* =======================
       OTHER EVENTS
    ======================= */
    paymentLogger.info(
      `Stripe event ignored | type=${event.type}`,
      { requestId }
    );

    res.status(200).json({ received: true });
  }
);

module.exports = router;
