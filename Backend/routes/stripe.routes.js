const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('../firebaseAdmin');
const db = admin.firestore();

// POST /api/stripe/create-checkout-session
router.post('/create-checkout-session', authMiddleware(['student', 'professor']), async (req, res) => {
  try {
    const { laboratorioId, fecha, horaInicio, horaFin, motivo } = req.body;
    const user = req.user;

    if (!laboratorioId || !fecha || horaInicio == null || horaFin == null) {
      return res.status(400).json({ error: 'Datos incompletos para la reserva' });
    }

    // 1. Validar que el laboratorio exista y sea premium
    const labDoc = await db.collection('laboratorios').doc(laboratorioId).get();
    if (!labDoc.exists) return res.status(404).json({ error: 'Laboratorio no encontrado' });

    const lab = labDoc.data();
    if (lab.tipo !== 'premium') {
      return res.status(400).json({ error: 'Este laboratorio no requiere pago' });
    }

    const reservaTemp = {
      laboratorioId,
      laboratorioNombre: lab.nombre || null,
      fecha,
      horaInicio,
      horaFin,
      motivo: motivo || null,
      estado: 'pendiente', // se confirmará cuando Stripe pague
      userId: user.uid,
      userEmail: user.email,
      userNombre: user.displayName || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 2. Guardar reserva temporal (aún no pagada)
    const reservaRef = await db.collection('reservas').add(reservaTemp);

    // 3. Crear sesión de pago en Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      metadata: {
        reservaId: reservaRef.id,
        userId: user.uid,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Reserva: ${lab.nombre} (${fecha} ${horaInicio}-${horaFin})`,
            },
            unit_amount: lab.precioUsd ? Math.round(lab.precioUsd * 100) : 200, // fallback 2 USD
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/reservas?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/reservas?cancelled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('❌ Error creando sesión de pago:', error);
    return res.status(500).json({ error: 'Error al generar sesión de pago' });
  }
});

module.exports = router;
