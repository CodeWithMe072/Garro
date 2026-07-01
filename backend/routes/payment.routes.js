import express from 'express';
import auth from '../middleware/auth.middleware.js';
import * as ctrl from '../controllers/payment.controller.js';

const router = express.Router();

// Webhook must receive raw body — mount BEFORE express.json()
router.post('/webhook', express.raw({ type: 'application/json' }), ctrl.stripeWebhook);

// All other routes need auth
router.post('/create-intent',          auth, ctrl.createPaymentIntent);
router.get('/invoice/:invoiceId',      auth, ctrl.getPaymentStatus);

export default router;
