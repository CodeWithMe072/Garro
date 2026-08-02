import { API_BASE } from '../config/api';
import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { toast } = useNotification();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Reset failed or token expired.');
      }
      toast.success('🎉 Password reset successfully! Please sign in with your new password.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      {/* LEFT */}
      <div className="auth-left">
        <div className="auth-lc">
          <Link to="/" className="auth-brand">
            <div className="auth-brand-ico">
              <svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
            </div>
            <span className="auth-brand-nm">Ga<em>rro</em></span>
          </Link>
          <div className="auth-tag"><span className="dot"></span>UAE's Trusted Car Platform</div>
          <h1 className="auth-headline">Reset<br/>password</h1>
          <p className="auth-sub">Enter your new secure password below to regain full access to your Garro account.</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <Link to="/login" className="auth-back">
          <span className="material-icons-round">arrow_back</span> Back to Login
        </Link>
        <div className="auth-header left-align">
          <h2>New Password 🔒</h2>
          <p>Reset and secure your account credentials</p>
        </div>

        {error && (
          <div className="auth-err">
            <span className="material-icons-round">error</span>
            {error}
          </div>
        )}

        {!token ? (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '24px', color: '#991b1b', textAlign: 'center' }}>
            <span className="material-icons-round" style={{ fontSize: '48px', color: '#ef4444', marginBottom: '12px' }}>link_off</span>
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Missing Reset Token</h3>
            <p style={{ fontSize: '14px', color: '#b91c1c', margin: 0 }}>
              The password reset token is missing from the URL. Please verify the link you clicked in your email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label className="auth-label">New Password</label>
              <div className="auth-iw">
                <span className="material-icons-round ic">lock</span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  placeholder="At least 6 characters"
                />
                <button 
                  type="button" 
                  className="auth-eye" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-icons-round">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="auth-label">Confirm New Password</label>
              <div className="auth-iw">
                <span className="material-icons-round ic">lock</span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Resetting password...' : (
                <><span className="material-icons-round">save</span> Reset Password</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
