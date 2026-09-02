import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/helper.controller.js';

router.use(auth);
router.get('/me/duty-status',      ctrl.getStaffDutyStatus);
router.patch('/me/toggle-duty',    ctrl.toggleStaffDutyStatus);
router.post('/me/request-deletion', ctrl.requestStaffDeletion);
router.delete('/me/request-deletion', ctrl.cancelStaffDeletionRequest);
router.get('/me/deletion-status', ctrl.getStaffDeletionStatus);
router.get('/',                    ctrl.getHelpers); // admin + helper can view
router.post('/',     role('admin'), ctrl.createHelper);
router.get('/available',           ctrl.getAvailableHelpers);
router.get('/:helperId/schedule',   ctrl.getHelperSchedule);
router.patch('/:helperId/working-hours', role('admin', 'superadmin', 'manager'), ctrl.updateWorkingHours);
router.put('/:helperId',   role('admin', 'superadmin', 'manager'), ctrl.updateHelperProfile);
router.delete('/:helperId', role('admin', 'superadmin', 'manager'), ctrl.deleteHelperAccount);
router.put('/:id',   role('admin', 'superadmin', 'manager'), ctrl.updateHelper);
router.patch('/:id/availability', ctrl.toggleAvailability);

export default router;
