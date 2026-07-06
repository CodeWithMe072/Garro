import Garage from '../models/Garage.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Invoice from '../models/Invoice.js';
import Review from '../models/Review.js';
import Request from '../models/Request.js';
import Quote from '../models/Quote.js';
import GaragePayout from '../models/GaragePayout.js';
import { uploadBufferToR2 } from '../utils/upload.js';
import { success, error  } from '../utils/response.js';

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
    success(res, { garage });
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
