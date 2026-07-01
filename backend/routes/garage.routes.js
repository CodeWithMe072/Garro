import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/garage.controller.js';

// Public for authenticated users (Customers & Admins)
router.get('/', auth, ctrl.getGarages);
router.get('/:id', auth, ctrl.getGarageById);

// Admin only
router.post('/', auth, role('admin'), ctrl.createGarage);
router.put('/:id', auth, role('admin'), ctrl.updateGarage);
router.patch('/:id/status', auth, role('admin'), ctrl.toggleStatus);
router.delete('/:id', auth, role('admin'), ctrl.deleteGarage);

export default router;
