const { reservaConfirmacionHTML } = require('../utils/emailTemplates');
const sendEmail = require('../utils/sendEmail');

/**
 * Envía un correo de confirmación de reserva con diseño personalizado.
 * @param {Object} reserva - Objeto con los datos de la reserva
 * @param {boolean} conPago - true si es reserva premium
 */
exports.confirmacionReserva = async (reserva, conPago = false) => {
  // 1. Validación básica para evitar errores si llega null
  if (!reserva) return;

  try {
    // 2. Construir el horario legible (Asumiendo que tienes horaInicio y horaFin)
    // Si tu objeto reserva YA tiene un string 'horario', puedes usar ese, 
    // pero basado en tu código anterior, se calculaba así:
    const textoHorario = reserva.horario 
      ? reserva.horario 
      : `${reserva.horaInicio}:00 - ${reserva.horaFin}:00`;

    // 3. Generar el HTML
    const html = reservaConfirmacionHTML({
      nombre: reserva.userNombre || reserva.userEmail.split('@')[0],
      laboratorio: reserva.laboratorioNombre,
      fecha: reserva.fecha, // Asegúrate de que sea legible (ej: "2026-01-20")
      horario: textoHorario, // <--- Aquí corregimos la sintaxis y la lógica
      reservaId: reserva.reservaId || reserva._id || 'N/A',
    });

    // 4. Enviar el correo
    await sendEmail({
      to: reserva.userEmail,
      subject: '✅ Confirmación de Reserva',
      html,
    });

    console.log(`📨 Email enviado a ${reserva.userEmail}`);

  } catch (error) {
    // 5. Manejo de errores para que no rompa el flujo del usuario
    console.error(`❌ Error enviando email a ${reserva?.userEmail}:`, error.message);
  }
};