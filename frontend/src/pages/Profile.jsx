import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { LuCar, LuLock, LuShieldAlert, LuUser, LuLightbulb, LuShieldCheck, LuDownload, LuTrash2 } from 'react-icons/lu';

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

  // Personal Info Form
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

  // Email Change OTP States
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailOtpSending, setEmailOtpSending] = useState(false);
  const [emailOtpVerifying, setEmailOtpVerifying] = useState(false);
  const [pendingNewEmail, setPendingNewEmail] = useState('');
  const [emailDemoCode, setEmailDemoCode] = useState(null);

  // Phone SMS OTP Change States
  const [showPhoneOtpModal, setShowPhoneOtpModal] = useState(false);
  const [phoneOtpCode, setPhoneOtpCode] = useState('');
  const [phoneOtpSending, setPhoneOtpSending] = useState(false);
  const [phoneOtpVerifying, setPhoneOtpVerifying] = useState(false);
  const [pendingNewPhone, setPendingNewPhone] = useState('');
  const [phoneDemoCode, setPhoneDemoCode] = useState(null);

  // Password Change Step-by-Step State
  const [pwdStep, setPwdStep] = useState(1); // 1: Enter Current, 2: Enter OTP & New Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [demoCode, setDemoCode] = useState(null);

  const token = localStorage.getItem('token');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleDownloadData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/me/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to export data');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `garro_data_export_${user?.id || 'profile'}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('🎉 Your data export has started!');
    } catch (err) {
      toast.error(err.message || 'Failed to download data');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return toast.error("Please type 'DELETE' to confirm.");
    }
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Account successfully deleted and anonymized. Goodbye!');
        logout();
        navigate('/login');
      } else {
        toast.error(data.message || 'Failed to delete account');
      }
    } catch (err) {
      toast.error('An error occurred during account deletion');
    }
  };

  // Trigger Email OTP Request
  const handleRequestEmailOtp = async (newEmail) => {
    setEmailOtpSending(true);
    setEmailDemoCode(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile/email/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPendingNewEmail(newEmail);
        setEmailOtpCode('');
        setShowEmailOtpModal(true);
        if (data.demoCode) setEmailDemoCode(data.demoCode);
        toast.success(`OTP code sent to ${newEmail}`);
      } else {
        toast.error(data.message || 'Failed to send Email OTP');
        if (res.status === 403 && data.message.includes('locked')) {
          handleLockout();
        }
      }
    } catch (err) {
      toast.error('An error occurred sending email OTP');
    } finally {
      setEmailOtpSending(false);
    }
  };

  // Verify Email OTP
  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (!emailOtpCode) return toast.error('Please enter the 6-digit OTP code');
    setEmailOtpVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile/email/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newEmail: pendingNewEmail, code: emailOtpCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        login(data.user, token);
        setShowEmailOtpModal(false);
        setEmailOtpCode('');
        toast.success('🎉 Email address updated successfully!');
      } else {
        toast.error(data.message || 'Failed to verify email OTP');
        if (res.status === 403 && data.message.includes('locked')) {
          handleLockout();
        }
      }
    } catch (err) {
      toast.error('An error occurred verifying email OTP');
    } finally {
      setEmailOtpVerifying(false);
    }
  };

  // Trigger Phone SMS OTP Request
  const handleRequestPhoneOtp = async (newPhone) => {
    setPhoneOtpSending(true);
    setPhoneDemoCode(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile/phone/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPhone })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPendingNewPhone(newPhone);
        setPhoneOtpCode('');
        setShowPhoneOtpModal(true);
        if (data.demoCode) setPhoneDemoCode(data.demoCode);
        toast.success(`SMS OTP sent to ${newPhone}`);
      } else {
        toast.error(data.message || 'Failed to send SMS OTP');
        if (res.status === 403 && data.message.includes('locked')) {
          handleLockout();
        }
      }
    } catch (err) {
      toast.error('An error occurred sending SMS OTP');
    } finally {
      setPhoneOtpSending(false);
    }
  };

  // Verify Phone SMS OTP
  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    if (!phoneOtpCode) return toast.error('Please enter the 6-digit SMS OTP code');
    setPhoneOtpVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile/phone/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPhone: pendingNewPhone, code: phoneOtpCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        login(data.user, token);
        setShowPhoneOtpModal(false);
        setPhoneOtpCode('');
        toast.success('🎉 Phone number updated successfully!');
      } else {
        toast.error(data.message || 'Failed to verify SMS OTP');
        if (res.status === 403 && data.message.includes('locked')) {
          handleLockout();
        }
      }
    } catch (err) {
      toast.error('An error occurred verifying SMS OTP');
    } finally {
      setPhoneOtpVerifying(false);
    }
  };

  // Handle personal profile submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    // 1. If Email was modified, trigger Email OTP Flow
    if (formData.email && formData.email.toLowerCase() !== (user?.email || '').toLowerCase()) {
      return handleRequestEmailOtp(formData.email);
    }

    // 2. If Phone was modified, trigger Phone SMS OTP Flow
    if (formData.phone && formData.phone !== (user?.phone || '')) {
      return handleRequestPhoneOtp(formData.phone);
    }

    // 3. Otherwise update Name
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

              {/* EDITABLE EMAIL & PHONE WITH TOP HEADER VERIFY BUTTON */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-medium text-dark mb-0">Email Address</label>
                    {formData.email && formData.email.toLowerCase() !== (user?.email || '').toLowerCase() && (
                      <button 
                        type="button" 
                        className="btn btn-primary-garro btn-sm text-white fw-bold px-3 py-1"
                        style={{ fontSize: '12px', borderRadius: '6px', transform: 'none', boxShadow: 'none' }}
                        onClick={() => handleRequestEmailOtp(formData.email)}
                        disabled={emailOtpSending}
                      >
                        {emailOtpSending ? 'Sending...' : 'Verify OTP'}
                      </button>
                    )}
                  </div>
                  <input 
                    type="email" 
                    className="form-control" 
                    name="email" 
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required 
                  />
                  <span className="form-text text-muted small">Changing email requires Email OTP verification.</span>
                </div>
                
                <div className="col-md-6">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-medium text-dark mb-0">Phone Number</label>
                    {formData.phone && formData.phone !== (user?.phone || '') && (
                      <button 
                        type="button" 
                        className="btn btn-primary-garro btn-sm text-white fw-bold px-3 py-1"
                        style={{ fontSize: '12px', borderRadius: '6px', transform: 'none', boxShadow: 'none' }}
                        onClick={() => handleRequestPhoneOtp(formData.phone)}
                        disabled={phoneOtpSending}
                      >
                        {phoneOtpSending ? 'Sending...' : 'Verify OTP'}
                      </button>
                    )}
                  </div>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    required 
                  />
                  <span className="form-text text-muted small">Changing phone number requires SMS OTP verification.</span>
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary-garro px-4" disabled={profileSaving || emailOtpSending || phoneOtpSending}>
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

      {/* EMAIL OTP VERIFICATION MODAL */}
      {showEmailOtpModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">✉️ Verify New Email Address</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEmailOtpModal(false)}></button>
              </div>
              <form onSubmit={handleVerifyEmailOtp}>
                <div className="modal-body p-4">
                  <p className="text-dark fw-medium mb-3">
                    We sent a 6-digit verification OTP code to <strong className="text-primary">{pendingNewEmail}</strong>.
                  </p>

                  {emailDemoCode && (
                    <div className="alert alert-info py-2 px-3 small fw-bold mb-3" style={{ borderRadius: '8px' }}>
                      💡 Demo Email OTP Code: <span className="text-primary fs-6 ms-1">{emailDemoCode}</span>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Enter 6-Digit Email OTP:</label>
                    <input 
                      type="text" 
                      className="form-control text-center fs-4 fw-bold" 
                      style={{ letterSpacing: '6px' }}
                      maxLength="6"
                      value={emailOtpCode} 
                      onChange={e => setEmailOtpCode(e.target.value.replace(/\D/g, ''))} 
                      placeholder="000000"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light border-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowEmailOtpModal(false)}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4" 
                    disabled={emailOtpVerifying || emailOtpCode.length < 6}
                  >
                    {emailOtpVerifying ? 'Verifying...' : 'Verify Email & Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PHONE SMS OTP VERIFICATION MODAL */}
      {showPhoneOtpModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">📱 Verify New Phone Number</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPhoneOtpModal(false)}></button>
              </div>
              <form onSubmit={handleVerifyPhoneOtp}>
                <div className="modal-body p-4">
                  <p className="text-dark fw-medium mb-3">
                    We sent a 6-digit SMS OTP code to <strong className="text-success">{pendingNewPhone}</strong>.
                  </p>

                  {phoneDemoCode && (
                    <div className="alert alert-info py-2 px-3 small fw-bold mb-3" style={{ borderRadius: '8px' }}>
                      💡 Demo SMS OTP Code: <span className="text-success fs-6 ms-1">{phoneDemoCode}</span>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Enter 6-Digit SMS OTP:</label>
                    <input 
                      type="text" 
                      className="form-control text-center fs-4 fw-bold" 
                      style={{ letterSpacing: '6px' }}
                      maxLength="6"
                      value={phoneOtpCode} 
                      onChange={e => setPhoneOtpCode(e.target.value.replace(/\D/g, ''))} 
                      placeholder="000000"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light border-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPhoneOtpModal(false)}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success px-4" 
                    disabled={phoneOtpVerifying || phoneOtpCode.length < 6}
                  >
                    {phoneOtpVerifying ? 'Verifying...' : 'Verify Phone & Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* GDPR Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">⚠️ Delete Account Permanently?</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-dark fw-medium mb-3">
                  This action is irreversible. All of your personal profile data, email, phone number, and vehicle listings will be anonymized or deleted.
                </p>
                <p className="text-muted small mb-4">
                  Note: Transactional receipts and tax invoices will be retained for accounting audit trails.
                </p>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-danger">To confirm deletion, type 'DELETE' below:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={deleteConfirmText} 
                    onChange={e => setDeleteConfirmText(e.target.value)} 
                    placeholder="DELETE"
                  />
                </div>
              </div>
              <div className="modal-footer bg-light border-0">
                <button type="button" className="btn btn-outline-secondary" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  disabled={deleteConfirmText !== 'DELETE'} 
                  onClick={handleDeleteAccount}
                >
                  Confirm Permanent Deletion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
