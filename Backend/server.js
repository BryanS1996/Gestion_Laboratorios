require('dotenv').config();

const express = require('express');
const cors = require('cors');

const serverLogger = require('./config/server.logger');
const requestId = require('./middleware/requestId');

const connectMongo = require('./config/mongo');
const { initReservasRealtime } = require('./realtime/reservasListener');

/* ======================================================
   CREATE EXPRESS APP 
   - Must be initialized before any app.use()
====================================================== */
const app = express();
const PORT = process.env.PORT || 5000;

/* ======================================================
   STRIPE WEBHOOK (RAW BODY ONLY)
   - MUST be mounted BEFORE express.json()
   - Now 'app' is defined, so this won't crash
====================================================== */
app.use('/api/stripe', require('./routes/stripe.webhook'));

/* ======================================================
   INIT SERVICES
====================================================== */
connectMongo();
initReservasRealtime();

/* ======================================================
   GLOBAL MIDDLEWARES
====================================================== */
app.use(cors());

// Assign requestId as early as possible for tracking
app.use(requestId);

/* ======================================================
   BODY PARSERS (AFTER WEBHOOK)
   - These process JSON bodies for all other routes
====================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================================================
   REQUEST LOGGING
====================================================== */
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    serverLogger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
      { requestId: req.requestId }
    );
  });

  next();
});

/* ======================================================
   HEALTH CHECK
====================================================== */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/* ======================================================
   API ROUTES
====================================================== */
app.use('/api/auth',         require('./routes/auth.routes'));
app.use('/api/users',        require('./routes/userRoutes'));
app.use('/api/laboratorios', require('./routes/laboratorios.routes'));
app.use('/api/reservas',     require('./routes/reservas.routes'));
app.use('/api/reportes',     require('./routes/reportes.routes'));
app.use('/api/dashboard',    require('./routes/dashboard.routes'));
app.use('/api/admin',        require('./routes/admin.routes'));
app.use('/api/stripe',       require('./routes/stripe.routes'));

/* ======================================================
   ROOT API INFO
====================================================== */
app.get('/api', (req, res) => {
  res.json({
    message: 'Laboratorios API',
    version: '1.0.0',
  });
});

/* ======================================================
   404 HANDLER
====================================================== */
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    method: req.method,
    path: req.originalUrl,
  });
});

/* ======================================================
   GLOBAL ERROR HANDLER
====================================================== */
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

/* ======================================================
   START SERVER
====================================================== */
app.listen(PORT, () => {
  serverLogger.info(
    `🚀 Server started on port ${PORT}`,
    { requestId: 'bootstrap' }
  );
});

module.exports = app;