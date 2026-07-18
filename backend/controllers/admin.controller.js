import Settings from '../models/Settings.js';
import Helper from '../models/Helper.js';
import Request from '../models/Request.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Invoice from '../models/Invoice.js';
import Complaint from '../models/Complaint.js';
import HelperBookingSlot from '../models/HelperBookingSlot.js';
import Vehicle from '../models/Vehicle.js';
import { checkHelperAvailability, SERVICE_DURATION_MAP } from './helper.controller.js';
import { success, error  } from '../utils/response.js';
import { getSetting, setSettingInMemory } from '../utils/settings.js';
import ExcelJS from 'exceljs';
import { generatePDF } from '../utils/pdf.js';

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
      const isAvailable = await checkHelperAvailability(helper, start, end, requestId);
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
        isAvailable,
        upcomingSlots
      });
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
          total: { $sum: '$totalAmount' },
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

// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let filter = {};
    if (role) {
      filter.role = role;
    }
    if (search) {
      // Find matching vehicles first to resolve userIds
      const vehicles = await Vehicle.find({
        registrationNumber: { $regex: search, $options: 'i' }
      }).select('userId');
      const userIds = vehicles.map(v => v.userId);

      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { _id: { $in: userIds } }
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    success(res, { users });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/admin/settings
export const getSettings = async (req, res) => {
  try {
    const settingsList = await Settings.find();
    const settingsMap = {};
    for (const s of settingsList) {
      settingsMap[s.key] = s.value;
    }
    const responseSettings = {
      vatPercentage: settingsMap.vatPercentage !== undefined ? settingsMap.vatPercentage : 5,
      serviceFeePercentage: settingsMap.serviceFeePercentage !== undefined ? settingsMap.serviceFeePercentage : 10,
      assignMode: settingsMap.assignMode !== undefined ? settingsMap.assignMode : 'manual'
    };
    success(res, { settings: responseSettings });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PATCH /api/admin/settings
export const updateSettings = async (req, res) => {
  try {
    const { vatPercentage, serviceFeePercentage, assignMode } = req.body;

    if (vatPercentage !== undefined) {
      const vatNum = parseFloat(vatPercentage);
      if (isNaN(vatNum) || vatNum < 0 || vatNum > 100) {
        return error(res, 'VAT percentage must be a number between 0 and 100.', 400);
      }
      await Settings.findOneAndUpdate(
        { key: 'vatPercentage' },
        { value: vatNum },
        { upsert: true, new: true }
      );
      setSettingInMemory('vatPercentage', vatNum);
    }

    if (serviceFeePercentage !== undefined) {
      const feeNum = parseFloat(serviceFeePercentage);
      if (isNaN(feeNum) || feeNum < 0 || feeNum > 100) {
        return error(res, 'Service fee percentage must be a number between 0 and 100.', 400);
      }
      await Settings.findOneAndUpdate(
        { key: 'serviceFeePercentage' },
        { value: feeNum },
        { upsert: true, new: true }
      );
      setSettingInMemory('serviceFeePercentage', feeNum);
    }

    if (assignMode !== undefined) {
      if (assignMode !== 'manual') {
        return error(res, 'Only manual assignment mode is supported.', 400);
      }
      await Settings.findOneAndUpdate(
        { key: 'assignMode' },
        { value: 'manual' },
        { upsert: true, new: true }
      );
      setSettingInMemory('assignMode', 'manual');
    }

    success(res, { message: 'Settings updated successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/admin/reports/revenue/export
export const exportRevenueReport = async (req, res) => {
  try {
    const format = req.query.format || 'pdf';
    const months = parseInt(req.query.months) || 6;
    const from   = new Date();
    from.setMonth(from.getMonth() - months);

    const revenue = await Invoice.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: from } } },
      { $group: {
          _id:   { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Revenue Report');

      worksheet.columns = [
        { header: 'Year', key: 'year', width: 10 },
        { header: 'Month', key: 'month', width: 20 },
        { header: 'Invoices Count', key: 'count', width: 15 },
        { header: 'Total Revenue (AED)', key: 'total', width: 25 }
      ];

      // Format headers
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '185FA5' }
      };

      let grandTotal = 0;
      let totalCount = 0;

      revenue.forEach(item => {
        grandTotal += item.total;
        totalCount += item.count;
        worksheet.addRow({
          year: item._id.year,
          month: monthNames[item._id.month],
          count: item.count,
          total: item.total
        });
      });

      // Add Total Row
      const totalRow = worksheet.addRow({
        year: 'Total',
        month: '',
        count: totalCount,
        total: grandTotal
      });
      totalRow.font = { bold: true };
      
      // Apply Currency Formatting to Revenue column
      worksheet.getColumn('total').numFmt = 'AED #,##0.00';
      worksheet.getColumn('count').alignment = { horizontal: 'right' };

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=revenue_report.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } else {
      // PDF format
      let totalRevenue = 0;
      let totalInvoices = 0;
      let tableRows = '';

      revenue.forEach(item => {
        totalRevenue += item.total;
        totalInvoices += item.count;
        tableRows += `
          <tr>
            <td>${item._id.year}</td>
            <td>${monthNames[item._id.month]}</td>
            <td style="text-align: right;">${item.count}</td>
            <td style="text-align: right; font-weight: bold; color: #185FA5;">AED ${item.total.toFixed(2)}</td>
          </tr>
        `;
      });

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #1a1a2e; padding: 40px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #185FA5; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: bold; color: #185FA5; }
            h2 { color: #185FA5; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #185FA5; color: white; padding: 12px; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .total-row { font-weight: bold; font-size: 16px; background: #f0f7ff; }
            .footer { margin-top: 40px; font-size: 12px; color: #888; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">GARRO</div>
              <div style="font-size: 12px; color: #888; margin-top: 4px;">UAE Car Service Marketplace</div>
            </div>
            <div style="text-align: right;">
              <h2>Revenue Report</h2>
              <div style="font-size: 13px; color: #555;">Report Period: Last ${months} Months</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Month</th>
                <th style="text-align: right;">Invoices Count</th>
                <th style="text-align: right;">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr class="total-row">
                <td colspan="2">Total</td>
                <td style="text-align: right;">${totalInvoices}</td>
                <td style="text-align: right; color: #185FA5;">AED ${totalRevenue.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            Garro Car Services UAE | Generated on ${new Date().toLocaleDateString('en-AE')}
          </div>
        </body>
        </html>
      `;

      const buffer = await generatePDF(html);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=revenue_report.pdf');
      res.send(buffer);
    }
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/admin/reports/garages/export
export const exportGarageReport = async (req, res) => {
  try {
    const format = req.query.format || 'pdf';

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

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Garage Performance');

      worksheet.columns = [
        { header: 'Garage Name', key: 'garageName', width: 30 },
        { header: 'Total Jobs', key: 'totalJobs', width: 15 },
        { header: 'Completed Jobs', key: 'completedJobs', width: 18 },
        { header: 'Avg Duration (Hours)', key: 'avgDuration', width: 22 },
        { header: 'Rating', key: 'rating', width: 12 }
      ];

      // Format headers
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '185FA5' }
      };

      report.forEach(item => {
        const durationHours = item.avgDuration ? parseFloat((item.avgDuration / (1000 * 60 * 60)).toFixed(1)) : 0;
        worksheet.addRow({
          garageName: item.garageName,
          totalJobs: item.totalJobs,
          completedJobs: item.completedJobs,
          avgDuration: durationHours,
          rating: item.rating || 0
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=garage_report.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } else {
      // PDF format
      let tableRows = '';

      report.forEach(item => {
        const durationHours = item.avgDuration ? `${(item.avgDuration / (1000 * 60 * 60)).toFixed(1)} hrs` : 'N/A';
        tableRows += `
          <tr>
            <td style="font-weight: bold;">${item.garageName}</td>
            <td style="text-align: right;">${item.totalJobs}</td>
            <td style="text-align: right;">${item.completedJobs}</td>
            <td style="text-align: right;">${durationHours}</td>
            <td style="text-align: right; font-weight: bold; color: #e74c3c;">★ ${item.rating ? item.rating.toFixed(1) : '0.0'}</td>
          </tr>
        `;
      });

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #1a1a2e; padding: 40px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #185FA5; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: bold; color: #185FA5; }
            h2 { color: #185FA5; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #185FA5; color: white; padding: 12px; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .footer { margin-top: 40px; font-size: 12px; color: #888; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">GARRO</div>
              <div style="font-size: 12px; color: #888; margin-top: 4px;">UAE Car Service Marketplace</div>
            </div>
            <div style="text-align: right;">
              <h2>Garage Performance Report</h2>
              <div style="font-size: 13px; color: #555;">Performance Analytics</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Garage Name</th>
                <th style="text-align: right;">Total Jobs</th>
                <th style="text-align: right;">Completed Jobs</th>
                <th style="text-align: right;">Avg Duration</th>
                <th style="text-align: right;">Rating</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="footer">
            Garro Car Services UAE | Generated on ${new Date().toLocaleDateString('en-AE')}
          </div>
        </body>
        </html>
      `;

      const buffer = await generatePDF(html);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=garage_report.pdf');
      res.send(buffer);
    }
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/admin/reports/email
export const emailReport = async (req, res) => {
  try {
    const { type, format, months, recipientEmail } = req.body;
    if (!recipientEmail) {
      return error(res, 'Recipient email is required.', 400);
    }

    const monthsParsed = parseInt(months) || 6;
    const from = new Date();
    from.setMonth(from.getMonth() - monthsParsed);

    let buffer;
    let filename = '';
    let contentType = '';

    const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    if (type === 'revenue') {
      const revenue = await Invoice.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: from } } },
        { $group: {
            _id:   { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      if (format === 'xlsx') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Revenue Report');

        worksheet.columns = [
          { header: 'Year', key: 'year', width: 10 },
          { header: 'Month', key: 'month', width: 20 },
          { header: 'Invoices Count', key: 'count', width: 15 },
          { header: 'Total Revenue (AED)', key: 'total', width: 25 }
        ];

        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '185FA5' } };

        let grandTotal = 0;
        let totalCount = 0;

        revenue.forEach(item => {
          grandTotal += item.total;
          totalCount += item.count;
          worksheet.addRow({
            year: item._id.year,
            month: monthNames[item._id.month],
            count: item.count,
            total: item.total
          });
        });

        const totalRow = worksheet.addRow({
          year: 'Total',
          month: '',
          count: totalCount,
          total: grandTotal
        });
        totalRow.font = { bold: true };
        
        worksheet.getColumn('total').numFmt = 'AED #,##0.00';
        worksheet.getColumn('count').alignment = { horizontal: 'right' };

        buffer = await workbook.xlsx.writeBuffer();
        filename = `revenue_report_${monthsParsed}_months.xlsx`;
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else {
        // PDF format
        let totalRevenue = 0;
        let totalInvoices = 0;
        let tableRows = '';

        revenue.forEach(item => {
          totalRevenue += item.total;
          totalInvoices += item.count;
          tableRows += `
            <tr>
              <td>${item._id.year}</td>
              <td>${monthNames[item._id.month]}</td>
              <td style="text-align: right;">${item.count}</td>
              <td style="text-align: right; font-weight: bold; color: #185FA5;">AED ${item.total.toFixed(2)}</td>
            </tr>
          `;
        });

        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #1a1a2e; padding: 40px; }
              .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #185FA5; padding-bottom: 20px; }
              .logo { font-size: 28px; font-weight: bold; color: #185FA5; }
              h2 { color: #185FA5; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background: #185FA5; color: white; padding: 12px; text-align: left; }
              td { padding: 12px; border-bottom: 1px solid #eee; }
              .total-row { font-weight: bold; font-size: 16px; background: #f0f7ff; }
              .footer { margin-top: 40px; font-size: 12px; color: #888; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="logo">GARRO</div>
                <div style="font-size: 12px; color: #888; margin-top: 4px;">UAE Car Service Marketplace</div>
              </div>
              <div style="text-align: right;">
                <h2>Revenue Performance Report</h2>
                <div style="font-size: 13px; color: #555;">Financial Analytics</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Month</th>
                  <th style="text-align: right;">Invoices Count</th>
                  <th style="text-align: right;">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
                <tr class="total-row">
                  <td>Total</td>
                  <td></td>
                  <td style="text-align: right;">${totalInvoices}</td>
                  <td style="text-align: right; color: #185FA5;">AED ${totalRevenue.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <div class="footer">
              Garro Car Services UAE | Generated on ${new Date().toLocaleDateString('en-AE')}
            </div>
          </body>
          </html>
        `;

        buffer = await generatePDF(html);
        filename = `revenue_report_${monthsParsed}_months.pdf`;
        contentType = 'application/pdf';
      }
    } else if (type === 'garage') {
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

      if (format === 'xlsx') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Garage Report');

        worksheet.columns = [
          { header: 'Garage Name', key: 'garageName', width: 25 },
          { header: 'Total Jobs', key: 'totalJobs', width: 15 },
          { header: 'Completed Jobs', key: 'completedJobs', width: 15 },
          { header: 'Avg Duration (Hours)', key: 'avgDuration', width: 20 },
          { header: 'Rating', key: 'rating', width: 15 }
        ];

        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '185FA5' } };

        report.forEach(item => {
          const durationHours = item.avgDuration ? (item.avgDuration / (1000 * 60 * 60)).toFixed(1) : 'N/A';
          worksheet.addRow({
            garageName: item.garageName,
            totalJobs: item.totalJobs,
            completedJobs: item.completedJobs,
            avgDuration: durationHours,
            rating: item.rating ? item.rating.toFixed(1) : '0.0'
          });
        });

        buffer = await workbook.xlsx.writeBuffer();
        filename = `garage_report.xlsx`;
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else {
        // PDF format
        let tableRows = '';
        report.forEach(item => {
          const durationHours = item.avgDuration ? (item.avgDuration / (1000 * 60 * 60)).toFixed(1) : 'N/A';
          tableRows += `
            <tr>
              <td style="font-weight: bold;">${item.garageName}</td>
              <td style="text-align: right;">${item.totalJobs}</td>
              <td style="text-align: right;">${item.completedJobs}</td>
              <td style="text-align: right;">${durationHours}</td>
              <td style="text-align: right; font-weight: bold; color: #e74c3c;">★ ${item.rating ? item.rating.toFixed(1) : '0.0'}</td>
            </tr>
          `;
        });

        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #1a1a2e; padding: 40px; }
              .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #185FA5; padding-bottom: 20px; }
              .logo { font-size: 28px; font-weight: bold; color: #185FA5; }
              h2 { color: #185FA5; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background: #185FA5; color: white; padding: 12px; text-align: left; }
              td { padding: 12px; border-bottom: 1px solid #eee; }
              .footer { margin-top: 40px; font-size: 12px; color: #888; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="logo">GARRO</div>
                <div style="font-size: 12px; color: #888; margin-top: 4px;">UAE Car Service Marketplace</div>
              </div>
              <div style="text-align: right;">
                <h2>Garage Performance Report</h2>
                <div style="font-size: 13px; color: #555;">Performance Analytics</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Garage Name</th>
                  <th style="text-align: right;">Total Jobs</th>
                  <th style="text-align: right;">Completed Jobs</th>
                  <th style="text-align: right;">Avg Duration</th>
                  <th style="text-align: right;">Rating</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            <div class="footer">
              Garro Car Services UAE | Generated on ${new Date().toLocaleDateString('en-AE')}
            </div>
          </body>
          </html>
        `;

        buffer = await generatePDF(html);
        filename = `garage_report.pdf`;
        contentType = 'application/pdf';
      }
    } else {
      return error(res, 'Invalid report type.', 400);
    }

    // Send email using Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.log(`[Demo Report Email] Would send report ${filename} to ${recipientEmail}`);
      return success(res, { message: `Demo: Report generated and would email to ${recipientEmail} (No API key)` });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: 'Garro Reports <official@backcrafter.shop>',
      to: recipientEmail,
      subject: `Garro — ${type.toUpperCase()} Report (${format.toUpperCase()})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #334155;">
          <h2 style="color: #1e3a8a;">Garro Admin Report Dispatch</h2>
          <p>Hello,</p>
          <p>Please find the requested <strong>${type}</strong> report attached as a <strong>${format.toUpperCase()}</strong> file.</p>
          <p>Thank you,</p>
          <p>Garro System Automations</p>
        </div>
      `,
      attachments: [
        {
          content: buffer.toString('base64'),
          filename
        }
      ]
    });

    success(res, { message: `Report successfully emailed to ${recipientEmail}` });
  } catch (err) {
    error(res, err.message, 500);
  }
};
