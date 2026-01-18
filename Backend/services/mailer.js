const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.confirmacionReserva = async (reserva, conPago) => {
  const html = `
    <h2>Reserva confirmada</h2>
    <p><b>Reserva ID:</b> ${reserva.reservaId}</p>
    <p><b>Laboratorio:</b> ${reserva.laboratorioNombre}</p>
    <p><b>Fecha:</b> ${reserva.fecha}</p>
    <p><b>Horario:</b> ${reserva.horario}</p>
    ${
      conPago
        ? `<p><b>Pago:</b> Confirmado ($${reserva.pago.monto})</p>`
        : `<p><b>Tipo:</b> Reserva básica</p>`
    }
  `;

  await transporter.sendMail({
    from: '"Laboratorios FI" <no-reply@labs.com>',
    to: reserva.userEmail,
    subject: 'Confirmación de Reserva',
    html,
  });
};
