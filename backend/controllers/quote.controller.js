import Quote from '../models/Quote.js';
import Request from '../models/Request.js';
import Job from '../models/Job.js';
import Helper from '../models/Helper.js';
import { success, error  } from '../utils/response.js';
import { notifyCustomer  } from '../utils/notify.js';
import { generatePDF, quoteTemplate } from '../utils/pdf.js';

// POST /api/quotes — admin creates quote for an assigned request
export const createQuote = async (req, res) => {
  try {
    const { requestId, garageId, partsCost, laborCost } = req.body;

    const request = await Request.findById(requestId);
    if (!request) return error(res, 'Request not found', 404);
    if (!['assigned', 'new'].includes(request.status)) {
      return error(res, 'Request must be assigned before creating a quote', 400);
    }

    // Quote pre-save hook auto-calculates serviceFee + VAT + customerTotal
    // We set status: 'sent' so that customers can approve or reject it
    const quote = await Quote.create({ 
      requestId, 
      garageId, 
      partsCost, 
      laborCost,
      status: 'sent' 
    });

    // Update request status
    await Request.findByIdAndUpdate(requestId, { status: 'quote_sent' });

    // Notify customer
    try {
      const populatedRequest = await Request.findById(requestId).populate('userId');
      const populatedQuote = await Quote.findById(quote._id);
      await notifyCustomer(populatedRequest.userId, 'quote_sent', { 
        cost: populatedQuote.customerTotal,
        requestId: populatedRequest._id
      });
    } catch (notifyErr) {
      console.error('Notification failed:', notifyErr.message);
    }

    success(res, { quote }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/quotes — customer sees own quotes, admin sees all
export const getQuotes = async (req, res) => {
  try {
    let quotes;
    if (req.user.role === 'customer') {
      // Get requests belonging to customer first
      const requests = await Request.find({ userId: req.user.id }).select('_id');
      const requestIds = requests.map(r => r._id);
      quotes = await Quote.find({ requestId: { $in: requestIds } })
        .populate('requestId')
        .populate('garageId', 'name phone');
    } else {
      quotes = await Quote.find()
        .populate('requestId')
        .populate('garageId', 'name phone');
    }
    success(res, { quotes });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/quotes/:id
export const getQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate('requestId')
      .populate('garageId');
    if (!quote) return error(res, 'Quote not found', 404);
    success(res, { quote });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PUT /api/quotes/:id/approve — customer approves → auto-create Job
export const approveQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id).populate('requestId');
    if (!quote) return error(res, 'Quote not found', 404);
    if (quote.status !== 'sent') return error(res, 'Quote is not in sent status', 400);

    // Check 24hr validity
    if (new Date() > quote.validUntil) {
      return error(res, 'Quote has expired', 400);
    }

    // Approve quote
    quote.status = 'approved';
    await quote.save();

    // Auto-create Job record
    const job = await Job.create({
      quoteId:          quote._id,
      requestId:        quote.requestId._id,
      garageId:         quote.garageId,
      helperId:         quote.requestId.helperId,
      status:           'pickup_scheduled',
      estimatedArrival: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hrs from now
    });

    // Update request status
    await Request.findByIdAndUpdate(quote.requestId._id, { status: 'quote_approved' });

    success(res, { quote, job, message: 'Quote approved. Job created and helper dispatched.' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PUT /api/quotes/:id/reject — customer rejects
export const rejectQuote = async (req, res) => {
  try {
    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!quote) return error(res, 'Quote not found', 404);
    await Request.findByIdAndUpdate(quote.requestId, { status: 'new' });
    success(res, { quote, message: 'Quote rejected' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const downloadQuotePDF = async (req, res) => {
  try {
    const quote   = await Quote.findById(req.params.id).populate('requestId').populate('garageId');
    if (!quote) return error(res, 'Quote not found', 404);

    const html   = quoteTemplate(quote, quote.requestId, quote.garageId);
    const buffer = await generatePDF(html);

    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename=quote-${req.params.id}.pdf` });
    res.send(buffer);
  } catch (err) {
    error(res, err.message, 500);
  }
};
