import Invoice from '../models/Invoice.js';
import GaragePayout from '../models/GaragePayout.js';
import Request from '../models/Request.js';
import Job from '../models/Job.js';
import Quote from '../models/Quote.js';
import Garage from '../models/Garage.js';
import { success, error } from '../utils/response.js';
import { generatePDF, invoiceTemplate, generateInvoicePDF } from '../utils/pdf.js';
import ExcelJS from 'exceljs';
import User from '../models/User.js';
import { downloadFile } from '../utils/upload.js';
import Stripe from 'stripe';
import { aedToFils } from '../utils/currency.js';

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

// GET /api/admin/payouts/stats — Payout statistics breakdown
export const getPayoutStats = async (req, res) => {
  try {
    const { range } = req.query; // 'all', 'month', 'week'
    let dateFilter = {};
    const now = new Date();

    if (range === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: startOfMonth } };
    } else if (range === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      dateFilter = { createdAt: { $gte: startOfWeek } };
    }

    const allPayouts = await GaragePayout.find(dateFilter);

    const total = allPayouts.length;
    const pending = allPayouts.filter(p => ['pending', 'processing'].includes(p.status)).length;
    const processed = allPayouts.filter(p => p.status === 'processed').length;
    const failed = allPayouts.filter(p => ['failed', 'on_hold', 'needs_review'].includes(p.status)).length;
    
    const totalPaidOut = allPayouts
      .filter(p => p.status === 'processed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    success(res, {
      total,
      pending,
      processed,
      failed,
      totalPaidOut: Number(totalPaidOut.toFixed(2)),
      currency: 'AED'
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/admin/payouts — Admin sees filtered, searched, sorted & paginated garage payouts
export const getGaragePayouts = async (req, res) => {
  try {
    const {
      status = 'all',
      recipientType = 'all',
      dateFrom,
      dateTo,
      search = '',
      sort = 'newest',
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build filter criteria
    const query = {};

    if (status && status !== 'all') {
      if (status === 'failed') {
        query.status = { $in: ['failed', 'on_hold', 'needs_review'] };
      } else if (status === 'pending') {
        query.status = { $in: ['pending', 'processing'] };
      } else {
        query.status = status;
      }
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const dTo = new Date(dateTo);
        dTo.setHours(23, 59, 59, 999);
        query.createdAt.$lte = dTo;
      }
    }

    // Sort order
    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'highest_amount') sortObj = { amount: -1 };
    if (sort === 'lowest_amount') sortObj = { amount: 1 };

    let payouts = await GaragePayout.find(query)
      .populate('garageId', 'name phone email role')
      .populate('invoiceId', 'invoiceNumber totalAmount paidAt')
      .populate('jobId')
      .sort(sortObj);

    // Recipient Type filtering
    if (recipientType !== 'all') {
      payouts = payouts.filter(p => {
        const role = p.garageId?.role || 'garage';
        if (recipientType === 'garage') return role !== 'staff';
        if (recipientType === 'staff') return role === 'staff';
        return true;
      });
    }

    // Search query filtering
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      payouts = payouts.filter(p => {
        const payoutId = p._id ? p._id.toString().toLowerCase() : '';
        const garageName = p.garageId?.name ? p.garageId.name.toLowerCase() : '';
        const garagePhone = p.garageId?.phone ? p.garageId.phone.toLowerCase() : '';
        const invoiceNum = p.invoiceId?.invoiceNumber ? p.invoiceId.invoiceNumber.toLowerCase() : '';
        return payoutId.includes(q) || garageName.includes(q) || garagePhone.includes(q) || invoiceNum.includes(q);
      });
    }

    const totalResults = payouts.length;
    const totalPages = Math.ceil(totalResults / limitNum) || 1;
    const paginatedPayouts = payouts.slice(skip, skip + limitNum);

    success(res, {
      payouts: paginatedPayouts,
      total: totalResults,
      page: pageNum,
      totalPages
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/admin/payouts/export — Export payouts report as XLSX or PDF
export const exportPayoutReport = async (req, res) => {
  try {
    const { format = 'pdf', range = 'month', dateFrom, dateTo } = req.query;
    const now = new Date();
    let dateFilter = {};
    let rangeLabel = 'All Time';

    if (range === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: startOfDay, $lte: endOfDay } };
      rangeLabel = 'Today (' + now.toLocaleDateString('en-AE') + ')';
    } else if (range === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: startOfMonth } };
      rangeLabel = 'This Month (' + now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + ')';
    } else if (range === 'custom' && (dateFrom || dateTo)) {
      let customFilter = {};
      if (dateFrom) customFilter.$gte = new Date(dateFrom);
      if (dateTo) {
        const dTo = new Date(dateTo);
        dTo.setHours(23, 59, 59, 999);
        customFilter.$lte = dTo;
      }
      dateFilter = { createdAt: customFilter };
      rangeLabel = `Custom Range (${dateFrom || 'Start'} to ${dateTo || 'End'})`;
    }

    const payouts = await GaragePayout.find(dateFilter)
      .populate('garageId', 'name phone email role')
      .populate('invoiceId', 'invoiceNumber totalAmount paidAt')
      .sort({ createdAt: -1 });

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Payout Settlements');

      worksheet.columns = [
        { header: 'Payout ID', key: 'payoutId', width: 18 },
        { header: 'Recipient Name', key: 'recipientName', width: 24 },
        { header: 'Recipient Contact', key: 'recipientContact', width: 26 },
        { header: 'Invoice Reference', key: 'invoiceRef', width: 20 },
        { header: 'Net Payout Amount (AED)', key: 'amount', width: 24 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'Date', key: 'date', width: 20 }
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0F172A' }
      };

      let totalPaidOut = 0;

      payouts.forEach(p => {
        if (p.status === 'processed') totalPaidOut += p.amount;

        worksheet.addRow({
          payoutId: '#' + (p._id ? p._id.toString().slice(-8).toUpperCase() : 'N/A'),
          recipientName: p.garageId?.name || 'Authorized Service Partner',
          recipientContact: p.garageId?.email || p.garageId?.phone || 'N/A',
          invoiceRef: p.invoiceId?.invoiceNumber || (`#INV-${p._id.toString().slice(-6)}`),
          amount: p.amount,
          status: p.status.toUpperCase(),
          date: new Date(p.processedAt || p.createdAt).toLocaleDateString('en-AE')
        });
      });

      const totalRow = worksheet.addRow({
        payoutId: 'TOTAL',
        recipientName: `${payouts.length} Settlements`,
        recipientContact: '',
        invoiceRef: '',
        amount: totalPaidOut,
        status: '',
        date: ''
      });
      totalRow.font = { bold: true };
      worksheet.getColumn('amount').numFmt = 'AED #,##0.00';

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=payout_settlements_${range}.xlsx`);

      await workbook.xlsx.write(res);
      return res.end();
    } else {
      // PDF Report
      let totalPaidOut = 0;
      let pendingCount = 0;
      let processedCount = 0;
      let failedCount = 0;
      let tableRows = '';

      payouts.forEach(p => {
        if (p.status === 'pending') pendingCount++;
        if (p.status === 'processed') {
          processedCount++;
          totalPaidOut += p.amount;
        }
        if (['failed', 'on_hold'].includes(p.status)) failedCount++;

        const statusLabel = p.status.toUpperCase();
        const statusBg = p.status === 'processed' ? '#f0fdf4; color: #16a34a;' : p.status === 'pending' ? '#fffbebf0; color: #d97706;' : '#fef2f2; color: #dc2626;';

        tableRows += `
          <tr>
            <td style="font-family: monospace; font-weight: bold;">#${p._id ? p._id.toString().slice(-8).toUpperCase() : 'N/A'}</td>
            <td><strong>${p.garageId?.name || 'Authorized Service Partner'}</strong><br/><span style="font-size:10px; color:#64748b;">${p.garageId?.email || p.garageId?.phone || ''}</span></td>
            <td>${p.invoiceId?.invoiceNumber || (`#INV-${p._id.toString().slice(-6)}`)}</td>
            <td style="font-weight: bold; color: #16a34a;">AED ${p.amount.toFixed(2)}</td>
            <td><span style="background: ${statusBg} padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: bold;">${statusLabel}</span></td>
            <td style="font-size: 11px; color: #64748b;">${new Date(p.processedAt || p.createdAt).toLocaleDateString('en-AE')}</td>
          </tr>
        `;
      });

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; padding: 30px; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #16a34a; padding-bottom: 15px; margin-bottom: 20px; }
            .logo { font-size: 26px; font-weight: 800; color: #16a34a; letter-spacing: -1px; }
            .title { text-align: right; }
            .title h2 { margin: 0; color: #0f172a; font-size: 18px; }
            .title p { margin: 3px 0 0; font-size: 12px; color: #64748b; }
            .stats-grid { display: flex; gap: 12px; margin-bottom: 20px; }
            .stat-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
            .stat-val { font-size: 18px; font-weight: 800; margin-top: 4px; }
            .stat-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
            th { background: #0f172a; color: #fff; padding: 10px; text-align: left; font-size: 10px; text-transform: uppercase; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">GARRO</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">UAE Car Services Platform</div>
            </div>
            <div class="title">
              <h2>Payout Settlements Report</h2>
              <p>Period: <strong>${rangeLabel}</strong></p>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-lbl">Total Settlements</div>
              <div class="stat-val">${payouts.length}</div>
            </div>
            <div class="stat-card">
              <div class="stat-lbl">Pending Processing</div>
              <div class="stat-val" style="color: #d97706;">${pendingCount}</div>
            </div>
            <div class="stat-card">
              <div class="stat-lbl">Processed</div>
              <div class="stat-val" style="color: #16a34a;">${processedCount}</div>
            </div>
            <div class="stat-card">
              <div class="stat-lbl">Total Paid Out</div>
              <div class="stat-val" style="color: #16a34a;">AED ${totalPaidOut.toFixed(2)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Payout ID</th>
                <th>Recipient</th>
                <th>Invoice Ref</th>
                <th>Net Payout</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows || '<tr><td colspan="6" style="text-align:center;">No payout settlements found for this period.</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            Generated by Garro Admin System on ${new Date().toLocaleDateString('en-AE')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </body>
        </html>
      `;

      const buffer = await generatePDF(html);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=payout_settlements_${range}.pdf`);
      return res.send(buffer);
    }
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// PATCH /api/admin/payouts/:id/process — mark payout as processed
// PATCH /api/admin/payouts/:id/process — Mark payout as processed and execute bank/Stripe transfer
export const processGaragePayout = async (req, res) => {
  try {
    // ── Atomic idempotency lock ──────────────────────────────────────────────────
    // findOneAndUpdate with status filter atomically transitions pending → processing,
    // preventing two concurrent requests from both calling stripe.transfers.create.
    const payout = await GaragePayout.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { $set: { status: 'processing' } },
      { new: true }
    ).populate('garageId', 'name email phone stripeAccountId role')
     .populate('invoiceId', 'invoiceNumber subtotal totalAmount');

    if (!payout) {
      // Either not found or already in processing/processed/failed state
      const existing = await GaragePayout.findById(req.params.id);
      if (!existing) return error(res, 'Payout record not found', 404);
      return res.status(409).json({
        success: false,
        message: `Payout cannot be processed — current status is '${existing.status}'. No funds were moved.`
      });
    }

    // ── Invoice recheck math ─────────────────────────────────────────────────────
    // Re-derive expected net payout from the invoice subtotal to catch stale
    // commission rates, manual DB edits, or calculation bugs before money moves.
    if (payout.invoiceId && payout.invoiceId.subtotal) {
      const subtotal = Number(payout.invoiceId.subtotal);
      // Garro deducts: 10% platform fee + 5% VAT from subtotal
      const expectedAmount = parseFloat((subtotal * 0.85).toFixed(2));
      const actualAmount   = parseFloat(payout.amount.toFixed(2));
      const tolerance      = 0.05; // Allow ±0.05 AED for floating-point rounding

      if (Math.abs(expectedAmount - actualAmount) > tolerance) {
        // Flag as needs_review so it surfaces in the admin queue but doesn't silently fail
        payout.status = 'needs_review';
        payout.notes  = `Amount mismatch: stored AED ${actualAmount} vs recalculated AED ${expectedAmount} from invoice subtotal AED ${subtotal}. Manual review required before funds can be released.`;
        await payout.save();
        return res.status(400).json({
          success: false,
          message: `Payout amount mismatch detected (stored: AED ${actualAmount}, expected: AED ${expectedAmount}). Payout flagged for manual review.`,
          payout
        });
      }
    }

    // ── Stripe Connect transfer (production) ───────────────────────────────────────
    let stripeTransferId = null;
    let isMock = false;
    const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

    if (stripe && payout.garageId?.stripeAccountId) {
      try {
        const transfer = await stripe.transfers.create({
          amount:      aedToFils(payout.amount), // Shared helper — never raw Math.round
          currency:    'aed',
          destination: payout.garageId.stripeAccountId,
          description: `Garro net payout for Invoice ${payout.invoiceId?.invoiceNumber || payout.invoiceId}`
        });
        stripeTransferId = transfer.id;
      } catch (stripeErr) {
        // ── Rollback on Stripe failure ──────────────────────────────────────────
        // Revert lock so admin can retry; surface the Stripe error clearly.
        payout.status = 'pending';
        await payout.save();
        console.error('Stripe transfer failed for payout', payout._id, ':', stripeErr.message);
        return res.status(502).json({
          success: false,
          message: `Stripe transfer failed: ${stripeErr.message}. Payout status reverted to pending.`
        });
      }
    } else {
      // No Stripe account linked — mark as mock (manual bank transfer outside platform)
      isMock = true;
      if (!payout.garageId?.stripeAccountId && process.env.NODE_ENV === 'production') {
        console.warn(
          `[WARN] Payout ${payout._id} processed without a Stripe Connect account for garage ${payout.garageId?.name}. No automated transfer was issued.`
        );
      }
    }

    // ── Mark processed & write audit trail ─────────────────────────────────────────
    payout.status           = 'processed';
    payout.processedAt      = new Date();
    payout.processedBy      = req.user?.id || req.user?._id || null;
    payout.stripeTransferId  = stripeTransferId;
    payout.isMockTransaction = isMock;
    payout.notes            = req.body.notes || (isMock ? 'Manual bank transfer — no Stripe account linked' : 'Processed via Stripe Connect');
    await payout.save();

    success(res, {
      payout,
      isMockTransaction: isMock,
      message: `Payout of AED ${payout.amount.toFixed(2)} to ${payout.garageId?.name} marked as processed${isMock ? ' (no Stripe transfer — manual settlement)' : ''}.`
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};
