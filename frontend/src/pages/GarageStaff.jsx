import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import GarageSidebar from '../components/GarageSidebar';
import CustomDropdown from '../components/CustomDropdown';
import {
  LuUsers,
  LuUserPlus,
  LuMail,
  LuPhone,
  LuShield,
  LuCheck,
  LuUser,
  LuLock,
  LuEye,
  LuEyeOff,
  LuClock,
  LuX,
  LuPencil,
  LuTrash2,
  LuShieldAlert,
  LuShieldCheck
} from 'react-icons/lu';

const defaultDays = [
  { day: 'monday', label: 'Monday', isWorking: true, startTime: '09:00', endTime: '21:00' },
  { day: 'tuesday', label: 'Tuesday', isWorking: true, startTime: '09:00', endTime: '21:00' },
  { day: 'wednesday', label: 'Wednesday', isWorking: true, startTime: '09:00', endTime: '21:00' },
  { day: 'thursday', label: 'Thursday', isWorking: true, startTime: '09:00', endTime: '21:00' },
  { day: 'friday', label: 'Friday', isWorking: true, startTime: '09:00', endTime: '21:00' },
  { day: 'saturday', label: 'Saturday', isWorking: true, startTime: '09:00', endTime: '21:00' },
  { day: 'sunday', label: 'Sunday', isWorking: true, startTime: '09:00', endTime: '21:00' }
];

const GarageStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStaffId, setEditStaffId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff'
  });

  const [schedule, setSchedule] = useState(defaultDays);

  const { toast, confirm } = useNotification();
  const { lang } = useLanguage();

  const handleOpenAddModal = () => {
    setEditStaffId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'staff'
    });
    setSchedule(defaultDays);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (st) => {
    setEditStaffId(st._id);
    setFormData({
      name: st.name || '',
      email: st.email || '',
      phone: st.phone || '',
      password: '',
      role: st.role || 'staff'
    });
    setSchedule(st.schedule && st.schedule.length > 0 ? st.schedule : defaultDays);
    setIsModalOpen(true);
  };

  const handleDayChange = (index, field, value) => {
    const updated = schedule.map((item, idx) =>
      idx === index ? { ...item, [field]: value } : item
    );
    setSchedule(updated);
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/garages/portal/staff`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch staff list.');
      }
      setStaffList(data.staffList || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [deletionRequests, setDeletionRequests] = useState([]);

  const fetchDeletionRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/garages/portal/staff-deletion-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDeletionRequests(data.requests || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchStaff();
    fetchDeletionRequests();
  }, []);

  const handleApproveStaffDeletion = async (staffId, staffName) => {
    confirm({
      title: 'Approve Staff Account Deletion',
      message: `Are you sure you want to approve deletion for "${staffName}"? This will permanently delete their staff account and profile data.`,
      confirmText: 'Approve & Delete',
      cancelText: 'Cancel',
      isDelete: true,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/api/garages/portal/staff-deletion-requests/${staffId}/approve`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            toast.success(data.message);
            fetchStaff();
            fetchDeletionRequests();
          } else {
            toast.error(data.message || 'Failed to approve deletion request');
          }
        } catch {
          toast.error('Failed to approve staff deletion request');
        }
      }
    });
  };

  const handleRejectStaffDeletion = async (staffId, staffName) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/garages/portal/staff-deletion-requests/${staffId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        fetchStaff();
        fetchDeletionRequests();
      } else {
        toast.error(data.message || 'Failed to reject deletion request');
      }
    } catch {
      toast.error('Failed to reject staff deletion request');
    }
  };

  const handleToggleStatus = async (staffId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/garages/portal/staff/${staffId}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update staff status.');
      }
      toast.success(data.message || 'Staff status updated successfully');
      fetchStaff();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteStaff = async (staffId, staffName) => {
    const isConfirmed = await confirm(`Are you sure you want to delete staff member "${staffName}"?`);
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/garages/portal/staff/${staffId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete staff member.');
      }
      toast.success(data.message || 'Staff member deleted successfully');
      fetchStaff();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Name, email, and phone are required.');
      return;
    }

    if (!editStaffId && !formData.password) {
      toast.error('Password is required for new staff members.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = editStaffId
        ? `${API_BASE}/api/garages/portal/staff/${editStaffId}`
        : `${API_BASE}/api/garages/portal/staff`;
      const method = editStaffId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, schedule })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save staff member.');
      }
      toast.success(data.message || (editStaffId ? 'Staff member updated successfully!' : 'Staff member added successfully!'));
      setIsModalOpen(false);
      setEditStaffId(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'staff'
      });
      setSchedule(defaultDays);
      fetchStaff();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="staff-wrapper">
      {/* ── SIDEBAR ── */}
      <GarageSidebar activeJobsCount={0} />

      {/* ── MAIN CONTENT ── */}
      <main className="staff-main">
        {/* Header */}
        <div className="dash-header mb-4">
          <div>
            <div className="dash-title">
              {lang === 'ar' ? 'طاقم العمل والفنيين' : 'Garage Staff & Mechanics'}
            </div>
            <div className="dash-subtitle">
              {lang === 'ar'
                ? 'إضافة وإدارة أعضاء طاقم العمل، الفنيين، والسائقين التابعين للكراج.'
                : 'Add and manage workshop staff, mechanics, and recovery drivers for your garage.'}
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="btn btn-garro btn-primary-garro fw-bold d-inline-flex align-items-center gap-2 px-4 py-2"
            style={{ borderRadius: '10px', fontSize: '13.5px' }}
          >
            <LuUserPlus size={16} />
            {lang === 'ar' ? 'إضافة موظف جديد' : 'Add New Staff Member'}
          </button>
        </div>

        {/* Staff Deletion Requests Banner */}
        {deletionRequests.length > 0 && (
          <div className="alert alert-danger bg-danger-subtle border-danger text-dark p-3 mb-4 rounded-3 shadow-sm">
            <h5 className="fw-bold text-danger d-flex align-items-center gap-2 m-0 mb-2">
              <LuShieldAlert size={20} /> Pending Staff Account Deletion Requests ({deletionRequests.length})
            </h5>
            <p className="small text-secondary mb-3">
              The following staff members have requested permanent account deletion. Please review and accept or reject their requests:
            </p>
            <div className="d-flex flex-column gap-2">
              {deletionRequests.map(req => (
                <div key={req._id} className="bg-white p-3 rounded-2 border d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div>
                    <div className="fw-bold text-dark">{req.name}</div>
                    <div className="small text-muted">{req.phone} • {req.userId?.email || 'No email'}</div>
                    <div className="small text-danger fw-semibold">Requested: {new Date(req.deletionRequest?.requestedAt || Date.now()).toLocaleDateString()}</div>
                  </div>
                  <div className="d-flex gap-2">
                    <button onClick={() => handleApproveStaffDeletion(req._id, req.name)} className="btn btn-sm btn-danger fw-bold px-3">
                      Accept & Delete Account
                    </button>
                    <button onClick={() => handleRejectStaffDeletion(req._id, req.name)} className="btn btn-sm btn-outline-secondary fw-bold px-3">
                      Reject Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff Table Card */}
        <div className="schedule-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px' }}>
          <div className="schedule-head d-flex justify-content-between align-items-center mb-3">
            <h4 className="m-0 d-flex align-items-center gap-2 font-bold" style={{ fontSize: '17px', color: '#0f172a' }}>
              <LuUsers className="text-primary-garro" size={18} />
              {lang === 'ar' ? 'قائمة الفنيين والموظفين' : 'Garage Staff Roster'}
            </h4>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {staffList.length} members
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }}></div>
              <p className="mt-2 text-muted small">Loading Garage Staff...</p>
            </div>
          ) : staffList.length === 0 ? (
            <div className="text-center py-5">
              <LuUsers size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
              <div className="fw-bold text-dark fs-6 mb-1">No staff members added yet</div>
              <div className="text-muted small">Click "Add New Staff Member" above to create accounts for your mechanics and drivers.</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '12px 16px', borderRadius: '8px 0 0 8px' }}>MEMBER</th>
                    <th style={{ padding: '12px 16px' }}>CONTACT</th>
                    <th style={{ padding: '12px 16px' }}>ASSIGNED ROLE</th>
                    <th style={{ padding: '12px 16px' }}>WORK SHIFT</th>
                    <th style={{ padding: '12px 16px' }}>STATUS</th>
                    <th style={{ padding: '12px 16px' }}>DATE ADDED</th>
                    <th className="text-end pe-4" style={{ padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((st, idx) => (
                    <tr key={st._id} style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', position: 'relative', zIndex: staffList.length - idx }}>
                      <td style={{ padding: '14px 16px', borderRadius: '8px 0 0 8px' }}>
                        <div className="d-flex align-items-center gap-3">
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: '#fff4ef',
                            color: '#ff5c1a',
                            display: 'flex',
                            alignItems: 'center',
                            justify: 'center',
                            fontWeight: '700',
                            fontSize: '14px',
                            flexShrink: 0,
                            border: '1px solid #ffe2d5'
                          }}>
                            {st.name[0]?.toUpperCase() || 'S'}
                          </div>
                          <div>
                            <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>{st.name}</div>
                            <div className="text-muted small" style={{ fontSize: '12px' }}>ID: #{st._id.slice(-6).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div className="small text-secondary" style={{ lineHeight: 1.5 }}>
                          <span className="d-block"><LuMail className="me-1" size={13} />{st.email}</span>
                          <span className="d-block"><LuPhone className="me-1" size={13} />{st.phone}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '800',
                          textTransform: 'uppercase'
                        }}>
                          {st.role === 'helper' ? 'Driver / Helper' : 'Mechanic / Staff'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div className="small fw-bold text-dark">
                          <LuClock className="me-1 text-primary-garro" size={13} />
                          {st.shiftStart || '09:00'} - {st.shiftEnd || '21:00'}
                        </div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>
                          {st.schedule ? `${st.schedule.filter(s => s.isWorking).length} days / week` : '7 days / week'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div className="d-flex flex-column gap-1 align-items-start">
                          {st.status === 'blocked' ? (
                            <span className="badge bg-danger text-white px-2.5 py-1 fw-bold" style={{ borderRadius: '6px', fontSize: '11px' }}>
                              ✕ Blocked
                            </span>
                          ) : (
                            <span className="badge bg-success text-white px-2.5 py-1 fw-bold" style={{ borderRadius: '6px', fontSize: '11px' }}>
                              ✓ Active
                            </span>
                          )}
                          {st.dutyStatus === 'off_duty' || st.isAvailable === false ? (
                            <span className="badge bg-warning text-dark px-2.5 py-1 fw-bold" style={{ borderRadius: '6px', fontSize: '11px' }}>
                              🔴 Off Duty
                            </span>
                          ) : (
                            <span className="badge bg-primary text-white px-2.5 py-1 fw-bold" style={{ borderRadius: '6px', fontSize: '11px' }}>
                              🟢 On Duty
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                        {new Date(st.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-end pe-4" style={{ padding: '14px 16px', borderRadius: '0 8px 8px 0' }}>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(st)}
                            className="btn btn-sm btn-outline-secondary py-1 px-2 d-inline-flex align-items-center"
                            style={{ borderRadius: '6px', fontSize: '12px' }}
                            title="Edit Staff Member"
                          >
                            <LuPencil className="me-1" size={13} /> {lang === 'ar' ? 'تعديل' : 'Edit'}
                          </button>
                          <button
                            onClick={() => handleToggleStatus(st._id)}
                            className={`btn btn-sm py-1 px-2 d-inline-flex align-items-center ${st.status === 'blocked' ? 'btn-outline-success' : 'btn-outline-warning'}`}
                            style={{ borderRadius: '6px', fontSize: '12px' }}
                            title={st.status === 'blocked' ? 'Unblock Staff' : 'Block Staff'}
                          >
                            {st.status === 'blocked' ? <LuShieldCheck className="me-1" size={13} /> : <LuShieldAlert className="me-1" size={13} />}
                            {st.status === 'blocked' ? (lang === 'ar' ? 'إلغاء الحظر' : 'Unblock') : (lang === 'ar' ? 'حظر' : 'Block')}
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(st._id, st.name)}
                            className="btn btn-sm btn-outline-danger py-1 px-2 d-inline-flex align-items-center"
                            style={{ borderRadius: '6px', fontSize: '12px' }}
                            title="Delete Staff Member"
                          >
                            <LuTrash2 className="me-1" size={13} /> {lang === 'ar' ? 'حذف' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Add / Edit Staff Modal ── */}
      {isModalOpen && (
        <div className="custom-modal-overlay" onClick={() => setIsModalOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, backdropFilter: 'blur(4px)' }}>
          <div className="custom-modal confirm no-scrollbar" onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', padding: '28px', borderRadius: '16px', maxWidth: '580px', width: '92%', color: '#0f172a', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', textAlign: 'left', maxHeight: '90vh', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <h4 className="fw-bold m-0 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                <LuUserPlus className="text-primary-garro" size={22} /> {editStaffId ? 'Edit Garage Staff Member' : 'Add Garage Staff Member'}
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn border-0 p-1 text-secondary"
                style={{ cursor: 'pointer', background: 'transparent', borderRadius: '50%', lineHeight: 1 }}
                title="Close"
              >
                <LuX size={20} />
              </button>
            </div>
            <p className="text-muted small mb-3">
              {editStaffId ? 'Update account details, role, and 7-day shift schedule.' : 'Create a login account and configure individual 7-day shift working hours.'}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Full Name *</label>
                <input
                  type="text"
                  className="form-control text-dark bg-white"
                  style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px' }}
                  placeholder="e.g. Tariq Ahmed"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">Email Address *</label>
                  <input
                    type="email"
                    className="form-control text-dark bg-white"
                    style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px' }}
                    placeholder="tariq@workshop.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-control text-dark bg-white"
                    style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px' }}
                    placeholder="+971501234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">
                  {editStaffId ? 'Password (Leave blank to keep current)' : 'Password *'}
                </label>
                <div className="position-relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control text-dark bg-white pe-5"
                    style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px' }}
                    placeholder={editStaffId ? 'Enter new password if changing' : 'Minimum 6 characters'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editStaffId}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-2 text-muted"
                  >
                    {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Role / Category *</label>
                <CustomDropdown
                  theme="light"
                  options={[
                    { label: 'Mechanic / Workshop Staff', value: 'staff' },
                    { label: 'Recovery Driver / Helper', value: 'helper' }
                  ]}
                  value={formData.role}
                  onChange={(val) => setFormData({ ...formData, role: val })}
                  placeholder="Select Role"
                  name="role"
                  required
                />
              </div>

              {/* ── 7-Day Weekly Shift Schedule Table ── */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label small fw-bold text-secondary m-0">Weekly Shift Schedule (7 Days) *</label>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none text-primary-garro fw-semibold"
                    style={{ fontSize: '11.5px' }}
                    onClick={() => setSchedule(defaultDays)}
                  >
                    Reset to 09:00 - 21:00 All Days
                  </button>
                </div>

                <div className="table-responsive no-scrollbar" style={{ border: '1.5px solid #cbd5e1', borderRadius: '10px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <table className="table table-sm align-middle mb-0" style={{ fontSize: '12.5px' }}>
                    <thead style={{ background: '#f8fafc' }}>
                      <tr style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '8px 12px' }}>Day</th>
                        <th style={{ padding: '8px 12px' }}>Duty Status</th>
                        <th style={{ padding: '8px 12px' }}>Start Time</th>
                        <th style={{ padding: '8px 12px' }}>End Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((item, idx) => (
                        <tr key={item.day} style={{ background: item.isWorking ? '#ffffff' : '#f8fafc', opacity: item.isWorking ? 1 : 0.6 }}>
                          <td className="fw-bold text-dark" style={{ padding: '6px 12px' }}>
                            {item.label}
                          </td>
                          <td style={{ padding: '6px 12px' }}>
                            <div className="form-check form-switch m-0 d-flex align-items-center gap-1">
                              <input
                                className="form-check-input me-1"
                                type="checkbox"
                                role="switch"
                                checked={item.isWorking}
                                onChange={(e) => handleDayChange(idx, 'isWorking', e.target.checked)}
                                style={{ cursor: 'pointer' }}
                              />
                              <span className="small fw-semibold" style={{ fontSize: '11px', color: item.isWorking ? '#16a34a' : '#64748b' }}>
                                {item.isWorking ? 'On Duty' : 'Off Day'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '6px 12px' }}>
                            <input
                              type="time"
                              className="form-control form-control-sm text-dark bg-white"
                              style={{ border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', padding: '3px 8px' }}
                              value={item.startTime}
                              disabled={!item.isWorking}
                              onChange={(e) => handleDayChange(idx, 'startTime', e.target.value)}
                            />
                          </td>
                          <td style={{ padding: '6px 12px' }}>
                            <input
                              type="time"
                              className="form-control form-control-sm text-dark bg-white"
                              style={{ border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', padding: '3px 8px' }}
                              value={item.endTime}
                              disabled={!item.isWorking}
                              onChange={(e) => handleDayChange(idx, 'endTime', e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn-garro btn-outline-garro btn-sm py-2 px-4 fw-semibold" style={{ fontSize: '13px', borderRadius: '8px' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-garro btn-primary-garro btn-sm py-2 px-4 fw-semibold" style={{ fontSize: '13px', borderRadius: '8px' }} disabled={submitting}>
                  {submitting ? (editStaffId ? 'Updating...' : 'Adding...') : (editStaffId ? 'Save Changes' : 'Add Staff Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GarageStaff;
