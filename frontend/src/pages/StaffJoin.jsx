import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { LuBriefcase, LuMail, LuPhone, LuLock, LuUser, LuCircleCheck, LuCircleAlert } from 'react-icons/lu';

const StaffJoin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const { login } = useAuth();
  const { toast } = useNotification();

  const [tokenInput, setTokenInput] = useState(tokenFromUrl || '');
  const [verifying, setVerifying] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const verifyToken = async (tok) => {
    if (!tok || !tok.trim()) return;
    setVerifying(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/staff-invites/verify/${tok.trim()}`);
      const data = await res.json();
      if (res.ok && data.success && data.invite) {
        setInviteData(data.invite);
      } else {
        setErrorMsg(data.message || 'Invalid or expired invitation link.');
        setInviteData(null);
      }
    } catch {
      setErrorMsg('Failed to verify invitation link.');
      setInviteData(null);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (tokenFromUrl) {
      verifyToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }
    if (!tokenInput) {
      toast.error('Invitation token is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/accept-staff-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenInput.trim(),
          firstName,
          lastName,
          phone,
          password
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Staff onboarding complete! Welcome to Garro.');
        login(data.user, data.token);
        if (data.user?.role === 'manager' || data.user?.role === 'admin') {
          navigate('/admin/staff');
        } else {
          navigate('/admin/staff');
        }
      } else {
        toast.error(data.message || 'Failed to complete registration.');
      }
    } catch {
      toast.error('An error occurred during staff onboarding.');
    } finally {
      setSubmitting(false);
    }
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
            <div className="auth-left-title">Staff Onboarding</div>
            <div className="auth-left-sub">Complete your staff invitation to access your Garro Staff Portal.</div>

            {inviteData && (
              <div className="p-3 bg-primary bg-opacity-10 border border-primary border-opacity-20 rounded-3 mt-4 text-white">
                <div className="fw-bold small text-primary mb-1 d-flex align-items-center gap-1">
                  <LuCircleCheck size={16} /> Invitation Verified
                </div>
                <div className="small"><strong>Email:</strong> {inviteData.email}</div>
                <div className="small"><strong>Role:</strong> {inviteData.role?.toUpperCase()}</div>
                {inviteData.garageId?.name && <div className="small"><strong>Assigned Garage:</strong> {inviteData.garageId.name}</div>}
              </div>
            )}
          </div>

          <div className="secret-notice">
            <div className="n-title"><i className="bi bi-shield-lock"></i> Staff Invitation Required</div>
            <div className="n-body">You must have a valid invitation link sent by a Garro Admin to set up your account.</div>
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="auth-right">
          <h2>Staff Account Onboarding</h2>
          <div className="sub mb-4">Set up your profile details and password to activate your account.</div>

          {errorMsg && (
            <div className="alert alert-danger d-flex align-items-center gap-2 small py-2">
              <LuCircleAlert size={16} /> {errorMsg}
            </div>
          )}

          {!inviteData && (
            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary">Invitation Token / Code</label>
              <div className="d-flex gap-2">
                <input 
                  type="text" 
                  className="form-control" 
                  value={tokenInput} 
                  onChange={e => setTokenInput(e.target.value)} 
                  placeholder="Paste your invitation token"
                />
                <button 
                  type="button" 
                  className="btn btn-primary-garro text-nowrap px-3" 
                  onClick={() => verifyToken(tokenInput)}
                  disabled={verifying || !tokenInput}
                >
                  {verifying ? 'Verifying...' : 'Verify Token'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label className="form-label small fw-bold">Invited Email Address *</label>
              <div className="inp-icon">
                <i className="bi bi-envelope"></i>
                <input 
                  type="email" 
                  className="inp" 
                  value={inviteData ? inviteData.email : ''} 
                  disabled 
                  placeholder="Your invited email" 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label small fw-bold">First Name *</label>
                <div className="inp-icon">
                  <i className="bi bi-person"></i>
                  <input 
                    type="text" 
                    className="inp" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    placeholder="e.g. Sarah" 
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label small fw-bold">Last Name *</label>
                <div className="inp-icon">
                  <i className="bi bi-person"></i>
                  <input 
                    type="text" 
                    className="inp" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    placeholder="e.g. Ahmed" 
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="form-label small fw-bold">Phone Number *</label>
              <div className="inp-icon">
                <i className="bi bi-telephone"></i>
                <input 
                  type="tel" 
                  className="inp" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="+971 50 000 0000" 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label small fw-bold">Create Password *</label>
                <div className="inp-icon">
                  <i className="bi bi-lock"></i>
                  <input 
                    type="password" 
                    className="inp" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    required 
                    minLength="6"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label small fw-bold">Confirm Password *</label>
                <div className="inp-icon">
                  <i className="bi bi-lock"></i>
                  <input 
                    type="password" 
                    className="inp" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••" 
                    required 
                    minLength="6"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-submit mt-3" 
              disabled={submitting || !inviteData}
            >
              {submitting ? 'Completing Setup...' : 'Complete Staff Account Setup'}
            </button>
          </form>

          <div className="signin-link mt-4">
            Already have an active staff account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffJoin;
