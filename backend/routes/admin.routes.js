import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/admin.controller.js';
import * as invoiceCtrl from '../controllers/invoice.controller.js';
import * as reqCtrl from '../controllers/request.controller.js';

router.use(auth, role('admin'));

router.get('/dashboard',                          ctrl.getDashboard);
router.get('/reports/revenue',                    ctrl.getRevenueReport);
router.get('/reports/garages',                    ctrl.getGarageReport);
router.get('/available-helpers',                  ctrl.getAvailableHelpers);
router.get('/helpers/:helperId/schedule',         ctrl.getHelperSchedule);
router.get('/settings/mode',                      ctrl.getSystemMode);
router.patch('/settings/mode',                    ctrl.setSystemMode);
router.get('/users',                              ctrl.getUsers);
router.patch('/requests/:id/manual-assign',       reqCtrl.manualAssign);

// Garage payout management
router.get('/payouts',                            invoiceCtrl.getGaragePayouts);
router.patch('/payouts/:id/process',              invoiceCtrl.processGaragePayout);

export default router;
