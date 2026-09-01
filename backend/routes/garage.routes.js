import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/garage.controller.js';
import { upload } from '../utils/upload.js';

// Public for authenticated users (Customers & Admins)
router.get('/', auth, ctrl.getGarages);
router.get('/:id', auth, ctrl.getGarageById);

// Admin, Superadmin & Manager
router.post('/upload-document', auth, role('admin', 'superadmin', 'manager'), upload.single('file'), ctrl.uploadGarageDocument);
router.post('/', auth, role('admin', 'superadmin', 'manager'), ctrl.createGarage);
router.put('/:id', auth, role('admin', 'superadmin', 'manager'), ctrl.updateGarage);
router.patch('/:id/status', auth, role('admin', 'superadmin', 'manager'), ctrl.toggleStatus);
router.patch('/:id/toggle-status', auth, role('admin', 'superadmin', 'manager'), ctrl.toggleStatus);
router.delete('/:id', auth, role('admin', 'superadmin', 'manager'), ctrl.deleteGarage);

// --- Garage Portal routes (Garage role only) ---
router.get('/portal/dashboard', auth, role('garage'), ctrl.getPortalDashboard);
router.get('/portal/jobs', auth, role('garage'), ctrl.getPortalJobs);
router.post('/portal/jobs/:jobId/respond', auth, role('garage'), ctrl.respondToJob);
router.post('/portal/quotes', auth, role('garage'), ctrl.submitGarageQuote);
router.post('/portal/jobs/:jobId/invoice', auth, upload.single('invoice'), ctrl.uploadInvoice);
router.get('/portal/earnings', auth, role('garage'), ctrl.getPortalEarnings);
router.get('/portal/staff', auth, role('garage'), ctrl.getPortalStaff);
router.post('/portal/staff', auth, role('garage'), ctrl.addPortalStaff);
router.put('/portal/staff/:staffId', auth, role('garage'), ctrl.updatePortalStaff);
router.patch('/portal/staff/:staffId/status', auth, role('garage'), ctrl.togglePortalStaffStatus);
router.patch('/portal/staff/:staffId/toggle-status', auth, role('garage'), ctrl.togglePortalStaffStatus);
router.get('/portal/status', auth, role('garage'), ctrl.getPortalGarageStatus);
router.patch('/portal/toggle-open', auth, role('garage'), ctrl.togglePortalGarageOpen);
router.post('/portal/request-deletion', auth, role('garage'), ctrl.requestGarageDeletion);
router.delete('/portal/request-deletion', auth, role('garage'), ctrl.cancelGarageDeletionRequest);

// --- Admin Deletion Request Management routes ---
router.get('/admin/deletion-requests', auth, role('admin', 'superadmin', 'manager'), ctrl.getGarageDeletionRequests);
router.post('/admin/deletion-requests/:garageId/approve', auth, role('admin', 'superadmin', 'manager'), ctrl.approveGarageDeletionRequest);
router.post('/admin/deletion-requests/:garageId/reject', auth, role('admin', 'superadmin', 'manager'), ctrl.rejectGarageDeletionRequest);
router.post('/admin/:garageId/reopen', auth, role('admin', 'superadmin', 'manager'), ctrl.reopenGarage);

export default router;
