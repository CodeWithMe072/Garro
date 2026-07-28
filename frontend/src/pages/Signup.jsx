import { API_BASE } from '../config/api';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.phone) {
      setError('Phone number is required');
      return;
    }

    const cleanPhone = formData.phone.trim();
    if (!/^\+\d{8,15}$/.test(cleanPhone)) {
      setError('Phone number must start with country code (e.g. +971501234567)');
      return;
    }

    setLoading(true);

    try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: cleanPhone,
          password: formData.password
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      localStorage.setItem('lastRegisteredEmail', formData.email);
      toast.success('Account created! Please verify with the OTP code sent to your email.');
      navigate('/verify-otp', { state: { email: formData.email, demoCode: data.demoCode } });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="auth-lc">
          <Link to="/" className="auth-brand">
            <div className="auth-brand-ico">
              <svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
            </div>
            <span className="auth-brand-nm">Ga<em>rro</em></span>
          </Link>

          <h1 className="auth-headline">Join Garro.<br/><em>Drive Smarter.</em></h1>
          <p className="auth-sub">Create your free account and unlock access to UAE's best-priced certified garages — with Insurance, Roadside Assistance and more.</p>

          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '16px' }}>What you unlock</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '10px', background: 'rgba(255,92,26,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-icons-round" style={{ fontSize: '18px', color: '#ff8c42' }}>request_quote</span>
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#fff' }}>Instant Quotes from 500+ Garages</div>
                  <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>Compare prices before you commit</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '10px', background: 'rgba(16,185,129,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-icons-round" style={{ fontSize: '18px', color: '#34d399' }}>shield</span>
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#fff' }}>Insurance &amp; Protection Plans</div>
                  <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>Comprehensive cover at the best rates</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '10px', background: 'rgba(239,68,68,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-icons-round" style={{ fontSize: '18px', color: '#f87171' }}>emergency</span>
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#fff' }}>24/7 Roadside Assistance</div>
                  <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>Towing, jump starts, flat tyre &amp; more</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', background: 'linear-gradient(135deg,rgba(255,92,26,.2),rgba(255,140,66,.1))', border: '1px solid rgba(255,92,26,.3)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-icons-round" style={{ fontSize: '24px', color: '#ff8c42' }}>local_offer</span>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#ff8c42' }}>20% OFF your first booking</div>
                <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,.45)', marginTop: '2px' }}>Automatically applied at checkout</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <Link to="/" className="auth-back">
          <span className="material-icons-round">arrow_back</span> Back to Home
        </Link>

        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Sign up with your email or phone number</p>
        </div>

        {error && (
          <div className="auth-err">
            <span className="material-icons-round">error</span>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="auth-label">First Name *</label>
              <div className="auth-iw" style={{ marginBottom: 0 }}>
                <span className="material-icons-round ic">person</span>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
            </div>
            <div className="col-6">
              <label className="auth-label">Last Name *</label>
              <div className="auth-iw" style={{ marginBottom: 0 }}>
                <span className="material-icons-round ic">person</span>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="auth-label">Email Address *</label>
            <div className="auth-iw" style={{ marginBottom: 0 }}>
              <span className="material-icons-round ic">email</span>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="auth-label">Phone Number *</label>
            <div className="auth-iw" style={{ marginBottom: 0 }}>
              <span className="material-icons-round ic">phone</span>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
                placeholder="+971501234567" 
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="auth-label">Password *</label>
            <div className="auth-iw" style={{ marginBottom: 0 }}>
              <span className="material-icons-round ic">lock</span>
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required />
              <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                <span className="material-icons-round">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="auth-label">Confirm Password *</label>
            <div className="auth-iw" style={{ marginBottom: 0 }}>
              <span className="material-icons-round ic">lock</span>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '24px' }}>
            <input type="checkbox" id="terms" required style={{ marginTop: '3px', accentColor: 'var(--brand)', width: '15px', height: '15px', flexShrink: 0 }} />
            <label htmlFor="terms" style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: '1.6', cursor: 'pointer' }}>
              I agree to the <a href="#" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: '600' }}>Terms &amp; Conditions</a> and <a href="#" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: '600' }}>Privacy Policy</a>
            </label>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            <span className="material-icons-round" style={{ fontSize: '18px' }}>person_add</span>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <p style={{ textAlign: 'center', fontSize: '13.5px', color: 'var(--muted)', margin: 0 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--brand)', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
