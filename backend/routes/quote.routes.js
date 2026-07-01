import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/quote.controller.js';

router.use(auth);
router.post('/',              role('admin'),              ctrl.createQuote);
router.get('/',                                           ctrl.getQuotes);
router.get('/:id',                                        ctrl.getQuote);
router.get('/:id/pdf',                                    ctrl.downloadQuotePDF);
router.put('/:id/approve',    role('customer'),           ctrl.approveQuote);
router.put('/:id/reject',     role('customer'),           ctrl.rejectQuote);

export default router;
