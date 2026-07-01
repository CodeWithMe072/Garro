import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Otp from '../models/Otp.js';

const signToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

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

    const token = signToken(user);
    res.status(201).json({ success: true, token, user: { id: user._id, name, email, role: user.role } });
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

    const record = await Otp.findOne({ email: email.toLowerCase(), code });
    if (!record) return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });

    await Otp.deleteOne({ _id: record._id });

    // Set user status to active upon successful OTP match
    await User.findOneAndUpdate({ email: email.toLowerCase() }, { status: 'active' });

    res.json({ success: true, message: 'Account verified successfully' });
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

    if (user.status !== 'active') return res.status(403).json({ success: false, message: 'Please verify your account first.' });

    const token = signToken(user);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/logout — stateless, client deletes token
export const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out' });
};
