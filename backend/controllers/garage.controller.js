import Garage from '../models/Garage.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Invoice from '../models/Invoice.js';
import Review from '../models/Review.js';
import Request from '../models/Request.js';
import Quote from '../models/Quote.js';
import GaragePayout from '../models/GaragePayout.js';
import Helper from '../models/Helper.js';
import bcrypt from 'bcryptjs';
import { uploadBufferToR2, uploadToR2 } from '../utils/upload.js';
import { success, error  } from '../utils/response.js';

export const uploadGarageDocument = async (req, res) => {
  try {
    if (!req.file) return error(res, 'No file provided', 400);
    const fileUrl = await uploadToR2(req.file);
    success(res, {
      fileUrl,
      fileName: req.file.originalname
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const createGarage = async (req, res) => {
  try {
    const garage = await Garage.create(req.body);
    success(res, { garage }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const getGarages = async (req, res) => {
  try {
    const garages = await Garage.find();
    success(res, { garages });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const getGarageById = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);
    if (!garage) return error(res, 'Garage not found', 404);
    success(res, { garage });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const updateGarage = async (req, res) => {
  try {
    const garage = await Garage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!garage) return error(res, 'Garage not found', 404);
    success(res, { garage });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const toggleStatus = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);
    if (!garage) return error(res, 'Garage not found', 404);
    garage.status = garage.status === 'active' ? 'inactive' : 'active';
    await garage.save();
    success(res, { garage, message: `Garage status updated to ${garage.status}` });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const deleteGarage = async (req, res) => {
  try {
    const garage = await Garage.findByIdAndDelete(req.params.id);
    if (!garage) return error(res, 'Garage not found', 404);
    success(res, { message: 'Garage removed successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// --- GARAGE PORTAL APIS ---

// GET /api/garages/portal/dashboard
export const getPortalDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.garageId) return error(res, 'User is not associated with a garage', 400);

    const garageId = user.garageId;

    // Aggregate statistics
    const totalJobs = await Job.countDocuments({ garageId });
    const completedJobs = await Job.countDocuments({ garageId, status: { $in: ['delivered', 'closed'] } });
    const activeJobs = await Job.countDocuments({ garageId, status: { $nin: ['delivered', 'closed', 'cancelled'] } });
    
    // Total Earnings (sum of processed payouts)
    const payouts = await GaragePayout.find({ garageId, status: 'processed' });
    const totalEarnings = payouts.reduce((sum, p) => sum + p.amount, 0);

    // Average rating
    const reviews = await Review.find({ garageId });
    const avgRating = reviews.length > 0 ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)) : 5.0;

    // Recent jobs
    const recentJobs = await Job.find({ garageId })
      .populate('quoteId')
      .populate({
        path: 'requestId',
        populate: [
          { path: 'userId', select: 'name phone email' },
          { path: 'vehicleId', select: 'make model year registrationNumber' }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(5);

    success(res, {
      stats: {
        totalJobs,
        completedJobs,
        activeJobs,
        totalEarnings,
        avgRating,
        reviewsCount: reviews.length
      },
      recentJobs
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/garages/portal/jobs
export const getPortalJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.garageId) return error(res, 'User is not associated with a garage', 400);

    const { status, acceptStatus } = req.query;
    let filter = { garageId: user.garageId };

    if (status) {
      filter.status = status;
    }
    if (acceptStatus) {
      filter.acceptedByGarage = acceptStatus;
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
      .populate('helperId', 'name phone')
      .sort({ createdAt: -1 });

    success(res, { jobs });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/garages/portal/jobs/:jobId/respond
export const respondToJob = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'decline'
    const user = await User.findById(req.user.id);
    if (!user || !user.garageId) return error(res, 'User is not associated with a garage', 400);

    const job = await Job.findById(req.params.jobId);
    if (!job) return error(res, 'Job not found', 404);
    if (job.garageId.toString() !== user.garageId.toString()) {
      return error(res, 'Unauthorized', 403);
    }

    if (action === 'accept') {
      job.acceptedByGarage = 'accepted';
      await job.save();

      // Trigger status update
      await Request.findByIdAndUpdate(job.requestId, { status: 'pickup_scheduled' });
      success(res, { job, message: 'Job accepted successfully' });
    } else if (action === 'decline') {
      job.acceptedByGarage = 'declined';
      job.status = 'cancelled';
      await job.save();

      // Set Request back to 'new' and unassign garage/helper so admin can re-assign
      await Request.findByIdAndUpdate(job.requestId, {
        status: 'new',
        garageId: null,
        helperId: null,
        scheduledArrivalDate: null
      });

      success(res, { job, message: 'Job declined and returned to admin pool' });
    } else {
      error(res, 'Invalid action. Must be accept or decline', 400);
    }
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/garages/portal/quotes
export const submitGarageQuote = async (req, res) => {
  try {
    const { requestId, partsCost, laborCost } = req.body;
    const user = await User.findById(req.user.id);
    if (!user || !user.garageId) return error(res, 'User is not associated with a garage', 400);

    const request = await Request.findById(requestId);
    if (!request) return error(res, 'Request not found', 404);

    // Clean up previous quotes for this request
    await Quote.deleteMany({ requestId });

    // Create a new Quote document
    const quote = await Quote.create({
      requestId,
      garageId: user.garageId,
      partsCost: Number(partsCost) || 0,
      laborCost: Number(laborCost) || 0,
      status: 'pending' // pending approval from admin/customer
    });

    // Update request state
    request.status = 'quote_sent';
    request.quoteId = quote._id;
    await request.save();

    success(res, { quote, message: 'Quote submitted successfully for review' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/garages/portal/jobs/:jobId/invoice
export const uploadInvoice = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.garageId) return error(res, 'User is not associated with a garage', 400);

    const job = await Job.findById(req.params.jobId);
    if (!job) return error(res, 'Job not found', 404);
    if (job.garageId.toString() !== user.garageId.toString()) {
      return error(res, 'Unauthorized', 403);
    }

    // Must have a file uploaded
    if (!req.file) {
      return error(res, 'No invoice PDF file uploaded', 400);
    }

    const quote = await Quote.findById(job.quoteId);
    if (!quote) return error(res, 'Approved quote not found', 404);

    const request = await Request.findById(job.requestId);
    if (!request) return error(res, 'Associated request not found', 404);

    // Upload invoice PDF to R2
    const pdfKey = `garro/garage-invoices/invoice-${job._id}-${Date.now()}.pdf`;
    const pdfUrl = await uploadBufferToR2(req.file.buffer, pdfKey, 'application/pdf');

    // Create or update Invoice model
    let invoice = await Invoice.findOne({ jobId: job._id });
    if (!invoice) {
      const subtotal = quote.subtotal;
      const vatAmount = quote.vat;
      const totalAmount = quote.customerTotal;
      const serviceFeeAmount = quote.serviceFee;
      const garagePayoutAmount = parseFloat((subtotal * 0.90).toFixed(2));

      // Build line items for customer-facing invoice
      const lineItems = [
        { description: 'Parts & Components', qty: 1, unitPrice: Number(quote.partsCost), total: Number(quote.partsCost) },
        { description: 'Labour Charges',     qty: 1, unitPrice: Number(quote.laborCost), total: Number(quote.laborCost) }
      ];

      invoice = await Invoice.create({
        quoteId: quote._id,
        jobId: job._id,
        customerId: request.userId,
        garageId: user.garageId,
        lineItems,
        partsCost: Number(quote.partsCost),
        laborCost: Number(quote.laborCost),
        subtotal,
        vatPercent: 5,
        vatAmount,
        totalAmount,
        serviceFeePercent: 10,
        serviceFeeAmount,
        garagePayoutAmount,
        status: 'pending', // pending payout processing
        paidAt: null,
        paymentMethod: 'card',
        pdfUrl,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    } else {
      invoice.pdfUrl = pdfUrl;
      await invoice.save();
    }

    success(res, { invoice, message: 'Invoice PDF uploaded successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/garages/portal/earnings
export const getPortalEarnings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.garageId) return error(res, 'User is not associated with a garage', 400);

    const payouts = await GaragePayout.find({ garageId: user.garageId })
      .populate('jobId')
      .populate('invoiceId')
      .sort({ createdAt: -1 });

    // Aggregate summary
    const pendingSum = payouts
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    const processedSum = payouts
      .filter(p => p.status === 'processed')
      .reduce((sum, p) => sum + p.amount, 0);

    success(res, {
      payouts,
      summary: {
        pendingAmount: parseFloat(pendingSum.toFixed(2)),
        processedAmount: parseFloat(processedSum.toFixed(2)),
        totalAmount: parseFloat((pendingSum + processedSum).toFixed(2))
      }
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/garages/portal/staff
export const getPortalStaff = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.garageId) return error(res, 'User is not associated with a garage', 400);

    const staffUsers = await User.find({
      garageId: user.garageId,
      _id: { $ne: user._id }
    }).select('-password').sort({ createdAt: -1 });

    const helpers = await Helper.find({ garageId: user.garageId });
    const helperMap = {};
    helpers.forEach(h => {
      if (h.userId) helperMap[h.userId.toString()] = h;
    });

    const staffList = staffUsers.map(u => {
      const uObj = u.toObject();
      const h = helperMap[u._id.toString()];
      if (h && h.workingHours?.schedule?.length > 0) {
        uObj.schedule = h.workingHours.schedule;
        const workingDay = h.workingHours.schedule.find(s => s.isWorking) || h.workingHours.schedule[0];
        uObj.shiftStart = workingDay.startTime;
        uObj.shiftEnd = workingDay.endTime;
      } else {
        uObj.shiftStart = '09:00';
        uObj.shiftEnd = '21:00';
        uObj.schedule = [
          { day: 'monday', isWorking: true, startTime: '09:00', endTime: '21:00' },
          { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '21:00' },
          { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '21:00' },
          { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '21:00' },
          { day: 'friday', isWorking: true, startTime: '09:00', endTime: '21:00' },
          { day: 'saturday', isWorking: true, startTime: '09:00', endTime: '21:00' },
          { day: 'sunday', isWorking: true, startTime: '09:00', endTime: '21:00' }
        ];
      }
      return uObj;
    });

    success(res, { staffList });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/garages/portal/staff
export const addPortalStaff = async (req, res) => {
  try {
    const { name, email, phone, password, role, schedule } = req.body;
    const user = await User.findById(req.user.id);
    if (!user || !user.garageId) return error(res, 'User is not associated with a garage', 400);

    if (!name || !email || !phone || !password) {
      return error(res, 'Name, email, phone, and password are required', 400);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return error(res, 'A user with this email address already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStaff = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      role: role || 'staff',
      garageId: user.garageId,
      status: 'active'
    });

    const defaultSchedule = [
      { day: 'monday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'friday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'saturday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'sunday', isWorking: true, startTime: '09:00', endTime: '21:00' }
    ];

    const finalSchedule = (schedule && Array.isArray(schedule) && schedule.length > 0) ? schedule : defaultSchedule;

    // Also register in Helper model for job assignment dispatching
    await Helper.create({
      userId: newStaff._id,
      name: newStaff.name,
      phone: newStaff.phone,
      garageId: user.garageId,
      isAvailable: true,
      workingHours: {
        timezone: 'Asia/Dubai',
        schedule: finalSchedule
      }
    });

    const staffObj = newStaff.toObject();
    delete staffObj.password;
    staffObj.schedule = finalSchedule;

    success(res, { staff: staffObj, message: 'Staff member added successfully with 7-day weekly schedule!' }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PUT /api/garages/portal/staff/:staffId
export const updatePortalStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { name, email, phone, role, password, schedule, status } = req.body;

    const user = await User.findById(req.user.id);
    if (!user || !user.garageId) return error(res, 'User is not associated with a garage', 400);

    const staffUser = await User.findOne({ _id: staffId, garageId: user.garageId });
    if (!staffUser) return error(res, 'Staff member not found', 404);

    if (email && email.toLowerCase().trim() !== staffUser.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: staffId } });
      if (existing) {
        return error(res, 'Email address is already in use by another user', 400);
      }
      staffUser.email = email.toLowerCase().trim();
    }

    if (name) staffUser.name = name.trim();
    if (phone) staffUser.phone = phone.trim();
    if (role) staffUser.role = role;
    if (status) staffUser.status = status;
    if (password && password.trim().length > 0) {
      staffUser.password = await bcrypt.hash(password.trim(), 10);
    }

    await staffUser.save();

    // Update corresponding Helper model
    const helper = await Helper.findOne({ userId: staffId });
    if (helper) {
      if (name) helper.name = name.trim();
      if (phone) helper.phone = phone.trim();
      if (status) helper.isAvailable = (status === 'active');
      if (schedule && Array.isArray(schedule) && schedule.length > 0) {
        helper.workingHours = helper.workingHours || {};
        helper.workingHours.schedule = schedule;
      }
      await helper.save();
    } else if (schedule && Array.isArray(schedule) && schedule.length > 0) {
      await Helper.create({
        userId: staffUser._id,
        name: staffUser.name,
        phone: staffUser.phone,
        garageId: user.garageId,
        isAvailable: staffUser.status === 'active',
        workingHours: {
          timezone: 'Asia/Dubai',
          schedule
        }
      });
    }

    const updatedObj = staffUser.toObject();
    delete updatedObj.password;
    if (schedule) updatedObj.schedule = schedule;

    success(res, { staff: updatedObj, message: 'Staff member updated successfully!' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PATCH /api/garages/portal/staff/:staffId/status (or toggle-status)
export const togglePortalStaffStatus = async (req, res) => {
  try {
    const { staffId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user || !user.garageId) return error(res, 'User is not associated with a garage', 400);

    const staffUser = await User.findOne({ _id: staffId, garageId: user.garageId });
    if (!staffUser) return error(res, 'Staff member not found', 404);

    const newStatus = staffUser.status === 'active' ? 'blocked' : 'active';
    staffUser.status = newStatus;
    await staffUser.save();

    // Sync Helper availability
    const helper = await Helper.findOne({ userId: staffId });
    if (helper) {
      helper.isAvailable = (newStatus === 'active');
      await helper.save();
    }

    success(res, { staff: staffUser, message: `Staff status updated to ${newStatus}` });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// DELETE /api/garages/portal/staff/:staffId
export const deletePortalStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user || !user.garageId) return error(res, 'User is not associated with a garage', 400);

    const staffUser = await User.findOneAndDelete({ _id: staffId, garageId: user.garageId });
    if (!staffUser) return error(res, 'Staff member not found', 404);

    await Helper.findOneAndDelete({ userId: staffId });

    success(res, { message: 'Staff member deleted successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/garages/portal/status
export const getPortalGarageStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.garageId) return error(res, 'User is not associated with a garage', 400);

    const garage = await Garage.findById(user.garageId);
    if (!garage) return error(res, 'Garage not found', 404);

    const isOpen = garage.isOpen !== false;
    success(res, { isOpen, status: garage.status, name: garage.name });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PATCH /api/garages/portal/toggle-open
export const togglePortalGarageOpen = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.garageId) return error(res, 'User is not associated with a garage', 400);

    const garage = await Garage.findById(user.garageId);
    if (!garage) return error(res, 'Garage not found', 404);

    const newIsOpen = !(garage.isOpen !== false);
    garage.isOpen = newIsOpen;
    await garage.save();

    // Also update all helpers associated with this garage
    await Helper.updateMany(
      { garageId: garage._id },
      { $set: { isAvailable: newIsOpen } }
    );

    success(res, {
      isOpen: newIsOpen,
      message: newIsOpen ? 'Garage opened successfully' : 'Garage closed successfully'
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/garages/portal/request-deletion
export const requestGarageDeletion = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.user.id);
    if (!user || !user.garageId) return error(res, 'User is not associated with a garage', 400);

    const garage = await Garage.findById(user.garageId);
    if (!garage) return error(res, 'Garage not found', 404);

    garage.deletionRequest = {
      status: 'pending',
      requestedAt: new Date(),
      reason: reason || 'Garage partner requested account deletion'
    };
    await garage.save();

    success(res, {
      garage,
      message: 'Account deletion request submitted to Admin. An administrator will contact you shortly to process your request.'
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// DELETE /api/garages/portal/request-deletion
export const cancelGarageDeletionRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.garageId) return error(res, 'User is not associated with a garage', 400);

    const garage = await Garage.findById(user.garageId);
    if (!garage) return error(res, 'Garage not found', 404);

    garage.deletionRequest = { status: 'none' };
    await garage.save();

    success(res, { message: 'Deletion request cancelled successfully. Your garage remains active.' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/garages/admin/deletion-requests
export const getGarageDeletionRequests = async (req, res) => {
  try {
    const requests = await Garage.find({ 'deletionRequest.status': 'pending' }).sort({ 'deletionRequest.requestedAt': -1 });
    success(res, { requests });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/garages/admin/deletion-requests/:garageId/approve
export const approveGarageDeletionRequest = async (req, res) => {
  try {
    const { garageId } = req.params;
    const { adminNotes } = req.body || {};

    const garage = await Garage.findById(garageId);
    if (!garage) return error(res, 'Garage not found', 404);

    garage.status = 'inactive';
    garage.isOpen = false;
    garage.deletionRequest.status = 'approved';
    garage.deletionRequest.reviewedAt = new Date();
    if (adminNotes) garage.deletionRequest.adminNotes = adminNotes;
    await garage.save();

    // Block all user accounts linked to this garage
    await User.updateMany(
      { garageId: garage._id },
      { $set: { status: 'banned' } }
    );

    // Set all helper profiles to unavailable & off duty
    await Helper.updateMany(
      { garageId: garage._id },
      { $set: { isAvailable: false, dutyStatus: 'off_duty' } }
    );

    // Delete all refresh tokens for all user accounts linked to this garage
    const garageUsers = await User.find({ garageId: garage._id });
    const garageUserIds = garageUsers.map(u => u._id);
    const RefreshToken = (await import('../models/RefreshToken.js')).default;
    await RefreshToken.deleteMany({ userId: { $in: garageUserIds } });

    success(res, { message: `Garage "${garage.name}" and all associated staff accounts have been permanently closed and deactivated.` });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/garages/admin/deletion-requests/:garageId/reject
export const rejectGarageDeletionRequest = async (req, res) => {
  try {
    const { garageId } = req.params;
    const { adminNotes } = req.body || {};

    const garage = await Garage.findById(garageId);
    if (!garage) return error(res, 'Garage not found', 404);

    garage.deletionRequest.status = 'rejected';
    garage.deletionRequest.reviewedAt = new Date();
    if (adminNotes) garage.deletionRequest.adminNotes = adminNotes;
    await garage.save();

    success(res, { message: `Deletion request for "${garage.name}" rejected. The garage remains active.` });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/garages/admin/:garageId/reopen
export const reopenGarage = async (req, res) => {
  try {
    const { garageId } = req.params;

    const garage = await Garage.findById(garageId);
    if (!garage) return error(res, 'Garage not found', 404);

    garage.status = 'active';
    garage.isOpen = true;
    garage.deletionRequest = { status: 'none' };
    await garage.save();

    // Reactivate all user accounts linked to this garage
    await User.updateMany(
      { garageId: garage._id },
      { $set: { status: 'active' } }
    );

    // Restore helper availability & on duty status
    await Helper.updateMany(
      { garageId: garage._id },
      { $set: { isAvailable: true, dutyStatus: 'on_duty' } }
    );

    success(res, { message: `Garage "${garage.name}" and all staff accounts have been reopened and access restored!` });
  } catch (err) {
    error(res, err.message, 500);
  }
};

