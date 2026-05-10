const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studyrepo';
  
  try {
    const MONGO_URI_CLEAN = MONGO_URI.trim();
    
    // Enable Mongoose debugging to troubleshoot connection issues
    mongoose.set('debug', true);

    const conn = await mongoose.connect(MONGO_URI_CLEAN, {
      maxPoolSize: 50,
      wtimeoutMS: 2500,
      serverSelectionTimeoutMS: 60000,
    });
    
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle post-initialization connection errors
    mongoose.connection.on('error', err => {
      logger.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

  } catch (error) {
    logger.error('❌ MongoDB Initial Connection Error:', error);
    // Removed process.exit(1) to allow Render to keep the service alive while retrying
  }
};

module.exports = connectDB;
