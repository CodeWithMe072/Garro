import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import * as ctrl from '../controllers/invoice.controller.js';

router.use(auth);
router.get('/',    ctrl.getInvoices);
router.get('/:id', ctrl.getInvoice);
router.get('/:id/pdf', ctrl.downloadInvoicePDF);

export default router;
