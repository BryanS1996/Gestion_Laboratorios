const stripe = require('../config/stripe');
const { v4: uuidv4 } = require('uuid');
const Reserva = require('../models/Reserva');

exports.crearCheckout = async (req, res) => {
  const { laboratorioId, laboratorioNombre, fecha, horario } = req.body;
  const { uid, email } = req.user;

  const reservaId = `RES-${uuidv4()}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: email,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Reserva ${laboratorioNombre}`,
        },
        unit_amount: 500, // $5.00 ejemplo
      },
      quantity: 1,
    }],
    success_url: `${process.env.FRONTEND_URL}/pago-exitoso?reservaId=${reservaId}`,
    cancel_url: `${process.env.FRONTEND_URL}/catalogo`,
    metadata: {
      reservaId,
      userId: uid,
      laboratorioId,
      laboratorioNombre,
      fecha,
      horario,
    }
  });

  await Reserva.create({
    reservaId,
    userId: uid,
    userEmail: email,
    laboratorioId,
    laboratorioNombre,
    fecha,
    horario,
    tipoAcceso: 'premium',
    pago: {
      requerido: true,
      stripeSessionId: session.id,
      estado: 'pendiente',
      monto: 5
    }
  });

  res.json({ url: session.url });
};
