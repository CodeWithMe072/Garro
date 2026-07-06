import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/job.controller.js';
import { upload  } from '../utils/upload.js';

router.use(auth);
router.get('/',                                                     ctrl.getJobs);
router.get('/request/:requestId',                                   ctrl.getJobByRequestId);
router.get('/:id',                                                  ctrl.getJob);
router.put('/:id/status',                                           ctrl.updateStatus);
router.post('/:id/photos',    upload.array('photos', 10),           ctrl.uploadPhotos);
router.post('/:id/condition-report', upload.array('photos', 5),    ctrl.submitConditionReport);

export default router;
