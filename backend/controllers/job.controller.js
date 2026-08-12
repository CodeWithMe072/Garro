import crypto from 'crypto';
import Job from '../models/Job.js';
import Helper from '../models/Helper.js';
import HelperBookingSlot from '../models/HelperBookingSlot.js';
import Invoice from '../models/Invoice.js';
import Quote, { computeMargin } from '../models/Quote.js';
import Request from '../models/Request.js';
import VCR from '../models/VehicleConditionReport.js';
import User from '../models/User.js';
import { success, error } from '../utils/response.js';
import { notifyCustomer, notifyScopeRevision, notifyFounderDelegateAction } from '../utils/notify.js';
import { uploadToR2 } from '../utils/upload.js';
import { logActivity } from '../utils/audit.js';

const STATUS_FLOW = {
  pickup_scheduled:   ['arrived_at_customer', 'picked_up'],
  arrived_at_customer:['picked_up'],
  picked_up:          ['in_garage'],
  in_garage:          ['inspection_done', 'repair_in_progress'],
  inspection_done:    ['repair_in_progress'],
  repair_in_progress: ['service_done'],
  service_done:       ['delivered'],
  delivered:          ['closed']
};

const STATUS_ROLES = {
  pickup_scheduled:   ['admin', 'helper', 'garage'],
  arrived_at_customer:['admin', 'helper', 'garage'],
  picked_up:          ['admin', 'helper', 'garage'],
  in_garage:          ['admin', 'helper', 'garage'],
  inspection_done:    ['admin', 'helper', 'garage'],
  repair_in_progress: ['admin', 'helper', 'garage'],
  service_done:       ['admin', 'helper', 'garage'],
  delivered:          ['admin', 'helper', 'garage'],
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
          { path: 'userId', select: 'name phone email' },
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
      .populate({
        path: 'requestId',
        populate: [
          { path: 'userId', select: 'name phone email' },
          { path: 'vehicleId', select: 'make model year registrationNumber' }
        ]
      })
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

    // Block status updates if a scope revision >20% is pending customer approval
    if (job.isScopeApprovalPending) {
      return error(res, 'Job progress is blocked pending customer approval for scope revision exceeding 20% threshold', 400);
    }

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

    // Record Stage Timestamps
    if (!job.stageTimestamps) job.stageTimestamps = {};
    if (['picked_up', 'in_garage'].includes(status) && !job.stageTimestamps.contact) {
      job.stageTimestamps.contact = new Date();
    }
    if (['delivered', 'closed'].includes(status) && !job.stageTimestamps.delivery) {
      job.stageTimestamps.delivery = new Date();
    }
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
      const reqDoc = await Request.findById(job.requestId);
      if (quote) {
        await Invoice.create({
          jobId:      job._id,
          quoteId:    quote._id,
          customerId: reqDoc?.userId || job.requestId,
          garageId:   job.garageId,
          partsCost:   quote.partsCost || 0,
          laborCost:   quote.laborCost || 0,
          subtotal:    quote.subtotal || 0,
          vatAmount:   quote.vat || 0,
          totalAmount: quote.customerTotal || 0,
          serviceFeeAmount: quote.serviceFee || 0,
          status:     'pending',
          dueDate:    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
      }
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

    // Emit status update to customer, staff, garage, and admin via Socket.IO
    const io = req.app.get('io');
    if (io) {
      const payload = {
        _id: job.requestId,
        jobId: job._id,
        requestId: job.requestId,
        status: job.status,
        updatedAt: new Date()
      };
      io.to(`job:${job._id}`).emit('job:status', payload);
      io.emit('job:status', payload);
      io.emit('request:updated', payload);
      io.emit('job:updated', job);
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

// PUT /api/jobs/:id/extend-time — staff/tech extends job completion time
export const extendJobTime = async (req, res) => {
  try {
    const { additionalHours, reason } = req.body;
    const hours = Number(additionalHours);
    if (!hours || hours <= 0) return error(res, 'Valid additionalHours is required', 400);

    const job = await Job.findById(req.params.id);
    if (!job) return error(res, 'Job not found', 404);

    const currentEnd = job.estimatedEndDate || new Date();
    job.estimatedEndDate = new Date(currentEnd.getTime() + hours * 60 * 60 * 1000);
    if (reason) {
      job.notes = (job.notes ? job.notes + '\n' : '') + `[Time Extended +${hours}h]: ${reason}`;
    }
    await job.save();

    // Also update request estimatedDuration
    const request = await Request.findById(job.requestId).populate('userId');
    if (request) {
      request.estimatedDuration = (request.estimatedDuration || 2) + hours;
      await request.save();

      // Notify customer
      if (request.userId) {
        try {
          await notifyCustomer(request.userId, 'time_extended', {
            jobId: job._id,
            additionalHours: hours,
            reason: reason || 'Additional repair time required'
          });
        } catch (notifyErr) {
          console.error('Time extend notification error:', notifyErr.message);
        }
      }
    }

    // Real-time socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`job:${job._id}`).emit('job:status', {
        jobId: job._id,
        status: job.status,
        estimatedEndDate: job.estimatedEndDate,
        updatedAt: new Date()
      });
      io.emit('job:updated', job);
    }

    success(res, { job, message: `Job estimated time extended by ${hours} hour(s)` });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// Change 1 — POST /api/jobs/:id/scope-revision
export const requestScopeRevision = async (req, res) => {
  try {
    const { additionalPartsCost, additionalLaborCost, justification } = req.body;
    const partsCost = Number(additionalPartsCost) || 0;
    const laborCost = Number(additionalLaborCost) || 0;
    const additionalAmount = partsCost + laborCost;

    if (!justification) {
      return error(res, 'Justification is required for scope revision', 400);
    }
    if (additionalAmount <= 0) {
      return error(res, 'Valid additional parts or labor cost is required', 400);
    }

    const job = await Job.findById(req.params.id).populate('quoteId');
    if (!job) return error(res, 'Job not found', 404);

    const originalQuoteAmount = job.quoteId ? (job.quoteId.customerTotal || job.quoteId.subtotal || 1) : 1;
    const percentageIncrease = parseFloat(((additionalAmount / originalQuoteAmount) * 100).toFixed(2));
    const requiresApproval = percentageIncrease > 20;

    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        photoUrls.push(await uploadToR2(file));
      }
    } else if (req.body.photos) {
      photoUrls = Array.isArray(req.body.photos) ? req.body.photos : [req.body.photos];
    }

    const newRevision = {
      additionalPartsCost: partsCost,
      additionalLaborCost: laborCost,
      additionalAmount,
      photos: photoUrls,
      justification,
      originalQuoteAmount,
      percentageIncrease,
      requiresApproval,
      status: requiresApproval ? 'pending' : 'approved',
      requestedBy: req.user?.id || null,
      requestedAt: new Date()
    };

    job.scopeRevisions.push(newRevision);
    if (requiresApproval) {
      job.isScopeApprovalPending = true;
    }

    // Auto-flag scope_change edge case (deduped per job)
    job.isEdgeCase = true;
    if (!job.edgeCaseFlags) job.edgeCaseFlags = [];
    const existingEdgeFlag = job.edgeCaseFlags.find(f => f.type === 'scope_change');
    if (existingEdgeFlag) {
      existingEdgeFlag.flaggedAt = new Date();
      existingEdgeFlag.details = `Scope revision requested (+AED ${additionalAmount}, ${percentageIncrease}%)`;
    } else {
      job.edgeCaseFlags.push({
        type: 'scope_change',
        flaggedAt: new Date(),
        details: `Scope revision requested (+AED ${additionalAmount}, ${percentageIncrease}%)`
      });
    }

    await job.save();

    // Universal Customer Notification — always notify regardless of %
    try {
      const request = await Request.findById(job.requestId).populate('userId');
      if (request && request.userId) {
        await notifyScopeRevision(request.userId, job, newRevision);
      }
    } catch (notifyErr) {
      console.error('Scope revision notification error:', notifyErr.message);
    }

    await logActivity(req.user?.id, 'scope_revision_requested', 'Job', job._id, {
      additionalAmount,
      percentageIncrease,
      requiresApproval
    });

    success(res, { job, revision: job.scopeRevisions[job.scopeRevisions.length - 1] }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

// Change 1 — PUT /api/jobs/:id/scope-revision/:revisionId/respond
export const respondScopeRevision = async (req, res) => {
  try {
    const { action } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(action)) {
      return error(res, 'Action must be "approved" or "rejected"', 400);
    }

    const job = await Job.findById(req.params.id).populate('quoteId');
    if (!job) return error(res, 'Job not found', 404);

    const revision = job.scopeRevisions.id(req.params.revisionId);
    if (!revision) return error(res, 'Scope revision not found', 404);
    if (revision.status !== 'pending') {
      return error(res, `Scope revision is already ${revision.status}`, 400);
    }

    revision.status = action;
    revision.actedBy = req.user?.id || null;
    revision.actedAt = new Date();

    // Unblock job if no other pending revisions requiring approval remain
    const remainingPending = job.scopeRevisions.some(r => r.requiresApproval && r.status === 'pending');
    job.isScopeApprovalPending = remainingPending;

    // Recalculate actual margin on approval & store revised customer total
    if (action === 'approved') {
      const approvedRevisionsSum = job.scopeRevisions
        .filter(r => r.status === 'approved')
        .reduce((sum, r) => sum + r.additionalAmount, 0);

      const origSubtotal = job.quoteId?.subtotal || job.revisedSubtotal || 1000;
      const origCustomerTotal = job.quoteId?.customerTotal || job.revisedCustomerTotal || 1155;

      const revisedSubtotal = origSubtotal + approvedRevisionsSum;
      const revisedCustomerTotal = origCustomerTotal + approvedRevisionsSum;

      job.revisedSubtotal = revisedSubtotal;
      job.revisedCustomerTotal = revisedCustomerTotal;
      job.actualMargin = parseFloat(((revisedCustomerTotal - revisedSubtotal) / revisedCustomerTotal).toFixed(4));
    }

    await job.save();

    await logActivity(req.user?.id, `scope_revision_${action}`, 'Job', job._id, {
      revisionId: req.params.revisionId,
      action
    });

    success(res, { job, message: `Scope revision ${action} successfully.` });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// Change 2 — PUT /api/jobs/:id/direct-contact-flag
export const toggleDirectContactFlag = async (req, res) => {
  try {
    const { directContactFlag, directContactNotes } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return error(res, 'Job not found', 404);

    job.directContactFlag = Boolean(directContactFlag);
    job.directContactNotes = directContactNotes || '';
    job.directContactFlaggedAt = new Date();
    job.directContactFlaggedBy = req.user?.id || null;

    await job.save();

    await logActivity(req.user?.id, 'direct_contact_flag_updated', 'Job', job._id, {
      directContactFlag: job.directContactFlag,
      notes: job.directContactNotes
    });

    success(res, { job, message: 'Direct contact flag updated successfully.' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// Change 5 — PUT /api/jobs/:id/delegate
export const assignDelegate = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return error(res, 'Name, email, and phone are required for delegate assignment', 400);
    }

    const job = await Job.findById(req.params.id);
    if (!job) return error(res, 'Job not found', 404);

    const accessCode = crypto.randomBytes(32).toString('hex'); // 64 char high-entropy token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 day expiry

    job.delegate = {
      name,
      email,
      phone,
      assignedAt: new Date(),
      expiresAt,
      accessCode,
      assignedBy: req.user?.id || null
    };

    await job.save();

    await logActivity(req.user?.id, 'delegate_assigned', 'Job', job._id, {
      delegateName: name,
      accessCode
    });

    success(res, {
      job,
      delegate: job.delegate,
      accessCode,
      message: 'Delegate assigned successfully.'
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// Change 5 — DELETE /api/jobs/:id/delegate (Revoke access)
export const revokeDelegate = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return error(res, 'Job not found', 404);

    job.delegate = undefined;
    await job.save();

    await logActivity(req.user?.id, 'delegate_revoked', 'Job', job._id, {});

    success(res, { job, message: 'Delegate access revoked successfully.' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// Change 5 — GET /api/jobs/delegate-view/:accessCode (Unprotected + rate limited + strictly scoped payload)
export const getDelegateView = async (req, res) => {
  try {
    const { accessCode } = req.params;
    if (!accessCode || accessCode.length < 32) {
      return error(res, 'Invalid delegate access code format', 400);
    }

    const job = await Job.findOne({ 'delegate.accessCode': accessCode })
      .populate({
        path: 'requestId',
        populate: [
          { path: 'userId', select: 'name phone' },
          { path: 'vehicleId', select: 'make model year registrationNumber' }
        ]
      })
      .populate('garageId', 'name phone address');

    if (!job || !job.delegate) {
      return error(res, 'Delegate job view not found or code invalid', 404);
    }

    // Check expiration and status
    if (new Date() > new Date(job.delegate.expiresAt) || ['delivered', 'closed'].includes(job.status)) {
      return error(res, 'Delegate access link has expired or job is complete', 410);
    }

    // Strictly Scoped Payload — NO raw cost breakdowns (parts/labor split) or secret credentials (Fix 8)
    const scopedView = {
      jobId: job._id,
      status: job.status,
      stageTimestamps: job.stageTimestamps || {},
      isEdgeCase: job.isEdgeCase || false,
      edgeCaseFlags: job.edgeCaseFlags || [],
      directContactFlag: job.directContactFlag || false,
      directContactNotes: job.directContactNotes || '',
      scopeRevisions: (job.scopeRevisions || []).map(r => ({
        _id: r._id,
        additionalAmount: r.additionalAmount,
        justification: r.justification,
        photos: r.photos,
        percentageIncrease: r.percentageIncrease,
        requiresApproval: r.requiresApproval,
        status: r.status,
        requestedAt: r.requestedAt
      })),
      customer: {
        name: job.requestId?.userId?.name || 'Customer',
        phone: job.requestId?.userId?.phone || 'N/A'
      },
      garage: {
        name: job.garageId?.name || 'Garage',
        phone: job.garageId?.phone || 'N/A',
        address: job.garageId?.address || ''
      },
      vehicle: {
        make: job.requestId?.vehicleId?.make || '',
        model: job.requestId?.vehicleId?.model || '',
        year: job.requestId?.vehicleId?.year || '',
        registrationNumber: job.requestId?.vehicleId?.registrationNumber || ''
      },
      delegate: {
        name: job.delegate.name,
        expiresAt: job.delegate.expiresAt
      }
    };

    success(res, { job: scopedView });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// Fix 6 — PUT /api/jobs/delegate-view/:accessCode/scope-revision/:revisionId/respond (Delegate Action Endpoint)
export const respondScopeRevisionAsDelegate = async (req, res) => {
  try {
    const { accessCode, revisionId } = req.params;
    const { action } = req.body; // 'approved' or 'rejected'

    if (!accessCode || accessCode.length < 32) {
      return error(res, 'Invalid delegate access code format', 400);
    }
    if (!['approved', 'rejected'].includes(action)) {
      return error(res, 'Action must be "approved" or "rejected"', 400);
    }

    const job = await Job.findOne({ 'delegate.accessCode': accessCode }).populate('quoteId');
    if (!job || !job.delegate) {
      return error(res, 'Delegate job view not found or code invalid', 404);
    }

    // Check expiration and status
    if (new Date() > new Date(job.delegate.expiresAt) || ['delivered', 'closed'].includes(job.status)) {
      return error(res, 'Delegate access link has expired or job is complete', 410);
    }

    const revision = job.scopeRevisions.id(revisionId);
    if (!revision) return error(res, 'Scope revision not found', 404);
    if (revision.status !== 'pending') {
      return error(res, `Scope revision is already ${revision.status}`, 400);
    }

    revision.status = action;
    revision.actedBy = null;
    revision.actedAsDelegate = true;
    revision.actedAt = new Date();

    // Unblock job if no other pending revisions requiring approval remain
    const remainingPending = job.scopeRevisions.some(r => r.requiresApproval && r.status === 'pending');
    job.isScopeApprovalPending = remainingPending;

    // Recalculate actual margin on approval & store revised customer total
    if (action === 'approved') {
      const approvedRevisionsSum = job.scopeRevisions
        .filter(r => r.status === 'approved')
        .reduce((sum, r) => sum + r.additionalAmount, 0);

      const origSubtotal = job.quoteId?.subtotal || job.revisedSubtotal || 1000;
      const origCustomerTotal = job.quoteId?.customerTotal || job.revisedCustomerTotal || 1155;

      const revisedSubtotal = origSubtotal + approvedRevisionsSum;
      const revisedCustomerTotal = origCustomerTotal + approvedRevisionsSum;

      job.revisedSubtotal = revisedSubtotal;
      job.revisedCustomerTotal = revisedCustomerTotal;
      job.actualMargin = parseFloat(((revisedCustomerTotal - revisedSubtotal) / revisedCustomerTotal).toFixed(4));
    }

    await job.save();

    await logActivity(null, `scope_revision_${action}_by_delegate`, 'Job', job._id, {
      revisionId,
      action,
      delegateName: job.delegate.name
    });

    // Issue 4 — Dispatch notification to founder when delegate acts
    notifyFounderDelegateAction(
      job.delegate.assignedBy || process.env.FOUNDER_EMAIL || 'admin@garro.ae',
      job,
      job.delegate.name,
      action,
      revision
    ).catch(err => console.error('[notifyFounderDelegateAction] Async error:', err.message));

    success(res, { job, message: `Scope revision ${action} by delegate successfully.` });
  } catch (err) {
    error(res, err.message, 500);
  }
};


