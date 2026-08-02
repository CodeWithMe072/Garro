import Stripe from 'stripe';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Quote from '../models/Quote.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Garage from '../models/Garage.js';
import GaragePayout from '../models/GaragePayout.js';
import Vehicle from '../models/Vehicle.js';
import Helper from '../models/Helper.js';
import Request from '../models/Request.js';
import { success, error } from '../utils/response.js';
import { generateInvoicePDF } from '../utils/pdf.js';
import { uploadBufferToR2 } from '../utils/upload.js';
import { notifyPayment } from '../utils/notify.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// POST /api/payments/create-intent
// Called when customer clicks "Pay Now" after approving a quote
export const createPaymentIntent = async (req, res) => {
  try {
    const { quoteId } = req.body;
    if (!quoteId) return error(res, 'quoteId is required', 400);

    let quote = await Quote.findById(quoteId).populate('requestId');
    if (!quote) {
      quote = await Quote.findOne({ requestId: quoteId }).populate('requestId');
    }
    if (!quote) return error(res, 'Quote not found', 404);
    if (quote.status !== 'approved') return error(res, 'Quote must be approved before payment', 400);

    // Prevent double-payment
    const existingPaid = await Invoice.findOne({ quoteId, status: 'paid' });
    if (existingPaid) return error(res, 'This quote has already been paid', 400);

    // Use the pre-calculated amounts from the Quote model
    const subtotal    = Number(quote.subtotal);
    const vatAmount   = Number(quote.vat);
    const totalAmount = Number(quote.customerTotal);

    let clientSecret = 'mock_secret_' + Date.now();
    let paymentIntentId = 'mock_intent_' + Date.now();

    if (stripe) {
      // Stripe accepts amount in fils (1/100 AED = 1 fil)
      const amountInFils = Math.round(totalAmount * 100);
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount:   amountInFils,
          currency: 'aed',
          metadata: {
            quoteId:    quoteId.toString(),
            requestId:  quote.requestId._id ? quote.requestId._id.toString() : quote.requestId.toString(),
            garageId:   quote.garageId ? quote.garageId.toString() : '',
            customerId: req.user.id.toString()
          },
          description: `Garro Car Service — ${quote.requestId.serviceType || 'Auto Service'}`
        });
        clientSecret = paymentIntent.client_secret;
        paymentIntentId = paymentIntent.id;

        // Create a pending payment record linked to this intent
        await Payment.create({
          invoiceId:             null, // will be filled after webhook
          amount:                totalAmount,
          status:                'pending',
          stripePaymentIntentId: paymentIntentId
        });
      } catch (stripeErr) {
        console.error('Stripe creation failed, using mock payment secret:', stripeErr.message);
      }
    }

    success(res, {
      clientSecret,
      paymentIntentId,
      breakdown: {
        partsCost:    Number(quote.partsCost),
        laborCost:    Number(quote.laborCost),
        subtotal,
        serviceFee:   Number(quote.serviceFee),
        vatPercent:   5,
        vatAmount,
        totalAmount,
        currency:     'AED'
      }
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/payments/webhook
// Stripe calls this endpoint when a payment event occurs
// IMPORTANT: must receive raw body — mounted before express.json() in server.js
export const stripeWebhook = async (req, res) => {
  if (!stripe) return res.status(500).send('Stripe not configured.');

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    // In development without a webhook secret, fall through if no secret configured
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Parse body manually for local dev testing without signature
    try {
      event = JSON.parse(req.body.toString());
    } catch (parseErr) {
      return res.status(400).send('Could not parse event');
    }
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const { quoteId, garageId, customerId } = intent.metadata || {};

    try {
      let quote = await Quote.findById(quoteId);
      if (!quote) {
        quote = await Quote.findOne({ requestId: quoteId });
      }
      const garage   = garageId ? await Garage.findById(garageId) : null;
      const customer = await User.findById(customerId);

      if (!quote || !customer) {
        console.error('Webhook: missing quote or customer for intent', intent.id);
        return res.json({ received: true });
      }

      // Find the job associated with this quote if garage is assigned
      let job = null;
      if (garage) {
        job = await Job.findOne({ quoteId: quote._id });
        if (!job) {
          console.error('Webhook: no job found for quoteId', quote._id);
          return res.json({ received: true });
        }
      }

      // Check we haven't already processed this payment
      const alreadyPaid = await Invoice.findOne({ quoteId: quote._id, status: 'paid' });
      if (alreadyPaid) {
        console.log('Webhook: already processed payment for', quote._id);
        return res.json({ received: true });
      }

      // Derive amounts from the Quote
      const subtotal           = Number(quote.subtotal);
      const vatAmount          = Number(quote.vat);
      const totalAmount        = Number(quote.customerTotal);
      const serviceFeeAmount   = Number(quote.serviceFee);
      const garagePayoutAmount = parseFloat((subtotal * 0.90).toFixed(2));

      // Build line items for customer-facing invoice
      const lineItems = [
        { description: 'Parts & Components', qty: 1, unitPrice: Number(quote.partsCost), total: Number(quote.partsCost) },
        { description: 'Labour Charges',     qty: 1, unitPrice: Number(quote.laborCost), total: Number(quote.laborCost) }
      ];

      // 1. Create the Invoice record
      const invoice = await Invoice.create({
        quoteId:    quote._id,
        jobId:      job ? job._id : null,
        customerId: customer._id,
        garageId:   garage ? garage._id : null,
        lineItems,
        partsCost:          Number(quote.partsCost),
        laborCost:          Number(quote.laborCost),
        subtotal,
        vatPercent:         5,
        vatAmount,
        totalAmount,
        serviceFeePercent:  10,
        serviceFeeAmount,
        garagePayoutAmount,
        status:             'paid',
        paidAt:             new Date(),
        paymentMethod:      intent.payment_method_types?.[0] || 'card',
        stripePaymentIntentId: intent.id,
        dueDate:            new Date()
      });

      // 2. Generate UAE Tax Invoice PDF via Puppeteer
      let pdfUrl = null;
      try {
        const displayGarage = garage || { name: 'Garro Service Partner' };
        const displayJob = job || { _id: quote._id };
        const pdfBuffer = await generateInvoicePDF(invoice, customer, displayGarage, displayJob);
        const pdfKey    = `garro/invoices/invoice-${invoice.invoiceNumber}.pdf`;
        pdfUrl = await uploadBufferToR2(pdfBuffer, pdfKey, 'application/pdf');
        await Invoice.findByIdAndUpdate(invoice._id, { pdfUrl });
        console.log(`PDF generated for ${invoice.invoiceNumber}: ${pdfUrl}`);
      } catch (pdfErr) {
        console.error('PDF generation failed (non-fatal):', pdfErr.message);
      }

      // 3. Update quote to paid
      await Quote.findByIdAndUpdate(quote._id, { status: 'paid' });

      // 4. Update request status to 'new' (so it shows to admin)
      const realReqId = quote.requestId?._id || quote.requestId;
      const updatedRequest = await Request.findByIdAndUpdate(
        realReqId,
        { status: 'new' },
        { new: true }
      )
      .populate('userId', 'name phone')
      .populate('vehicleId', 'make model year registrationNumber')
      .populate('garageId', 'name phone')
      .populate('helperId', 'name phone');

      // Emit realtime Socket.io event to admin dashboard
      const io = req.app.get('io');
      if (io && updatedRequest) {
        io.emit('request:new', updatedRequest);
      }

      // 5. Mark pending Payment record as completed
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: 'completed', method: 'card', stripePaidAt: new Date(), invoiceId: invoice._id }
      );

      // 6. Create garage payout record (only if garage is assigned)
      if (garage) {
        await GaragePayout.create({
          garageId:  garage._id,
          invoiceId: invoice._id,
          jobId:     job._id,
          amount:    garagePayoutAmount,
          status:    'pending'
        });
      }

      // 7. Dispatch invoice email & WhatsApp to customer
      try {
        await notifyPayment(customer, invoice, pdfUrl || '#');
      } catch (notifyErr) {
        console.error('Webhook: customer payment notification failed:', notifyErr.message);
      }

      console.log(`Webhook processed successfully for quote ${quote._id}, invoice ${invoice.invoiceNumber}`);
      res.json({ received: true });
    } catch (err) {
      console.error('Webhook processing error:', err.message);
      res.status(500).json({ error: err.message });
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    const { quoteId, requestId } = intent.metadata || {};

    try {
      if (requestId) {
        await Request.findByIdAndDelete(requestId);
      }
      if (quoteId) {
        await Quote.findByIdAndDelete(quoteId);
      }
      await Payment.findOneAndDelete({ stripePaymentIntentId: intent.id });
      console.log(`❌ Payment failed. Deleted Request ${requestId} and Quote ${quoteId} from database.`);
    } catch (err) {
      console.error('Failed to clean up failed payment resources:', err.message);
    }
    res.json({ received: true });

  // ── Refund reconciliation safety net ──────────────────────────────────────────
  // Fires when Stripe confirms a refund reached the card network.
  // Closes the gap where the Stripe API call succeeded but the DB write after it failed.
  // All checks are idempotent — safe to receive duplicate events.
  } else if (event.type === 'charge.refunded') {
    const charge = event.data.object;
    try {
      // Find matching Payment by stripePaymentIntentId
      const payment = await Payment.findOne({ stripePaymentIntentId: charge.payment_intent });
      if (!payment) {
        console.log('Webhook charge.refunded: no local Payment found for intent', charge.payment_intent);
        return res.json({ received: true });
      }

      // Idempotency — only update if not already reconciled
      if (payment.status !== 'refunded') {
        payment.status = 'refunded';
        payment.refundedAt = payment.refundedAt || new Date();
        // Capture the Stripe refund ID from the most recent refund on the charge
        if (charge.refunds?.data?.length > 0) {
          payment.stripeRefundId = payment.stripeRefundId || charge.refunds.data[0].id;
        }
        await payment.save();

        // Reconcile the linked Invoice
        if (payment.invoiceId) {
          await Invoice.findByIdAndUpdate(payment.invoiceId, { status: 'refunded' });
        }

        // Reconcile the linked Request (find via invoice)
        const invoice = payment.invoiceId ? await Invoice.findById(payment.invoiceId) : null;
        if (invoice) {
          const request = await Request.findOne({
            $or: [{ _id: invoice.jobId }, { quoteId: invoice.quoteId }]
          });
          if (request && request.refundStatus !== 'processed') {
            request.refundStatus = 'processed';
            request.refundedAt = request.refundedAt || new Date();
            await request.save();
          }
        }

        console.log(`Webhook charge.refunded: reconciled Payment ${payment._id} → status=refunded`);
      }
    } catch (err) {
      console.error('Webhook charge.refunded processing error:', err.message);
    }
    res.json({ received: true });

  // ── Payout transfer confirmed by Stripe ───────────────────────────────────────
  // Fires when a Stripe Connect transfer reaches the connected account successfully.
  // Safety net for cases where the admin action completed in Stripe but the DB write failed.
  } else if (event.type === 'transfer.paid') {
    const transfer = event.data.object;
    try {
      // Look up GaragePayout by stripeTransferId
      const payout = await GaragePayout.findOne({ stripeTransferId: transfer.id });
      if (!payout) {
        console.log('Webhook transfer.paid: no local GaragePayout found for transfer', transfer.id);
        return res.json({ received: true });
      }

      // Idempotency — only update if not already processed
      if (payout.status !== 'processed') {
        payout.status = 'processed';
        payout.processedAt = payout.processedAt || new Date();
        payout.notes = (payout.notes ? payout.notes + ' | ' : '') + 'Reconciled via Stripe transfer.paid webhook';
        await payout.save();
        console.log(`Webhook transfer.paid: reconciled GaragePayout ${payout._id} → status=processed`);
      }
    } catch (err) {
      console.error('Webhook transfer.paid processing error:', err.message);
    }
    res.json({ received: true });

  // ── Payout transfer failure ────────────────────────────────────────────────────
  // Fires when a Stripe Connect transfer fails (e.g. invalid bank account, network issue).
  // Currently the system has no failure path for payouts — this closes that gap.
  } else if (event.type === 'transfer.failed') {
    const transfer = event.data.object;
    try {
      const payout = await GaragePayout.findOne({ stripeTransferId: transfer.id });
      if (!payout) {
        console.log('Webhook transfer.failed: no local GaragePayout found for transfer', transfer.id);
        return res.json({ received: true });
      }

      // Idempotency — only flag if not already in a terminal state
      if (!['failed', 'processed'].includes(payout.status)) {
        payout.status = 'failed';
        payout.notes = (payout.notes ? payout.notes + ' | ' : '') +
          `Stripe transfer failed: ${transfer.failure_message || 'Unknown reason'} (code: ${transfer.failure_code || 'n/a'})`;
        await payout.save();
        console.error(`Webhook transfer.failed: GaragePayout ${payout._id} flagged as failed — ${transfer.failure_message}`);
      }
    } catch (err) {
      console.error('Webhook transfer.failed processing error:', err.message);
    }
    res.json({ received: true });

  } else {
    // Unhandled event type — acknowledge receipt so Stripe doesn't retry
    res.json({ received: true });
  }
};

