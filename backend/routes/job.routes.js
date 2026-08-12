import express from 'express';
import rateLimit from 'express-rate-limit';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/job.controller.js';
import { upload } from '../utils/upload.js';

/**
 * Fix 9 Security Documentation:
 * Primary access security is guaranteed by 256-bit cryptographic token entropy
 * (crypto.randomBytes(32).toString('hex')) and 7-day automatic expiration windows.
 * The IP-based rate limiter below protects server bandwidth against denial-of-service attempts.
 */
const delegateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many delegate view requests. Please try again later.' }
});

// Public / Token-scoped routes (Unprotected by auth middleware, secured via 256-bit crypto access code)
router.get('/delegate-view/:accessCode', delegateLimiter, ctrl.getDelegateView);
// Fix 6 — Delegate Action Route (allows delegate to approve/reject scope revisions)
router.put('/delegate-view/:accessCode/scope-revision/:revisionId/respond', delegateLimiter, ctrl.respondScopeRevisionAsDelegate);

// Authenticated Routes
router.use(auth);
router.get('/',                                                     ctrl.getJobs);
router.get('/request/:requestId',                                   ctrl.getJobByRequestId);
router.get('/:id',                                                  ctrl.getJob);
router.put('/:id/status',                                           ctrl.updateStatus);
router.put('/:id/extend-time',                                      ctrl.extendJobTime);
router.post('/:id/photos',    upload.array('photos', 10),           ctrl.uploadPhotos);
router.post('/:id/condition-report', upload.array('photos', 5),    ctrl.submitConditionReport);

// Change 1 — Scope-creep adjudication routes
router.post('/:id/scope-revision', upload.array('photos', 5),       ctrl.requestScopeRevision);
router.put('/:id/scope-revision/:revisionId/respond',              ctrl.respondScopeRevision);

// Change 2 — Warranty direct-contact flag route
router.put('/:id/direct-contact-flag',                              ctrl.toggleDirectContactFlag);

// Change 5 — Delegate mode routes
router.put('/:id/delegate',                                         ctrl.assignDelegate);
router.delete('/:id/delegate',                                      ctrl.revokeDelegate);

export default router;
