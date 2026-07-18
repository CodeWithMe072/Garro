import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: identifier, password })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      // Parse name into firstName and lastName
      const [firstName, ...rest] = (data.user.name || '').split(' ');
      const lastName = rest.join(' ') || '';

      // Map backend role to frontend routing role permissions
      let role = data.user.role;
      if (role === 'admin') role = 'superadmin';
      if (role === 'helper') role = 'staff';

      const userData = {
        id: data.user.id,
        email: data.user.email,
        firstName,
        lastName,
        role
      };

      login(userData, data.token);
      toast.success(`Welcome back, ${userData.firstName}!`);

      if (role === 'superadmin' || role === 'manager') {
        navigate('/admin');
      } else if (role === 'staff') {
        navigate('/admin/staff');
      } else if (role === 'garage') {
        navigate('/garage-portal');
      } else {
        const from = location.state?.from?.pathname || '/home';
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
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
          <h1 className="auth-headline">Welcome<br/>back to <em>Garro</em></h1>
          <p className="auth-sub">Sign in to manage your bookings, track your car service, and access instant quotes from verified garages.</p>

          {/* Trust stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '36px' }}>
            <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '16px', padding: '20px 18px' }}>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#ff8c42', letterSpacing: '-.02em' }}>500+</div>
              <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,.5)', marginTop: '4px' }}>Premium Garages</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '16px', padding: '20px 18px' }}>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#ff8c42', letterSpacing: '-.02em' }}>4.8★</div>
              <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,.5)', marginTop: '4px' }}>Average Rating</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '16px', padding: '20px 18px' }}>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#ff8c42', letterSpacing: '-.02em' }}>30min</div>
              <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,.5)', marginTop: '4px' }}>Avg. Response Time</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '16px', padding: '20px 18px' }}>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#ff8c42', letterSpacing: '-.02em' }}>24/7</div>
              <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,.5)', marginTop: '4px' }}>Emergency Support</div>
            </div>
          </div>

          {/* Recent activity ticker */}
          <div style={{ marginTop: '28px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '12px', padding: '16px 18px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '12px' }}>Recent Bookings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-icons-round" style={{ fontSize: '15px', color: 'white' }}>directions_car</span>
                </div>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'rgba(255,255,255,.8)' }}>Ahmed booked Oil Change</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.35)' }}>2 minutes ago · Dubai</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-icons-round" style={{ fontSize: '15px', color: 'white' }}>shield</span>
                </div>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'rgba(255,255,255,.8)' }}>Sara got Comprehensive Insurance</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.35)' }}>15 minutes ago · Abu Dhabi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <Link to="/" className="auth-back">
          <span className="material-icons-round">arrow_back</span> Back to Garro
        </Link>
        <div className="auth-header left-align">
          <h2>Sign in 👋</h2>
          <p>Enter your email or phone number to continue</p>
        </div>

        {error && (
          <div className="auth-err">
            <span className="material-icons-round">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label className="auth-label">Email or Phone</label>
            <div className="auth-iw">
              <span className="material-icons-round ic">person</span>
              <input 
                type="text" 
                value={identifier} 
                onChange={(e) => setIdentifier(e.target.value)} 
                required 
              />
            </div>
          </div>
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="auth-label" style={{ marginBottom: 0 }}>Password</label>
              <a href="#" style={{ fontSize: '12.5px', color: 'var(--brand)', fontWeight: '600', textDecoration: 'none' }}>Forgot password?</a>
            </div>
            <div className="auth-iw">
              <span className="material-icons-round ic">lock</span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
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
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : (
              <><span className="material-icons-round">login</span> Sign In</>
            )}
          </button>
        </form>

        <div className="auth-divider">or</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          <Link to="/signup" className="auth-alt-link">
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons-round" style={{ fontSize: '20px', color: 'var(--brand)' }}>person_add</span>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--dark)' }}>Create Account</div>
            </div>
            <div style={{ marginLeft: 'auto', color: 'var(--muted)' }}><span className="material-icons-round">chevron_right</span></div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
