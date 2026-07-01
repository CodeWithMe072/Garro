import Request from '../models/Request.js';
import Helper from '../models/Helper.js';
import Job from '../models/Job.js';
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
      status: 'new'
    };

    // Parse location if sent as JSON string
    if (typeof req.body.location === 'string') {
      requestData.location = JSON.parse(req.body.location);
    }

    const request = await Request.create(requestData);

    const io = req.app.get('io');
    if (io) {
      io.emit('request:new', request);
    }

    success(res, { request, autoAssigned: false }, 201);
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

    if (status)      filter.status      = status;
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
    const { garageId, helperId } = req.body;
    if (!garageId || !helperId) return error(res, 'garageId and helperId are required', 400);

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { garageId, helperId, status: 'assigned', assignMode: 'manual' },
      { new: true }
    ).populate('garageId', 'name').populate('helperId', 'name phone');

     if (!request) return error(res, 'Request not found', 404);

    // Mark helper as unavailable
    await Helper.findByIdAndUpdate(helperId, { isAvailable: false });

    // Trigger notification
    try {
      const populatedRequest = await Request.findById(request._id)
        .populate('userId')
        .populate('helperId');
      if (populatedRequest && populatedRequest.userId) {
        await notifyCustomer(populatedRequest.userId, 'assigned', {
          helperName: populatedRequest.helperId ? populatedRequest.helperId.name : 'Service Tech',
          requestId: populatedRequest._id
        });
      }
    } catch (notifyErr) {
      console.error('Manual assignment notification failed:', notifyErr.message);
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('request:assigned', request);
    }

    success(res, { request, message: 'Manually assigned successfully' });
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

    // If helper was assigned, mark them as available again
    if (request.helperId) {
      await Helper.findByIdAndUpdate(request.helperId, { isAvailable: true });
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
