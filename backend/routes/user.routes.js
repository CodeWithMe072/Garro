import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import { exportUserData, deleteUserAccount, getFavoriteLocations, addFavoriteLocation } from '../controllers/user.controller.js';

router.get('/me/export', auth, exportUserData);
router.delete('/me', auth, deleteUserAccount);
router.get('/me/favorite-locations', auth, getFavoriteLocations);
router.post('/me/favorite-locations', auth, addFavoriteLocation);

export default router;
