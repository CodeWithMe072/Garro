import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  LuClipboardList,
  LuHourglass,
  LuCircleCheck,
  LuCalendar,
  LuMessageSquare,
  LuWrench,
  LuGlobe,
  LuChevronDown,
  LuCheck,
  LuStore,
  LuCar,
  LuTruck,
  LuCalendarDays,
  LuLayoutDashboard,
  LuTrendingUp
} from 'react-icons/lu';
import { io } from 'socket.io-client';
import { useLanguage } from '../context/LanguageContext';
import StaffSidebar from '../components/StaffSidebar';

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
      <StaffSidebar pendingJobsCount={stats.my_pending} />

      {/* ── MAIN ── */}
      <main className="staff-main">
        <div className="dash-header mb-4" style={{ display: 'block' }}>
          <div className="dash-title">{t('staff_dashboard')}</div>
          <div className="dash-subtitle">{t('welcome_back')}, {user?.firstName || 'Staff'}!</div>
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
            <h4><LuCalendarDays className="text-primary-garro me-2" size={18} />{t('todays_schedule')} <span className="today-badge">{t('active_jobs')}</span></h4>
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
                    <div className="tl-garage"><LuStore className="text-secondary me-1" size={13} /> {b.garage.name} &nbsp;·&nbsp; <LuCar className="text-secondary me-1" size={13} /> {b.car_model}</div>
                    <div className="tl-services">
                      {b.services.join(', ')}
                    </div>
                    {b.pickup_type === 'pickup_drop' && (
                      <div style={{ fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '6px', marginTop: '6px', fontWeight: '600' }}>
                        <LuCar size={12} /> <span>{t('pickup_required')}</span>
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
                          className="tl-btn d-inline-flex align-items-center justify-content-center" 
                          onClick={() => handleUpdateStatus(b.id, 'picked_up')} 
                          style={{ background: '#ff5c1a', color: 'white' }}
                        >
                          <LuTruck size={14} className="me-1" /> Mark Picked Up
                        </button>
                      )}
                      {b.status === 'picked_up' && (
                        <button 
                          className="tl-btn d-inline-flex align-items-center justify-content-center" 
                          onClick={() => handleOpenVcrModal(b.id)} 
                          style={{ background: '#10b981', color: 'white' }}
                        >
                          <LuClipboardList size={14} className="me-1" /> Check-in to Garage
                        </button>
                      )}
                      {b.status === 'ready_for_delivery' && (
                        <button 
                          className="tl-btn d-inline-flex align-items-center justify-content-center" 
                          onClick={() => handleUpdateStatus(b.id, 'delivered')} 
                          style={{ background: '#3b82f6', color: 'white' }}
                        >
                          <LuCheck size={14} className="me-1" /> Mark Delivered
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
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <LuCalendarDays size={48} className="text-muted mb-3" />
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#374151', marginBottom: '6px' }}>No bookings assigned</div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>Enjoy your day — nothing scheduled for today.</div>
            </div>
          )}
        </div>
      </main>

      {/* ── Vehicle Condition Report Form Modal ── */}
      {isVcrOpen && (
        <div className="custom-modal-overlay" onClick={() => setIsVcrOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, backdropFilter: 'blur(4px)' }}>
          <div className="custom-modal confirm" onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', padding: '30px', borderRadius: '16px', maxWidth: '500px', width: '90%', color: '#0f172a', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
              <LuClipboardList className="text-primary-garro" size={22} /> Vehicle Check-in
            </h4>
            <p className="text-muted small mb-4">Submit a vehicle condition report to check the car into the garage.</p>

            <form onSubmit={handleVcrSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Odometer Reading (km)</label>
                <input 
                  type="number" 
                  className="form-control text-dark bg-white" 
                  style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px' }}
                  placeholder="e.g. 45000"
                  value={vcrData.odometer}
                  onChange={(e) => setVcrData({ ...vcrData, odometer: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Fuel Level</label>
                <select 
                  className="form-select text-dark bg-white" 
                  style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px' }}
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
                <label className="form-label small fw-bold text-secondary">Damage/Inspection Notes</label>
                <textarea 
                  className="form-control text-dark bg-white" 
                  style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px' }}
                  rows="3" 
                  placeholder="e.g. Scratch on front left door, minor dent on rear bumper"
                  value={vcrData.damageNotes}
                  onChange={(e) => setVcrData({ ...vcrData, damageNotes: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Driver/Helper Name</label>
                <input 
                  type="text" 
                  className="form-control text-dark bg-white" 
                  style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px' }}
                  value={vcrData.driverName}
                  onChange={(e) => setVcrData({ ...vcrData, driverName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn-garro btn-outline-garro btn-sm py-2 px-4 fw-semibold" style={{ fontSize: '13px', borderRadius: '8px' }} onClick={() => setIsVcrOpen(false)}>Cancel</button>
                <button type="submit" className="btn-garro btn-primary-garro btn-sm py-2 px-4 fw-semibold" style={{ fontSize: '13px', borderRadius: '8px' }} disabled={submittingVcr}>
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
