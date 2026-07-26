import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { LuCar, LuLock, LuShieldAlert, LuUser, LuLightbulb } from 'react-icons/lu';

const Profile = () => {
  const { user, login, logout } = useAuth();
  const { toast, confirm } = useNotification();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Helper to split user.name into first and last name if they are not defined
  const getNameParts = () => {
    const fullName = user?.name || '';
    const parts = fullName.trim().split(' ');
    const first = parts[0] || '';
    const last = parts.slice(1).join(' ') || '';
    return { first, last };
  };

  const initialNameParts = getNameParts();

  // Personal Info Form (Email and Phone are read-only)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || initialNameParts.first,
    lastName: user?.lastName || initialNameParts.last,
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Sync form state when user changes/loads
  useEffect(() => {
    if (user) {
      const parts = (user.name || '').trim().split(' ');
      const first = parts[0] || '';
      const last = parts.slice(1).join(' ') || '';
      setFormData({
        firstName: user.firstName || first,
        lastName: user.lastName || last,
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Password Change Step-by-Step State
  const [pwdStep, setPwdStep] = useState(1); // 1: Enter Current, 2: Enter OTP & New Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [demoCode, setDemoCode] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  // Handle personal profile submission (updates only name)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: fullName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        login(data.user, token);
        toast.success('Personal information updated successfully.');
      } else {
        toast.error(data.message || 'Failed to update profile.');
        if (res.status === 403 && data.message.includes('locked')) {
          handleLockout();
        }
      }
    } catch (err) {
      toast.error('An error occurred.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Step 1: Request Password Change OTP
  const handleRequestPasswordOtp = async (e) => {
    e.preventDefault();
    if (!currentPassword) return toast.error('Current password is required.');

    setRequestingOtp(true);
    setDemoCode(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile/password/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('OTP sent successfully. Check your email!');
        setPwdStep(2);
        if (data.demoCode) {
          setDemoCode(data.demoCode);
        }
      } else {
        toast.error(data.message || 'Failed to request OTP.');
        if (res.status === 403 && data.message.includes('locked')) {
          handleLockout();
        }
      }
    } catch (err) {
      toast.error('An error occurred.');
    } finally {
      setRequestingOtp(false);
    }
  };

  // Step 2: Confirm OTP & Change Password
  const handleVerifyPasswordChange = async (e) => {
    e.preventDefault();
    if (!otpCode) return toast.error('OTP code is required.');
    if (!newPassword) return toast.error('New password is required.');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match.');

    setVerifyingOtp(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile/password/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: otpCode, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Password changed successfully!');
        // Reset password state
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setOtpCode('');
        setPwdStep(1);
        setDemoCode(null);
      } else {
        toast.error(data.message || 'Failed to change password.');
        if (res.status === 403 && data.message.includes('locked')) {
          handleLockout();
        }
      }
    } catch (err) {
      toast.error('An error occurred.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handle Profile Lockout Redirection
  const handleLockout = () => {
    confirm({
      title: 'Profile Locked',
      message: 'This account has been locked for 30 minutes due to multiple incorrect OTP entries. You will be signed out.',
      confirmText: 'OK',
      cancelText: '',
      isDelete: true,
      onConfirm: () => {
        logout();
        navigate('/login');
      }
    });
  };

  return (
    <div className="container py-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <h3 className="fw-bold mb-4">{t('profile_title')}</h3>

      <div className="row g-4">
        {/* Profile Info Summary Card */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm text-center p-4 mb-4" style={{ borderRadius: '16px' }}>
            <div 
              style={{ 
                width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', 
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', 
                fontWeight: '700', margin: '0 auto 16px' 
              }}
            >
              {((formData.firstName?.[0] || 'U') + (formData.lastName?.[0] || 'U')).toUpperCase()}
            </div>
            <h5 className="fw-bold mb-1 text-dark" style={{ textTransform: 'capitalize' }}>{formData.firstName} {formData.lastName}</h5>
            <p className="text-muted small mb-3">{formData.email}</p>
            <span className="badge bg-light text-dark border py-2 px-3">
              {user?.role ? user.role.toUpperCase() : 'CUSTOMER'}
            </span>
          </div>

          {/* Quick Help Card */}
          <div className="card border-0 shadow-sm p-4 bg-light mb-4" style={{ borderRadius: '16px' }}>
            <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
              <LuCar style={{ color: '#ff5c1a' }} size={18} /> {t('manage_fleet_title')}
            </h6>
            <p className="text-muted small mb-0">
              {t('manage_fleet_desc')}
            </p>
          </div>

          {/* Security Alert Info */}
          <div className="card border-0 shadow-sm p-4 border-start border-warning" style={{ borderRadius: '16px', borderLeftWidth: '5px !important' }}>
            <h6 className="fw-bold text-warning mb-2 d-flex align-items-center gap-2">
              <LuShieldAlert size={18} /> {t('security_alert_title')}
            </h6>
            <p className="text-muted small mb-0">
              {t('security_alert_desc')}
            </p>
          </div>
        </div>

        {/* Profile Editing Section */}
        <div className="col-lg-8">
          {/* PERSONAL INFO CARD */}
          <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold mb-4 text-dark">{t('personal_info')}</h5>
            
            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-medium">{t('first_name')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })} 
                    required 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">{t('last_name')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              {/* READ-ONLY EMAIL & PHONE */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-medium text-muted">{t('email_readonly')}</label>
                  <input 
                    type="email" 
                    className="form-control text-muted bg-light border-0" 
                    name="email" 
                    value={formData.email} 
                    disabled 
                    readOnly 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium text-muted">{t('phone_readonly')}</label>
                  <input 
                    type="text" 
                    className="form-control text-muted bg-light border-0" 
                    name="phone" 
                    value={formData.phone} 
                    disabled 
                    readOnly 
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary-garro px-4" disabled={profileSaving}>
                  {profileSaving ? t('updating') : t('save_profile_changes')}
                </button>
              </div>
            </form>
          </div>

          {/* CHANGE PASSWORD SEPARATE FLOW */}
          <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <LuLock size={20} style={{ color: '#ff5c1a' }} /> {t('change_pwd_title')}
            </h5>
            <p className="text-muted small mb-4">{t('change_pwd_desc')}</p>

            {/* STEP 1: VERIFY CURRENT PASSWORD */}
            {pwdStep === 1 && (
              <form onSubmit={handleRequestPasswordOtp}>
                <div className="mb-4">
                  <label className="form-label small fw-medium">{t('current_pwd_label')}</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder={t('current_pwd_placeholder')} 
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary-garro px-4" disabled={requestingOtp}>
                    {requestingOtp ? t('updating') : t('verify_send_otp')}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: VERIFY OTP AND CHANGE PASSWORD */}
            {pwdStep === 2 && (
              <form onSubmit={handleVerifyPasswordChange}>
                {demoCode && (
                  <div className="alert alert-info py-2 small mb-3" style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <LuLightbulb size={16} /> <span><strong>{t('demo_mode')}:</strong> {t('use_code')} <strong>{demoCode}</strong> {t('to_verify')}.</span>
                  </div>
                )}
                
                <div className="mb-3">
                  <label className="form-label small fw-medium text-primary">{t('enter_otp')}</label>
                  <input 
                    type="text" 
                    className="form-control fw-bold text-center letter-spacing-2" 
                    placeholder="000000" 
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">{t('new_password')}</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder={t('new_pwd_placeholder')} 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">{t('confirm_new_password')}</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder={t('confirm_pwd_placeholder')} 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between">
                  <button type="button" className="btn btn-outline-secondary px-3" onClick={() => setPwdStep(1)}>
                    {t('back')}
                  </button>
                  <button type="submit" className="btn btn-success px-4" disabled={verifyingOtp}>
                    {verifyingOtp ? t('updating') : t('submit_pwd_change')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
