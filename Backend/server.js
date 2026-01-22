const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ======================================================
// 🗄️ CONEXIONES Y SERVICIOS
// ======================================================
const connectMongo = require('./config/mongo');
const { initReservasRealtime } = require('./realtime/reservasListener');

// Conectar MongoDB
connectMongo();

// Inicializar listeners en tiempo real
initReservasRealtime();

// ======================================================
// 🧩 MIDDLEWARES GLOBALES
// ======================================================
app.use(cors());

// ⚠️ STRIPE WEBHOOK (DEBE IR ANTES DEL JSON PARSER)
app.use('/api/stripe', require('./routes/stripe.webhook'));

// Body parsers (después del webhook)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ======================================================
// ❤️ HEALTH CHECK
// ======================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// ======================================================
// 🚏 RUTAS DE LA API
// ======================================================

// Auth
app.use('/api/auth', require('./routes/auth.routes'));

// Usuarios
app.use('/api/users', require('./routes/userRoutes'));

// Laboratorios
app.use('/api/laboratorios', require('./routes/laboratorios.routes'));

// Reservas
app.use('/api/reservas', require('./routes/reservas.routes'));

// Reportes (usuarios)
app.use('/api/reportes', require('./routes/reportes.routes'));

// Dashboard
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// 🔴 ADMIN (TODAS LAS RUTAS ADMIN AQUÍ)
app.use('/api/admin', require('./routes/admin.routes'));

// Stripe checkout (DESPUÉS del JSON parser)
app.use('/api/stripe', require('./routes/stripe.routes'));

// ======================================================
// 📌 ROOT API INFO
// ======================================================
app.get('/api', (req, res) => {
  res.json({
    message: 'Laboratorios API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      laboratorios: '/api/laboratorios',
      reservas: '/api/reservas',
      reportes: '/api/reportes',
      dashboard: '/api/dashboard',
      admin: '/api/admin',
      stripe: '/api/stripe',
    },
  });
});

// ======================================================
// ❌ MANEJO DE ERRORES
// ======================================================

// 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    method: req.method,
    path: req.originalUrl,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
  });
});

// ======================================================
// 🚀 START SERVER
// ======================================================
app.listen(PORT, () => {
  console.log(`\n✅ Backend corriendo en http://localhost:${PORT}`);
  console.log(`📚 API disponible en http://localhost:${PORT}/api\n`);
});

module.exports = app;