import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/garage.controller.js';
import { upload } from '../utils/upload.js';

// Public for authenticated users (Customers & Admins)
router.get('/', auth, ctrl.getGarages);
router.get('/:id', auth, ctrl.getGarageById);

// Admin only
router.post('/', auth, role('admin'), ctrl.createGarage);
router.put('/:id', auth, role('admin'), ctrl.updateGarage);
router.patch('/:id/status', auth, role('admin'), ctrl.toggleStatus);
router.delete('/:id', auth, role('admin'), ctrl.deleteGarage);

// --- Garage Portal routes (Garage role only) ---
router.get('/portal/dashboard', auth, role('garage'), ctrl.getPortalDashboard);
router.get('/portal/jobs', auth, role('garage'), ctrl.getPortalJobs);
router.post('/portal/jobs/:jobId/respond', auth, role('garage'), ctrl.respondToJob);
router.post('/portal/quotes', auth, role('garage'), ctrl.submitGarageQuote);
router.post('/portal/jobs/:jobId/invoice', auth, upload.single('invoice'), ctrl.uploadInvoice);
router.get('/portal/earnings', auth, role('garage'), ctrl.getPortalEarnings);

export default router;
