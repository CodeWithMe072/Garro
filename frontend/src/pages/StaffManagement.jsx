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
  LuPhone
} from 'react-icons/lu';
import { useLanguage } from '../context/LanguageContext';
import AdminSidebar from '../components/AdminSidebar';

const StaffManagement = () => {
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { t, lang, changeLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);


  // Modal State
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

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/helpers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setHelpers(data.helpers || []);
        }
      } catch (err) {
        console.error('Failed to fetch helpers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHelpers();
  }, [refreshTrigger]);

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

    return {
      id: h._id,
      first_name,
      last_name,
      role: 'staff',
      email: '',
      phone: h.phone,
      department: h.garageId ? h.garageId.name : 'Unassigned',
      is_active: h.isAvailable,
      raw: h
    };
  });

  const invites = [
    { email: 'newstaff@garro.com', status: 'pending', role: 'staff', created_at: '2026-06-25T10:00:00Z', is_valid: true },
    { email: 'manager@garro.com', status: 'used', role: 'manager', created_at: '2026-06-20T10:00:00Z', is_valid: false }
  ];

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('loading')}</span>
        </div>
        <h5 className="mt-3">{t('loading')}</h5>
      </div>
    );
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
                  <div className="sc-actions">
                     <button onClick={() => handleOpenScheduleModal(s.raw)} className="sc-btn edit d-inline-flex align-items-center justify-content-center" style={{ flex: 1 }}>
                       <LuCalendarClock className="me-1" /> {t('schedule')}
                     </button>
                    {s.is_active ? (
                      <button className="sc-btn deact d-inline-flex align-items-center justify-content-center" style={{ flex: 1 }}>
                        <LuCircleSlash className="me-1" /> {t('deactivate')}
                      </button>
                    ) : (
                      <span className="sc-btn" style={{ background: '#f1f5f9', color: '#94a3b8', flex: 1, textAlign: 'center' }}>{t('inactive')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Invite panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Send Invite */}
            <div className="panel">
              <div className="panel-head">
                <span style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}><LuMail /></span>
                <h3>{t('invite_new_helper')}</h3>
              </div>
              <div className="panel-body">
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Generate a secure invite link. The staff member sets their own password when they join.</p>
                <form onSubmit={e => e.preventDefault()}>
                  <div className="fg">
                    <label>Staff Email *</label>
                    <input type="email" name="email" className="inp" placeholder="staff@example.com" required />
                  </div>
                  <div className="fg">
                    <label>Role</label>
                    <select name="role" className="inp">
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label>Department</label>
                    <input type="text" name="department" className="inp" placeholder="e.g. Operations, Service" />
                  </div>
                  <button type="submit" className="btn-garro btn-primary-garro w-100 py-2.5" style={{ fontSize: '13.5px', fontWeight: '700' }}>{t('send_invitation_link')}</button>
                </form>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px', textAlign: 'center' }}>Link expires in 3 days · Only one active invite per email</p>
              </div>
            </div>

            {/* Invite history */}
            <div className="panel">
               <div className="panel-head">
                 <span style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}><LuClipboardList /></span>
                 <h3>{t('recent_invitations')}</h3>
               </div>
            <div className="panel-body" style={{ padding: 0 }}>
              {invites.map((inv, idx) => (
                <div key={idx} className="invite-item" style={{ padding: '11px 20px' }}>
                  <div className="invite-ico">
                     {inv.status === 'used' ? <LuCircleCheck style={{ color: '#10b981' }} /> : inv.status === 'pending' ? <LuMail style={{ color: '#3b82f6' }} /> : <LuX style={{ color: '#ef4444' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="invite-email">{inv.email}</div>
                    <div className="invite-meta">
                      <span className={`ibadge ${inv.status}`}>{inv.status}</span>
                      &nbsp;{inv.role}
                    </div>
                  </div>
                  {inv.status === 'pending' && <button className="text-danger small fw-bold border-0 bg-transparent p-0" style={{ transition: 'opacity 0.2s', outline: 'none' }} onMouseEnter={e => e.target.style.opacity = '0.7'} onMouseLeave={e => e.target.style.opacity = '1'}>Revoke</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* ── Helper Schedule / Working Hours Modal ── */}
      {scheduleModalOpen && selectedHelper && (
        <div className="custom-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, backdropFilter: 'blur(4px)' }}>
          <div className="custom-modal" style={{ background: '#ffffff', padding: '30px', borderRadius: '16px', maxWidth: '520px', width: '90%', color: '#0f172a', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }}>
            <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
              <LuCalendarClock className="text-primary-garro" /> Edit Working Hours
            </h4>
            <p className="text-muted small mb-4">Set timezone and active days for <strong>{selectedHelper.name}</strong></p>

            <form onSubmit={handleScheduleSubmit}>
              {/* Timezone */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary">Local Timezone</label>
                <select 
                  className="form-select text-dark bg-white"
                  style={{
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '13.5px'
                  }}
                  value={scheduleFormData.timezone}
                  onChange={e => setScheduleFormData({ ...scheduleFormData, timezone: e.target.value })}
                  required
                >
                  <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                </select>
              </div>

              {/* Weekly Schedule days list */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary mb-2">Weekly Schedule</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {scheduleFormData.schedule.map((dayItem, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
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
                          <input 
                            type="time" 
                            className="form-control form-control-sm bg-white text-dark"
                            style={{ border: '1.5px solid #cbd5e1', borderRadius: '6px' }}
                            value={dayItem.startTime}
                            onChange={e => handleDayTimeChange(dayItem.day, 'startTime', e.target.value)}
                            required
                          />
                          <span className="small text-muted">to</span>
                          <input 
                            type="time" 
                            className="form-control form-control-sm bg-white text-dark"
                            style={{ border: '1.5px solid #cbd5e1', borderRadius: '6px' }}
                            value={dayItem.endTime}
                            onChange={e => handleDayTimeChange(dayItem.day, 'endTime', e.target.value)}
                            required
                          />
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
      </main>
    </div>
  );
};

export default StaffManagement;
