import Request from '../models/Request.js';
import Vehicle from '../models/Vehicle.js';
import Helper from '../models/Helper.js';
import Job from '../models/Job.js';
import Quote from '../models/Quote.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import GaragePayout from '../models/GaragePayout.js';
import HelperBookingSlot from '../models/HelperBookingSlot.js';
import { checkHelperAvailability, SERVICE_DURATION_MAP } from './helper.controller.js';
import { uploadToR2  } from '../utils/upload.js';
import { success, error  } from '../utils/response.js';
import { notifyCustomer, notifyGarage } from '../utils/notify.js';
import { getPriceForServiceType } from './servicePricing.controller.js';
import ExcelJS from 'exceljs';
import { generatePDF } from '../utils/pdf.js';
import Stripe from 'stripe';
import { aedToFils } from '../utils/currency.js';

// POST /api/requests
export const createRequest = async (req, res) => {
  try {
    // Upload photos to R2
    const photoUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToR2(file);
        photoUrls.push(url);
      }
    }

    const requestData = {
      ...req.body,
      userId: req.user.id,
      photos: photoUrls,
      assignMode: 'manual',
      status: 'pending_payment'
    };

    // Parse location if sent as JSON string
    if (typeof req.body.location === 'string') {
      requestData.location = JSON.parse(req.body.location);
    }

    const request = await Request.create(requestData);

    // Determine estimated cost — reads from admin-configurable ServicePricing collection
    const { partsCost, laborCost, total: estimatedTotal } = await getPriceForServiceType(request.serviceType);

    // Create a temporary Quote for upfront payment (pre-approved)
    const quote = await Quote.create({
      requestId: request._id,
      partsCost,
      laborCost,
      status: 'approved'
    });

    // Link quoteId back to the request
    request.quoteId = quote._id;
    await request.save();

    success(res, { request, quoteId: quote._id, autoAssigned: false }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/requests
export const getRequests = async (req, res) => {
  try {
    const { status, serviceType, assignMode, page = 1, limit = 20 } = req.query;
    let filter = {};

    if (req.user.role === 'customer') {
      filter.userId = req.user.id;
    } else if (req.user.role === 'helper' || req.user.role === 'staff') {
      const helper = await Helper.findOne({ userId: req.user.id });
      filter.helperId = helper ? helper._id : null;
    }

    if (status) {
      filter.status = status;
    } else if (req.user.role !== 'customer') {
      filter.status = { $ne: 'pending_payment' };
    }
    
    if (serviceType) filter.serviceType = serviceType;
    if (assignMode)  filter.assignMode  = assignMode;

    const requests = await Request.find(filter)
      .populate('userId', 'name phone')
      .populate('vehicleId', 'make model year registrationNumber')
      .populate('garageId', 'name phone')
      .populate('helperId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const requestsWithInvoices = await Promise.all(requests.map(async (r) => {
      const invoice = await Invoice.findOne({
        $or: [{ jobId: r._id }, { quoteId: r.quoteId }]
      });
      const actualAmount = invoice?.totalAmount || r.estimatedCost || 299;
      return {
        ...r.toObject(),
        estimatedCost: actualAmount,
        invoice
      };
    }));

    const total = await Request.countDocuments(filter);
    success(res, { requests: requestsWithInvoices, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/requests/:id
export const getRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('userId', 'name phone email')
      .populate('vehicleId')
      .populate('garageId')
      .populate('helperId')
      .populate('quoteId');
    if (!request) return error(res, 'Request not found', 404);
    success(res, { request });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PATCH /api/requests/:id/manual-assign (admin only)
export const manualAssign = async (req, res) => {
  try {
    const { garageId, helperId, scheduledDate, scheduledTime, estimatedDuration } = req.body;
    if (!garageId || !helperId) return error(res, 'garageId and helperId are required', 400);

    const request = await Request.findById(req.params.id);
    if (!request) return error(res, 'Request not found', 404);

    if (['cancellation_requested', 'cancelled'].includes(request.status)) {
      return error(res, 'Cannot assign garage or staff to a booking that has a pending cancellation or refund request.', 400);
    }

    const helper = await Helper.findById(helperId);
    if (!helper) return error(res, 'Helper not found', 404);

    // Calculate requested window
    let startTime;
    if (scheduledDate && scheduledTime) {
      startTime = new Date(`${scheduledDate}T${scheduledTime}:00+04:00`);
    } else {
      startTime = request.preferredDate || new Date();
    }

    const durationHours = Number(estimatedDuration) || SERVICE_DURATION_MAP[request.serviceType] || 2;
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

    // Validate availability (avoid race conditions)
    const isAvailable = await checkHelperAvailability(helper, startTime, endTime, request._id);
    if (!isAvailable) {
      return error(res, 'Helper is not available for this time slot (outside working hours or overlapping job exists)', 400);
    }

    // Cancel any existing active slots for this request first
    await HelperBookingSlot.updateMany({ bookingId: request._id, status: { $in: ['reserved', 'in_progress'] } }, { status: 'cancelled' });

    // Create the booking slot
    await HelperBookingSlot.create({
      helperId,
      bookingId: request._id,
      date: startTime,
      startTime,
      endTime,
      status: 'reserved'
    });

    // Complete the assignment on the Request
    request.garageId = garageId;
    request.helperId = helperId;
    request.status = 'assigned';
    request.assignMode = 'manual';
    request.scheduledArrivalDate = startTime;
    request.estimatedDuration = durationHours;
    await request.save();

    // Handle paid upfront request assignment (Quote already paid)
    const paidQuote = await Quote.findOne({ requestId: request._id, status: 'paid' });
    if (paidQuote) {
      paidQuote.garageId = garageId;
      await paidQuote.save();

      let job = await Job.findOne({ requestId: request._id });
      if (job) {
        job.garageId = garageId;
        job.helperId = helperId;
        await job.save();
      } else {
        job = await Job.create({
          quoteId:          paidQuote._id,
          requestId:        request._id,
          garageId:         garageId,
          helperId:         helperId,
          status:           'pickup_scheduled',
          estimatedArrival: new Date(Date.now() + 4 * 60 * 60 * 1000)
        });
      }

      const invoice = await Invoice.findOne({ quoteId: paidQuote._id });
      if (invoice) {
        invoice.garageId = garageId;
        invoice.jobId = job._id;
        await invoice.save();

        const subtotal = Number(paidQuote.subtotal);
        const garagePayoutAmount = parseFloat((subtotal * 0.90).toFixed(2));

        await GaragePayout.create({
          garageId:  garageId,
          invoiceId: invoice._id,
          jobId:     job._id,
          amount:    garagePayoutAmount,
          status:    'pending'
        });
      }
    }

    const populatedRequest = await Request.findById(request._id)
      .populate('garageId', 'name')
      .populate('helperId', 'name phone');

    // Sync isAvailable status (busy indicator) if slot is active right now
    const now = new Date();
    if (startTime <= now && endTime >= now) {
      await Helper.findByIdAndUpdate(helperId, { isAvailable: false });
    }

    // Trigger notification
    try {
      const notifyPopulated = await Request.findById(request._id)
        .populate('userId')
        .populate('helperId');
      if (notifyPopulated && notifyPopulated.userId) {
        await notifyCustomer(notifyPopulated.userId, 'assigned', {
          helperName: notifyPopulated.helperId ? notifyPopulated.helperId.name : 'Service Tech',
          requestId: notifyPopulated._id
        });
      }

      // Notify garage of their new job assignment
      try {
        const notifyGaragePopulated = await Request.findById(request._id)
          .populate('garageId')
          .populate('userId', 'name')
          .populate('vehicleId', 'make model year');
        if (notifyGaragePopulated?.garageId) {
          const assignedJob = await Job.findOne({ requestId: request._id }).sort({ createdAt: -1 });
          await notifyGarage(notifyGaragePopulated.garageId, assignedJob, notifyGaragePopulated);
        }
      } catch (garageNotifyErr) {
        console.error('Garage assignment notification failed:', garageNotifyErr.message);
      }
    } catch (notifyErr) {
      console.error('Manual assignment notification failed:', notifyErr.message);
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('request:assigned', populatedRequest);
    }

    success(res, { request: populatedRequest, message: 'Manually assigned successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PATCH /api/requests/:id/cancel
export const cancelRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return error(res, 'Request not found', 404);

    // Verify ownership: customer can only cancel their own request
    if (req.user.role === 'customer' && request.userId.toString() !== req.user.id) {
      return error(res, 'Unauthorized to cancel this request', 403);
    }

    if (['in_garage', 'completed', 'cancelled'].includes(request.status)) {
      return error(res, `Cannot cancel request in ${request.status} status`, 400);
    }

    request.status = 'cancelled';
    await request.save();

    // If helper was assigned, mark them as available again and cancel booking slot
    if (request.helperId) {
      await Helper.findByIdAndUpdate(request.helperId, { isAvailable: true });
      await HelperBookingSlot.updateMany(
        { bookingId: request._id, status: { $in: ['reserved', 'in_progress'] } },
        { status: 'cancelled' }
      );
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('request:cancelled', request);
    }

    success(res, { request, message: 'Request cancelled successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PATCH /api/requests/:id/schedule
export const updateSchedule = async (req, res) => {
  try {
    const { preferredDate } = req.body;
    if (!preferredDate) {
      return error(res, 'preferredDate is required', 400);
    }

    const request = await Request.findById(req.params.id);
    if (!request) return error(res, 'Request not found', 404);

    // Verify ownership
    if (req.user.role === 'customer' && request.userId.toString() !== req.user.id) {
      return error(res, 'Unauthorized to edit this request schedule', 403);
    }

    // Only allow schedule updates before job gets in garage or completed
    if (['in_garage', 'work_complete', 'ready_for_delivery', 'delivered', 'closed', 'cancelled'].includes(request.status)) {
      return error(res, `Cannot update schedule for request in ${request.status} status`, 400);
    }

    if (!request.helperId) {
      // No helper assigned yet, update directly
      request.preferredDate = new Date(preferredDate);
      request.proposedDate = null;
      request.proposedDateStatus = 'none';
      await request.save();

      // Also update estimated arrival on Job if one exists
      const job = await Job.findOne({ requestId: request._id });
      if (job) {
        job.estimatedArrival = new Date(new Date(preferredDate).getTime() + 2 * 60 * 60 * 1000); // 2 hours buffer
        await job.save();
      }

      const io = req.app.get('io');
      if (io) {
        io.emit('request:updated', request);
      }

      success(res, { request, message: 'Preferred schedule updated successfully' });
    } else {
      // Helper is assigned, set as proposed pending helper approval
      request.proposedDate = new Date(preferredDate);
      request.proposedDateStatus = 'pending';
      await request.save();

      const io = req.app.get('io');
      if (io) {
        io.emit('request:updated', request);
      }

      success(res, { request, message: 'Schedule change proposed and sent to helper for approval' });
    }
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PATCH /api/requests/:id/schedule/respond
export const respondToScheduleProposal = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    if (!['accept', 'reject'].includes(action)) {
      return error(res, 'Action must be either accept or reject', 400);
    }

    const request = await Request.findById(req.params.id);
    if (!request) return error(res, 'Request not found', 404);

    // Verify helper is assigned to this request
    const helper = await Helper.findOne({ userId: req.user.id });
    if (!helper || request.helperId.toString() !== helper._id.toString()) {
      return error(res, 'Unauthorized to respond to schedule change request', 403);
    }

    if (request.proposedDateStatus !== 'pending' || !request.proposedDate) {
      return error(res, 'No pending schedule change proposal found', 400);
    }

    if (action === 'accept') {
      request.preferredDate = request.proposedDate;
      request.proposedDateStatus = 'accepted';

      // Also update estimated arrival on Job if one exists
      const job = await Job.findOne({ requestId: request._id });
      if (job) {
        job.estimatedArrival = new Date(new Date(request.proposedDate).getTime() + 2 * 60 * 60 * 1000);
        await job.save();
      }

      // Update HelperBookingSlot
      const startTime = request.proposedDate;
      const durationHours = SERVICE_DURATION_MAP[request.serviceType] || 2;
      const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

      await HelperBookingSlot.updateMany(
        { bookingId: request._id, status: { $in: ['reserved', 'in_progress'] } },
        { date: startTime, startTime, endTime }
      );
    } else {
      request.proposedDateStatus = 'rejected';
    }

    // Clear proposedDate after handling
    request.proposedDate = null;
    await request.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('request:updated', request);
    }

    success(res, { request, message: `Schedule change request ${action}ed successfully` });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/requests/customer/dashboard-stats
export const getCustomerDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const userId = req.user.id;

    // Get count of user's requests ids
    const userRequestIds = await Request.find({ userId }).distinct('_id');

    const [
      totalVehicles,
      activeRequests,
      pendingQuotes,
      totalServices,
      recentActivity,
      upcomingAppointments
    ] = await Promise.all([
      Vehicle.countDocuments({ userId }),
      Request.countDocuments({
        userId,
        status: { $in: ['pending_payment', 'new', 'assigned', 'quote_pending', 'quote_sent', 'quote_approved', 'pickup_scheduled', 'picked_up', 'in_garage', 'repair_in_progress', 'work_complete', 'ready_for_delivery'] }
      }),
      Quote.countDocuments({
        requestId: { $in: userRequestIds },
        status: { $in: ['pending', 'sent'] }
      }),
      Request.countDocuments({
        userId,
        status: { $in: ['delivered', 'closed'] }
      }),
      Request.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(3)
        .populate('vehicleId'),
      Request.find({
        userId,
        preferredDate: { $gte: now },
        status: { $nin: ['closed', 'cancelled', 'delivered'] }
      })
        .sort({ preferredDate: 1 })
        .limit(3)
        .populate('vehicleId')
    ]);

    success(res, {
      stats: {
        totalVehicles,
        activeRequests,
        pendingQuotes,
        totalServices
      },
      recentActivity,
      upcomingAppointments
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PATCH /api/requests/:id/cancel — Customer requests cancellation & refund, or Admin cancels directly with auto-refund
export const requestCancellation = async (req, res) => {
  try {
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'superadmin');
    const { cancellationReason } = req.body || {};
    const trimmedReason = (cancellationReason || '').trim();

    // If NOT admin, validate reason requirement
    if (!isAdmin) {
      const placeholders = ['no', 'na', 'n/a', 'test', 'none', 'nothing', 'a', 'x', 'nil'];
      if (!trimmedReason || trimmedReason.length < 5 || placeholders.includes(trimmedReason.toLowerCase())) {
        return error(res, 'Please provide a valid cancellation reason explaining why you want to cancel (at least 5 characters).', 400);
      }
    }

    const request = await Request.findById(req.params.id);

    if (!request) return error(res, 'Request not found', 404);

    // Verify ownership or admin role
    if (!isAdmin && request.userId.toString() !== req.user.id.toString()) {
      return error(res, 'Unauthorized', 403);
    }

    if (['completed', 'delivered', 'closed', 'cancelled'].includes(request.status)) {
      return error(res, `Cannot cancel request in status '${request.status}'`, 400);
    }

    // Revoke any reserved booking slots and set active jobs to cancelled
    await HelperBookingSlot.updateMany({ bookingId: request._id }, { status: 'cancelled' });
    await Job.updateMany({ requestId: request._id }, { status: 'cancelled' });

    const invoice = await Invoice.findOne({
      $or: [{ jobId: request._id }, { quoteId: request.quoteId }]
    });
    const payment = invoice ? await Payment.findOne({ invoiceId: invoice._id }) : null;
    const isPaid = (invoice && (invoice.status === 'paid' || invoice.paymentStatus === 'paid')) || (payment && ['completed', 'succeeded', 'paid'].includes(payment?.status));
    const fullAmount = invoice?.totalAmount || request.estimatedCost || request.refundAmount || 299;

    if (isAdmin) {
      // ── ADMIN CANCELLATION: Automatic Full Refund & Immediate Processing ──
      let stripeRefundId = null;
      let isMock = false;

      if (payment && payment.stripePaymentIntentId) {
        const intentId = payment.stripePaymentIntentId;
        const isMockIntent = intentId.startsWith('bypass_') || intentId.startsWith('mock_');

        if (isMockIntent) {
          isMock = true;
          if (process.env.NODE_ENV === 'production') {
            console.warn(
              `[WARN] Mock/bypass payment intent detected in PRODUCTION: ${intentId} for Request ${request._id}. No Stripe refund was issued.`
            );
          }
        } else {
          try {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
            const refundObj = await stripe.refunds.create({
              payment_intent: intentId,
              amount: aedToFils(fullAmount)
            });
            stripeRefundId = refundObj.id;
          } catch (stripeErr) {
            console.error('Stripe refund error during admin cancellation:', stripeErr.message);
            return res.status(502).json({
              success: false,
              message: `Stripe refund failed: ${stripeErr.message}. Request cancellation aborted.`
            });
          }
        }
      }

      request.previousStatus = request.status;
      request.status = 'cancelled';
      request.cancellationReason = trimmedReason || 'Cancelled by Admin (Full Refund Issued)';
      request.refundStatus = 'processed';
      request.refundAmount = isPaid ? fullAmount : 0;
      request.refundedAt = new Date();
      request.isMockTransaction = isMock;
      request.refundApprovedBy = req.user.id || req.user._id || null;
      request.refundApprovedAt = new Date();
      request.cancellationRequestedAt = new Date();

      await request.save();

      // Create Notification for Customer
      await Notification.create({
        userId: request.userId,
        role: 'customer',
        type: 'request_status',
        message: `Your booking #${request._id.toString().slice(-8).toUpperCase()} has been cancelled by Admin. ${isPaid ? `A full refund of AED ${fullAmount.toFixed(2)} has been automatically processed.` : 'No payment was made.'}`
      });

      const io = req.app.get('io');
      if (io) io.emit('request:updated', request);

      return success(res, { request, message: `Booking cancelled by Admin. ${isPaid ? `Full refund of AED ${fullAmount.toFixed(2)} automatically processed!` : 'Unpaid booking cancelled.'}` });
    } else {
      // ── CUSTOMER CANCELLATION ──
      if (!isPaid) {
        // UNPAID Booking: Cancel directly — no admin approval or refund queue needed!
        request.previousStatus = request.status;
        request.status = 'cancelled';
        request.cancellationReason = trimmedReason || 'Cancelled by customer (unpaid)';
        request.refundStatus = 'none';
        request.refundAmount = 0;
        request.cancellationRequestedAt = new Date();

        await request.save();

        const io = req.app.get('io');
        if (io) io.emit('request:updated', request);

        return success(res, { request, message: 'Unpaid booking cancelled immediately! No admin approval or refund required.' });
      } else {
        // PAID Booking: Sent to Admin Approval Queue for refund verification & processing
        request.previousStatus = request.status;
        request.status = 'cancellation_requested';
        request.cancellationReason = trimmedReason || 'Customer requested cancellation and refund';
        request.refundStatus = 'requested';
        request.cancellationRequestedAt = new Date();
        request.refundAmount = fullAmount;

        await request.save();

        // Create Notification for Admin
        await Notification.create({
          userId: req.user.id,
          role: 'admin',
          type: 'request_status',
          message: `Cancellation & refund requested for PAID Booking #${request._id.toString().slice(-8).toUpperCase()} (AED ${fullAmount.toFixed(2)}): ${request.cancellationReason}`
        });

        const io = req.app.get('io');
        if (io) io.emit('request:updated', request);

        return success(res, { request, message: 'Cancellation and refund request submitted! Pending admin approval.' });
      }
    }
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/admin/cancellations/stats — Refund statistics breakdown
export const getRefundStats = async (req, res) => {
  try {
    const { range } = req.query; // 'all', 'month', 'week'
    let dateFilter = {};
    const now = new Date();

    if (range === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: startOfMonth } };
    } else if (range === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      dateFilter = { createdAt: { $gte: startOfWeek } };
    }

    const baseFilter = {
      $or: [
        { status: 'cancellation_requested' },
        { status: 'cancelled' },
        { refundStatus: { $ne: 'none' } }
      ],
      ...dateFilter
    };

    const allRequests = await Request.find(baseFilter);

    const total = allRequests.length;
    const pending = allRequests.filter(r => r.status === 'cancellation_requested' || r.refundStatus === 'requested').length;
    const approved = allRequests.filter(r => r.status === 'cancelled' && ['approved', 'processed'].includes(r.refundStatus)).length;
    const rejected = allRequests.filter(r => r.refundStatus === 'rejected').length;
    
    const totalRefundedAmount = allRequests
      .filter(r => r.status === 'cancelled' && ['approved', 'processed'].includes(r.refundStatus))
      .reduce((sum, r) => sum + (r.refundAmount || 0), 0);

    success(res, {
      total,
      pending,
      approved,
      rejected,
      totalRefundedAmount: Number(totalRefundedAmount.toFixed(2)),
      currency: 'AED'
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/admin/cancellations/:id — Single refund detail for drawer
export const getRefundDetail = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('vehicleId', 'make model year registrationNumber color')
      .populate('garageId', 'name phone email address city area')
      .populate('helperId', 'name phone');

    if (!request) return error(res, 'Refund request not found', 404);

    const invoice = await Invoice.findOne({
      $or: [{ jobId: request._id }, { quoteId: request.quoteId }]
    });
    const payment = invoice ? await Payment.findOne({ invoiceId: invoice._id }) : null;
    const job = await Job.findOne({ requestId: request._id }).populate('helperId', 'name phone');

    success(res, {
      request: {
        ...request.toObject(),
        invoice,
        payment,
        job
      }
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/admin/cancellations — Server-side filtered & paginated refund requests
export const getAdminCancellations = async (req, res) => {
  try {
    const { status, dateFrom, dateTo, service, search, sort = 'newest', page = 1, limit = 10 } = req.query;

    let filter = {
      $or: [
        { status: 'cancellation_requested' },
        { status: 'cancelled' },
        { refundStatus: { $ne: 'none' } }
      ]
    };

    // Filter by status dropdown
    if (status && status !== 'all') {
      if (status === 'pending') {
        filter.$and = [{ $or: [{ status: 'cancellation_requested' }, { refundStatus: 'requested' }] }];
      } else if (status === 'approved') {
        filter.refundStatus = { $in: ['approved', 'processed'] };
      } else if (status === 'rejected') {
        filter.refundStatus = 'rejected';
      }
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    // Filter by service type
    if (service && service !== 'all') {
      filter.$or = [
        { serviceType: service },
        { subCategory: service }
      ];
    }

    // Sort order
    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'highest_refund') sortOptions = { refundAmount: -1 };
    if (sort === 'lowest_refund') sortOptions = { refundAmount: 1 };

    let requests = await Request.find(filter)
      .populate('userId', 'name email phone')
      .populate('vehicleId', 'make model year')
      .populate('garageId', 'name')
      .populate('helperId', 'name phone')
      .sort(sortOptions);

    // Perform search filtering on populated fields if search query present
    if (search) {
      const q = search.toLowerCase().trim();
      requests = requests.filter(r => {
        const bookingId = (r._id ? r._id.toString() : '').toLowerCase();
        const shortId = bookingId.slice(-8);
        const name = (r.userId?.name || '').toLowerCase();
        const email = (r.userId?.email || '').toLowerCase();
        const phone = (r.userId?.phone || '').toLowerCase();
        return bookingId.includes(q) || shortId.includes(q) || name.includes(q) || email.includes(q) || phone.includes(q);
      });
    }

    // Pagination
    const total = requests.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const totalPages = Math.ceil(total / limitNum) || 1;
    const paginatedRequests = requests.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // Attach invoice & payment info
    const results = await Promise.all(paginatedRequests.map(async (r) => {
      const invoice = await Invoice.findOne({
        $or: [{ jobId: r._id }, { quoteId: r.quoteId }]
      });
      const payment = invoice ? await Payment.findOne({ invoiceId: invoice._id }) : null;
      const isPaidVerified = (invoice && (invoice.status === 'paid' || invoice.paymentStatus === 'paid')) || (payment && ['completed', 'succeeded', 'paid'].includes(payment.status));
      return {
        ...r.toObject(),
        invoice,
        payment,
        isPaidVerified
      };
    }));

    success(res, {
      results,
      requests: results, // Backward compatibility
      total,
      page: pageNum,
      totalPages
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/admin/cancellations/:id/approve — Admin approves cancellation & executes custom or full refund
export const approveRefund = async (req, res) => {
  try {
    const { customRefundAmount, adminNotes } = req.body || {};
    const request = await Request.findById(req.params.id);
    if (!request) return error(res, 'Request not found', 404);

    // ── Idempotency guard ──────────────────────────────────────────────────────
    // Prevents double-money-movement if the admin double-clicks or retries.
    if (['processed', 'rejected'].includes(request.refundStatus)) {
      return res.status(409).json({
        success: false,
        message: `This refund request has already been resolved (status: ${request.refundStatus}). No funds were moved.`
      });
    }

    const invoice = await Invoice.findOne({
      $or: [{ jobId: request._id }, { quoteId: request.quoteId }]
    });

    const fullAmount = invoice?.totalAmount || request.refundAmount || 0;
    const finalRefundAmount = (customRefundAmount !== undefined && customRefundAmount !== null && customRefundAmount !== '')
      ? Number(customRefundAmount)
      : fullAmount;

    // ── Server-side amount validation ─────────────────────────────────────────
    // Must validate before any Stripe call so no state is left half-updated.
    if (finalRefundAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount must be greater than AED 0.'
      });
    }
    if (finalRefundAmount > fullAmount) {
      return res.status(400).json({
        success: false,
        message: `Refund amount (AED ${finalRefundAmount.toFixed(2)}) cannot exceed the original payment of AED ${fullAmount.toFixed(2)}.`
      });
    }

    let payment = invoice ? await Payment.findOne({ invoiceId: invoice._id }) : null;
    let stripeRefundId = null;
    let isMock = false;

    if (payment && payment.stripePaymentIntentId) {
      const intentId = payment.stripePaymentIntentId;
      const isMockIntent = intentId.startsWith('bypass_') || intentId.startsWith('mock_');

      if (isMockIntent) {
        // ── Mock/bypass flagging ───────────────────────────────────────────────
        isMock = true;
        if (process.env.NODE_ENV === 'production') {
          console.warn(
            `[WARN] Mock/bypass payment intent detected in PRODUCTION: ${intentId} for Request ${request._id}. No Stripe refund was issued.`
          );
        }
      } else {
        // ── Real Stripe refund ─────────────────────────────────────────────────
        try {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
          const refundObj = await stripe.refunds.create({
            payment_intent: intentId,
            amount: aedToFils(finalRefundAmount) // Use shared helper — never raw Math.round
          });
          stripeRefundId = refundObj.id;
        } catch (stripeErr) {
          console.error('Stripe refund error:', stripeErr.message);
          return res.status(502).json({
            success: false,
            message: `Stripe refund failed: ${stripeErr.message}. No local state was changed.`
          });
        }
      }
    }

    // ── Update Request ─────────────────────────────────────────────────────────
    request.status = 'cancelled';
    request.refundStatus = 'processed';
    request.refundAmount = finalRefundAmount;
    request.refundedAt = new Date();
    request.isMockTransaction = isMock;
    // Audit trail — who approved and when
    request.refundApprovedBy = req.user?.id || req.user?._id || null;
    request.refundApprovedAt = new Date();
    if (adminNotes) {
      request.cancellationReason = `${request.cancellationReason || ''} (Admin Note: ${adminNotes})`.trim();
    }

    if (!request.statusHistory) request.statusHistory = [];
    request.statusHistory.push({
      status: 'approved',
      changedBy: req.user?.name || req.user?.email || 'Admin',
      changedAt: new Date(),
      note: adminNotes || `Refund of AED ${finalRefundAmount.toFixed(2)} approved & processed${isMock ? ' [TEST — no funds moved]' : ''}`
    });

    await request.save();

    // ── Update Invoice & Payment ───────────────────────────────────────────────
    if (invoice) {
      invoice.status = 'refunded';
      await invoice.save();
    }
    if (payment) {
      payment.status = 'refunded';
      if (stripeRefundId) payment.stripeRefundId = stripeRefundId;
      payment.refundedAt = new Date();
      await payment.save();
    }

    // ── Notify Customer ────────────────────────────────────────────────────────
    await Notification.create({
      userId: request.userId,
      role: 'customer',
      type: 'request_status',
      message: `Your cancellation request for Booking #${request._id.toString().slice(-8).toUpperCase()} was approved! Refund of AED ${finalRefundAmount.toFixed(2)} processed.`
    });

    const io = req.app.get('io');
    if (io) io.emit('request:updated', request);

    success(res, {
      request,
      isMockTransaction: isMock,
      message: `Cancellation approved & AED ${finalRefundAmount.toFixed(2)} refund processed successfully!${isMock ? ' (Test transaction — no real funds moved)' : ''}`
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/admin/cancellations/:id/reject — Admin rejects cancellation request
export const rejectCancellation = async (req, res) => {
  try {
    const { rejectionReason } = req.body || {};
    const request = await Request.findById(req.params.id);
    if (!request) return error(res, 'Request not found', 404);

    // ── Idempotency guard ──────────────────────────────────────────────────────
    if (['processed', 'rejected'].includes(request.refundStatus)) {
      return res.status(409).json({
        success: false,
        message: `This cancellation request has already been resolved (status: ${request.refundStatus}).`
      });
    }

    // ── Revert booking status & record rejection ───────────────────────────────
    request.status = request.previousStatus || 'assigned';
    request.refundStatus = 'rejected';
    // Audit trail — who rejected and when
    request.refundRejectedBy = req.user?.id || req.user?._id || null;
    request.refundRejectedAt = new Date();

    if (!request.statusHistory) request.statusHistory = [];
    request.statusHistory.push({
      status: 'rejected',
      changedBy: req.user?.name || req.user?.email || 'Admin',
      changedAt: new Date(),
      note: rejectionReason || 'Cancellation request rejected'
    });

    await request.save();

    // ── Notify Customer ────────────────────────────────────────────────────────
    await Notification.create({
      userId: request.userId,
      role: 'customer',
      type: 'request_status',
      message: `Your cancellation request for Booking #${request._id.toString().slice(-8).toUpperCase()} was rejected: ${rejectionReason || 'Service is already underway'}`
    });

    const io = req.app.get('io');
    if (io) io.emit('request:updated', request);

    success(res, { request, message: 'Cancellation request rejected successfully.' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/admin/cancellations/export — Export refunds report as XLSX or PDF
export const exportRefundReport = async (req, res) => {
  try {
    const { format = 'pdf', range = 'month', dateFrom, dateTo } = req.query;
    const now = new Date();
    let dateFilter = {};
    let rangeLabel = 'All Time';

    if (range === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: startOfDay, $lte: endOfDay } };
      rangeLabel = 'Today (' + now.toLocaleDateString('en-AE') + ')';
    } else if (range === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: startOfMonth } };
      rangeLabel = 'This Month (' + now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + ')';
    } else if (range === 'custom' && (dateFrom || dateTo)) {
      let customFilter = {};
      if (dateFrom) customFilter.$gte = new Date(dateFrom);
      if (dateTo) {
        const dTo = new Date(dateTo);
        dTo.setHours(23, 59, 59, 999);
        customFilter.$lte = dTo;
      }
      dateFilter = { createdAt: customFilter };
      rangeLabel = `Custom Range (${dateFrom || 'Start'} to ${dateTo || 'End'})`;
    }

    const baseFilter = {
      $or: [
        { status: 'cancellation_requested' },
        { status: 'cancelled' },
        { refundStatus: { $ne: 'none' } }
      ],
      ...dateFilter
    };

    const requests = await Request.find(baseFilter)
      .populate('userId', 'name email phone')
      .populate('vehicleId', 'make model year plateNumber')
      .sort({ createdAt: -1 });

    const formatServiceLabel = (serviceType, subCategory) => {
      const val = subCategory || serviceType || '';
      if (!val) return 'General Service';
      const map = {
        'ac_repair': 'AC Repair',
        'emergency_pickup': 'Emergency Pickup',
        'minor_service': 'Minor Service',
        'major_service': 'Major Service',
        'brake_repair': 'Brake Repair',
        'roadside_assistance': 'Roadside Assistance',
        'electrical': 'Electrical Repair',
        'diagnostics': 'Computer Diagnostics',
        'battery': 'Battery Replacement',
        'tyre_change': 'Tyre Change'
      };
      if (map[val.toLowerCase()]) return map[val.toLowerCase()];
      return val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Refund Requests');

      worksheet.columns = [
        { header: 'Booking ID', key: 'bookingId', width: 16 },
        { header: 'Customer Name', key: 'customerName', width: 22 },
        { header: 'Customer Contact', key: 'customerContact', width: 26 },
        { header: 'Service', key: 'service', width: 22 },
        { header: 'Refund Amount (AED)', key: 'refundAmount', width: 22 },
        { header: 'Cancellation Reason', key: 'reason', width: 35 },
        { header: 'Status', key: 'status', width: 22 },
        { header: 'Date Requested', key: 'date', width: 20 }
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0F172A' }
      };

      let totalRefunded = 0;

      requests.forEach(r => {
        const isPending = r.status === 'cancellation_requested' || r.refundStatus === 'requested';
        const isApproved = r.status === 'cancelled' && ['approved', 'processed'].includes(r.refundStatus);

        const amount = r.refundAmount || r.invoice?.totalAmount || r.estimatedCost || 299;
        if (isApproved) totalRefunded += amount;

        const cleanReason = (r.cancellationReason || 'N/A').replace(/^["']|["']$/g, '').trim();

        worksheet.addRow({
          bookingId: '#' + (r._id ? r._id.toString().slice(-8).toUpperCase() : 'N/A'),
          customerName: r.userId?.name || 'Customer',
          customerContact: r.userId?.email || r.userId?.phone || 'N/A',
          service: formatServiceLabel(r.serviceType, r.subCategory),
          refundAmount: amount,
          reason: cleanReason,
          status: isPending ? 'Pending Review' : isApproved ? 'Approved & Refunded' : 'Rejected',
          date: new Date(r.cancellationRequestedAt || r.createdAt).toLocaleDateString('en-AE')
        });
      });

      // Total Row
      const totalRow = worksheet.addRow({
        bookingId: 'TOTAL',
        customerName: `${requests.length} Requests`,
        customerContact: '',
        service: '',
        refundAmount: totalRefunded,
        reason: '',
        status: '',
        date: ''
      });
      totalRow.font = { bold: true };
      worksheet.getColumn('refundAmount').numFmt = 'AED #,##0.00';

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=refund_requests_${range}.xlsx`);

      await workbook.xlsx.write(res);
      return res.end();
    } else {
      // PDF Report Generation
      let totalRefunded = 0;
      let pendingCount = 0;
      let approvedCount = 0;
      let rejectedCount = 0;

      let tableRows = '';

      requests.forEach(r => {
        const isPending = r.status === 'cancellation_requested' || r.refundStatus === 'requested';
        const isApproved = r.status === 'cancelled' && ['approved', 'processed'].includes(r.refundStatus);
        const isRejected = r.refundStatus === 'rejected';

        if (isPending) pendingCount++;
        if (isApproved) approvedCount++;
        if (isRejected) rejectedCount++;

        const amount = r.refundAmount || r.invoice?.totalAmount || r.estimatedCost || 299;
        if (isApproved) totalRefunded += amount;

        const cleanReason = (r.cancellationReason || 'N/A').replace(/^["']|["']$/g, '').trim();
        const statusLabel = isPending ? 'PENDING' : isApproved ? 'APPROVED & REFUNDED' : 'REJECTED';
        const statusBg = isPending ? '#fef2f2; color: #dc2626;' : isApproved ? '#f0fdf4; color: #16a34a;' : '#f1f5f9; color: #64748b;';

        tableRows += `
          <tr>
            <td style="font-family: monospace; font-weight: bold;">#${r._id ? r._id.toString().slice(-8).toUpperCase() : 'N/A'}</td>
            <td><strong>${r.userId?.name || 'Customer'}</strong><br/><span style="font-size:10px; color:#64748b;">${r.userId?.email || r.userId?.phone || ''}</span></td>
            <td>${formatServiceLabel(r.serviceType, r.subCategory)}</td>
            <td style="font-weight: bold; color: #16a34a;">AED ${amount.toFixed(2)}</td>
            <td style="max-width: 200px; word-break: break-word;">${cleanReason}</td>
            <td><span style="background: ${statusBg} padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: bold;">${statusLabel}</span></td>
            <td style="font-size: 11px; color: #64748b;">${new Date(r.cancellationRequestedAt || r.createdAt).toLocaleDateString('en-AE')}</td>
          </tr>
        `;
      });

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; padding: 30px; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ff5c1a; padding-bottom: 15px; margin-bottom: 20px; }
            .logo { font-size: 26px; font-weight: 800; color: #ff5c1a; letter-spacing: -1px; }
            .title { text-align: right; }
            .title h2 { margin: 0; color: #0f172a; font-size: 18px; }
            .title p { margin: 3px 0 0; font-size: 12px; color: #64748b; }
            .stats-grid { display: flex; gap: 12px; margin-bottom: 20px; }
            .stat-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
            .stat-val { font-size: 18px; font-weight: 800; margin-top: 4px; }
            .stat-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
            th { background: #0f172a; color: #fff; padding: 10px; text-align: left; font-size: 10px; text-transform: uppercase; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">GARRO</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">UAE Car Services Platform</div>
            </div>
            <div class="title">
              <h2>Refund Requests Report</h2>
              <p>Period: <strong>${rangeLabel}</strong></p>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-lbl">Total Requests</div>
              <div class="stat-val">${requests.length}</div>
            </div>
            <div class="stat-card">
              <div class="stat-lbl">Pending Review</div>
              <div class="stat-val" style="color: #d97706;">${pendingCount}</div>
            </div>
            <div class="stat-card">
              <div class="stat-lbl">Approved</div>
              <div class="stat-val" style="color: #16a34a;">${approvedCount}</div>
            </div>
            <div class="stat-card">
              <div class="stat-lbl">Total Refunded</div>
              <div class="stat-val" style="color: #16a34a;">AED ${totalRefunded.toFixed(2)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows || '<tr><td colspan="7" style="text-align:center;">No refund requests found for this period.</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            Generated by Garro Admin System on ${new Date().toLocaleDateString('en-AE')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </body>
        </html>
      `;

      const buffer = await generatePDF(html);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=refund_requests_${range}.pdf`);
      return res.send(buffer);
    }
  } catch (err) {
    return error(res, err.message, 500);
  }
};
