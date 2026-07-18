import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import BlockedIp from '../models/BlockedIp.js';
import RefreshToken from '../models/RefreshToken.js';
import { logActivity } from '../utils/audit.js';

const signToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

const generateAndSetRefreshToken = async (res, userId) => {
  const tokenStr = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await RefreshToken.create({
    token: tokenStr,
    userId,
    expiresAt
  });

  res.cookie('refreshToken', tokenStr, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  return tokenStr;
};

const sendEmailOtp = async (email, otp) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[Demo/Dev Mode] No RESEND_API_KEY configured. Mock sending OTP ${otp} to ${email}`);
    return true;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Garro  <official@backcrafter.shop>',
        to: email,
        subject: 'Verify your Garro account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0f172a; text-align: center;">Verify Your Account</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">Thank you for registering with Garro. Please use the following 6-digit OTP code to verify your account:</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 28px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #ff5c1a; margin: 24px 0;">
              ${otp}
            </div>
            <p style="color: #94a3b8; font-size: 13px; text-align: center;">This code is valid for 5 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `
      })
    });
    const data = await res.json();
    console.log('Resend API response:', data);
    return res.ok;
  } catch (err) {
    console.error('Error calling Resend API:', err);
    return false;
  }
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    // Create new users as inactive so they must verify via OTP first
    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role: role || 'customer',
      status: 'inactive'
    });

    // Generate and send OTP immediately upon registration
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const lowercaseEmail = email.toLowerCase();
    await Otp.findOneAndUpdate(
      { email: lowercaseEmail },
      { code, createdAt: new Date() },
      { upsert: true, new: true }
    );
    await sendEmailOtp(email, code);

    const token = signToken(user);
    await generateAndSetRefreshToken(res, user._id);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name, email, role: user.role },
      demoCode: process.env.RESEND_API_KEY ? null : code
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/send-otp
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const lowercaseEmail = email.toLowerCase();
    const existing = await Otp.findOne({ email: lowercaseEmail });
    if (existing) {
      const timeDiff = Date.now() - new Date(existing.createdAt).getTime();
      if (timeDiff < 15000) { // 15 seconds
        console.log(`[Rate Limit] OTP requested too fast for ${email}. Skipping duplicate send.`);
        return res.json({
          success: true,
          message: 'OTP sent successfully (deduplicated)',
          demoCode: process.env.RESEND_API_KEY ? null : existing.code
        });
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.findOneAndUpdate(
      { email: lowercaseEmail },
      { code, createdAt: new Date() },
      { upsert: true, new: true }
    );

    const sent = await sendEmailOtp(email, code);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      demoCode: process.env.RESEND_API_KEY ? null : code
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, message: 'Email and code are required' });

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const record = await Otp.findOne({ email: email.toLowerCase(), code });
    if (!record) {
      // Increment wrong attempts for IP
      const blockRecord = await BlockedIp.findOneAndUpdate(
        { ip },
        { $inc: { attempts: 1 } },
        { upsert: true, new: true }
      );
      
      if (blockRecord.attempts >= 5) {
        blockRecord.blockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await blockRecord.save();
        return res.status(403).json({
          success: false,
          message: 'Too many wrong OTP attempts. This IP address is blocked for 30 minutes.'
        });
      }
      
      const remainingAttempts = 5 - blockRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid or expired OTP code. ${remainingAttempts} attempts remaining before IP lockout.`
      });
    }

    // Success, reset IP blocked attempts
    await BlockedIp.findOneAndUpdate({ ip }, { attempts: 0, blockedUntil: null });

    await Otp.deleteOne({ _id: record._id });

    // Set user status to active upon successful OTP match
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { status: 'active' },
      { new: true }
    );

    const token = signToken(user);
    await generateAndSetRefreshToken(res, user._id);

    // Log Activity
    await logActivity(user._id, 'verify_otp', 'User', user._id, { email: user.email, phone: user.phone });

    res.json({
      success: true,
      message: 'Account verified successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone: email }
      ]
    }).select('+password');
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    // Lock check
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({ success: false, message: `Your profile is locked. Try again in ${remainingMinutes} minutes.` });
    }

    if (user.status !== 'active') return res.status(403).json({ success: false, message: 'Please verify your account first.' });

    const token = signToken(user);
    await generateAndSetRefreshToken(res, user._id);

    // Log Activity
    await logActivity(user._id, 'login', 'User', user._id, { email: user.email });

    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Lock check
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({ success: false, message: `Your profile is locked. Try again in ${remainingMinutes} minutes.` });
    }

    user.name = name;
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: { id: user._id, firstName: user.name.split(' ')[0] || user.name, lastName: user.name.split(' ').slice(1).join(' ') || '', email: user.email, phone: user.phone, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/profile/password/request
export const requestPasswordChange = async (req, res) => {
  try {
    const { currentPassword } = req.body;
    if (!currentPassword) return res.status(400).json({ success: false, message: 'Current password is required' });

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Lock check
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({ success: false, message: `Your profile is locked. Try again in ${remainingMinutes} minutes.` });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Current password incorrect' });

    // Generate and send OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.findOneAndUpdate(
      { email: user.email.toLowerCase() },
      { code, createdAt: new Date() },
      { upsert: true, new: true }
    );

    const sent = await sendEmailOtp(user.email, code);

    res.json({
      success: true,
      message: 'OTP sent to your registered email address.',
      demoCode: process.env.RESEND_API_KEY ? null : code
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/profile/password/verify
export const verifyPasswordChange = async (req, res) => {
  try {
    const { code, newPassword } = req.body;
    if (!code || !newPassword) return res.status(400).json({ success: false, message: 'OTP code and new password are required' });

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Lock check
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({ success: false, message: `Your profile is locked. Try again in ${remainingMinutes} minutes.` });
    }

    const record = await Otp.findOne({ email: user.email.toLowerCase(), code });
    if (!record) {
      // Track wrong attempts on profile
      user.wrongOtpAttempts = (user.wrongOtpAttempts || 0) + 1;
      if (user.wrongOtpAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        user.wrongOtpAttempts = 0; // reset for next duration
        await user.save();
        return res.status(403).json({
          success: false,
          message: 'Too many wrong OTP attempts. Your profile is locked for 30 minutes.'
        });
      }
      await user.save();
      const remaining = 5 - user.wrongOtpAttempts;
      return res.status(400).json({
        success: false,
        message: `Invalid or expired OTP code. ${remaining} attempts remaining before account lockout.`
      });
    }

    // Change password
    user.password = await bcrypt.hash(newPassword, 12);
    user.wrongOtpAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // Delete OTP
    await Otp.deleteOne({ _id: record._id });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/refresh
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token missing' });
    }

    const activeToken = await RefreshToken.findOne({ token: refreshToken });
    if (!activeToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    if (activeToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: activeToken._id });
      res.clearCookie('refreshToken');
      return res.status(401).json({ success: false, message: 'Refresh token expired' });
    }

    const user = await User.findById(activeToken.userId);
    if (!user || user.status !== 'active') {
      await RefreshToken.deleteOne({ _id: activeToken._id });
      res.clearCookie('refreshToken');
      return res.status(401).json({ success: false, message: 'User not active or found' });
    }

    // Rotate token: delete old one
    await RefreshToken.deleteOne({ _id: activeToken._id });

    // Generate new ones
    const newAccessToken = signToken(user);
    await generateAndSetRefreshToken(res, user._id);

    res.json({
      success: true,
      token: newAccessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
