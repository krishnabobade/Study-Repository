const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// ============================================================
// STARTUP VALIDATION — Fail fast if critical env vars missing
// ============================================================
const REQUIRED_ENV = ['JWT_SECRET', 'MONGO_URI', 'ADMIN_EMAIL'];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`\n[FATAL] Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('[FATAL] Server cannot start without these variables. Check your .env file.');
  process.exit(1);
}

const logger = require('./config/logger');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const resourceRoutes = require('./routes/resource.routes');

const app = express();

// Trust Render's proxy for accurate IP tracking and rate-limiting
app.set('trust proxy', 1);

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
// Note: mongoSanitize applied once here, after JSON parsing, for correct operation

// Configure CORS — explicit allowlist in all environments
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);

    const isVercel = origin.endsWith('.vercel.app');
    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin);

    if (isVercel || isExplicitlyAllowed || isLocalhost) {
      callback(null, true);
    } else {
      const logger = require('./config/logger');
      logger.warn(`[CORS Blocked] Origin: ${origin}`);
      callback(new Error(`CORS Error: Origin ${origin} not allowed`));
    }
  }, 
  credentials: true 
}));

// Body parsing with size limits to prevent DoS via oversized payloads
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: logger.stream }));
// Note: mongoSanitize is applied above before routing; no second call needed

// Global API Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Strict Login Bruteforce Protection
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes.' }
});

// Password Reset / OTP Endpoints — Dedicated strict limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // Max 10 reset attempts per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many password reset attempts. Please try again in 1 hour.' }
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/verify-otp', passwordResetLimiter);
app.use('/api/auth/resend-otp', passwordResetLimiter);

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

const trendingRoutes = require('./routes/trending.routes');
app.use('/api/trending', trendingRoutes);

const roomRoutes = require('./routes/room.routes');
app.use('/api/rooms', roomRoutes);

// Health check — minimal response, no internal state disclosed
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

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

// Initialize Database Connection immediately
connectDB();

if (require.main === module) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    logger.info(`📡 Binding to 0.0.0.0 for cloud accessibility`);
  });

  // Initialize WebSockets
  const socketFile = require('./socket');
  socketFile.init(server);

  // Initialize Automated Background Jobs
  const cronService = require('./services/cron.service');
  cronService.initCronJobs();

  // Self-Ping Keep-Alive Mechanism for Render Free Tier (Prevents 15-min sleep)
  const selfUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
  if (selfUrl && process.env.ENABLE_KEEP_ALIVE === 'true') {
    setInterval(() => {
      const https = require('https');
      https.get(`${selfUrl}/api/health`, (resp) => {
        if (resp.statusCode === 200) {
          logger.info(`[KEEP-ALIVE] Pinged self to prevent cold start.`);
        }
      }).on('error', (err) => {
        logger.warn(`[KEEP-ALIVE] Ping failed: ${err.message}`);
      });
    }, 14 * 60 * 1000); // Runs every 14 minutes
  }
}

module.exports = app;

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

