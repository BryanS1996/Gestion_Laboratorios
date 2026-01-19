const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error('MAIL_USER o MAIL_PASS no definidos');
  }

  const info = await transporter.sendMail({
    from: `"Laboratorios FI" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log('✅ Email enviado:', info.messageId);
}

module.exports = sendEmail;
