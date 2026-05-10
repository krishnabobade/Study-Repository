const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studyrepo';
  
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      // These options are generally default in mongoose 6+, but good practice to explicitly state for pooling
      maxPoolSize: 50,
      wtimeoutMS: 2500,
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
