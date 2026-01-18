// utils/sendEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: false, // true para 465, false para 587
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });

  console.log(`✅ Email enviado a ${to}: ${info.messageId}`);
}

module.exports = sendEmail;
