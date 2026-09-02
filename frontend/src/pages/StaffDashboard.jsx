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
import CustomDropdown from '../components/CustomDropdown';

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

    const socket = io(API_BASE, { transports: ['websocket', 'polling'], withCredentials: true });

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
      customer_address: b.location?.standardLocation || b.location?.strandedLocation || b.location?.address || 'Dubai',
      standard_location: b.location?.standardLocation || b.location?.strandedLocation || '',
      area_city_address: b.location?.address || '',
      lat: b.location?.lat,
      lng: b.location?.lng,
      is_emergency: b.serviceType === 'roadside_assistance' || b.urgency === 'asap',
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
      <main className="staff-main" style={{ padding: '24px 32px' }}>
        {/* Header */}
        <div className="mb-4">
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
            {t('staff_dashboard') !== 'staff_dashboard' ? t('staff_dashboard') : 'Staff Dashboard'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            {t('welcome_back') !== 'welcome_back' ? t('welcome_back') : 'Welcome back'}, <strong>{user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.name || user?.email?.split('@')[0] || 'Staff')}</strong>!
          </p>
        </div>

        {/* 🚨 Emergency Pickup Alert Banner */}
        {emergencyJobs.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            color: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px',
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

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: t('my_bookings') !== 'my_bookings' ? t('my_bookings') : 'My Bookings', value: stats.my_total, icon: <LuClipboardList size={22} />, color: '#ff5c1a', bg: '#fff5f0' },
            { label: t('pending') !== 'pending' ? t('pending') : 'Pending', value: stats.my_pending, icon: <LuHourglass size={22} />, color: '#f59e0b', bg: '#fffbeb' },
            { label: t('completed') !== 'completed' ? t('completed') : 'Completed', value: stats.my_completed, icon: <LuCircleCheck size={22} />, color: '#10b981', bg: '#f0fdf4' },
            { label: t('today') !== 'today' ? t('today') : 'Today', value: stats.my_today, icon: <LuCalendar size={22} />, color: '#3b82f6', bg: '#eff6ff' },
            { label: t('messages') !== 'messages' ? t('messages') : 'Messages', value: stats.unread_msgs, icon: <LuMessageSquare size={22} />, color: '#8b5cf6', bg: '#f5f3ff' }
          ].map((item, idx) => (
            <div key={idx} style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '18px 20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  {item.value}
                </div>
              </div>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: item.bg,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {item.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Today's Schedule Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff5f0', color: '#ff5c1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LuCalendarDays size={22} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {t('todays_schedule') !== 'todays_schedule' ? t('todays_schedule') : "Today's Schedule"}
                  <span style={{ background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                    {t('active_jobs') !== 'active_jobs' ? t('active_jobs') : 'Active Jobs'}
                  </span>
                </h4>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>Scheduled tasks &amp; assigned service jobs for today</span>
              </div>
            </div>
            <span style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px', fontWeight: 700 }}>
              {mappedBookings.length} {mappedBookings.length === 1 ? 'Job Assigned' : 'Jobs Assigned'}
            </span>
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
                      {b.standard_location && (
                        <div style={{ fontSize: '12px', color: '#1e40af', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '6px 10px', marginTop: '6px', fontWeight: 700 }}>
                          📍 Standard / Stranded Location for Assigned Staff: <span style={{ color: '#0f172a' }}>"{b.standard_location}"</span>
                        </div>
                      )}
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
            <div style={{ textAlign: 'center', padding: '48px 24px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#ff5c1a' }}>
                <LuCalendarDays size={28} />
              </div>
              <h5 style={{ fontWeight: 800, color: '#0f172a', margin: '0 0 4px', fontSize: '16px' }}>No Bookings Assigned</h5>
              <p style={{ color: '#64748b', fontSize: '13.5px', margin: 0 }}>There are no active jobs or tasks scheduled for you today.</p>
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
                <label className="form-label small fw-bold text-secondary mb-2" style={{ display: 'block' }}>Fuel Level</label>
                <CustomDropdown
                  options={[
                    { value: 'empty', label: 'Empty' },
                    { value: 'quarter', label: 'Quarter Tank' },
                    { value: 'half', label: 'Half Tank' },
                    { value: 'three_quarter', label: 'Three Quarter Tank' },
                    { value: 'full', label: 'Full Tank' }
                  ]}
                  value={vcrData.fuelLevel}
                  onChange={(val) => setVcrData({ ...vcrData, fuelLevel: val })}
                  theme="light"
                />
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
                <label className="form-label small fw-bold text-secondary mb-2" style={{ display: 'block' }}>Additional Hours to Add</label>
                <CustomDropdown
                  options={[
                    { value: '1', label: '1 Hour' },
                    { value: '2', label: '2 Hours' },
                    { value: '3', label: '3 Hours' },
                    { value: '4', label: '4 Hours' },
                    { value: '6', label: '6 Hours' },
                    { value: '24', label: '24 Hours (1 Day)' }
                  ]}
                  value={String(extendHours)}
                  onChange={(val) => setExtendHours(val)}
                  theme="light"
                />
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
