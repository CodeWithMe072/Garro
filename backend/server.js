import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import Helper from './models/Helper.js';
import HelperTracking from './models/HelperTracking.js';
import { loadSettings } from './utils/settings.js';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';
import garageRoutes from './routes/garage.routes.js';
import helperRoutes from './routes/helper.routes.js';
import requestRoutes from './routes/request.routes.js';
import adminRoutes from './routes/admin.routes.js';
import quoteRoutes from './routes/quote.routes.js';
import jobRoutes from './routes/job.routes.js';
import trackingRoutes from './routes/tracking.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import userRoutes from './routes/user.routes.js';
import auth from './middleware/auth.middleware.js';
import role from './middleware/role.middleware.js';
import { manualAssign } from './controllers/request.controller.js';
import paymentRoutes from './routes/payment.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import reviewRoutes from './routes/review.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import jwt from 'jsonwebtoken';
import supportRoutes from './routes/support.routes.js';
import SupportConversation from './models/SupportConversation.js';
import logger from './utils/logger.js';

const app = express();
app.set('trust proxy', 1);

const server = http.createServer(app);

// CORS configuration supporting localhost & production frontend url
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Database Connection
connectDB().then(() => {
  loadSettings();
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(cookieParser());

// Stripe payment routes (webhook requires raw body, must be before express.json)
app.use('/api/payments', paymentRoutes);

// 3. JSON parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many auth/OTP attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many payment attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/send-otp', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth/profile/password', authLimiter);
app.use('/api/payments/create-intent', paymentLimiter);
app.use('/api/payments/bypass-pay', paymentLimiter);
// app.use('/api/', generalLimiter);

// Make io accessible in controllers
app.set('io', io);

// Health check
app.get('/', (req, res) => res.json({ status: 'Garro API running' }));

// Mount other REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/garages', garageRoutes);
app.use('/api/helpers', helperRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin/catalog', catalogRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/users', userRoutes);

// Time-slot based booking assignment
app.post('/api/bookings/:bookingId/assign', auth, role('admin'), (req, res, next) => {
  req.params.id = req.params.bookingId;
  next();
}, manualAssign);

// Debug auto-assign route
app.post('/api/test/auto-assign', auth, role('admin'), (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Not Found' });
  }
  next();
}, async (req, res) => {
  try {
    const { runAutoAssign } = await import('./agents/autoAssignAgent.js');
    const result = await runAutoAssign(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Socket.IO — real-time helper tracking
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Authenticate socket using JWT
  try {
    const token = socket.handshake.auth?.token;
    if (token) {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
    }
  } catch (err) {
    socket.user = null;
  }

  // Customer or admin joins job room to receive updates
  socket.on('join:job', (jobId) => {
    socket.join(`job:${jobId}`);
    logger.info(`Socket ${socket.id} joined room job:${jobId}`);
  });

  // Helper emits location every 30 seconds
  socket.on('helper:location', async (data) => {
    try {
      const { jobId, helperId, lat, lng } = data;

      // Save to HelperTracking collection
      await HelperTracking.create({ jobId, helperId, location: { lat, lng } });

      // Update helper's currentLocation
      await Helper.findByIdAndUpdate(helperId, { currentLocation: { lat, lng } });

      // Broadcast to everyone in that job room
      io.to(`job:${jobId}`).emit('location:update', { jobId, lat, lng, timestamp: new Date() });
    } catch (err) {
      logger.error(`Tracking error: ${err.message}`);
    }
  });

  socket.on('leave:job', (jobId) => {
    socket.leave(`job:${jobId}`);
  });

  // --- Support chat ---
  const AGENT_ROLES = ['admin', 'staff', 'manager', 'superadmin'];

  // Client joins a specific conversation room. Must be authenticated AND
  // either the conversation's owning customer or an agent.
  socket.on('support:join', async (conversationId) => {
    if (!socket.user) return;
    if (AGENT_ROLES.includes(socket.user.role)) {
      socket.join(`support:${conversationId}`);
      logger.info(`Agent socket ${socket.id} joined support:${conversationId}`);
      return;
    }
    if (socket.user.role === 'customer') {
      try {
        const convo = await SupportConversation.findById(conversationId).select('customerId');
        if (convo && String(convo.customerId) === String(socket.user.id)) {
          socket.join(`support:${conversationId}`);
          logger.info(`Customer socket ${socket.id} joined support:${conversationId}`);
        }
      } catch (err) {
        logger.error(`Error in support:join: ${err.message}`);
      }
    }
  });

  socket.on('support:leave', (conversationId) => {
    socket.leave(`support:${conversationId}`);
    logger.info(`Socket ${socket.id} left support:${conversationId}`);
  });

  // Agents join a global room to get list/badge updates even when no thread is open.
  socket.on('support:join:agent', () => {
    if (socket.user && AGENT_ROLES.includes(socket.user.role)) {
      socket.join('support:agents');
      logger.info(`Agent socket ${socket.id} joined support:agents`);
    }
  });

  socket.on('support:leave:agent', () => {
    socket.leave('support:agents');
    logger.info(`Agent socket ${socket.id} left support:agents`);
  });

  // --- Disconnect ---
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => logger.info(`Server running on port ${PORT}`));
