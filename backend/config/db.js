import mongoose from 'mongoose';
import dns from 'dns';
import logger from '../utils/logger.js';

// Configure Node to use Google Public DNS for SRV record resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if unavailable
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 20, // Maintain up to 20 socket connections for high traffic
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Reconnecting...');
    });

    return conn;
  } catch (err) {
    logger.error(`DB connection failed: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
