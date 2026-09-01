import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/request.controller.js';
import { upload  } from '../utils/upload.js';

router.post('/submit-quote', ctrl.submitQuote);
router.post('/claim-quote', auth, async (req, res) => {
  try {
    const { quoteToken } = req.body;
    const request = await ctrl.claimPendingQuote(quoteToken, req.user);
    if (!request) return res.status(400).json({ success: false, message: 'Invalid or expired quote token.' });
    return res.status(200).json({ success: true, request, redirectUrl: `/payment/${request._id}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.use(auth);
router.post('/', role('customer', 'admin', 'superadmin', 'manager'), upload.array('photos', 10), ctrl.createRequest);
router.get('/customer/dashboard-stats', ctrl.getCustomerDashboardStats);
router.get('/',  ctrl.getRequests);
router.get('/:id', ctrl.getRequest);
router.patch('/:id/cancel', ctrl.requestCancellation);
router.patch('/:id/schedule', ctrl.updateSchedule);
router.patch('/:id/schedule/respond', ctrl.respondToScheduleProposal);

export default router;
