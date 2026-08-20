import express from 'express';
const router = express.Router();
import { 
  register, 
  login, 
  logout, 
  sendOtp, 
  verifyOtp,
  updateProfile,
  requestPasswordChange,
  verifyPasswordChange,
  requestEmailChange,
  verifyEmailChange,
  requestPhoneChange,
  verifyPhoneChange,
  refresh,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller.js';
import auth from '../middleware/auth.middleware.js';
import { checkIpBlock } from '../middleware/ipBlock.middleware.js';
import { body, validationResult } from 'express-validator';

const validateRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
  }
];

router.post('/register',   validateRegister, register);
router.post('/login',      login);
router.post('/logout',     logout);
router.post('/send-otp',   checkIpBlock, sendOtp);
router.post('/verify-otp', checkIpBlock, verifyOtp);
router.post('/refresh',    refresh);

// Profile, Password, Email & Phone endpoints (secured with auth middleware)
router.put('/profile',                   auth, updateProfile);
router.post('/profile/password/request', auth, requestPasswordChange);
router.post('/profile/password/verify',  auth, verifyPasswordChange);
router.post('/profile/email/request',    auth, requestEmailChange);
router.post('/profile/email/verify',     auth, verifyEmailChange);
router.post('/profile/phone/request',    auth, requestPhoneChange);
router.post('/profile/phone/verify',     auth, verifyPhoneChange);

router.post('/forgot-password',         forgotPassword);
router.post('/reset-password/:token',   resetPassword);

export default router;
