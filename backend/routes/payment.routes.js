import express from 'express';
import auth from '../middleware/auth.middleware.js';
import * as ctrl from '../controllers/payment.controller.js';

const router = express.Router();

// Webhook — MUST receive raw body, mounted before express.json() in server.js
router.post('/webhook', express.raw({ type: 'application/json' }), ctrl.stripeWebhook);

// Authenticated routes (use JSON body parser)
router.use(express.json());

router.post('/create-intent',               auth, ctrl.createPaymentIntent);
router.post('/bypass-pay',                  auth, ctrl.bypassPayment);
router.get('/quote/:quoteId/status',        auth, ctrl.getPaymentStatusByQuote);
router.get('/invoice/:invoiceId',           auth, ctrl.getPaymentStatus);

export default router;
