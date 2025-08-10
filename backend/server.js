require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Add avalanche CLI to PATH
process.env.PATH = `${process.env.PATH}:/Users/${process.env.USER}/bin`;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const deployRoutes = require('./routes/deploy');
const monitorRoutes = require('./routes/monitor');
const templateRoutes = require('./routes/templates');
const healthRoutes = require('./routes/health');
const userRoutes = require('./routes/users');

// Routes
app.use('/deploy', deployRoutes);
app.use('/monitor', monitorRoutes);
app.use('/templates', templateRoutes);
app.use('/health', healthRoutes);
app.use('/users', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Avax Studio API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      deploy: '/deploy',
      monitor: '/monitor',
      templates: '/templates',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Avax Studio API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;
