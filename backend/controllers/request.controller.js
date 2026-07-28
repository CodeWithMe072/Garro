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
import Stripe from 'stripe';

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

    const total = await Request.countDocuments(filter);
    success(res, { requests, total, page: Number(page), pages: Math.ceil(total / limit) });
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

// PATCH /api/requests/:id/cancel — Customer requests cancellation & refund
export const requestCancellation = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) return error(res, 'Request not found', 404);

    // Verify ownership or admin role
    if (req.user.role === 'customer' && request.userId.toString() !== req.user.id.toString()) {
      return error(res, 'Unauthorized', 403);
    }

    if (['completed', 'delivered', 'closed', 'cancelled'].includes(request.status)) {
      return error(res, `Cannot cancel request in status '${request.status}'`, 400);
    }

    const unpaidStatuses = ['pending_payment', 'quote_pending', 'new'];
    const isUnpaid = unpaidStatuses.includes(request.status);

    if (isUnpaid) {
      request.status = 'cancelled';
      request.cancellationReason = cancellationReason || 'Cancelled by customer before payment';
      request.refundStatus = 'none';
      await request.save();

      const io = req.app.get('io');
      if (io) io.emit('request:updated', request);

      return success(res, { request, message: 'Request cancelled successfully.' });
    }

    // For paid bookings, set to cancellation_requested & refundStatus: 'requested'
    request.previousStatus = request.status;
    request.status = 'cancellation_requested';
    request.cancellationReason = cancellationReason || 'Customer requested cancellation and refund';
    request.refundStatus = 'requested';
    request.cancellationRequestedAt = new Date();

    // Revoke any reserved booking slots and set active jobs to cancelled
    await HelperBookingSlot.updateMany({ bookingId: request._id }, { status: 'cancelled' });
    await Job.updateMany({ requestId: request._id }, { status: 'cancelled' });

    const invoice = await Invoice.findOne({
      $or: [{ jobId: request._id }, { quoteId: request.quoteId }]
    });
    if (invoice) {
      request.refundAmount = invoice.totalAmount || 0;
    }

    await request.save();

    // Create Notification for Admin
    await Notification.create({
      userId: req.user.id,
      role: 'admin',
      type: 'request_status',
      message: `Cancellation & refund requested for Booking #${request._id.toString().slice(-8).toUpperCase()}: ${request.cancellationReason}`
    });

    const io = req.app.get('io');
    if (io) io.emit('request:updated', request);

    success(res, { request, message: 'Cancellation and refund request submitted! Pending admin approval.' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/admin/cancellations — Admin views pending cancellation & refund requests
export const getAdminCancellations = async (req, res) => {
  try {
    const requests = await Request.find({
      $or: [
        { status: 'cancellation_requested' },
        { refundStatus: { $in: ['requested', 'approved', 'processed', 'rejected'] } }
      ]
    })
      .populate('userId', 'name email phone')
      .populate('vehicleId', 'make model year')
      .populate('garageId', 'name')
      .sort({ updatedAt: -1 });

    // Attach invoice & payment info
    const requestsWithPayments = await Promise.all(requests.map(async (r) => {
      const invoice = await Invoice.findOne({
        $or: [{ jobId: r._id }, { quoteId: r.quoteId }]
      });
      const payment = invoice ? await Payment.findOne({ invoiceId: invoice._id }) : null;
      return {
        ...r.toObject(),
        invoice,
        payment
      };
    }));

    success(res, { requests: requestsWithPayments });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/admin/cancellations/:id/approve — Admin approves cancellation & executes custom or full refund
export const approveRefund = async (req, res) => {
  try {
    const { customRefundAmount, adminNotes } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return error(res, 'Request not found', 404);

    const invoice = await Invoice.findOne({
      $or: [{ jobId: request._id }, { quoteId: request.quoteId }]
    });

    const fullAmount = invoice?.totalAmount || request.refundAmount || 0;
    const finalRefundAmount = (customRefundAmount !== undefined && customRefundAmount !== null && customRefundAmount !== '')
      ? Number(customRefundAmount)
      : fullAmount;

    let payment = invoice ? await Payment.findOne({ invoiceId: invoice._id }) : null;
    if (!payment && invoice?.stripePaymentIntentId) {
      payment = await Payment.findOne({ stripePaymentIntentId: invoice.stripePaymentIntentId });
    }

    let refundResult = null;
    const paymentIntentId = invoice?.stripePaymentIntentId || payment?.stripePaymentIntentId;

    if (paymentIntentId) {
      const isMock = paymentIntentId.startsWith('bypass_') || paymentIntentId.startsWith('mock_');
      if (isMock) {
        console.log(`[Refund Simulation] Approved test/mock refund of AED ${finalRefundAmount} for PaymentIntent: ${paymentIntentId}`);
        refundResult = { id: 're_mock_' + Date.now() };
      } else {
        const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
        if (stripe) {
          try {
            refundResult = await stripe.refunds.create({
              payment_intent: paymentIntentId,
              amount: Math.round(finalRefundAmount * 100)
            });
          } catch (stripeErr) {
            console.error('Stripe refund execution failed:', stripeErr.message);
            return error(res, `Stripe refund failed: ${stripeErr.message}`, 400);
          }
        }
      }
    }

    // Update Payment, Invoice, Request status
    if (payment) {
      payment.status = 'refunded';
      payment.stripeRefundId = refundResult?.id || 're_manual_' + Date.now();
      payment.refundedAt = new Date();
      await payment.save();
    }

    if (invoice) {
      invoice.status = 'refunded';
      await invoice.save();
    }

    request.status = 'cancelled';
    request.refundStatus = 'processed';
    request.refundAmount = finalRefundAmount;
    request.refundedAt = new Date();
    if (adminNotes) request.adminNotes = adminNotes;
    await request.save();

    // Send push notification to Customer
    const noteText = adminNotes ? ` (${adminNotes})` : '';
    await Notification.create({
      userId: request.userId,
      role: 'customer',
      type: 'payment_update',
      message: `Your cancellation and refund of AED ${finalRefundAmount.toFixed(2)} has been approved and processed!${noteText} Funds will appear in your account.`
    });

    const io = req.app.get('io');
    if (io) io.emit('request:updated', request);

    success(res, { request, message: `Cancellation approved & AED ${finalRefundAmount.toFixed(2)} refund processed successfully!` });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/admin/cancellations/:id/reject — Admin rejects cancellation request
export const rejectCancellation = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return error(res, 'Request not found', 404);

    // Revert status
    request.status = request.previousStatus || 'assigned';
    request.refundStatus = 'rejected';
    await request.save();

    // Notify Customer
    await Notification.create({
      userId: request.userId,
      role: 'customer',
      type: 'request_status',
      message: `Your cancellation request for Booking #${request._id.toString().slice(-8).toUpperCase()} was rejected: ${rejectionReason || 'Service is already underway'}`
    });

    const io = req.app.get('io');
    if (io) io.emit('request:updated', request);

    success(res, { request, message: 'Cancellation request rejected. Booking status reverted.' });
  } catch (err) {
    error(res, err.message, 500);
  }
};
