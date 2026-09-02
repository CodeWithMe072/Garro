import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LuCalendarClock, 
  LuClipboardList, 
  LuCircleCheck, 
  LuMail, 
  LuX, 
  LuCircleSlash, 
  LuLayoutDashboard, 
  LuStore, 
  LuSearch, 
  LuSettings, 
  LuUser, 
  LuBriefcase, 
  LuUsers, 
  LuGlobe,
  LuChevronLeft,
  LuChevronRight,
  LuPhone,
  LuPencil,
  LuTrash2,
  LuLock,
  LuCopy,
  LuLink,
  LuShieldAlert
} from 'react-icons/lu';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import AdminSidebar from '../components/AdminSidebar';
import PageLoader from '../components/PageLoader';
import CustomDropdown from '../components/CustomDropdown';

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Dubai', label: 'Asia/Dubai (UTC+4)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' }
];

const TIME_OPTIONS_12H = [
  { value: '06:00', label: '06:00 AM' },
  { value: '06:30', label: '06:30 AM' },
  { value: '07:00', label: '07:00 AM' },
  { value: '07:30', label: '07:30 AM' },
  { value: '08:00', label: '08:00 AM' },
  { value: '08:30', label: '08:30 AM' },
  { value: '09:00', label: '09:00 AM' },
  { value: '09:30', label: '09:30 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '11:30', label: '11:30 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:00', label: '01:00 PM' },
  { value: '13:30', label: '01:30 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '14:30', label: '02:30 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '15:30', label: '03:30 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '16:30', label: '04:30 PM' },
  { value: '17:00', label: '05:00 PM' },
  { value: '17:30', label: '05:30 PM' },
  { value: '18:00', label: '06:00 PM' },
  { value: '18:30', label: '06:30 PM' },
  { value: '19:00', label: '07:00 PM' },
  { value: '19:30', label: '07:30 PM' },
  { value: '20:00', label: '08:00 PM' },
  { value: '20:30', label: '08:30 PM' },
  { value: '21:00', label: '09:00 PM' },
  { value: '21:30', label: '09:30 PM' },
  { value: '22:00', label: '10:00 PM' },
  { value: '22:30', label: '10:30 PM' },
  { value: '23:00', label: '11:00 PM' },
  { value: '23:30', label: '11:30 PM' },
  { value: '00:00', label: '12:00 AM' },
  { value: '00:30', label: '12:30 AM' },
  { value: '01:00', label: '01:00 AM' },
  { value: '01:30', label: '01:30 AM' },
  { value: '02:00', label: '02:00 AM' },
  { value: '02:30', label: '02:30 AM' },
  { value: '03:00', label: '03:00 AM' },
  { value: '03:30', label: '03:30 AM' },
  { value: '04:00', label: '04:00 AM' },
  { value: '04:30', label: '04:30 AM' },
  { value: '05:00', label: '05:00 AM' },
  { value: '05:30', label: '05:30 AM' }
];

const ROLE_OPTIONS = [
  { value: 'staff', label: 'Staff' },
  { value: 'manager', label: 'Manager' }
];

const StaffManagement = () => {
  const { toast, confirm } = useNotification();
  const { t, lang } = useLanguage();

  const [helpers, setHelpers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [inviteDepartment, setInviteDepartment] = useState('');
  const [inviteGarageId, setInviteGarageId] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  // Edit Staff Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'staff',
    department: '',
    garageId: '',
    status: 'active'
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Schedule Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [scheduleFormData, setScheduleFormData] = useState({
    timezone: 'Asia/Dubai',
    schedule: [
      { day: 'monday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'friday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'saturday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'sunday', isWorking: true, startTime: '09:00', endTime: '21:00' }
    ]
  });
  const [savingSchedule, setSavingSchedule] = useState(false);

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const [helpersRes, invitesRes, garagesRes] = await Promise.all([
        fetch(`${API_BASE}/api/helpers`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/auth/staff-invites`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/garages`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const helpersData = await helpersRes.json();
      const invitesData = await invitesRes.json();
      const garagesData = await garagesRes.json();

      if (helpersRes.ok && helpersData.success) setHelpers(helpersData.helpers || []);
      if (invitesRes.ok && invitesData.success) setInvites(invitesData.invites || []);
      if (garagesRes.ok && garagesData.success) setGarages(garagesData.garages || []);
    } catch (err) {
      console.error('Failed to fetch staff data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger, token]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.trim()) {
      toast.error('Email address is required.');
      return;
    }
    setSendingInvite(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/staff-invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          department: inviteDepartment,
          garageId: inviteGarageId || null
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Invitation generated successfully!');
        setInviteEmail('');
        setInviteDepartment('');
        setInviteGarageId('');
        setRefreshTrigger(prev => prev + 1);
        if (data.inviteToken) {
          const inviteUrl = `${window.location.origin}/staff/join?token=${data.inviteToken}`;
          navigator.clipboard.writeText(inviteUrl);
          toast.success('Invitation link copied to clipboard!');
        }
      } else {
        toast.error(data.message || 'Failed to send invitation.');
      }
    } catch {
      toast.error('Failed to send invitation link.');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleCopyInviteLink = (inviteToken) => {
    const inviteUrl = `${window.location.origin}/staff/join?token=${inviteToken}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invitation link copied to clipboard!');
  };

  const handleRevokeInvite = async (inviteId) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/staff-invites/${inviteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(data.message || 'Failed to revoke invite.');
      }
    } catch {
      toast.error('Failed to revoke invitation.');
    }
  };

  const handleOpenEditModal = (staff) => {
    setSelectedStaff(staff);
    setEditFormData({
      name: `${staff.first_name} ${staff.last_name}`.trim(),
      phone: staff.phone || '',
      email: staff.email || '',
      role: staff.role || 'staff',
      department: staff.department || '',
      garageId: staff.raw?.garageId?._id || staff.raw?.garageId || '',
      status: staff.is_active ? 'active' : 'banned'
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await fetch(`${API_BASE}/api/helpers/${selectedStaff.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Staff profile updated.');
        setEditModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(data.message || 'Failed to update staff profile.');
      }
    } catch {
      toast.error('Failed to update staff profile.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStaffStatus = async (staff) => {
    const newStatus = staff.is_active ? 'banned' : 'active';
    try {
      const res = await fetch(`${API_BASE}/api/helpers/${staff.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Staff member ${newStatus === 'active' ? 'activated' : 'blocked'} successfully.`);
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(data.message || 'Failed to update status.');
      }
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteStaff = async (staff) => {
    confirm({
      title: 'Delete Staff Member',
      message: `Are you sure you want to permanently delete "${staff.first_name} ${staff.last_name}"? This action cannot be undone.`,
      confirmText: 'Delete Staff Member',
      cancelText: 'Cancel',
      isDelete: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/api/helpers/${staff.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            toast.success(data.message || 'Staff member deleted.');
            setRefreshTrigger(prev => prev + 1);
          } else {
            toast.error(data.message || 'Failed to delete staff member.');
          }
        } catch {
          toast.error('Failed to delete staff member.');
        }
      }
    });
  };

  const handleRejectStaffDeletionRequest = async (staffId) => {
    try {
      const res = await fetch(`${API_BASE}/api/garages/portal/staff-deletion-requests/${staffId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(data.message || 'Failed to reject deletion request');
      }
    } catch {
      toast.error('Failed to reject deletion request');
    }
  };

  const handleOpenScheduleModal = (helper) => {
    setSelectedHelper(helper);
    
    const defaultSchedule = [
      { day: 'monday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'friday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'saturday', isWorking: true, startTime: '09:00', endTime: '21:00' },
      { day: 'sunday', isWorking: true, startTime: '09:00', endTime: '21:00' }
    ];

    setScheduleFormData({
      timezone: helper.workingHours?.timezone || 'Asia/Dubai',
      schedule: helper.workingHours?.schedule?.length ? helper.workingHours.schedule : defaultSchedule
    });
    setScheduleModalOpen(true);
  };

  const handleDayCheckChange = (dayName, isChecked) => {
    const updated = scheduleFormData.schedule.map(d => {
      if (d.day === dayName) return { ...d, isWorking: isChecked };
      return d;
    });
    setScheduleFormData({ ...scheduleFormData, schedule: updated });
  };

  const handleDayTimeChange = (dayName, field, value) => {
    const updated = scheduleFormData.schedule.map(d => {
      if (d.day === dayName) return { ...d, [field]: value };
      return d;
    });
    setScheduleFormData({ ...scheduleFormData, schedule: updated });
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSavingSchedule(true);
    try {
      const response = await fetch(`${API_BASE}/api/helpers/${selectedHelper._id}/working-hours`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workingHours: scheduleFormData })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setScheduleModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
        alert('Working hours schedule updated successfully.');
      } else {
        alert(data.message || 'Failed to update working hours.');
      }
    } catch (err) {
      alert('An error occurred.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const staffList = helpers.map(h => {
    const [first_name, ...rest] = (h.name || '').split(' ');
    const last_name = rest.join(' ') || '';
    const isUserActive = h.userId?.status ? h.userId.status === 'active' : h.isAvailable;

    return {
      id: h._id,
      first_name: first_name || 'Staff',
      last_name: last_name || '',
      role: h.role || h.userId?.role || 'staff',
      email: h.email || h.userId?.email || '',
      phone: h.phone || h.userId?.phone || '',
      department: h.userId?.department || (h.garageId?.name || 'General'),
      is_active: isUserActive,
      raw: h
    };
  });

  const pendingDeletionRequests = helpers.filter(h => h.deletionRequest?.status === 'pending' || h.userId?.deletionRequest?.status === 'pending');

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="dash-wrapper">
      {/* ── SIDEBAR ── */}
      <AdminSidebar />

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main">
        <div className="dash-header mb-4 align-items-center">
          <div>
            <div className="dash-title d-flex align-items-center gap-2">
              <LuBriefcase className="text-primary-garro" />
              <span>{t('staff_management')}</span>
            </div>
            <div className="dash-subtitle">{staffList.length} {t('staff_members_manage')}</div>
          </div>
          <div>
            <Link to="/admin/create-staff" className="btn-garro btn-primary-garro text-decoration-none px-4" style={{ height: '42px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontSize: '13.5px', fontWeight: '700' }}>
              + {t('create_account_directly')}
            </Link>
          </div>
        </div>

        {/* Staff Account Deletion Requests Banner */}
        {pendingDeletionRequests.length > 0 && (
          <div className="alert alert-danger bg-danger-subtle border-danger text-dark p-3 mb-4 rounded-3 shadow-sm">
            <h5 className="fw-bold text-danger d-flex align-items-center gap-2 m-0 mb-2">
              <LuShieldAlert size={20} /> Pending Staff Account Deletion Requests ({pendingDeletionRequests.length})
            </h5>
            <p className="small text-secondary mb-3">
              The following staff members have requested permanent account deletion. Please review and accept or reject:
            </p>
            <div className="d-flex flex-column gap-2">
              {pendingDeletionRequests.map(req => (
                <div key={req._id} className="bg-white p-3 rounded-2 border d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div>
                    <div className="fw-bold text-dark">{req.name}</div>
                    <div className="small text-muted">{req.phone} • {req.userId?.email || req.email || 'No email'}</div>
                    <div className="small text-muted">Garage: {req.garageId?.name || 'Unassigned Platform Staff'}</div>
                  </div>
                  <div className="d-flex gap-2">
                    <button onClick={() => handleDeleteStaff({ id: req._id, first_name: req.name, last_name: '' })} className="btn btn-sm btn-danger fw-bold px-3">
                      Approve & Delete Account
                    </button>
                    <button onClick={() => handleRejectStaffDeletionRequest(req._id)} className="btn btn-sm btn-outline-secondary fw-bold px-3">
                      Reject Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="two-col">
          {/* Left: Staff list */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.08em', color: '#94a3b8', marginBottom: '12px' }}>
              {t('current_staff')} ({staffList.length})
            </div>
            
            <div className="staff-grid">
              {staffList.map(s => (
                <div key={s.id} className={`sc ${!s.is_active ? 'inactive' : ''}`}>
                  <div className="sc-top">
                    <div className="sc-av" style={{ background: s.is_active ? 'var(--brand)' : '#94a3b8' }}>
                      {s.first_name[0]}{s.last_name[0]}
                      <div className={`sc-status ${s.is_active ? 'active' : 'inactive'}`}></div>
                    </div>
                    <div>
                      <div className="sc-name">{s.first_name} {s.last_name}</div>
                      <span className={`sc-role ${s.role}`}>{s.role.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="sc-info">
                    {s.email && <span><LuMail size={13} className="text-secondary me-1" />{s.email}</span>}
                    {s.phone && <span><LuPhone size={13} className="text-secondary me-1" />{s.phone}</span>}
                    {s.department && <span><LuStore size={13} className="text-secondary me-1" />{s.department}</span>}
                  </div>
                  <div className="sc-actions d-flex flex-wrap gap-1 mt-2">
                    <button onClick={() => handleOpenScheduleModal(s.raw)} className="btn btn-sm btn-outline-primary flex-fill d-inline-flex align-items-center justify-content-center py-1 text-nowrap" style={{ fontSize: '11px', borderRadius: '6px' }}>
                      <LuCalendarClock className="me-1" /> {t('schedule')}
                    </button>
                    <button onClick={() => handleOpenEditModal(s)} className="btn btn-sm btn-outline-secondary flex-fill d-inline-flex align-items-center justify-content-center py-1 text-nowrap" style={{ fontSize: '11px', borderRadius: '6px' }}>
                      <LuPencil className="me-1" /> {t('edit')}
                    </button>
                    <button onClick={() => handleToggleStaffStatus(s)} className={`btn btn-sm ${s.is_active ? 'btn-outline-warning' : 'btn-outline-success'} flex-fill d-inline-flex align-items-center justify-content-center py-1 text-nowrap`} style={{ fontSize: '11px', borderRadius: '6px' }}>
                      {s.is_active ? <><LuLock className="me-1" /> Block</> : <><LuCircleCheck className="me-1" /> Activate</>}
                    </button>
                    <button onClick={() => handleDeleteStaff(s)} className="btn btn-sm btn-outline-danger flex-fill d-inline-flex align-items-center justify-content-center py-1 text-nowrap" style={{ fontSize: '11px', borderRadius: '6px' }}>
                      <LuTrash2 className="me-1" /> {t('delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Invite Form & History */}
          <div>
            <div className="panel" style={{ marginBottom: '20px' }}>
              <div className="panel-head">
                <span style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}><LuMail /></span>
                <h3>{t('invite_new_staff')}</h3>
              </div>
              <div className="panel-body">
                <form onSubmit={handleSendInvite}>
                  <div className="fg mb-3">
                    <label className="form-label small fw-bold text-secondary">Email Address *</label>
                    <input type="email" className="form-control" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@garro.com" required />
                  </div>
                  <div className="fg mb-3">
                    <label className="form-label small fw-bold text-secondary">Role</label>
                    <CustomDropdown
                      options={ROLE_OPTIONS}
                      value={inviteRole}
                      onChange={(val) => setInviteRole(val)}
                      theme="light"
                    />
                  </div>
                  <div className="fg mb-3">
                    <label className="form-label small fw-bold text-secondary">Assign Garage (Optional)</label>
                    <select className="form-select" value={inviteGarageId} onChange={e => setInviteGarageId(e.target.value)}>
                      <option value="">Unassigned (Platform Staff)</option>
                      {garages.map(g => (
                        <option key={g._id} value={g._id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="fg mb-3">
                    <label className="form-label small fw-bold text-secondary">Department</label>
                    <input type="text" className="form-control" value={inviteDepartment} onChange={e => setInviteDepartment(e.target.value)} placeholder="e.g. Operations, Diagnostics" />
                  </div>
                  <button type="submit" className="btn-garro btn-primary-garro w-100 py-2.5 fw-bold d-inline-flex align-items-center justify-content-center gap-2" disabled={sendingInvite} style={{ fontSize: '13.5px' }}>
                    <LuLink size={16} /> {sendingInvite ? 'Generating Invite...' : t('send_invitation_link')}
                  </button>
                </form>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px', textAlign: 'center' }}>Link expires in 3 days · Generates instant setup token link</p>
              </div>
            </div>

            {/* Invite history */}
            <div className="panel">
              <div className="panel-head">
                <span style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}><LuClipboardList /></span>
                <h3>{t('recent_invitations')}</h3>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                {invites.length === 0 ? (
                  <div className="p-3 text-muted text-center small">No invitations sent yet.</div>
                ) : (
                  invites.map((inv) => (
                    <div key={inv._id} className="invite-item d-flex align-items-center justify-content-between p-3 border-bottom">
                      <div className="invite-ico me-2">
                        {inv.status === 'used' ? <LuCircleCheck style={{ color: '#10b981' }} size={18} /> : inv.status === 'pending' ? <LuMail style={{ color: '#3b82f6' }} size={18} /> : <LuX style={{ color: '#ef4444' }} size={18} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="invite-email fw-bold text-truncate" style={{ fontSize: '13px' }}>{inv.email}</div>
                        <div className="invite-meta small text-muted">
                          <span className={`badge ${inv.status === 'used' ? 'bg-success' : inv.status === 'pending' ? 'bg-primary' : 'bg-secondary'}`}>{inv.status}</span>
                          &nbsp;{inv.role?.toUpperCase()} {inv.garageId?.name ? `(${inv.garageId.name})` : ''}
                        </div>
                      </div>
                      <div className="d-flex gap-1">
                        {inv.status === 'pending' && (
                          <>
                            <button onClick={() => handleCopyInviteLink(inv.token)} className="btn btn-sm btn-outline-primary py-0 px-2 small d-inline-flex align-items-center" title="Copy Setup Link">
                              <LuCopy size={12} className="me-1" /> Copy
                            </button>
                            <button onClick={() => handleRevokeInvite(inv._id)} className="btn btn-sm btn-outline-danger py-0 px-2 small">Revoke</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      {/* ── Helper Schedule / Working Hours Modal ── */}
      {scheduleModalOpen && selectedHelper && (
        <div className="custom-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, backdropFilter: 'blur(4px)' }}>
          <div className="custom-modal no-scrollbar" style={{ background: '#ffffff', padding: '30px', borderRadius: '16px', maxWidth: '520px', width: '90%', color: '#0f172a', maxHeight: '90vh', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', textAlign: 'left' }}>
            
            {/* Modal Header with Close (X) button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                  <LuCalendarClock className="text-primary-garro" /> Edit Working Hours
                </h4>
                <p className="text-muted small mb-0">Set timezone and active days for <strong>{selectedHelper.name}</strong></p>
              </div>
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close"
              >
                <LuX size={22} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              {/* Timezone */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary mb-2" style={{ display: 'block' }}>Local Timezone</label>
                <CustomDropdown 
                  options={TIMEZONE_OPTIONS}
                  value={scheduleFormData.timezone}
                  onChange={val => setScheduleFormData({ ...scheduleFormData, timezone: val })}
                  theme="light"
                />
              </div>

              {/* Weekly Schedule days list */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary mb-2" style={{ display: 'block' }}>Weekly Schedule</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {scheduleFormData.schedule.map((dayItem, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative', zIndex: 100 - idx }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100px', flexShrink: 0 }}>
                        <input 
                          type="checkbox"
                          className="form-check-input"
                          id={`check-${dayItem.day}`}
                          checked={dayItem.isWorking}
                          onChange={e => handleDayCheckChange(dayItem.day, e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        <label className="form-check-label small fw-semibold text-capitalize text-dark" htmlFor={`check-${dayItem.day}`} style={{ cursor: 'pointer' }}>
                          {dayItem.day.slice(0, 3)}
                        </label>
                      </div>

                      {dayItem.isWorking ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <div style={{ flex: 1, minWidth: '120px' }}>
                            <CustomDropdown 
                              options={TIME_OPTIONS_12H}
                              value={dayItem.startTime}
                              onChange={val => handleDayTimeChange(dayItem.day, 'startTime', val)}
                              theme="light"
                            />
                          </div>
                          <span className="small text-muted" style={{ flexShrink: 0 }}>to</span>
                          <div style={{ flex: 1, minWidth: '120px' }}>
                            <CustomDropdown 
                              options={TIME_OPTIONS_12H}
                              value={dayItem.endTime}
                              onChange={val => handleDayTimeChange(dayItem.day, 'endTime', val)}
                              theme="light"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="small text-muted text-center flex-grow-1" style={{ fontStyle: 'italic' }}>
                          Off Duty
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn-garro btn-outline-garro btn-sm py-2 px-4 fw-semibold" style={{ fontSize: '13px', borderRadius: '8px' }} onClick={() => setScheduleModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-garro btn-primary-garro btn-sm py-2 px-4 fw-semibold" style={{ fontSize: '13px', borderRadius: '8px' }} disabled={savingSchedule}>
                  {savingSchedule ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Staff Member Modal ── */}
      {editModalOpen && selectedStaff && (
        <div className="custom-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, backdropFilter: 'blur(4px)' }}>
          <div className="custom-modal" style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', maxWidth: '480px', width: '90%', color: '#0f172a', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                <LuPencil className="text-primary-garro" /> Edit Staff Profile
              </h5>
              <button type="button" onClick={() => setEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <LuX size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Full Name *</label>
                <input type="text" className="form-control" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Phone Number</label>
                <input type="text" className="form-control" value={editFormData.phone} onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Email Address</label>
                <input type="email" className="form-control" value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} required />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold text-secondary">Role</label>
                  <select className="form-select" value={editFormData.role} onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}>
                    <option value="staff">Staff Member</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-secondary">Status</label>
                  <select className="form-select" value={editFormData.status} onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="banned">Blocked / Inactive</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Assigned Garage</label>
                <select className="form-select" value={editFormData.garageId} onChange={e => setEditFormData({ ...editFormData, garageId: e.target.value })}>
                  <option value="">Unassigned (General Staff)</option>
                  {garages.map(g => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Department</label>
                <input type="text" className="form-control" value={editFormData.department} onChange={e => setEditFormData({ ...editFormData, department: e.target.value })} placeholder="e.g. Mechanical, Diagnostics" />
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary-garro btn-sm fw-bold px-3" disabled={savingEdit}>
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};

export default StaffManagement;
