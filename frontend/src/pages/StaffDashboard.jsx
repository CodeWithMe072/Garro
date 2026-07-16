import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { LuClipboardList, LuHourglass, LuCircleCheck, LuCalendar, LuMessageSquare, LuWrench, LuGlobe, LuChevronDown, LuCheck } from 'react-icons/lu';
import { io } from 'socket.io-client';
import { useLanguage } from '../context/LanguageContext';

const StaffDashboard = () => {
  const { user } = useAuth();
  const { toast } = useNotification();
  const { t, lang, changeLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Condition Report Modal State
  const [isVcrOpen, setIsVcrOpen] = useState(false);
  const [vcrJobId, setVcrJobId] = useState(null);
  const [vcrData, setVcrData] = useState({
    odometer: '',
    fuelLevel: 'half',
    damageNotes: '',
    driverName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Helper'
  });
  const [submittingVcr, setSubmittingVcr] = useState(false);

  const fetchJobs = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to fetch staff jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Socket.IO Listeners
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(API_BASE);

    socket.on('job:status', (data) => {
      console.log('Real-time job:status update received in Staff:', data);
      fetchJobs();
    });

    socket.on('request:assigned', (data) => {
      console.log('Real-time request assigned received in Staff:', data);
      fetchJobs();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleUpdateStatus = async (jobId, nextStatus) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(`Job status updated to: ${nextStatus.replace(/_/g, ' ')}`);
        fetchJobs();
      } else {
        toast.error(data.message || 'Failed to update job status.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Error updating status.');
    }
  };

  const handleOpenVcrModal = (jobId) => {
    setVcrJobId(jobId);
    setIsVcrOpen(true);
  };

  const handleVcrSubmit = async (e) => {
    e.preventDefault();
    if (!vcrData.odometer) {
      toast.error('Odometer reading is required.');
      return;
    }

    setSubmittingVcr(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      // 1. Submit Condition Report
      const reportRes = await fetch(`${API_BASE}/api/jobs/${vcrJobId}/condition-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          odometer: Number(vcrData.odometer),
          fuelLevel: vcrData.fuelLevel,
          damageNotes: vcrData.damageNotes,
          driverName: vcrData.driverName
        })
      });

      const reportData = await reportRes.json();
      if (!reportRes.ok || !reportData.success) {
        throw new Error(reportData.message || 'Failed to submit vehicle report.');
      }

      // 2. Move job status to 'in_garage'
      const statusRes = await fetch(`${API_BASE}/api/jobs/${vcrJobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'in_garage' })
      });

      const statusData = await statusRes.json();
      if (statusRes.ok && statusData.success) {
        toast.success('Condition report submitted! Vehicle checked in to garage.');
        setIsVcrOpen(false);
        setVcrData({
          odometer: '',
          fuelLevel: 'half',
          damageNotes: '',
          driverName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Helper'
        });
        fetchJobs();
      } else {
        toast.error(statusData.message || 'Failed to check-in vehicle.');
      }
    } catch (err) {
      console.error('Error in VCR check-in:', err);
      toast.error(err.message || 'Error checking in vehicle.');
    } finally {
      setSubmittingVcr(false);
    }
  };

  const stats = {
    my_total: jobs.length,
    my_pending: jobs.filter(j => !['delivered', 'closed'].includes(j.status)).length,
    my_completed: jobs.filter(j => ['delivered', 'closed'].includes(j.status)).length,
    my_today: jobs.filter(j => {
      const b = j.requestId;
      if (!b || !b.preferredDate) return false;
      const today = new Date().toDateString();
      const pref = new Date(b.preferredDate).toDateString();
      return today === pref;
    }).length,
    unread_msgs: 0
  };

  const mappedBookings = jobs.map(j => {
    const b = j.requestId || {};
    const prefDate = b.preferredDate ? new Date(b.preferredDate) : new Date(j.createdAt);
    const timeStr = prefDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userDisplayName = b.userId ? b.userId.name : 'Unknown User';
    const [first_name, ...rest] = userDisplayName.split(' ');
    const last_name = rest.join(' ') || '';

    return {
      id: j._id,
      booking_time: timeStr,
      status: j.status,
      status_display: j.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      user: { first_name, last_name },
      garage: { name: j.garageId ? j.garageId.name : 'Pending Assignment' },
      car_model: b.vehicleId ? `${b.vehicleId.make} ${b.vehicleId.model}` : 'Unknown Car',
      services: [b.serviceType ? b.serviceType.replace('_', ' ').toUpperCase() : 'GENERAL SERVICE'],
      pickup_type: b.location && b.location.address !== 'Self Drop at Garage' ? 'pickup_drop' : 'self_drop',
      notes: b.description || ''
    };
  });

  return (
    <div className="staff-wrapper">
      {/* ── SIDEBAR ── */}
      <aside className="staff-sidebar">
        <div className="sb-profile">
          <div className="sb-profile-av">{user?.firstName?.[0] || 'S'}</div>
          <div>
            <div className="sb-profile-name">{user?.firstName || 'Staff'}</div>
            <div className="sb-profile-role">{user?.role || 'staff'}</div>
          </div>
        </div>

        <span className="sb-label">{t('my_work')}</span>
        <Link to="/admin/staff" className="sb-link active">
          <span className="si">⚡</span>{t('my_dashboard')}
        </Link>
        <Link to="/my-bookings" className="sb-link">
          <span className="si"><LuClipboardList /></span>{t('all_bookings')}
          {stats.my_pending > 0 && <span className="sb-badge">{stats.my_pending}</span>}
        </Link>

        {['manager', 'superadmin', 'admin'].includes(user?.role) && (
          <>
            <div className="sb-divider"></div>
            <span className="sb-label">{lang === 'ar' ? 'وصول المسؤول' : (lang === 'ur' ? 'ایڈمن رسائی' : 'Admin Access')}</span>
            <Link to="/admin" className="sb-link">
              <span className="si">📊</span>{t('full_dashboard')}
            </Link>
          </>
        )}

        <div className="sb-divider"></div>
        <Link to="/home" className="sb-link">
          <span className="si"><LuGlobe /></span>{t('back_to_site')}
        </Link>
      </aside>

      {/* ── MAIN ── */}
      <main className="staff-main">
        <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="dash-title">{t('staff_dashboard')} ⚡</div>
            <div className="dash-subtitle">{t('welcome_back')}, {user?.firstName || 'Staff'}!</div>
          </div>
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
        </div>

        {/* Stats */}
        <div className="s-stats">
          <div className="s-stat">
            <div className="ico" style={{ display: 'flex', justifyContent: 'center' }}><LuClipboardList /></div>
            <div className="val">{stats.my_total}</div>
            <div className="lbl">{t('my_bookings')}</div>
          </div>
          <div className="s-stat">
            <div className="ico" style={{ display: 'flex', justifyContent: 'center' }}><LuHourglass /></div>
            <div className="val" style={{ color: '#f59e0b' }}>{stats.my_pending}</div>
            <div className="lbl">{t('pending')}</div>
          </div>
          <div className="s-stat highlight">
            <div className="ico" style={{ display: 'flex', justifyContent: 'center' }}><LuCircleCheck /></div>
            <div className="val">{stats.my_completed}</div>
            <div className="lbl">{t('completed')}</div>
          </div>
          <div className="s-stat">
            <div className="ico" style={{ display: 'flex', justifyContent: 'center' }}><LuCalendar /></div>
            <div className="val" style={{ color: '#3b82f6' }}>{stats.my_today}</div>
            <div className="lbl">{t('today')}</div>
          </div>
          <div className="s-stat">
            <div className="ico" style={{ display: 'flex', justifyContent: 'center' }}><LuMessageSquare /></div>
            <div className="val" style={{ color: '#ef4444' }}>{stats.unread_msgs}</div>
            <div className="lbl">{t('messages')}</div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="schedule-card">
          <div className="schedule-head">
            <h4>📅 {t('todays_schedule')} <span className="today-badge">{t('active_jobs')}</span></h4>
            <span style={{ fontSize: '13px', color: '#64748b' }}>{mappedBookings.length} {t('jobs_assigned')}</span>
          </div>

          {mappedBookings.length > 0 ? (
            <div className="timeline">
              {mappedBookings.map(b => (
                <div className="tl-item" key={b.id}>
                  <div className="tl-time">{b.booking_time}</div>
                  <div className={`tl-dot ${b.status}`}></div>
                  <div className="tl-card">
                    <div className="tl-top">
                      <div className="tl-cust">{b.user.first_name} {b.user.last_name}</div>
                      <span className={`sbadge ${b.status}`}>{b.status_display}</span>
                    </div>
                    <div className="tl-garage">🏪 {b.garage.name} &nbsp;·&nbsp; 🚗 {b.car_model}</div>
                    <div className="tl-services">
                      {b.services.join(', ')}
                    </div>
                    {b.pickup_type === 'pickup_drop' && (
                      <div style={{ fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', display: 'inline-block', padding: '2px 8px', borderRadius: '6px', marginTop: '6px', fontWeight: '600' }}>
                        🚗 {t('pickup_required')}
                      </div>
                    )}
                    {b.notes && (
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', fontStyle: 'italic' }}>
                        "{b.notes}"
                      </div>
                    )}
                    
                    <div className="tl-actions">
                      {b.status === 'pickup_scheduled' && (
                        <button 
                          className="tl-btn" 
                          onClick={() => handleUpdateStatus(b.id, 'picked_up')} 
                          style={{ background: '#ff5c1a', color: 'white' }}
                        >
                          🚚 Mark Picked Up
                        </button>
                      )}
                      {b.status === 'picked_up' && (
                        <button 
                          className="tl-btn" 
                          onClick={() => handleOpenVcrModal(b.id)} 
                          style={{ background: '#10b981', color: 'white' }}
                        >
                          📋 Check-in to Garage
                        </button>
                      )}
                      {b.status === 'ready_for_delivery' && (
                        <button 
                          className="tl-btn" 
                          onClick={() => handleUpdateStatus(b.id, 'delivered')} 
                          style={{ background: '#3b82f6', color: 'white' }}
                        >
                          🏁 Mark Delivered
                        </button>
                      )}
                      {['in_garage', 'inspection_done', 'repair_in_progress', 'work_complete'].includes(b.status) && (
                        <span style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <LuWrench /> Undergoing repair in garage
                        </span>
                      )}
                      {['delivered', 'closed'].includes(b.status) && (
                        <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <LuCircleCheck /> Job completed and closed
                        </span>
                      )}
                      <Link to={`/my-bookings`} className="tl-btn" style={{ background: '#f1f5f9', color: '#374151' }}>View Details</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>☀️</div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#374151', marginBottom: '6px' }}>No bookings assigned</div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>Enjoy your day — nothing scheduled for today.</div>
            </div>
          )}
        </div>
      </main>

      {/* ── Vehicle Condition Report Form Modal ── */}
      {isVcrOpen && (
        <div className="custom-modal-overlay" onClick={() => setIsVcrOpen(false)}>
          <div className="custom-modal confirm" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', textAlign: 'left' }}>
            <div className="modal-icon" style={{ fontSize: '32px', marginBottom: '8px', justifyContent: 'flex-start' }}>📋</div>
            <h3 className="modal-title" style={{ marginBottom: '4px' }}>Vehicle Check-in</h3>
            <p className="modal-message" style={{ marginBottom: '20px' }}>Submit a vehicle condition report to check the car into the garage.</p>

            <form onSubmit={handleVcrSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-light">Odometer Reading (km)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  placeholder="e.g. 45000"
                  value={vcrData.odometer}
                  onChange={(e) => setVcrData({ ...vcrData, odometer: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-light">Fuel Level</label>
                <select 
                  className="form-select" 
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  value={vcrData.fuelLevel}
                  onChange={(e) => setVcrData({ ...vcrData, fuelLevel: e.target.value })}
                  required
                >
                  <option value="empty">Empty</option>
                  <option value="quarter">Quarter Tank</option>
                  <option value="half">Half Tank</option>
                  <option value="three_quarter">Three Quarter Tank</option>
                  <option value="full">Full Tank</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-light">Damage/Inspection Notes</label>
                <textarea 
                  className="form-control" 
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  rows="3" 
                  placeholder="e.g. Scratch on front left door, minor dent on rear bumper"
                  value={vcrData.damageNotes}
                  onChange={(e) => setVcrData({ ...vcrData, damageNotes: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-light">Driver/Helper Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  value={vcrData.driverName}
                  onChange={(e) => setVcrData({ ...vcrData, driverName: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="modal-btn btn-cancel" onClick={() => setIsVcrOpen(false)}>Cancel</button>
                <button type="submit" className="modal-btn btn-confirm btn-primary" disabled={submittingVcr}>
                  {submittingVcr ? 'Submitting...' : 'Submit & Check-in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const StaffDashboardWrapper = () => <StaffDashboard />;
export default StaffDashboard;
