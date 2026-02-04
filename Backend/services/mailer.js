const { reservaConfirmacionHTML } = require('../utils/emailTemplates');
const sendEmail = require('../utils/sendEmail');

/**
 * Sends a reservation confirmation email with custom design.
 * @param {Object} reserva - Object with reservation data
 * @param {boolean} conPago - true if it is a premium reservation
 */
exports.confirmacionReserva = async (reserva, conPago = false) => {
  // 1. Basic validation to avoid errors if null is received
  if (!reserva) return;

  try {
    // 2. Build readable schedule (Assuming you have horaInicio and horaFin)
    // If your reserva object ALREADY has a 'horario' string, you can use that, 
    // but based on your previous code, it was calculated like this:
    const textoHorario = reserva.horario 
      ? reserva.horario 
      : `${reserva.horaInicio}:00 - ${reserva.horaFin}:00`;

    // 3. Generate HTML
    const html = reservaConfirmacionHTML({
      nombre: reserva.userNombre || reserva.userEmail.split('@')[0],
      laboratorio: reserva.laboratorioNombre,
      fecha: reserva.fecha, // Make sure it's readable (e.g.: "2026-01-20")
      horario: textoHorario, // <--- Fixed syntax and logic here
      reservaId: reserva.reservaId || reserva._id || 'N/A',
    });

    // 4. Send the email
    await sendEmail({
      to: reserva.userEmail,
      subject: '✅ Confirmación de Reserva',
      html,
    });

    console.log(`📨 Email enviado a ${reserva.userEmail}`);

  } catch (error) {
    // 5. Error handling so it doesn't break the user flow
    console.error(`❌ Error enviado email a ${reserva?.userEmail}:`, error.message);
  }
};