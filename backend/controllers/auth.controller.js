import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import BlockedIp from '../models/BlockedIp.js';
import RefreshToken from '../models/RefreshToken.js';
import { logActivity } from '../utils/audit.js';
import { claimPendingQuote } from './request.controller.js';

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
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
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

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Mobile number is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    const emailExists = await User.findOne({ email: cleanEmail });
    if (emailExists) return res.status(400).json({ success: false, message: 'This email is already registered.' });

    const phoneExists = await User.findOne({ phone: cleanPhone });
    if (phoneExists) return res.status(400).json({ success: false, message: 'This phone number is already registered.' });

    const hashed = await bcrypt.hash(password, 12);
    // Create new users as inactive so they must verify via OTP first
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: hashed,
      role: role || 'customer',
      status: 'inactive'
    });

    // Generate and send OTP immediately upon registration
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.findOneAndUpdate(
      { email: cleanEmail },
      { code, createdAt: new Date() },
      { upsert: true, new: true }
    );
    await sendEmailOtp(cleanEmail, code);

    const token = signToken(user);
    await generateAndSetRefreshToken(res, user._id);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
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

    let claimedRequest = null;
    if (req.body.quoteToken) {
      claimedRequest = await claimPendingQuote(req.body.quoteToken, user);
    }

    res.json({
      success: true,
      message: 'Account verified successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      claimedRequest,
      redirectUrl: claimedRequest ? `/payment/${claimedRequest._id}` : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email: emailField, identifier, password } = req.body;
    const email = emailField || identifier;          // accept both field names
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

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

    if (user.status === 'banned') {
      return res.status(403).json({ success: false, message: 'Access revoked. Your account has been permanently closed. Please contact Admin to reopen access.' });
    }

    if (user.garageId) {
      const Garage = (await import('../models/Garage.js')).default;
      const garage = await Garage.findById(user.garageId);
      if (garage && (garage.status === 'inactive' || garage.deletionRequest?.status === 'approved')) {
        return res.status(403).json({ success: false, message: 'Access revoked. Your garage account has been closed by Admin. Please contact Admin to reopen access.' });
      }
    }

    if (user.status !== 'active') {
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      await Otp.findOneAndUpdate(
        { email: user.email.toLowerCase() },
        { code, createdAt: new Date() },
        { upsert: true, new: true }
      );

      await sendEmailOtp(user.email, code);

      return res.status(403).json({
        success: false,
        isUnverified: true,
        email: user.email,
        message: 'Your account is not verified yet. A new verification OTP code has been sent to your email.',
        demoCode: process.env.RESEND_API_KEY ? null : code
      });
    }

    const token = signToken(user);
    await generateAndSetRefreshToken(res, user._id);

    // Log Activity
    await logActivity(user._id, 'login', 'User', user._id, { email: user.email });

    let claimedRequest = null;
    if (req.body.quoteToken) {
      claimedRequest = await claimPendingQuote(req.body.quoteToken, user);
    }

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      claimedRequest,
      redirectUrl: claimedRequest ? `/payment/${claimedRequest._id}` : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (refreshToken) {
      await RefreshToken.deleteMany({ token: refreshToken });
    }

    let userId = req.user?.id;
    if (!userId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const tokenStr = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(tokenStr, process.env.JWT_SECRET);
        if (decoded?.id) userId = decoded.id;
      } catch (e) {
        // Token expired or invalid, proceed with cookie clear
      }
    }

    if (userId) {
      await RefreshToken.deleteMany({ userId });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/'
    };

    res.clearCookie('refreshToken', cookieOptions);
    res.clearCookie('refreshToken');
    res.clearCookie('token', { path: '/' });
    res.clearCookie('token');
    res.clearCookie('connect.sid', { path: '/' });
    res.clearCookie('connect.sid');

    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, firstName, lastName } = req.body;
    const fullName = name ? name.trim() : (`${firstName || ''} ${lastName || ''}`).trim();
    if (!fullName) return res.status(400).json({ success: false, message: 'Name is required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Lock check
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({ success: false, message: `Your profile is locked. Try again in ${remainingMinutes} minutes.` });
    }

    user.name = fullName;
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    await user.save();

    // Sync Helper record if exists
    try {
      const Helper = (await import('../models/Helper.js')).default;
      const helper = await Helper.findOne({ userId: user._id });
      if (helper) {
        helper.name = user.name;
        await helper.save();
      }
    } catch {
      // ignore if helper lookup fails
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName || user.name.split(' ')[0] || user.name,
        lastName: user.lastName || user.name.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone: user.phone,
        role: user.role,
        garageId: user.garageId
      }
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

const sendSmsOtp = async (phone, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    console.log(`[Demo/Dev Mode] No Twilio configured. Mock sending SMS OTP ${otp} to ${phone}`);
    return true;
  }
  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
      to: phone,
      body: `Your Garro verification OTP code is: ${otp}. Valid for 5 minutes.`
    });
    console.log(`SMS OTP sent to ${phone}`);
    return true;
  } catch (err) {
    console.error('Twilio SMS error:', err.message);
    return false;
  }
};

