import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/review.controller.js';

// Customer reviews
router.post('/', auth, role('customer'), ctrl.createReview);
router.get('/my', auth, role('customer'), ctrl.getMyReviews);

// Publicly readable reviews
router.get('/garage/:garageId', auth, ctrl.getGarageReviews);
router.get('/helper/:helperId', auth, ctrl.getHelperReviews);

export default router;
