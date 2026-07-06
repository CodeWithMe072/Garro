import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import * as ctrl from '../controllers/invoice.controller.js';

router.use(auth);

router.get('/my',              ctrl.getMyInvoices);       // customer: all their invoices
router.get('/',                ctrl.getInvoices);          // admin: all invoices
router.get('/:id',             ctrl.getInvoice);           // single invoice
router.get('/:id/download',    ctrl.downloadInvoicePDF);   // PDF redirect or on-the-fly

export default router;
