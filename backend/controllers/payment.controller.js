import Stripe from 'stripe';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { notifyCustomer } from '../utils/notify.js';
import { success, error } from '../utils/response.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// POST /api/payments/create-intent — customer initiates payment
export const createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) return error(res, 'Stripe secret key is not configured on this server.', 500);
    const { invoiceId } = req.body;
    const invoice = await Invoice.findById(invoiceId).populate('jobId');
    if (!invoice) return error(res, 'Invoice not found', 404);
    if (invoice.status === 'paid') return error(res, 'Invoice already paid', 400);

    // Stripe amount is in smallest currency unit (fils for AED = 1/100)
    const amountInFils = Math.round(invoice.total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountInFils,
      currency: 'aed',
      metadata: { invoiceId: invoiceId.toString(), jobId: invoice.jobId.toString() }
    });

    // Save pending payment record
    await Payment.create({
      invoiceId,
      amount:                invoice.total,
      status:                'pending',
      stripePaymentIntentId: paymentIntent.id
    });

    success(res, {
      clientSecret:    paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount:          invoice.total,
      currency:        'AED'
    });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/payments/webhook — Stripe calls this when payment completes
// IMPORTANT: this route must use raw body, not express.json()
export const stripeWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(500).send('Stripe secret key is not configured.');
  }
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const { invoiceId } = intent.metadata;

    try {
      // Mark invoice as paid
      const invoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        { status: 'paid' },
        { new: true }
      );

      // Mark payment as completed
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: 'completed', method: 'card', stripePaidAt: new Date() }
      );

      // Notify customer
      if (invoice) {
        const job = await Job.findById(invoice.jobId).populate('requestId');
        if (job && job.requestId) {
          const customer = await User.findById(job.requestId.userId);
          await notifyCustomer(customer, 'closed', { total: invoice.total });
        }
      }

      console.log('Payment succeeded for invoice:', invoiceId);
    } catch (err) {
      console.error('Post-payment processing error:', err.message);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: intent.id },
      { status: 'failed' }
    );
  }

  res.json({ received: true });
};

// GET /api/payments/invoice/:invoiceId — payment status for an invoice
export const getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({ invoiceId: req.params.invoiceId })
      .sort({ createdAt: -1 });
    success(res, { payment });
  } catch (err) {
    error(res, err.message, 500);
  }
};
