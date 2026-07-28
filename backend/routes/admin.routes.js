import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/admin.controller.js';
import * as invoiceCtrl from '../controllers/invoice.controller.js';
import * as reqCtrl from '../controllers/request.controller.js';
import * as pricingCtrl from '../controllers/servicePricing.controller.js';

router.use(auth, role('admin'));

router.get('/dashboard',                          ctrl.getDashboard);
router.get('/reports/revenue',                    ctrl.getRevenueReport);
router.get('/reports/revenue/export',             ctrl.exportRevenueReport);
router.get('/reports/garages',                    ctrl.getGarageReport);
router.get('/reports/garages/export',             ctrl.exportGarageReport);
router.post('/reports/email',                      ctrl.emailReport);
router.get('/available-helpers',                  ctrl.getAvailableHelpers);
router.get('/helpers/:helperId/schedule',         ctrl.getHelperSchedule);
router.get('/settings/mode',                      ctrl.getSystemMode);
router.patch('/settings/mode',                    ctrl.setSystemMode);
router.get('/settings',                           ctrl.getSettings);
router.patch('/settings',                         ctrl.updateSettings);
router.get('/users',                              ctrl.getUsers);
router.get('/activity-logs',                     ctrl.getActivityLogs);
router.patch('/requests/:id/manual-assign',       reqCtrl.manualAssign);

// Service Pricing (admin-configurable)
router.get('/service-pricing',                    pricingCtrl.getServicePricing);
router.put('/service-pricing/:serviceType',       pricingCtrl.updateServicePricing);

// Cancellation & Refund Management
router.get('/cancellations',                        reqCtrl.getAdminCancellations);
router.post('/cancellations/:id/approve',           reqCtrl.approveRefund);
router.post('/cancellations/:id/reject',            reqCtrl.rejectCancellation);

// Garage payout management
router.get('/payouts',                            invoiceCtrl.getGaragePayouts);
router.patch('/payouts/:id/process',              invoiceCtrl.processGaragePayout);

export default router;
