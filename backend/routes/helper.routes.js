import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/helper.controller.js';

router.use(auth);
router.get('/',                    ctrl.getHelpers); // admin + helper can view
router.post('/',     role('admin'), ctrl.createHelper);
router.get('/available',           ctrl.getAvailableHelpers);
router.get('/:helperId/schedule',   ctrl.getHelperSchedule);
router.patch('/:helperId/working-hours', role('admin'), ctrl.updateWorkingHours);
router.put('/:id',   role('admin'), ctrl.updateHelper);
router.patch('/:id/availability', role('admin'), ctrl.toggleAvailability);

export default router;
