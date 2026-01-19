const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const admin = require('../firebaseAdmin'); // Asegúrate de importar tu admin de Firebase
const db = admin.firestore();

exports.createCheckoutSession = async (req, res) => {
  try {
    // 1. Recibimos los datos del Frontend (Modal)
    const { 
      laboratorioId, 
      laboratorioNombre, // Asegúrate de enviar esto desde el front o buscarlo aquí
      fecha, 
      horaInicio, 
      horaFin,
      precio = 5.00 // Precio por defecto si no viene
    } = req.body;
    
    const { uid, email } = req.user;

    // 2. Creamos la reserva en la Base de Datos con estado 'pendiente'
    // Esto es útil para "reservar" el hueco mientras paga
    const nuevaReserva = {
      userId: uid,
      userEmail: email,
      laboratorioId,
      laboratorioNombre: laboratorioNombre || 'Laboratorio',
      fecha, // Guardamos la fecha tal cual (YYYY-MM-DD)
      horaInicio,
      horaFin,
      tipoAcceso: 'premium',
      estado: 'pendiente', // IMPORTANTE: Empieza como pendiente
      pago: {
        requerido: true,
        monto: precio,
        estado: 'pendiente'
      },
      createdAt: new Date()
    };

    const reservaRef = await db.collection('reservas').add(nuevaReserva);
    const reservaId = reservaRef.id;

    // 3. Creamos la sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Reserva Premium: ${laboratorioNombre || 'Lab'}`,
            description: `Fecha: ${fecha} | Horario: ${horaInicio}:00 - ${horaFin}:00`,
          },
          unit_amount: Math.round(precio * 100), // Stripe usa centavos (500 = $5.00)
        },
        quantity: 1,
      }],
      
      // ✅ REDIRECCIÓN AL FRONTEND (Puerto 5173)
      success_url: `http://localhost:5173/mis-reservas?payment=success&reservaId=${reservaId}`,
      cancel_url: `http://localhost:5173/catalogo?payment=cancelled`,
      
      // Metadatos para el Webhook (si lo configuras después)
      metadata: {
        reservaId, // Vinculamos el pago con la reserva creada
        userId: uid,
        laboratorioId
      }
    });

    // 4. Actualizamos la reserva con el ID de sesión de Stripe (Opcional pero recomendado)
    await reservaRef.update({
      'pago.stripeSessionId': session.id
    });

    // 5. Devolvemos la URL
    res.json({ url: session.url });

  } catch (error) {
    console.error('Error en crearCheckout:', error);
    res.status(500).json({ error: 'Error al generar el pago' });
  }
};