const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const admin = require('../firebaseAdmin');
const db = admin.firestore();
const nodemailer = require('nodemailer');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Configurar el transporter de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // o usa otro proveedor
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️ Error en webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 🎯 Solo respondemos al éxito de pago
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;

    const reservaId = intent.metadata?.reservaId;
    const userEmail = intent.metadata?.userEmail;
    const userNombre = intent.metadata?.userNombre || 'Usuario';
    const laboratorioNombre = intent.metadata?.laboratorioNombre || 'Laboratorio';

    if (!reservaId || !userEmail) {
      console.warn('⚠️ Falta metadata en el intent');
      return res.status(400).send('Faltan metadatos');
    }

    try {
      // ✅ Confirmar reserva en Firestore
      const ref = db.collection('reservas').doc(reservaId);
      await ref.update({
        estado: 'confirmada',
        updatedAt: new Date(),
      });

      // ✅ Enviar correo con comprobante
      await transporter.sendMail({
        from: `"Laboratorios UCE" <${process.env.EMAIL_FROM}>`,
        to: userEmail,
        subject: '✅ Confirmación de pago y reserva exitosa',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #4CAF50;">✅ Reserva confirmada</h2>
            <p>Hola <strong>${userNombre}</strong>,</p>
            <p>Tu reserva en el laboratorio <strong>${laboratorioNombre}</strong> ha sido confirmada correctamente.</p>
            <p><strong>ID de transacción:</strong> ${intent.id}</p>
            <p><strong>Monto:</strong> $${(intent.amount_received / 100).toFixed(2)}</p>
            <p>Gracias por usar nuestro sistema.</p>
            <br/>
            <p style="font-size: 0.9em; color: gray;">Facultad de Ingeniería - Universidad Central del Ecuador</p>
          </div>
        `,
      });

      console.log(`✅ Reserva ${reservaId} confirmada y correo enviado a ${userEmail}`);
      res.status(200).json({ received: true });
    } catch (err) {
      console.error('❌ Error al confirmar reserva:', err);
      res.status(500).send('Error interno al confirmar reserva');
    }
  } else {
    res.status(200).json({ received: true });
  }
});

module.exports = router;
