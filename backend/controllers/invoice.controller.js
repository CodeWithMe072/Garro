import Invoice from '../models/Invoice.js';
import Request from '../models/Request.js';
import Job from '../models/Job.js';
import Quote from '../models/Quote.js';
import { success, error } from '../utils/response.js';
import { generatePDF, invoiceTemplate } from '../utils/pdf.js';

// GET /api/invoices — customer sees own, admin sees all
export const getInvoices = async (req, res) => {
  try {
    let invoices;
    if (req.user.role === 'customer') {
      const requests = await Request.find({ userId: req.user.id }).select('_id');
      const requestIds = requests.map(r => r._id);
      invoices = await Invoice.find()
        .populate({ path: 'jobId', match: { requestId: { $in: requestIds } } });
      invoices = invoices.filter(i => i.jobId);
    } else {
      invoices = await Invoice.find().populate('jobId');
    }
    success(res, { invoices });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/invoices/:id
export const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('jobId');
    if (!invoice) return error(res, 'Invoice not found', 404);
    success(res, { invoice });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return error(res, 'Invoice not found', 404);

    const job   = await Job.findById(invoice.jobId);
    const quote = await Quote.findById(job.quoteId);
    const html  = invoiceTemplate(invoice, job, quote);
    const buffer = await generatePDF(html);

    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename=invoice-${req.params.id}.pdf` });
    res.send(buffer);
  } catch (err) {
    error(res, err.message, 500);
  }
};
