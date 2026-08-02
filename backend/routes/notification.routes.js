import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/notification.controller.js';

router.use(auth);
router.get('/', ctrl.getNotifications);
router.put('/:id/read', ctrl.markRead);
router.post('/bulk', role('admin'), ctrl.sendBulkNotification);

export default router;
