const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. IMPORTAR CONEXIÓN A MONGO
const connectMongo = require('./config/mongo');

// Import routes
const userRoutes = require('./routes/userRoutes');
const laboratoriosRoutes = require('./routes/laboratorios.routes');
const reservasRoutes = require('./routes/reservas.routes');
const reportesRoutes = require('./routes/reportes.routes');
const adminRoutes = require('./routes/admin.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const authRoutes = require('./routes/auth.routes');


const app = express();
const PORT = process.env.PORT || 5000;

const stripeWebhook = require('./routes/stripe.webhook');
app.use('/api/stripe', stripeWebhook); // Usa express.raw en este archivo

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CONECTAR A MONGODB (Se ejecuta al iniciar)
connectMongo();

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/laboratorios', laboratoriosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Laboratorios API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      laboratorios: '/api/laboratorios',
      reservas: '/api/reservas',
      reportes: '/api/reportes',
      admin: '/api/admin'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method 
  });
});

// Stripe webhook endpoint
const stripeRoutes = require('./routes/stripe.routes');
app.use('/api/stripe', stripeRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Servidor backend ejecutándose en http://localhost:${PORT}`);
  console.log(`📚 API disponible en http://localhost:${PORT}/api\n`);
});

module.exports = app;