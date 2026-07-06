import Job from '../models/Job.js';
import Helper from '../models/Helper.js';
import HelperBookingSlot from '../models/HelperBookingSlot.js';
import Invoice from '../models/Invoice.js';
import Quote from '../models/Quote.js';
import Request from '../models/Request.js';
import VCR from '../models/VehicleConditionReport.js';
import { success, error } from '../utils/response.js';
import { notifyCustomer } from '../utils/notify.js';
import { uploadToR2 } from '../utils/upload.js';
import { logActivity } from '../utils/audit.js';

const STATUS_FLOW = {
  pickup_scheduled:   ['picked_up'],
  picked_up:          ['in_garage'],
  in_garage:          ['inspection_done'],
  inspection_done:    ['repair_in_progress'],
  repair_in_progress: ['work_complete'],
  work_complete:      ['ready_for_delivery'],
  ready_for_delivery: ['delivered'],
  delivered:          ['closed']
};

const STATUS_ROLES = {
  pickup_scheduled:   ['admin', 'helper'],
  picked_up:          ['helper'],
  in_garage:          ['admin', 'helper', 'garage'],
  inspection_done:    ['admin', 'garage'],
  repair_in_progress: ['admin', 'garage'],
  work_complete:      ['admin', 'garage'],
  ready_for_delivery: ['admin', 'helper', 'garage'],
  delivered:          ['helper'],
  closed:             ['admin']
};

// GET /api/jobs
export const getJobs = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'helper' || req.user.role === 'staff') {
      const helper = await Helper.findOne({ userId: req.user.id });
      filter = { helperId: helper ? helper._id : null };
    }
    const jobs = await Job.find(filter)
      .populate('quoteId')
      .populate({
        path: 'requestId',
        populate: [
          { path: 'userId', select: 'name phone' },
          { path: 'vehicleId', select: 'make model year registrationNumber' }
        ]
      })
      .populate('garageId', 'name phone')
      .populate('helperId', 'name phone')
      .sort({ createdAt: -1 });
    success(res, { jobs });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/jobs/:id
export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('quoteId')
      .populate('requestId')
      .populate('garageId')
      .populate('helperId');
    if (!job) return error(res, 'Job not found', 404);
    success(res, { job });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PUT /api/jobs/:id/status
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return error(res, 'Job not found', 404);

    // Normalize user role mapping so all management/staff roles gain admin rights
    let userRole = req.user.role;
    if (['superadmin', 'manager', 'staff'].includes(userRole)) {
      userRole = 'admin';
    }

    // Validate role can update this status
    const allowedRoles = STATUS_ROLES[status] || [];
    if (!allowedRoles.includes(userRole)) {
      return error(res, `Your role cannot set status to "${status}"`, 403);
    }

    // Validate status sequence
    const allowedNext = STATUS_FLOW[job.status] || [];
    if (!allowedNext.includes(status)) {
      return error(res, `Cannot move from "${job.status}" to "${status}"`, 400);
    }

    // Condition report required before moving to in_garage
    if (status === 'in_garage' && !job.conditionReportId) {
      return error(res, 'Vehicle condition report must be submitted before moving to in_garage', 400);
    }

    job.status = status;
    if (status === 'picked_up') {
      job.startDate = new Date();
      await HelperBookingSlot.updateMany({ bookingId: job.requestId, status: 'reserved' }, { status: 'in_progress' });
    }
    if (status === 'in_garage') {
      // Helper successfully brought the vehicle to the garage - mark free for next job!
      if (job.helperId) {
        await Helper.findByIdAndUpdate(job.helperId, { isAvailable: true, activeJobId: null });
        await HelperBookingSlot.updateMany({ bookingId: job.requestId, status: { $in: ['reserved', 'in_progress'] } }, { status: 'completed' });
      }
    }
    if (status === 'delivered') {
      job.actualEndDate = new Date();
      // Helper successfully delivered the vehicle to customer - mark free!
      if (job.helperId) {
        await Helper.findByIdAndUpdate(job.helperId, { isAvailable: true, activeJobId: null });
        await HelperBookingSlot.updateMany({ bookingId: job.requestId, status: { $in: ['reserved', 'in_progress'] } }, { status: 'completed' });
      }
    }
    const oldStatus = job.status;
    await job.save();

    // Log Activity
    await logActivity(req.user.id, 'job_status_change', 'Job', job._id, { oldStatus, newStatus: status });

    // Auto-create invoice when job is closed
    if (status === 'closed') {
      const quote = await Quote.findById(job.quoteId);
      await Invoice.create({
        jobId:   job._id,
        amount:  quote.subtotal,
        vat:     quote.vat,
        total:   quote.customerTotal,
        status:  'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
      // Free up helper (fail-safe)
      if (job.helperId) {
        await Helper.findByIdAndUpdate(job.helperId, { isAvailable: true, activeJobId: null });
        await HelperBookingSlot.updateMany({ bookingId: job.requestId, status: { $in: ['reserved', 'in_progress'] } }, { status: 'completed' });
      }
    }

    // Sync request status & Notify customer
    try {
      const request = await Request.findById(job.requestId).populate('userId');
      if (request) {
        request.status = status;
        await request.save();
      }
      const customer = request?.userId;
      const notifyData = { jobId: job._id };

      if (status === 'closed') {
        const invoice = await Invoice.findOne({ jobId: job._id });
        notifyData.total = invoice ? invoice.total : 0;
      }

      if (customer) {
        await notifyCustomer(customer, status, notifyData);
      }
    } catch (notifyErr) {
      console.error('Notification failed:', notifyErr.message);
    }

    // Emit status update to customer via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`job:${job._id}`).emit('job:status', {
        jobId:  job._id,
        status: job.status,
        updatedAt: new Date()
      });
    }

    success(res, { job });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/jobs/:id/photos — helper uploads inspection photos
export const uploadPhotos = async (req, res) => {
  try {
    const photoUrls = [];
    if (req.files) {
      for (const file of req.files) {
        photoUrls.push(await uploadToR2(file));
      }
    }
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $push: { photos: { $each: photoUrls } } },
      { new: true }
    );
    success(res, { job });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/jobs/:id/condition-report
export const submitConditionReport = async (req, res) => {
  try {
    const photoUrls = [];
    if (req.files) {
      for (const file of req.files) {
        photoUrls.push(await uploadToR2(file));
      }
    }

    const report = await VCR.create({
      ...req.body,
      jobId:  req.params.id,
      photos: photoUrls
    });

    await Job.findByIdAndUpdate(req.params.id, { conditionReportId: report._id });
    success(res, { report }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/jobs/request/:requestId
export const getJobByRequestId = async (req, res) => {
  try {
    const job = await Job.findOne({ requestId: req.params.requestId })
      .populate('quoteId')
      .populate('requestId')
      .populate('garageId', 'name rating phone')
      .populate('helperId', 'name rating phone');
    if (!job) return error(res, 'Job not found for this request', 404);
    success(res, { job });
  } catch (err) {
    error(res, err.message, 500);
  }
};
