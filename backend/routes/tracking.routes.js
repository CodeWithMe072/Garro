import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import * as ctrl from '../controllers/tracking.controller.js';

router.use(auth);
router.post('/update',            ctrl.updateLocation);
router.get('/:jobId/latest',      ctrl.getLatestLocation);
router.get('/:jobId/history',     ctrl.getLocationHistory);

export default router;
