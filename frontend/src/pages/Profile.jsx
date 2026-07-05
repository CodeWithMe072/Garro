import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import CustomDropdown from '../components/CustomDropdown';

const Profile = () => {
  const { user, login, logout } = useAuth();
  const { toast, confirm } = useNotification();
  const navigate = useNavigate();

  // Personal Info Form (Email and Phone are read-only)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Change Step-by-Step State
  const [pwdStep, setPwdStep] = useState(1); // 1: Enter Current, 2: Enter OTP & New Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [demoCode, setDemoCode] = useState(null);

  // Vehicles states
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [catalogBrands, setCatalogBrands] = useState([]);

  // Vehicles Add/Edit Modal
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    registrationNumber: '',
    VIN: '',
    isActive: true
  });

  // Available models for selected brand in modal
  const [availableModels, setAvailableModels] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  // Fetch functions
  const fetchMyVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const res = await fetch(`${API_BASE}/api/vehicles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVehicles(data.vehicles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchCatalogBrands = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/vehicles/catalog/brands`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCatalogBrands(data.brands || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyVehicles();
    fetchCatalogBrands();
  }, []);

  // Update models dropdown when make changes
  useEffect(() => {
    if (vehicleFormData.make) {
      const brand = catalogBrands.find(b => b.name === vehicleFormData.make);
      setAvailableModels(brand ? brand.models || [] : []);
    } else {
      setAvailableModels([]);
    }
  }, [vehicleFormData.make, catalogBrands]);

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

  // Open modals
  const handleOpenAddVehicle = () => {
    setEditVehicleId(null);
    setVehicleFormData({
      make: catalogBrands[0]?.name || '',
      model: '',
      year: new Date().getFullYear(),
      registrationNumber: '',
      VIN: '',
      isActive: true
    });
    setVehicleModalOpen(true);
  };

  const handleOpenEditVehicle = (vehicle) => {
    setEditVehicleId(vehicle._id);
    setVehicleFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      registrationNumber: vehicle.registrationNumber,
      VIN: vehicle.VIN || '',
      isActive: vehicle.isActive ?? true
    });
    setVehicleModalOpen(true);
  };

  // Toggle vehicle active status
  const handleToggleVehicleActive = async (vehicle) => {
    try {
      const res = await fetch(`${API_BASE}/api/vehicles/${vehicle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !vehicle.isActive })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Vehicle status updated successfully.');
        fetchMyVehicles();
      } else {
        toast.error(data.message || 'Failed to update vehicle status.');
      }
    } catch (err) {
      toast.error('An error occurred.');
    }
  };

  // Delete vehicle
  const handleDeleteVehicle = (vehicle) => {
    confirm({
      title: 'Delete Vehicle',
      message: `Are you sure you want to remove your vehicle "${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})"?`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      isDelete: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/api/vehicles/${vehicle._id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            toast.success('Vehicle removed successfully.');
            fetchMyVehicles();
          } else {
            toast.error(data.message || 'Failed to delete vehicle.');
          }
        } catch (err) {
          toast.error('An error occurred.');
        }
      }
    });
  };

  // Submit vehicle form
  const [savingVehicle, setSavingVehicle] = useState(false);
  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setSavingVehicle(true);

    const url = editVehicleId ? `${API_BASE}/api/vehicles/${editVehicleId}` : `${API_BASE}/api/vehicles`;
    const method = editVehicleId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vehicleFormData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(editVehicleId ? 'Vehicle updated successfully.' : 'Vehicle added successfully.');
        setVehicleModalOpen(false);
        fetchMyVehicles();
      } else {
        toast.error(data.message || 'Failed to save vehicle.');
      }
    } catch (err) {
      toast.error('An error occurred.');
    } finally {
      setSavingVehicle(false);
    }
  };

  return (
    <div className="container py-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <h3 className="fw-bold mb-4">My Account Profile</h3>

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
              {(formData.firstName?.[0] || 'U')}{(formData.lastName?.[0] || 'U')}
            </div>
            <h5 className="fw-bold mb-1 text-dark">{formData.firstName} {formData.lastName}</h5>
            <p className="text-muted small mb-3">{formData.email}</p>
            <span className="badge bg-light text-dark border py-2 px-3">
              {user?.role ? user.role.toUpperCase() : 'CUSTOMER'}
            </span>
          </div>

          {/* Quick Help Card */}
          <div className="card border-0 shadow-sm p-4 bg-light mb-4" style={{ borderRadius: '16px' }}>
            <h6 className="fw-bold text-dark mb-2">🚗 Manage Your Fleet</h6>
            <p className="text-muted small mb-0">
              Add your family cars or fleet vehicles here. You can select them easily when scheduling diagnostics, major services, or recovery requests.
            </p>
          </div>

          {/* Security Alert Info */}
          <div className="card border-0 shadow-sm p-4 border-start border-warning" style={{ borderRadius: '16px', borderLeftWidth: '5px !important' }}>
            <h6 className="fw-bold text-warning mb-2">⚠️ Security Protection</h6>
            <p className="text-muted small mb-0">
              For security, email and phone numbers cannot be changed directly. Toggling password changes requires OTP validation, and profiles lock for 30 minutes after 5 failed attempts.
            </p>
          </div>
        </div>

        {/* Profile Editing & Vehicles catalog split */}
        <div className="col-lg-8">
          {/* PERSONAL INFO CARD */}
          <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold mb-4 text-dark">Personal Information</h5>
            
            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-medium">First Name</label>
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
                  <label className="form-label small fw-medium">Last Name</label>
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
                  <label className="form-label small fw-medium text-muted">Email Address (Read-only)</label>
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
                  <label className="form-label small fw-medium text-muted">Phone Number (Read-only)</label>
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
                  {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* CHANGE PASSWORD SEPARATE FLOW */}
          <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold mb-1 text-dark">🔐 Change Account Password</h5>
            <p className="text-muted small mb-4">Verification code will be sent to your email to confirm this action</p>

            {/* STEP 1: VERIFY CURRENT PASSWORD */}
            {pwdStep === 1 && (
              <form onSubmit={handleRequestPasswordOtp}>
                <div className="mb-4">
                  <label className="form-label small fw-medium">Current Account Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Enter current password to request OTP" 
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary-garro px-4" disabled={requestingOtp}>
                    {requestingOtp ? 'Requesting OTP...' : 'Verify & Send OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: VERIFY OTP AND CHANGE PASSWORD */}
            {pwdStep === 2 && (
              <form onSubmit={handleVerifyPasswordChange}>
                {demoCode && (
                  <div className="alert alert-info py-2 small mb-3" style={{ borderRadius: '10px' }}>
                    💡 <strong>Demo Mode:</strong> Use code <strong>{demoCode}</strong> to verify.
                  </div>
                )}
                
                <div className="mb-3">
                  <label className="form-label small fw-medium text-primary">Enter 6-Digit Email OTP</label>
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
                    <label className="form-label small fw-medium">New Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Min 6 characters" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Repeat new password" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between">
                  <button type="button" className="btn btn-outline-secondary px-3" onClick={() => setPwdStep(1)}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-success px-4" disabled={verifyingOtp}>
                    {verifyingOtp ? 'Changing Password...' : 'Verify & Change Password'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* MY VEHICLES DIRECTORY */}
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold text-dark mb-1">🚗 My Registered Vehicles</h5>
                <p className="text-muted small mb-0">Add, edit, or deactivate your vehicles for service bookings</p>
              </div>
              <button onClick={handleOpenAddVehicle} className="btn btn-primary-garro btn-sm px-3">
                + Add Vehicle
              </button>
            </div>

            {loadingVehicles ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
                <div className="text-muted small mt-2">Loading your vehicles...</div>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-5 border rounded bg-light" style={{ borderStyle: 'dashed !important' }}>
                <span style={{ fontSize: '36px' }}>🚘</span>
                <h6 className="fw-bold text-dark mt-2 mb-1">No vehicles registered yet</h6>
                <p className="text-muted small mb-3">Add your first vehicle to speed up service requests.</p>
                <button onClick={handleOpenAddVehicle} className="btn btn-primary-garro btn-sm px-4">
                  Add Now
                </button>
              </div>
            ) : (
              <div className="row g-3">
                {vehicles.map(v => (
                  <div key={v._id} className="col-md-6">
                    <div className={`card border p-3 h-100 position-relative ${v.isActive ? 'bg-white' : 'bg-light'}`} style={{ borderRadius: '12px' }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="fw-bold text-dark mb-1">{v.make} {v.model}</h6>
                          <div className="text-muted small mb-2">Year: {v.year}</div>
                          
                          <div className="d-flex gap-2 align-items-center mb-1">
                            <span className="badge bg-secondary text-white font-monospace small px-2 py-1">
                              Plate: {v.registrationNumber}
                            </span>
                            {v.VIN && (
                              <span className="badge bg-light text-muted border font-monospace small px-2 py-1">
                                VIN: {v.VIN.slice(-6)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`badge px-2 py-1 ${v.isActive ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`} style={{ fontSize: '10px' }}>
                          {v.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>

                      <div className="d-flex gap-2 justify-content-end mt-3 pt-2 border-top">
                        <button onClick={() => handleToggleVehicleActive(v)} className="btn btn-xs btn-outline-warning py-1 px-2" style={{ fontSize: '11px' }}>
                          {v.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleOpenEditVehicle(v)} className="btn btn-xs btn-outline-secondary py-1 px-2" style={{ fontSize: '11px' }}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDeleteVehicle(v)} className="btn btn-xs btn-outline-danger py-1 px-2" style={{ fontSize: '11px' }}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add/Edit Vehicle Modal Overlay ── */}
      {vehicleModalOpen && (
        <div className="custom-modal-overlay" onClick={() => setVehicleModalOpen(false)}>
          <div className="custom-modal confirm" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', textAlign: 'left' }}>
            <h4 className="modal-title mb-4">
              {editVehicleId ? '✏️ Edit Registered Vehicle' : '➕ Add New Vehicle'}
            </h4>

            <form onSubmit={handleVehicleSubmit}>
              {/* Brand Selector */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-light">Car Brand / Make</label>
                {editVehicleId ? (
                  <input 
                    type="text" 
                    className="form-control text-white-50"
                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)' }}
                    value={vehicleFormData.make}
                    disabled
                  />
                ) : (
                  <CustomDropdown
                    options={catalogBrands.map(b => b.name)}
                    value={vehicleFormData.make}
                    onChange={val => setVehicleFormData({ ...vehicleFormData, make: val, model: '' })}
                    placeholder="Select Brand..."
                    required
                  />
                )}
              </div>

              {/* Model Selector */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-light">Car Model</label>
                {editVehicleId ? (
                  <input 
                    type="text" 
                    className="form-control text-white-50"
                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)' }}
                    value={vehicleFormData.model}
                    disabled
                  />
                ) : (
                  <CustomDropdown
                    options={[...availableModels.map(m => m.name), 'Other']}
                    value={vehicleFormData.model}
                    onChange={val => setVehicleFormData({ ...vehicleFormData, model: val })}
                    placeholder="Select Model..."
                    required
                  />
                )}
              </div>

              {/* Year */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-light">Year of Manufacture</label>
                <input 
                  type="number" 
                  className="form-control"
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  value={vehicleFormData.year}
                  min={1980}
                  max={new Date().getFullYear() + 1}
                  onChange={e => setVehicleFormData({ ...vehicleFormData, year: Number(e.target.value) })}
                  required
                />
              </div>

              {/* Registration plate */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-light">Registration Plate / License Number</label>
                <input 
                  type="text" 
                  className="form-control"
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  value={vehicleFormData.registrationNumber}
                  placeholder="e.g. DXB-A-12345"
                  onChange={e => setVehicleFormData({ ...vehicleFormData, registrationNumber: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              {/* Chassis number (VIN) */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-light">VIN / Chassis Number (Optional)</label>
                <input 
                  type="text" 
                  className="form-control"
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  value={vehicleFormData.VIN}
                  placeholder="17-digit code (e.g. 1T1Y...)"
                  maxLength={17}
                  onChange={e => setVehicleFormData({ ...vehicleFormData, VIN: e.target.value.toUpperCase() })}
                />
              </div>

              {/* Active Toggle */}
              <div className="form-check form-switch mt-3 mb-2">
                <input 
                  className="form-check-input" 
                  type="checkbox"
                  checked={vehicleFormData.isActive}
                  onChange={e => setVehicleFormData({ ...vehicleFormData, isActive: e.target.checked })}
                  id="vehicleActiveSwitch"
                />
                <label className="form-check-label text-light small fw-bold" htmlFor="vehicleActiveSwitch">
                  Enable vehicle for new service bookings
                </label>
              </div>

              <div className="modal-actions mt-4 d-flex justify-content-end gap-2">
                <button type="button" className="modal-btn btn-cancel" onClick={() => setVehicleModalOpen(false)}>Cancel</button>
                <button type="submit" className="modal-btn btn-confirm btn-primary" disabled={savingVehicle}>
                  {savingVehicle ? 'Saving...' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
