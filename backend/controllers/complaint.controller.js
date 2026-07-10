import Complaint from '../models/Complaint.js';
import Stripe from 'stripe';
import Invoice from '../models/Invoice.js';
import User from '../models/User.js';
import { success, error  } from '../utils/response.js';
import { notifyCustomer } from '../utils/notify.js';

export const createComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.create({ ...req.body, customerId: req.user.id });
    success(res, { complaint }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const getComplaints = async (req, res) => {
  try {
    const filter = req.user.role === 'customer' ? { customerId: req.user.id } : {};
    const complaints = await Complaint.find(filter).populate('jobId').populate('customerId', 'name email');
    success(res, { complaints });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const resolveComplaint = async (req, res) => {
  try {
    const { resolution } = req.body;
    if (!resolution || !resolution.type) {
      return error(res, 'Resolution type is required.', 400);
    }

    const validTypes = ["refund", "compensation", "fix_at_garage", "replacement", "no_action"];
    if (!validTypes.includes(resolution.type)) {
      return error(res, `Invalid resolution type. Must be one of: ${validTypes.join(', ')}`, 400);
    }

    if (["refund", "compensation"].includes(resolution.type)) {
      const amount = parseFloat(resolution.amount);
      if (isNaN(amount) || amount <= 0) {
        return error(res, 'A positive amount is required for refund or compensation resolution.', 400);
      }
    }

    // Find the complaint
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return error(res, 'Complaint not found', 404);

    // If type is refund, process Stripe refund
    if (resolution.type === 'refund') {
      const invoice = await Invoice.findOne({ jobId: complaint.jobId });
      if (invoice && invoice.stripePaymentIntentId) {
        const isMock = invoice.stripePaymentIntentId.startsWith('bypass_') || invoice.stripePaymentIntentId.startsWith('mock_');
        if (isMock) {
          console.log(`[Refund Simulation] Bypassed Stripe refund for mock/test payment intent: ${invoice.stripePaymentIntentId} (Amount: AED ${resolution.amount})`);
        } else {
          const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
          if (stripe) {
            try {
              const amountInFils = Math.round(resolution.amount * 100);
              await stripe.refunds.create({
                payment_intent: invoice.stripePaymentIntentId,
                amount: amountInFils
              });
              console.log(`[Refund Success] Successfully refunded AED ${resolution.amount} via Stripe.`);
            } catch (stripeErr) {
              console.error('Stripe refund failed:', stripeErr.message);
              return error(res, `Stripe refund failed: ${stripeErr.message}`, 400);
            }
          } else {
            console.warn('[Refund Warning] Stripe is not configured on this server. Skipping live refund call.');
          }
        }
      } else {
        console.warn(`[Refund Warning] No invoice or Stripe payment intent ID found for jobId: ${complaint.jobId}. Skipping refund.`);
      }
    }

    // Update complaint record
    complaint.status = 'resolved';
    complaint.resolution = {
      type:       resolution.type,
      amount:     resolution.amount || 0,
      notes:      resolution.notes || '',
      resolvedBy: req.user.id,
      resolvedAt: new Date()
    };
    await complaint.save();

    // Trigger Notification
    try {
      const customer = await User.findById(complaint.customerId);
      if (customer) {
        await notifyCustomer(customer, 'complaint_resolved', {
          actionType: resolution.type,
          jobId: complaint.jobId
        });
      }
    } catch (notifyErr) {
      console.error('Failed to notify customer of resolved complaint:', notifyErr.message);
    }

    success(res, { complaint });
  } catch (err) {
    error(res, err.message, 500);
  }
};
