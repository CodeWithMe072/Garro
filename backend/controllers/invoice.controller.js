import Invoice from '../models/Invoice.js';
import GaragePayout from '../models/GaragePayout.js';
import Request from '../models/Request.js';
import Job from '../models/Job.js';
import Quote from '../models/Quote.js';
import Garage from '../models/Garage.js';
import { success, error } from '../utils/response.js';
import { generatePDF, invoiceTemplate, generateInvoicePDF } from '../utils/pdf.js';
import User from '../models/User.js';
import { downloadFile } from '../utils/upload.js';

// GET /api/invoices — customer sees own, admin/staff sees all
export const getInvoices = async (req, res) => {
  try {
    let invoices;
    if (req.user.role === 'customer') {
      invoices = await Invoice.find({ customerId: req.user.id })
        .populate('garageId', 'name phone')
        .populate('jobId')
        .sort({ createdAt: -1 });
    } else {
      invoices = await Invoice.find()
        .populate('garageId', 'name phone')
        .populate('customerId', 'name email phone')
        .populate('jobId')
        .sort({ createdAt: -1 });
    }
    success(res, { invoices });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/invoices/my — customer's invoices with full details
export const getMyInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ customerId: req.user.id })
      .populate('garageId', 'name phone email')
      .populate('jobId')
      .populate('quoteId')
      .sort({ createdAt: -1 });
    success(res, { invoices });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/invoices/:id
export const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('garageId', 'name phone')
      .populate('customerId', 'name email phone')
      .populate('jobId');
    if (!invoice) return error(res, 'Invoice not found', 404);

    // Customers can only see their own invoices
    if (req.user.role === 'customer' && invoice.customerId?._id.toString() !== req.user.id.toString()) {
      return error(res, 'Unauthorized', 403);
    }
    success(res, { invoice });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/invoices/:id/download — redirect to R2 PDF or generate on-the-fly
export const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('garageId', 'name phone');
    if (!invoice) return error(res, 'Invoice not found', 404);

    // Customers can only download their own
    if (req.user.role === 'customer' && invoice.customerId?._id.toString() !== req.user.id.toString()) {
      return error(res, 'Unauthorized', 403);
    }

    // If PDF already generated and stored, download it from storage and stream to client
    if (invoice.pdfUrl) {
      try {
        const buffer = await downloadFile(invoice.pdfUrl);
        res.set({
          'Content-Type':        'application/pdf',
          'Content-Disposition': `attachment; filename=invoice-${invoice.invoiceNumber || req.params.id}.pdf`
        });
        return res.send(buffer);
      } catch (dlErr) {
        console.error('Failed to retrieve stored PDF, generating on-the-fly:', dlErr.message);
      }
    }

    // Otherwise generate on-the-fly using Puppeteer
    const job      = invoice.jobId ? await Job.findById(invoice.jobId) : null;
    const customer = invoice.customerId || await User.findById(invoice.customerId);
    const garage   = invoice.garageId ? await Garage.findById(invoice.garageId) : null;

    const displayGarage = garage || { name: 'Garro Service Partner' };
    const displayJob = job || { _id: invoice.quoteId };

    let buffer;
    if (invoice.lineItems && invoice.lineItems.length > 0) {
      // New format — use the UAE Tax Invoice template
      buffer = await generateInvoicePDF(invoice, customer, displayGarage, displayJob);
    } else {
      // Legacy format — use the old basic template
      const quote = job ? await Quote.findById(job.quoteId) : null;
      const html  = invoiceTemplate(invoice, job, quote);
      buffer = await generatePDF(html);
    }

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${invoice.invoiceNumber || req.params.id}.pdf`
    });
    res.send(buffer);
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/admin/payouts — admin sees all garage payouts
export const getGaragePayouts = async (req, res) => {
  try {
    const payouts = await GaragePayout.find()
      .populate('garageId', 'name phone email')
      .populate('invoiceId', 'invoiceNumber totalAmount paidAt')
      .populate('jobId')
      .sort({ createdAt: -1 });
    success(res, { payouts });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PATCH /api/admin/payouts/:id/process — mark payout as processed
export const processGaragePayout = async (req, res) => {
  try {
    const payout = await GaragePayout.findByIdAndUpdate(
      req.params.id,
      { status: 'processed', processedAt: new Date(), notes: req.body.notes },
      { new: true }
    ).populate('garageId', 'name');

    if (!payout) return error(res, 'Payout not found', 404);
    success(res, { payout, message: `Payout of AED ${payout.amount} to ${payout.garageId?.name} marked as processed` });
  } catch (err) {
    error(res, err.message, 500);
  }
};
