const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const admin = require('../firebaseAdmin');
const db = admin.firestore();

exports.createCheckoutSession = async (req, res) => {
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

    const reservaRef = await db.collection('reservas').add(nuevaReserva);
    const reservaId = reservaRef.id;

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

    await reservaRef.update({
      'pago.stripeSessionId': session.id,
      'pago.estado': 'pendiente',
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error en crearCheckout:', error);
    res.status(500).json({ error: 'Error al generar el pago' });
  }
};
