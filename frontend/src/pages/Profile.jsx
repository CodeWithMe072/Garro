import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { LuCar, LuLock, LuShieldAlert, LuUser, LuLightbulb, LuShieldCheck, LuDownload, LuTrash2 } from 'react-icons/lu';
import AdminSidebar from '../components/AdminSidebar';
import GarageSidebar from '../components/GarageSidebar';
import StaffSidebar from '../components/StaffSidebar';

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
  const [garageDeletionStatus, setGarageDeletionStatus] = useState('none');
  const [staffDeletionStatus, setStaffDeletionStatus] = useState('none');
  const [deletionReason, setDeletionReason] = useState('');
  const [requestingDeletion, setRequestingDeletion] = useState(false);

  useEffect(() => {
    if (user?.role === 'garage') {
      const fetchGarageStatus = async () => {
        try {
          const res = await fetch(`${API_BASE}/api/garages/portal/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.success && data.garage) {
            setGarageDeletionStatus(data.garage.deletionRequest?.status || 'none');
          }
        } catch {}
      };
      fetchGarageStatus();
    } else if (['staff', 'helper'].includes(user?.role)) {
      fetch(`${API_BASE}/api/helpers/me/deletion-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.deletionRequest) {
          setStaffDeletionStatus(data.deletionRequest.status || 'none');
        }
      })
      .catch(() => {});
    }
  }, [token, user]);

  const handleRequestGarageDeletion = async () => {
    setRequestingDeletion(true);
    try {
      const res = await fetch(`${API_BASE}/api/garages/portal/request-deletion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: deletionReason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGarageDeletionStatus('pending');
        setShowDeleteModal(false);
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to submit deletion request');
      }
    } catch {
      toast.error('Failed to submit deletion request');
    } finally {
      setRequestingDeletion(false);
    }
  };

  const handleCancelGarageDeletion = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/garages/portal/request-deletion`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGarageDeletionStatus('none');
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to cancel request');
      }
    } catch {
      toast.error('Failed to cancel request');
    }
  };

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

    // If staff user -> submit deletion request to Garage (if linked) or Admin (if unassigned)
    if (['staff', 'helper'].includes(user?.role)) {
      try {
        const res = await fetch(`${API_BASE}/api/helpers/me/request-deletion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason: 'Staff member requested account deletion from Profile' })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success(data.message || 'Account deletion request submitted for approval.');
          setStaffDeletionStatus('pending');
          setShowDeleteModal(false);
          setDeleteConfirmText('');
        } else {
          toast.error(data.message || 'Failed to submit deletion request.');
        }
      } catch {
        toast.error('An error occurred submitting account deletion request.');
      }
      return;
    }

    // Normal customer deletion
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

  const handleCancelStaffDeletion = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/helpers/me/request-deletion`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        setStaffDeletionStatus('none');
      } else {
        toast.error(data.message || 'Failed to cancel deletion request');
      }
    } catch {
      toast.error('An error occurred cancelling deletion request');
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

  const role = user?.role || 'customer';
  const isAdminRole = ['admin', 'superadmin', 'manager'].includes(role);
  const isGarageRole = role === 'garage';
  const isStaffRole = role === 'staff' || role === 'helper';

  const profileBody = (
    <>
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
                <button type="submit" className="btn btn-primary-garro py-2 px-4 fw-bold" disabled={profileSaving}>
                  {profileSaving ? 'Saving...' : t('save_profile_changes')}
                </button>
              </div>
            </form>
          </div>

          {/* CHANGE PASSWORD CARD */}
          <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <LuLock className="text-warning" size={20} /> Change Account Password
            </h5>
            <p className="text-muted small mb-4">Verification code will be sent to your email to confirm this action</p>

            {pwdStep === 1 ? (
              <div>
                <div className="mb-3">
                  <label className="form-label small fw-medium text-dark">Current Account Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Enter current password to request OTP"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="d-flex justify-content-end">
                  <button 
                    type="button" 
                    className="btn btn-outline-dark fw-bold px-4 py-2"
                    onClick={handleRequestPasswordOtp}
                    disabled={requestingOtp}
                  >
                    {requestingOtp ? 'Sending OTP...' : 'Send Verification OTP →'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="alert alert-success small mb-3">
                  ✓ Verification code sent to <strong>{user?.email}</strong>
                  {demoCode && <div className="mt-1 fw-bold">Demo OTP Code: {demoCode}</div>}
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-medium text-dark">6-Digit OTP Code</label>
                    <input 
                      type="text" 
                      className="form-control text-center fw-bold" 
                      placeholder="123456"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium text-dark">New Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium text-dark">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <button 
                    type="button" 
                    className="btn btn-link text-secondary btn-sm p-0 text-decoration-none"
                    onClick={() => { setPwdStep(1); setOtpCode(''); setNewPassword(''); setConfirmPassword(''); }}
                  >
                    ← Cancel & Reset
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary-garro fw-bold px-4 py-2"
                    onClick={handleVerifyPasswordChange}
                    disabled={verifyingOtp}
                  >
                    {verifyingOtp ? 'Updating Password...' : 'Verify OTP & Update Password'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PRIVACY & DATA EXPORT CARD */}
          <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <LuShieldCheck className="text-success" size={20} /> Data & Account Governance
            </h5>
            <p className="text-muted small mb-4">Export your personal data archive or request permanent account deletion</p>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100 d-flex flex-column justify-content-between bg-light">
                  <div>
                    <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                      <LuDownload size={16} /> Download Data Archive
                    </h6>
                    <p className="text-muted small mb-3">Export a copy of your account profile, vehicles, quotes, and booking history in JSON format.</p>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-outline-dark btn-sm fw-bold w-100 py-2"
                    onClick={handleDownloadData}
                  >
                    Download Data Export
                  </button>
                </div>
              </div>

              <div className="col-md-6">
                <div className="border border-danger-subtle rounded-3 p-3 h-100 d-flex flex-column justify-content-between bg-danger-subtle bg-opacity-10">
                  <div>
                    <h6 className="fw-bold text-danger mb-1 d-flex align-items-center gap-2">
                      <LuTrash2 size={16} /> {isGarageRole || isStaffRole ? 'Request Account Deletion' : 'Delete Account'}
                    </h6>
                    <p className="text-muted small mb-3">
                      {isGarageRole 
                        ? 'Submits an account deletion & garage closure request to Admin. Upon approval, your garage and all staff accounts will be permanently closed.'
                        : isStaffRole
                        ? `Submits an account deletion request to your ${user?.garageId ? 'Garage Manager' : 'Admin'} for review and approval.`
                        : 'Permanently remove your personal profile and account credentials. This action cannot be undone.'}
                    </p>
                  </div>
                  {isGarageRole && garageDeletionStatus === 'pending' ? (
                    <div className="d-flex flex-column gap-2">
                      <span className="badge bg-warning text-dark p-2 fw-bold" style={{ fontSize: '11px', borderRadius: '6px' }}>
                        ⏳ Deletion Request Pending Admin Review
                      </span>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary btn-sm fw-bold w-100 py-1.5"
                        onClick={handleCancelGarageDeletion}
                        style={{ fontSize: '12px' }}
                      >
                        Cancel Deletion Request
                      </button>
                    </div>
                  ) : isStaffRole && staffDeletionStatus === 'pending' ? (
                    <div className="d-flex flex-column gap-2">
                      <span className="badge bg-warning text-dark p-2 fw-bold" style={{ fontSize: '11px', borderRadius: '6px' }}>
                        ⏳ Deletion Request Pending {user?.garageId ? 'Garage' : 'Admin'} Review
                      </span>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary btn-sm fw-bold w-100 py-1.5"
                        onClick={handleCancelStaffDeletion}
                        style={{ fontSize: '12px' }}
                      >
                        Cancel Deletion Request
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      className="btn btn-outline-danger btn-sm fw-bold w-100 py-2"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      {isGarageRole || isStaffRole ? 'Request Account Deletion' : 'Delete Account'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EMAIL OTP MODAL */}
      {showEmailOtpModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Verify New Email Address</h5>
                <button type="button" className="btn-close" onClick={() => setShowEmailOtpModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <p className="text-muted small mb-3">
                  We sent a 6-digit verification code to <strong>{pendingNewEmail}</strong>. Please enter it below to confirm your new email.
                </p>
                {emailDemoCode && (
                  <div className="alert alert-info small mb-3 py-2">
                    🔑 <strong>Demo OTP Code:</strong> {emailDemoCode}
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label small fw-bold">6-Digit Verification Code</label>
                  <input 
                    type="text" 
                    className="form-control text-center fw-bold fs-4" 
                    placeholder="123456" 
                    maxLength={6}
                    value={emailOtpCode} 
                    onChange={e => setEmailOtpCode(e.target.value)} 
                  />
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowEmailOtpModal(false)}>Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-primary-garro fw-bold px-4" 
                  onClick={handleVerifyEmailOtp} 
                  disabled={emailOtpVerifying || emailOtpCode.length < 6}
                >
                  {emailOtpVerifying ? 'Verifying...' : 'Confirm Email Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHONE OTP MODAL */}
      {showPhoneOtpModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Verify New Phone Number</h5>
                <button type="button" className="btn-close" onClick={() => setShowPhoneOtpModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <p className="text-muted small mb-3">
                  We sent an SMS verification code to <strong>{pendingNewPhone}</strong>. Enter the 6-digit code below to confirm.
                </p>
                {phoneDemoCode && (
                  <div className="alert alert-info small mb-3 py-2">
                    🔑 <strong>Demo SMS OTP:</strong> {phoneDemoCode}
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label small fw-bold">6-Digit SMS Code</label>
                  <input 
                    type="text" 
                    className="form-control text-center fw-bold fs-4" 
                    placeholder="123456" 
                    maxLength={6}
                    value={phoneOtpCode} 
                    onChange={e => setPhoneOtpCode(e.target.value)} 
                  />
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPhoneOtpModal(false)}>Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-primary-garro fw-bold px-4" 
                  onClick={handleVerifyPhoneOtp} 
                  disabled={phoneOtpVerifying || phoneOtpCode.length < 6}
                >
                  {phoneOtpVerifying ? 'Verifying...' : 'Confirm Phone Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">
                  {isGarageRole ? 'Request Account Deletion & Garage Closure' : 'Delete Account Confirmation'}
                </h5>
                <button type="button" className="btn-close" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}></button>
              </div>
              {isGarageRole ? (
                <div className="modal-body py-3">
                  <p className="text-dark small mb-2 fw-semibold">
                    Submitting this request will notify Garro Platform Administrators. Upon approval by Admin, your garage profile, staff accounts, and services will be permanently closed.
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Reason for Deletion (Optional):</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      value={deletionReason} 
                      onChange={e => setDeletionReason(e.target.value)} 
                      placeholder="e.g. Closing workshop, relocating, or changing business entity..."
                    />
                  </div>
                </div>
              ) : (
                <div className="modal-body py-3">
                  <p className="text-dark small mb-2 fw-semibold">
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
              )}
              <div className="modal-footer bg-light border-0">
                <button type="button" className="btn btn-outline-secondary" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}>
                  Cancel
                </button>
                {isGarageRole ? (
                  <button 
                    type="button" 
                    className="btn btn-danger fw-bold px-4" 
                    onClick={handleRequestGarageDeletion}
                    disabled={requestingDeletion}
                  >
                    {requestingDeletion ? 'Submitting...' : 'Submit Request to Admin'}
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    disabled={deleteConfirmText !== 'DELETE'} 
                    onClick={handleDeleteAccount}
                  >
                    Confirm Permanent Deletion
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (isGarageRole) {
    return (
      <div className="staff-wrapper">
        <GarageSidebar />
        <main className="staff-main">
          <div className="container-fluid py-4">
            {profileBody}
          </div>
        </main>
      </div>
    );
  }

  if (isStaffRole) {
    return (
      <div className="staff-wrapper">
        <StaffSidebar />
        <main className="staff-main">
          <div className="container-fluid py-4">
            {profileBody}
          </div>
        </main>
      </div>
    );
  }

  if (isAdminRole) {
    return (
      <div className="dash-wrapper">
        <AdminSidebar />
        <main className="dash-main">
          <div className="container-fluid py-4">
            {profileBody}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {profileBody}
    </div>
  );
};

export default Profile;
