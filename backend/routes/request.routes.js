import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/request.controller.js';
import { upload  } from '../utils/upload.js';

router.use(auth);
router.post('/', role('customer'), upload.array('photos', 10), ctrl.createRequest);
router.get('/customer/dashboard-stats', ctrl.getCustomerDashboardStats);
router.get('/',  ctrl.getRequests);
router.get('/:id', ctrl.getRequest);
router.patch('/:id/cancel', ctrl.cancelRequest);
router.patch('/:id/schedule', ctrl.updateSchedule);
router.patch('/:id/schedule/respond', ctrl.respondToScheduleProposal);

export default router;
