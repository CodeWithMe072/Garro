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
  LuChevronRight
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
      <main className="dash-main" style={{ background: '#f1f5f9', minHeight: '100vh', padding: '24px' }}>
        <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="fs-3 fw-bold text-dark m-0 d-flex align-items-center gap-2">
              <LuBriefcase /> {t('staff_management')}
            </h1>
            <p className="text-muted small m-0">{staffList.length} {t('staff_members_manage')}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Language Switcher */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '13.5px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
              >
                <LuGlobe size={14} /> {lang === 'en' ? 'English' : (lang === 'ar' ? 'العربية' : 'اردو')}
              </button>
              {isLangOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.2)', zIndex: 1000,
                  minWidth: '120px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px'
                }}>
                  {[{ code: 'en', label: 'English' }, { code: 'ar', label: 'العربية' }, { code: 'ur', label: 'اردو' }].map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => { changeLanguage(code); setIsLangOpen(false); }}
                      style={{
                        background: lang === code ? 'rgba(255,92,26,0.15)' : 'none', border: 'none',
                        borderRadius: '8px', padding: '8px 12px',
                        color: lang === code ? '#ff8c5a' : 'rgba(255,255,255,0.6)',
                        fontSize: '13px', fontWeight: lang === code ? 700 : 500,
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', width: '100%', transition: 'all 0.15s'
                      }}
                    >
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/admin/create-staff" className="btn-primary" style={{ borderRadius: '10px', textDecoration: 'none' }}>+ {t('create_account_directly')}</Link>
            <Link to="/admin" className="btn-outline" style={{ borderRadius: '10px', textDecoration: 'none' }}>← {t('dashboard_back')}</Link>
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
                    <div className="sc-av" style={{ background: s.is_active ? '#3b82f6' : '#94a3b8' }}>
                      {s.first_name[0]}{s.last_name[0]}
                      <div className={`sc-status ${s.is_active ? 'active' : 'inactive'}`}></div>
                    </div>
                    <div>
                      <div className="sc-name">{s.first_name} {s.last_name}</div>
                      <span className={`sc-role ${s.role}`}>{s.role.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="sc-info">
                    {s.email && <span><span className="material-icons-round" style={{ fontSize: '14px', color: '#94a3b8' }}>email</span>{s.email}</span>}
                    {s.phone && <span><span className="material-icons-round" style={{ fontSize: '14px', color: '#94a3b8' }}>phone</span>{s.phone}</span>}
                    {s.department && <span><span className="material-icons-round" style={{ fontSize: '14px', color: '#94a3b8' }}>business</span>{s.department}</span>}
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
                      <option value="staff">👤 Staff</option>
                      <option value="manager">🌟 Manager</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label>Department</label>
                    <input type="text" name="department" className="inp" placeholder="e.g. Operations, Service" />
                  </div>
                  <button type="submit" className="btn-send">{t('send_invitation_link')}</button>
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
                  {inv.status === 'pending' && <button className="revoke-btn" style={{ background: 'none', border: 'none' }}>Revoke</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* ── Helper Schedule / Working Hours Modal ── */}
      {scheduleModalOpen && selectedHelper && (
        <div className="custom-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div className="custom-modal" style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', maxWidth: '520px', width: '90%', color: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <LuCalendarClock /> Edit Working Hours
            </h3>
            <p className="text-white-50 small mb-4">Set timezone and active days for <strong>{selectedHelper.name}</strong></p>

            <form onSubmit={handleScheduleSubmit}>
              {/* Timezone */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-white-50">Local Timezone</label>
                <select 
                  className="form-select text-white bg-dark border-secondary"
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
                <label className="form-label small fw-bold text-white-50 mb-2">Weekly Schedule</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {scheduleFormData.schedule.map((dayItem, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                        <input 
                          type="checkbox"
                          className="form-check-input"
                          id={`check-${dayItem.day}`}
                          checked={dayItem.isWorking}
                          onChange={e => handleDayCheckChange(dayItem.day, e.target.checked)}
                        />
                        <label className="form-check-label small fw-semibold text-capitalize" htmlFor={`check-${dayItem.day}`}>
                          {dayItem.day.slice(0, 3)}
                        </label>
                      </div>

                      {dayItem.isWorking ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <input 
                            type="time" 
                            className="form-control form-control-sm bg-dark text-white border-secondary"
                            value={dayItem.startTime}
                            onChange={e => handleDayTimeChange(dayItem.day, 'startTime', e.target.value)}
                            required
                          />
                          <span className="small text-white-50">to</span>
                          <input 
                            type="time" 
                            className="form-control form-control-sm bg-dark text-white border-secondary"
                            value={dayItem.endTime}
                            onChange={e => handleDayTimeChange(dayItem.day, 'endTime', e.target.value)}
                            required
                          />
                        </div>
                      ) : (
                        <div className="small text-white-50 text-center flex-grow-1" style={{ fontStyle: 'italic' }}>
                          Off Duty
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-sm btn-outline-light" onClick={() => setScheduleModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-sm btn-primary" disabled={savingSchedule}>
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
