const logger = require('./config/logger.base');
const requestId = require('./middleware/requestId');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ======================================================
// Connections and Services
// ======================================================
const connectMongo = require('./config/mongo');
const { initReservasRealtime } = require('./realtime/reservasListener');

connectMongo();
initReservasRealtime();

// ======================================================
// MIDDLEWARES GLOBALS
// ======================================================
app.use(cors());

//logger.js
logger.info('🚀 Logger initialized');

// ⚠️ STRIPE WEBHOOK
app.use('/api/stripe', require('./routes/stripe.webhook'));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// RequestId middleware
app.use(requestId);

// ======================================================
// HEALTH CHECK
// ======================================================
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Logging de requests
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
});

// ======================================================
// API ROUTES
// ======================================================

app.use('/api/auth',         require('./routes/auth.routes'));
app.use('/api/users',        require('./routes/userRoutes'));
app.use('/api/laboratorios', require('./routes/laboratorios.routes'));
app.use('/api/reservas',     require('./routes/reservas.routes'));
app.use('/api/reportes',     require('./routes/reportes.routes'));
app.use('/api/dashboard',    require('./routes/dashboard.routes'));
app.use('/api/admin',        require('./routes/admin.routes'));
app.use('/api/stripe',       require('./routes/stripe.routes'));

// ======================================================
// ROOT API INFO
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
// Error Handling
// ======================================================

/// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    method: req.method,
    path: req.originalUrl,
  });
});

// Global error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);


// ======================================================
// START SERVER
// ======================================================
app.listen(PORT, () => {
  console.log(`\n✅ Backend corriendo en http://localhost:${PORT}`);
  console.log(`📚 API disponible en http://localhost:${PORT}/api\n`);
});

module.exports = app;