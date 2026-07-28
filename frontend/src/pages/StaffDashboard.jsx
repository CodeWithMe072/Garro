import { API_BASE } from '../config/api';
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
  LuCheck,
  LuStore,
  LuCar,
  LuTruck,
  LuCalendarDays,
  LuMapPin,
  LuClock
} from 'react-icons/lu';
import { io } from 'socket.io-client';
import { useLanguage } from '../context/LanguageContext';
import StaffSidebar from '../components/StaffSidebar';

const StaffDashboard = () => {
  const { user } = useAuth();
  const { toast } = useNotification();
  const { t } = useLanguage();

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

  // Extend Job Time Modal State
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [extendJobId, setExtendJobId] = useState(null);
  const [extendHours, setExtendHours] = useState('1');
  const [extendReason, setExtendReason] = useState('');
  const [submittingExtend, setSubmittingExtend] = useState(false);

  const fetchJobs = async () => {
    try {
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

  const handleOpenExtendModal = (jobId) => {
    setExtendJobId(jobId);
    setIsExtendOpen(true);
  };

  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    if (!extendHours || Number(extendHours) <= 0) {
      toast.error('Please enter valid additional hours.');
      return;
    }

    setSubmittingExtend(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/jobs/${extendJobId}/extend-time`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          additionalHours: Number(extendHours),
          reason: extendReason
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to extend job time.');
      }
      toast.success(`Job time extended by ${extendHours} hour(s)!`);
      setIsExtendOpen(false);
      setExtendHours('1');
      setExtendReason('');
      fetchJobs();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingExtend(false);
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
    const userDisplayName = b.userId ? b.userId.name : 'Customer';
    const [first_name, ...rest] = userDisplayName.split(' ');
    const last_name = rest.join(' ') || '';

    return {
      id: j._id,
      requestId: b._id,
      booking_time: timeStr,
      status: j.status,
      status_display: j.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      user: { first_name, last_name, phone: b.userId?.phone || 'N/A' },
      garage: { name: j.garageId ? j.garageId.name : 'Pending Assignment' },
      car_model: b.vehicleId ? `${b.vehicleId.make} ${b.vehicleId.model}` : 'Unknown Car',
      services: [b.serviceType ? b.serviceType.replace('_', ' ').toUpperCase() : 'GENERAL SERVICE'],
      pickup_type: b.location && b.location.address !== 'Self Drop at Garage' ? 'pickup_drop' : 'self_drop',
      customer_address: b.location?.address || 'Dubai',
      lat: b.location?.lat,
      lng: b.location?.lng,
      is_emergency: b.serviceType === 'emergency_pickup' || b.serviceType === 'roadside_assistance' || b.urgency === 'asap',
      estimated_end: j.estimatedEndDate ? new Date(j.estimatedEndDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBC',
      notes: b.description || ''
    };
  });

  const emergencyJobs = mappedBookings.filter(b => b.is_emergency && !['delivered', 'closed', 'completed', 'cancelled'].includes(b.status));

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

        {/* 🚨 Emergency Pickup Alert Banner */}
        {emergencyJobs.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            color: 'white', borderRadius: '16px', padding: '20px', marginBottom: '24px',
            boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.4)', border: '2px solid #fca5a5'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  🚨 HIGH PRIORITY DISPATCH ({emergencyJobs.length})
                </span>
                <h4 style={{ margin: '8px 0 4px', fontWeight: 800, color: 'white' }}>
                  Active Emergency Pickup / Roadside Request
                </h4>
                <p style={{ margin: 0, fontSize: '13.5px', opacity: 0.9 }}>
                  Immediate tow truck dispatch required! Customer needs urgent roadside assistance.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to={`/track/${emergencyJobs[0].requestId || emergencyJobs[0].id}`}
                  className="btn btn-light fw-bold px-4 py-2"
                  style={{ borderRadius: '10px', color: '#dc2626', textDecoration: 'none', fontSize: '13px' }}
                >
                  ⚡ View &amp; Accept Job
                </Link>
                {emergencyJobs[0].lat && (
                  <a
                    href={`https://www.google.com/maps?q=${emergencyJobs[0].lat},${emergencyJobs[0].lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-light fw-bold px-3 py-2"
                    style={{ borderRadius: '10px', fontSize: '13px' }}
                  >
                    📍 Open GPS Navigation
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

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
                    <div className="tl-card" style={b.is_emergency ? { border: '2px solid #ef4444', background: '#fff5f5' } : {}}>
                      <div className="tl-top">
                        <div className="tl-cust" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {b.user.first_name} {b.user.last_name} ({b.user.phone})
                          {b.is_emergency && (
                            <span style={{ background: '#dc2626', color: 'white', fontSize: '10.5px', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                              🚨 EMERGENCY PICKUP (ASAP)
                            </span>
                          )}
                        </div>
                        <span className={`sbadge ${b.status}`}>{b.status_display}</span>
                      </div>
                      <div className="tl-garage">
                        <LuStore className="text-secondary me-1" size={13} /> {b.garage.name} &nbsp;·&nbsp;
                        <LuCar className="text-secondary me-1" size={13} /> {b.car_model} &nbsp;·&nbsp;
                        <LuMapPin className="text-secondary me-1" size={13} /> {b.customer_address}
                        {b.lat && (
                          <a
                            href={`https://www.google.com/maps?q=${b.lat},${b.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ marginLeft: '10px', color: '#ff5c1a', fontWeight: 700, fontSize: '12px', textDecoration: 'none' }}
                          >
                            📍 Open GPS Maps
                          </a>
                        )}
                      </div>
                      <div className="tl-services">
                        {b.services.join(', ')}
                      </div>
                      {b.notes && (
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', fontStyle: 'italic' }}>
                          "{b.notes}"
                        </div>
                      )}

                    {/* Timeline Action Buttons for Staff */}
                    <div className="tl-actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
                      {/* Step 1: Arrive at Customer */}
                      {b.status === 'pickup_scheduled' && (
                        <button
                          className="tl-btn d-inline-flex align-items-center justify-content-center"
                          onClick={() => handleUpdateStatus(b.id, 'arrived_at_customer')}
                          style={{ background: '#f59e0b', color: 'white' }}
                        >
                          <LuMapPin size={14} className="me-1" /> Mark Arrived at Customer
                        </button>
                      )}

                      {/* Step 2: Pick Up Vehicle */}
                      {['pickup_scheduled', 'arrived_at_customer'].includes(b.status) && (
                        <button
                          className="tl-btn d-inline-flex align-items-center justify-content-center"
                          onClick={() => handleUpdateStatus(b.id, 'picked_up')}
                          style={{ background: '#ff5c1a', color: 'white' }}
                        >
                          <LuTruck size={14} className="me-1" /> Mark Picked Up
                        </button>
                      )}

                      {/* Step 3: Check-in to Garage */}
                      {b.status === 'picked_up' && (
                        <button
                          className="tl-btn d-inline-flex align-items-center justify-content-center"
                          onClick={() => handleOpenVcrModal(b.id)}
                          style={{ background: '#10b981', color: 'white' }}
                        >
                          <LuClipboardList size={14} className="me-1" /> Check-in to Garage
                        </button>
                      )}

                      {/* Step 4: Complete Delivery */}
                      {b.status === 'ready_for_delivery' && (
                        <button
                          className="tl-btn d-inline-flex align-items-center justify-content-center"
                          onClick={() => handleUpdateStatus(b.id, 'delivered')}
                          style={{ background: '#3b82f6', color: 'white' }}
                        >
                          <LuCheck size={14} className="me-1" /> Mark Delivered
                        </button>
                      )}

                      {/* Action: Extend Job Time */}
                      {!['delivered', 'closed'].includes(b.status) && (
                        <button
                          className="tl-btn d-inline-flex align-items-center justify-content-center"
                          onClick={() => handleOpenExtendModal(b.id)}
                          style={{ background: '#8b5cf6', color: 'white' }}
                        >
                          <LuClock size={14} className="me-1" /> Extend Job Time
                        </button>
                      )}

                      {['delivered', 'closed'].includes(b.status) && (
                        <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <LuCircleCheck /> Job completed and closed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <LuCalendarDays size={48} className="text-muted mb-3" />
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#374151', marginBottom: '6px' }}>No bookings assigned</div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>Nothing scheduled for today.</div>
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

      {/* ── Extend Job Time Modal ── */}
      {isExtendOpen && (
        <div className="custom-modal-overlay" onClick={() => setIsExtendOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, backdropFilter: 'blur(4px)' }}>
          <div className="custom-modal confirm" onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', padding: '30px', borderRadius: '16px', maxWidth: '480px', width: '90%', color: '#0f172a', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
              <LuClock className="text-primary-garro" size={22} /> Extend Job Duration
            </h4>
            <p className="text-muted small mb-4">Add extra hours to the estimated completion time and inform the customer.</p>

            <form onSubmit={handleExtendSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Additional Hours to Add</label>
                <select
                  className="form-select text-dark bg-white"
                  style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px' }}
                  value={extendHours}
                  onChange={(e) => setExtendHours(e.target.value)}
                  required
                >
                  <option value="1">1 Hour</option>
                  <option value="2">2 Hours</option>
                  <option value="3">3 Hours</option>
                  <option value="4">4 Hours</option>
                  <option value="6">6 Hours</option>
                  <option value="24">24 Hours (1 Day)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Reason for Extension (Optional)</label>
                <textarea
                  className="form-control text-dark bg-white"
                  style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px' }}
                  rows="3"
                  placeholder="e.g. Additional parts required for installation, extended diagnostic testing"
                  value={extendReason}
                  onChange={(e) => setExtendReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn-garro btn-outline-garro btn-sm py-2 px-4 fw-semibold" style={{ fontSize: '13px', borderRadius: '8px' }} onClick={() => setIsExtendOpen(false)}>Cancel</button>
                <button type="submit" className="btn-garro btn-primary-garro btn-sm py-2 px-4 fw-semibold" style={{ fontSize: '13px', borderRadius: '8px', background: '#8b5cf6', borderColor: '#8b5cf6' }} disabled={submittingExtend}>
                  {submittingExtend ? 'Updating...' : 'Extend Duration'}
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
