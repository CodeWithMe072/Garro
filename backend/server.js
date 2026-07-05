import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import Helper from './models/Helper.js';
import HelperTracking from './models/HelperTracking.js';

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
import auth from './middleware/auth.middleware.js';
import role from './middleware/role.middleware.js';
import { manualAssign } from './controllers/request.controller.js';
import paymentRoutes from './routes/payment.routes.js';
import catalogRoutes from './routes/catalog.routes.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Database Connection
connectDB();

// 1. Stripe payment routes (webhook requires raw body, must be before express.json)
app.use('/api/payments', paymentRoutes);

// 2. CORS configuration supporting localhost & production frontend url
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:3000',
    'https://your-frontend.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// 3. JSON parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Rate limiter
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' }
}));

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

// Time-slot based booking assignment
app.post('/api/bookings/:bookingId/assign', auth, role('admin'), (req, res, next) => {
  req.params.id = req.params.bookingId;
  next();
}, manualAssign);

// Debug auto-assign route
app.post('/api/test/auto-assign', async (req, res) => {
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
  console.log('Socket connected:', socket.id);

  // Customer or admin joins job room to receive updates
  socket.on('join:job', (jobId) => {
    socket.join(`job:${jobId}`);
    console.log(`Socket ${socket.id} joined room job:${jobId}`);
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
      console.error('Tracking error:', err.message);
    }
  });

  socket.on('leave:job', (jobId) => {
    socket.leave(`job:${jobId}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
