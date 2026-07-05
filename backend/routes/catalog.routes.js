import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/catalog.controller.js';
import * as ctrlBulk from '../controllers/catalogBulk.controller.js';

// Protect all catalog endpoints for Admin role only
router.use(auth, role('admin'));

// 1. Customer Vehicles
router.get('/vehicles', ctrl.getVehicles);
router.put('/vehicles/:id', ctrl.updateVehicle);
router.patch('/vehicles/:id/status', ctrl.toggleVehicleStatus);
router.delete('/vehicles/:id', ctrl.deleteVehicle);

// 2. Brands & Models
router.get('/brands', ctrl.getBrands);
router.post('/brands', ctrl.createBrand);
router.put('/brands/:id', ctrl.updateBrand);
router.delete('/brands/:id', ctrl.deleteBrand);
router.post('/brands/:brandId/models', ctrl.createModel);
router.put('/models/:id', ctrl.updateModel);
router.delete('/models/:id', ctrl.deleteModel);

// 3. Services
router.get('/categories', ctrl.getCategories);
router.post('/categories', ctrl.createCategory);
router.put('/categories/:id', ctrl.updateCategory);
router.delete('/categories/:id', ctrl.deleteCategory);
router.post('/categories/:categoryId/subcategories', ctrl.createSubCategory);
router.put('/subcategories/:id', ctrl.updateSubCategory);
router.delete('/subcategories/:id', ctrl.deleteSubCategory);

// 4. Locations & Cities
router.get('/cities', ctrl.getCities);
router.post('/cities', ctrl.createCity);
router.put('/cities/:id', ctrl.updateCity);
router.delete('/cities/:id', ctrl.deleteCity);
router.post('/cities/:cityId/areas', ctrl.createArea);
router.put('/areas/:id', ctrl.updateArea);
router.delete('/areas/:id', ctrl.deleteArea);

// 5. Bulk Export & Import (CSV)
router.get('/export/brands',     ctrlBulk.exportBrands);
router.post('/import/brands',    ctrlBulk.importBrands);
router.get('/export/services',   ctrlBulk.exportServices);
router.post('/import/services',  ctrlBulk.importServices);
router.get('/export/locations',  ctrlBulk.exportLocations);
router.post('/import/locations', ctrlBulk.importLocations);

export default router;
