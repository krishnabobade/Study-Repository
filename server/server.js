const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const logger = require('./config/logger');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const resourceRoutes = require('./routes/resource.routes');

const app = express();

// Apply security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://spline.design"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*", "wss://*", "https://*"],
      frameSrc: ["'self'", "https://my.spline.design"],
    },
  },
}));

app.use(mongoSanitize());
app.use(compression());

// Configure CORS for production
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
}));

app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: logger.stream }));

// Global API Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, 
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Strict Login Bruteforce Protection
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 failed/successful logins per IP per 15 minutes
  message: { success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes. This incident has been logged.' }
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', loginLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);

const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

const analyticsRoutes = require('./routes/analytics.routes');
const notificationRoutes = require('./routes/notification.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const announcementRoutes = require('./routes/announcement.routes');
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/announcements', announcementRoutes);
const feedbackRoutes = require('./routes/feedback.routes');
app.use('/api/feedback', feedbackRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'connected', db: 'ok' }));

// Handle missing API routes gracefully instead of returning HTML
app.use('/api/*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 404;
  next(err);
});

// Serve static assets automatically to run on same port
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
});

// Initialize Server and Database
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  // Initialize WebSockets
  const socketFile = require('./socket');
  socketFile.init(server);

  // Initialize Automated Background Jobs (Queue & CRON)
  const cronService = require('./services/cron.service');
  cronService.initCronJobs();
};

startServer();

// Global Error Handler & Production Logging
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  
  // Structured Error Logging
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    status: statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };
  
  if (statusCode >= 500) {
    logger.error('[SERVER ERROR] %o', errorLog);
  } else {
    logger.warn('[CLIENT ERROR] %o', errorLog);
  }

  // Standardized API Error Response
  const response = {
    success: false,
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal Server Error' 
      : err.message || 'Internal Server Error',
    errorCode: err.code || 'UNKNOWN_ERROR'
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