// POST /api/auth/profile/email/request
export const requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ success: false, message: 'New email address is required' });

    const lowercaseEmail = newEmail.toLowerCase().trim();
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.email.toLowerCase() === lowercaseEmail) {
      return res.status(400).json({ success: false, message: 'New email address is identical to your current email' });
    }

    const existing = await User.findOne({ email: lowercaseEmail, _id: { $ne: user._id } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email address is already in use by another account' });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({ success: false, message: `Your profile is locked. Try again in ${remainingMinutes} minutes.` });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.findOneAndUpdate(
      { email: lowercaseEmail },
      { code, createdAt: new Date() },
      { upsert: true, new: true }
    );

    await sendEmailOtp(lowercaseEmail, code);

    res.json({
      success: true,
      message: 'OTP code sent to your new email address.',
      demoCode: process.env.RESEND_API_KEY ? null : code
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/profile/email/verify
export const verifyEmailChange = async (req, res) => {
  try {
    const { newEmail, code } = req.body;
    if (!newEmail || !code) return res.status(400).json({ success: false, message: 'New email and OTP code are required' });

    const lowercaseEmail = newEmail.toLowerCase().trim();
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({ success: false, message: `Your profile is locked. Try again in ${remainingMinutes} minutes.` });
    }

    const record = await Otp.findOne({ email: lowercaseEmail, code });
    if (!record) {
      user.wrongOtpAttempts = (user.wrongOtpAttempts || 0) + 1;
      if (user.wrongOtpAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        user.wrongOtpAttempts = 0;
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

    user.email = lowercaseEmail;
    user.wrongOtpAttempts = 0;
    user.lockUntil = null;
    await user.save();

    await Otp.deleteOne({ _id: record._id });
    await logActivity(user._id, 'update_email', 'User', user._id, { email: user.email });

    res.json({
      success: true,
      message: 'Email address updated successfully!',
      user: { id: user._id, firstName: user.name.split(' ')[0] || user.name, lastName: user.name.split(' ').slice(1).join(' ') || '', email: user.email, phone: user.phone, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/profile/phone/request
export const requestPhoneChange = async (req, res) => {
  try {
    const { newPhone } = req.body;
    if (!newPhone) return res.status(400).json({ success: false, message: 'New phone number is required' });

    const trimmedPhone = newPhone.trim();
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.phone === trimmedPhone) {
      return res.status(400).json({ success: false, message: 'New phone number is identical to your current phone' });
    }

    const existing = await User.findOne({ phone: trimmedPhone, _id: { $ne: user._id } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Phone number is already in use by another account' });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({ success: false, message: `Your profile is locked. Try again in ${remainingMinutes} minutes.` });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.findOneAndUpdate(
      { phone: trimmedPhone },
      { code, createdAt: new Date() },
      { upsert: true, new: true }
    );

    await sendSmsOtp(trimmedPhone, code);

    res.json({
      success: true,
      message: 'SMS OTP sent to your new phone number.',
      demoCode: (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) ? null : code
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/profile/phone/verify
export const verifyPhoneChange = async (req, res) => {
  try {
    const { newPhone, code } = req.body;
    if (!newPhone || !code) return res.status(400).json({ success: false, message: 'New phone number and OTP code are required' });

    const trimmedPhone = newPhone.trim();
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({ success: false, message: `Your profile is locked. Try again in ${remainingMinutes} minutes.` });
    }

    const record = await Otp.findOne({ phone: trimmedPhone, code });
    if (!record) {
      user.wrongOtpAttempts = (user.wrongOtpAttempts || 0) + 1;
      if (user.wrongOtpAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        user.wrongOtpAttempts = 0;
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

    user.phone = trimmedPhone;
    user.wrongOtpAttempts = 0;
    user.lockUntil = null;
    await user.save();

    await Otp.deleteOne({ _id: record._id });
    await logActivity(user._id, 'update_phone', 'User', user._id, { phone: user.phone });

    res.json({
      success: true,
      message: 'Phone number updated successfully!',
      user: { id: user._id, firstName: user.name.split(' ')[0] || user.name, lastName: user.name.split(' ').slice(1).join(' ') || '', email: user.email, phone: user.phone, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/refresh
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
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
    if (!user || user.status !== 'active' || user.status === 'banned') {
      await RefreshToken.deleteOne({ _id: activeToken._id });
      res.clearCookie('refreshToken');
      return res.status(403).json({ success: false, message: 'Access revoked. Account closed by Admin.' });
    }

    if (user.garageId) {
      const Garage = (await import('../models/Garage.js')).default;
      const garage = await Garage.findById(user.garageId);
      if (garage && (garage.status === 'inactive' || garage.deletionRequest?.status === 'approved')) {
        await RefreshToken.deleteOne({ _id: activeToken._id });
        res.clearCookie('refreshToken');
        return res.status(403).json({ success: false, message: 'Access revoked. Your garage account has been closed by Admin.' });
      }
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

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't leak if email exists
      return res.json({ success: true, message: 'If that email exists in our system, we have sent a reset link.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const subject = 'Garro — Reset Your Password';
    const html = `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #185FA5; text-align: center;">Reset Your Password</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">You requested a password reset for your Garro account. Please click the button below to reset your password:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="background: #185FA5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #94a3b8; font-size: 13px; text-align: center;">This link will expire in 1 hour. If you did not request this, you can safely ignore this email.</p>
    </div>`;

    const { sendEmail } = await import('../utils/notify.js');
    await sendEmail(user.email, subject, html);

    res.json({ success: true, message: 'If that email exists in our system, we have sent a reset link.', demoToken: token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ success: false, message: 'New password is required' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
