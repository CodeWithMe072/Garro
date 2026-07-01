import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const StaffJoin = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
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
            <div className="auth-left-title">Staff Registration</div>
            <div className="auth-left-sub">Join the Garro team and help us deliver premium automotive services across the UAE.</div>

            <div className="auth-feature">
              <div className="auth-feature-ico bg-primary bg-opacity-10 text-primary">
                <i className="bi bi-person-badge"></i>
              </div>
              <div className="auth-feature-text">
                <div className="title">Manage Operations</div>
                <div className="desc">Process bookings, coordinate pickups, and manage service workflows.</div>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-ico bg-success bg-opacity-10 text-success">
                <i className="bi bi-chat-dots"></i>
              </div>
              <div className="auth-feature-text">
                <div className="title">Customer Support</div>
                <div className="desc">Assist customers with quotes, updates, and general inquiries.</div>
              </div>
            </div>
          </div>

          <div className="secret-notice">
            <div className="n-title"><i className="bi bi-shield-lock"></i> Staff Invitation Required</div>
            <div className="n-body">You must have a valid invitation code provided by a Garro Administrator to create a staff account.</div>
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="auth-right">
          <h2>Create Staff Account</h2>
          <div className="sub">Please fill in your details to set up your staff profile.</div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <div className="inp-icon">
                  <i className="bi bi-person"></i>
                  <input type="text" className="inp" placeholder="e.g. Sarah" required />
                </div>
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <div className="inp-icon">
                  <i className="bi bi-person"></i>
                  <input type="text" className="inp" placeholder="e.g. Ahmed" required />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <div className="inp-icon">
                <i className="bi bi-envelope"></i>
                <input type="email" className="inp" placeholder="staff@garro.com" required />
              </div>
              <div className="hint">Use your official Garro email address if provided.</div>
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
              <label><i className="bi bi-envelope-paper"></i> Invitation Code *</label>
              <input type="text" className="inp mt-2" placeholder="Enter your 8-character invitation code" required />
            </div>

            <button type="submit" className="btn-submit">Register Staff Account</button>
          </form>

          <div className="signin-link">
            Already have a staff account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffJoin;
