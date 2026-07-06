import Request from '../models/Request.js';
import Helper from '../models/Helper.js';
import Job from '../models/Job.js';
import Quote from '../models/Quote.js';
import Invoice from '../models/Invoice.js';
import GaragePayout from '../models/GaragePayout.js';
import HelperBookingSlot from '../models/HelperBookingSlot.js';
import { checkHelperAvailability, SERVICE_DURATION_MAP } from './helper.controller.js';
import { uploadToR2  } from '../utils/upload.js';
import { success, error  } from '../utils/response.js';
import { notifyCustomer } from '../utils/notify.js';

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

    // Determine estimated cost based on serviceType
    const serviceTypeCosts = {
      minor_service: 299,
      brake_repair: 399,
      battery: 499,
      ac_repair: 249,
      other: 199
    };
    const estimatedCost = serviceTypeCosts[request.serviceType] || 199;

    // Create a temporary Quote for upfront payment (pre-approved)
    const quote = await Quote.create({
      requestId: request._id,
      partsCost: 0,
      laborCost: estimatedCost,
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
      .populate('helperId');
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

      const job = await Job.create({
        quoteId:          paidQuote._id,
        requestId:        request._id,
        garageId:         garageId,
        helperId:         helperId,
        status:           'pickup_scheduled',
        estimatedArrival: new Date(Date.now() + 4 * 60 * 60 * 1000)
      });

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
