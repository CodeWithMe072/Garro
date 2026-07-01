import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminSignup = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dummy signup handling
    navigate('/login');
  };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="auth-page">
        {/* LEFT: Branding */}
        <div className="auth-left">
          <div>
            <Link to="/" className="auth-brand">
              <div className="auth-brand-icon">🔧</div>
              <span className="auth-brand-name">Ga<span>rro</span></span>
            </Link>
            <div className="auth-left-title">Admin Account Registration</div>
            <div className="auth-left-sub">Create your administrator account to access the Garro management dashboard and control panel.</div>

            <div className="auth-feature">
              <div className="auth-feature-ico bg-primary bg-opacity-10 text-primary">
                <i className="bi bi-speedometer2"></i>
              </div>
              <div className="auth-feature-text">
                <div className="title">Complete Oversight</div>
                <div className="desc">Monitor active bookings, revenue, and platform analytics in real-time.</div>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-ico bg-success bg-opacity-10 text-success">
                <i className="bi bi-people"></i>
              </div>
              <div className="auth-feature-text">
                <div className="title">Staff Management</div>
                <div className="desc">Onboard and manage platform staff, service advisors, and mechanics.</div>
              </div>
            </div>
          </div>

          <div className="secret-notice">
            <div className="n-title"><i className="bi bi-shield-lock"></i> Restricted Access</div>
            <div className="n-body">This page requires a valid Admin Secret Key provided by the system owner. Unauthorized access attempts are logged.</div>
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="auth-right">
          <h2>Create Admin Account</h2>
          <div className="sub">Please fill in your details to set up your administrator profile.</div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <div className="inp-icon">
                  <i className="bi bi-person"></i>
                  <input type="text" className="inp" placeholder="e.g. Omar" required />
                </div>
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <div className="inp-icon">
                  <i className="bi bi-person"></i>
                  <input type="text" className="inp" placeholder="e.g. Al Hashimi" required />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <div className="inp-icon">
                <i className="bi bi-envelope"></i>
                <input type="email" className="inp" placeholder="admin@garro.com" required />
              </div>
              <div className="hint">Use your official corporate email address.</div>
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <div className="inp-icon">
                <i className="bi bi-telephone"></i>
                <input type="tel" className="inp" placeholder="+971 50 000 0000" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <div className="inp-icon">
                  <i className="bi bi-lock"></i>
                  <input type="password" className="inp" placeholder="••••••••" required />
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <div className="inp-icon">
                  <i className="bi bi-lock"></i>
                  <input type="password" className="inp" placeholder="••••••••" required />
                </div>
              </div>
            </div>

            <div className="divider-label">Authorization</div>

            <div className="secret-box mb-3">
              <label><i className="bi bi-key-fill"></i> Admin Secret Key *</label>
              <input type="password" className="inp mt-2" placeholder="Enter the 16-character secret key" required />
              <div className="hint mt-2" style={{ fontSize: '11px' }}>Required to verify you are authorized to create an admin account.</div>
            </div>

            <button type="submit" className="btn-submit">Register Admin Account</button>
          </form>

          <div className="signin-link">
            Already have an admin account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
