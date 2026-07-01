import Settings from '../models/Settings.js';
import Helper from '../models/Helper.js';
import Request from '../models/Request.js';
import Job from '../models/Job.js';
import Invoice from '../models/Invoice.js';
import Complaint from '../models/Complaint.js';
import { success, error  } from '../utils/response.js';

// GET /api/admin/available-helpers
export const getAvailableHelpers = async (req, res) => {
  try {
    const helpers = await Helper.find({ isAvailable: true })
      .populate('garageId', 'name location')
      .sort({ rating: -1 });
    success(res, { helpers });
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
