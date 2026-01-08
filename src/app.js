const express = require('express');
const cors = require('cors');
const https = require('https');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const env = require('./config/environment');
const logger = require('./utils/logger');
const initializeDatabase = require('./database/init');

// Self-ping to keep Render free tier alive
const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes
const PING_URL = process.env.HEALTH_CHECK_URL;

setInterval(() => {
  https.get(PING_URL, (res) => {
    logger.debug('Self-ping successful', { statusCode: res.statusCode });
  }).on('error', (err) => {
    logger.error('Self-ping failed', { error: err.message });
  });
}, PING_INTERVAL);


// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const dishRoutes = require('./routes/dish.routes');
const orderRoutes = require('./routes/order.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const notificationRoutes = require('./routes/notification.routes');

// Import middleware
const { errorHandler, notFound } = require('./middlewares/error.middleware');

// Initialize Express app
const app = express();

// Production Security & Performance Middleware
app.use(cors()); // Enable CORS
app.use(helmet()); // Basic security headers
app.use(compression()); // Gzip compression
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting: Max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api/', limiter);

// Request logging (basic)
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      userId: req.user?.id || null
    });
  });

  next();
});

// Health check route
app.get('/health', (req, res) => {
  const payload = {
    success: true,
    message: 'Bhejoo Backend API is running',
    timestamp: new Date().toISOString()
  };

  logger.debug('Health check called', {});
  res.json(payload);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/notifications', notificationRoutes);

const http = require('http');
const socketUtil = require('./utils/socket');

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
socketUtil.init(server);

async function start() {
  try {
    // Ensure database schema exists before handling requests
    await initializeDatabase();



    const PORT = env.PORT || 3000;
    server.listen(PORT, () => {
      logger.info('Server started', {
        port: PORT,
        env: env.NODE_ENV,
        baseUrl: `http://localhost:${PORT}/api`
      });
    });
  } catch (error) {
    logger.error('Failed to start server due to DB initialization error', error);
    process.exit(1);
  }
}

start();

module.exports = app;
