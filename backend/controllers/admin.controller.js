import Settings from '../models/Settings.js';
import Helper from '../models/Helper.js';
import Request from '../models/Request.js';
import Job from '../models/Job.js';
import Invoice from '../models/Invoice.js';
import Complaint from '../models/Complaint.js';
import HelperBookingSlot from '../models/HelperBookingSlot.js';
import { checkHelperAvailability, SERVICE_DURATION_MAP } from './helper.controller.js';
import { success, error  } from '../utils/response.js';

// GET /api/admin/available-helpers
export const getAvailableHelpers = async (req, res) => {
  try {
    const { requestId } = req.query;
    let start = new Date();
    let end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // default 2 hours

    if (requestId) {
      const request = await Request.findById(requestId);
      if (request) {
        start = request.preferredDate || new Date();
        const durationHours = SERVICE_DURATION_MAP[request.serviceType] || 2;
        end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
      }
    }

    const helpers = await Helper.find().populate('garageId', 'name location');
    const availableHelpers = [];

    for (const helper of helpers) {
      const isAvailable = await checkHelperAvailability(helper, start, end);
      if (isAvailable) {
        // Fetch next 3 upcoming slots for admin visual scheduling context
        const upcomingSlots = await HelperBookingSlot.find({
          helperId: helper._id,
          status: { $in: ['reserved', 'in_progress'] },
          startTime: { $gte: new Date() }
        })
        .sort({ startTime: 1 })
        .limit(3)
        .populate('bookingId', 'serviceType');

        availableHelpers.push({
          ...helper.toObject(),
          upcomingSlots
        });
      }
    }

    // Sort by rating desc
    availableHelpers.sort((a, b) => (b.rating || 5) - (a.rating || 5));

    success(res, { helpers: availableHelpers });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/admin/helpers/:helperId/schedule?date=YYYY-MM-DD
export const getHelperSchedule = async (req, res) => {
  try {
    const { helperId } = req.params;
    const { date } = req.query;

    if (!date) return error(res, 'date query param required (YYYY-MM-DD)', 400);

    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd   = new Date(`${date}T23:59:59.999Z`);

    const slots = await HelperBookingSlot.find({
      helperId,
      status: { $in: ['reserved', 'in_progress'] },
      startTime: { $lte: dayEnd },
      endTime:   { $gte: dayStart }
    })
    .sort({ startTime: 1 })
    .populate('bookingId', 'serviceType userId');

    // Return each slot with formatted times + buffer end time
    const formatted = slots.map(s => {
      const durMs       = new Date(s.endTime) - new Date(s.startTime);
      const durHours    = durMs / (1000 * 60 * 60);
      const bufferHours = Math.min(durHours, 4); // max 4 hour buffer
      const bufferEnd   = new Date(new Date(s.endTime).getTime() + bufferHours * 60 * 60 * 1000);
      return {
        _id: s._id,
        startTime: s.startTime,
        endTime: s.endTime,
        bufferEndTime: bufferEnd,   // frontend shows yellow buffer zone up to here
        bufferHours: bufferHours,
        status: s.status,
        serviceType: s.bookingId?.serviceType || 'service',
        bookingId: s.bookingId?._id || s.bookingId
      };
    });

    success(res, { slots: formatted, date });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PATCH /api/admin/settings/mode
export const setSystemMode = async (req, res) => {
  try {
    const { mode } = req.body;
    if (mode !== 'manual') {
      return error(res, 'Only manual assignment mode is supported.', 400);
    }

    const setting = await Settings.findOneAndUpdate(
      { key: 'assignMode' },
      { value: 'manual' },
      { new: true, upsert: true }
    );
    success(res, { setting, message: `System switched to manual mode` });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/admin/settings/mode
export const getSystemMode = async (req, res) => {
  try {
    success(res, { mode: 'manual' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/admin/dashboard — full metrics
export const getDashboard = async (req, res) => {
  try {
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      newLeads, assigned, inService, completed,
      monthlyRevenue, pendingPayments, activeHelpers,
      pendingComplaints
    ] = await Promise.all([
      Request.countDocuments({ status: 'new' }),
      Request.countDocuments({ status: 'assigned' }),
      Job.countDocuments({ status: { $in: ['picked_up', 'in_garage', 'inspection_done', 'repair_in_progress', 'work_complete'] } }),
      Job.countDocuments({ status: 'closed' }),
      Invoice.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Invoice.countDocuments({ status: 'pending' }),
      Helper.countDocuments({ isAvailable: true }),
      Complaint.countDocuments({ status: 'open' })
    ]);

    success(res, {
      newLeads,
      assigned,
      inService,
      completed,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      pendingPayments,
      activeHelpers,
      pendingComplaints,
      systemMode: 'manual'
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/admin/reports/revenue?period=monthly&months=6
export const getRevenueReport = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const from   = new Date();
    from.setMonth(from.getMonth() - months);

    const revenue = await Invoice.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: from } } },
      { $group: {
          _id:   { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$total' },
          count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    success(res, { revenue });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/admin/reports/garages — performance per garage
export const getGarageReport = async (req, res) => {
  try {
    const report = await Job.aggregate([
      { $group: {
          _id:          '$garageId',
          totalJobs:    { $sum: 1 },
          completedJobs:{ $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          avgDuration:  { $avg: { $subtract: ['$actualEndDate', '$startDate'] } }
      }},
      { $lookup: { from: 'garages', localField: '_id', foreignField: '_id', as: 'garage' } },
      { $unwind: '$garage' },
      { $project: { garageName: '$garage.name', totalJobs: 1, completedJobs: 1, avgDuration: 1, rating: '$garage.rating' } },
      { $sort: { completedJobs: -1 } }
    ]);

    success(res, { report });
  } catch (err) {
    error(res, err.message, 500);
  }
};
