import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/complaint.controller.js';

router.use(auth);
router.post('/',           ctrl.createComplaint);
router.get('/',            ctrl.getComplaints);
router.patch('/:id/resolve', role('admin'), ctrl.resolveComplaint);

export default router;