// GET /api/payments/quote/:quoteId/status
// Customer polls this to check if their payment went through
export const getPaymentStatusByQuote = async (req, res) => {
  try {
    const inputId = req.params.quoteId;
    let quote = await Quote.findById(inputId);
    if (!quote) {
      quote = await Quote.findOne({ requestId: inputId });
    }
    const realQuoteId = quote ? quote._id : inputId;

    const invoice = await Invoice.findOne({
      $or: [{ quoteId: realQuoteId }, { quoteId: inputId }],
      status: 'paid'
    }).select('invoiceNumber status totalAmount paidAt pdfUrl');

    success(res, {
      paid:    !!invoice && invoice.status === 'paid',
      invoice: invoice || null
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/payments/invoice/:invoiceId — legacy route kept for compatibility
export const getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({ invoiceId: req.params.invoiceId })
      .sort({ createdAt: -1 });
    success(res, { payment });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/payments/bypass-pay
export const bypassPayment = async (req, res) => {
  try {
    const { quoteId } = req.body;
    if (!quoteId) return error(res, 'quoteId is required', 400);

    let quote = await Quote.findById(quoteId);
    if (!quote) {
      quote = await Quote.findOne({ requestId: quoteId });
    }
    if (!quote) return error(res, 'Quote not found', 404);

    const customerId = req.user.id;
    const customer = await User.findById(customerId);
    if (!customer) return error(res, 'Customer not found', 404);

    const garageId = quote.garageId;
    const garage = garageId ? await Garage.findById(garageId) : null;

    // Find the job associated with this quote if garage is assigned
    let job = null;
    if (garage) {
      job = await Job.findOne({ quoteId: quote._id });
    }

    // Check we haven't already processed this payment
    let invoice = await Invoice.findOne({
      $or: [{ quoteId: quote._id }, { quoteId }],
      status: 'paid'
    });

    if (!invoice) {
      // Derive amounts from the Quote
      const subtotal           = Number(quote.subtotal);
      const vatAmount          = Number(quote.vat);
      const totalAmount        = Number(quote.customerTotal);
      const serviceFeeAmount   = Number(quote.serviceFee);
      const garagePayoutAmount = parseFloat((subtotal * 0.90).toFixed(2));

      // Build line items for customer-facing invoice
      const lineItems = [
        { description: 'Parts & Components', qty: 1, unitPrice: Number(quote.partsCost), total: Number(quote.partsCost) },
        { description: 'Labour Charges',     qty: 1, unitPrice: Number(quote.laborCost), total: Number(quote.laborCost) }
      ];

      // 1. Create the Invoice record
      invoice = await Invoice.create({
        quoteId:    quote._id,
        jobId:      job ? job._id : null,
        customerId: customer._id,
        garageId:   garage ? garage._id : null,
        lineItems,
        partsCost:          Number(quote.partsCost),
        laborCost:          Number(quote.laborCost),
        subtotal,
        vatPercent:         5,
        vatAmount,
        totalAmount,
        serviceFeePercent:  10,
        serviceFeeAmount,
        garagePayoutAmount,
        status:             'paid',
        paidAt:             new Date(),
        paymentMethod:      'card',
        stripePaymentIntentId: 'bypass_' + Date.now(),
        dueDate:            new Date()
      });

      // 2. Generate UAE Tax Invoice PDF via Puppeteer
      try {
        const displayGarage = garage || { name: 'Garro Service Partner' };
        const displayJob = job || { _id: quote._id };
        const pdfBuffer = await generateInvoicePDF(invoice, customer, displayGarage, displayJob);
        const pdfKey    = `garro/invoices/invoice-${invoice.invoiceNumber}.pdf`;
        const pdfUrl = await uploadBufferToR2(pdfBuffer, pdfKey, 'application/pdf');
        await Invoice.findByIdAndUpdate(invoice._id, { pdfUrl });
        console.log(`PDF generated for ${invoice.invoiceNumber}: ${pdfUrl}`);
      } catch (pdfErr) {
        console.error('PDF generation failed (non-fatal):', pdfErr.message);
      }
    }

    // 3. Update quote to paid
    await Quote.findByIdAndUpdate(quote._id, { status: 'paid' });

    // 4. Update request status to 'new' (so it shows to admin)
    const realReqId = quote.requestId?._id || quote.requestId;
    const updatedRequest = await Request.findByIdAndUpdate(
      realReqId,
      { status: 'new' },
      { new: true }
    )
    .populate('userId', 'name phone')
    .populate('vehicleId', 'make model year registrationNumber')
    .populate('garageId', 'name phone')
    .populate('helperId', 'name phone');

    // Emit realtime Socket.io event to admin dashboard
    const io = req.app.get('io');
    if (io && updatedRequest) {
      io.emit('request:new', updatedRequest);
    }

    success(res, { success: true, message: 'Bypassed payment successfully', invoice });
  } catch (err) {
    error(res, err.message, 500);
  }
};
