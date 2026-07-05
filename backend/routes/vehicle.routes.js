import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import * as ctrl from '../controllers/vehicle.controller.js';

// Public endpoints (no auth required)
router.get('/catalog/brands', ctrl.getActiveBrands);
router.get('/catalog/services', ctrl.getActiveServices);
router.get('/catalog/locations', ctrl.getActiveLocations);

router.use(auth);
router.post('/',    ctrl.addVehicle);
router.get('/',     ctrl.getVehicles);
router.get('/:id',  ctrl.getVehicle);
router.put('/:id',  ctrl.updateVehicle);
router.delete('/:id', ctrl.deleteVehicle);

export default router;
