import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { io } from 'socket.io-client';
import CustomDropdown from '../components/CustomDropdown';

const TrackRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast, confirm } = useNotification();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState('');

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [garagesList, setGaragesList] = useState([]);
  const [availableHelpersList, setAvailableHelpersList] = useState([]);
  const [assignGarageId, setAssignGarageId] = useState('');
  const [assignHelperId, setAssignHelperId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [assignDate, setAssignDate] = useState('');
  const [assignTime, setAssignTime] = useState('09:00');
  const [assignDuration, setAssignDuration] = useState('4');
  const [helperSchedule, setHelperSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictReason, setConflictReason] = useState('');

  const WORK_START = 9 * 60;  // 9:00 in minutes
  const WORK_END   = 21 * 60; // 21:00 in minutes

  const fetchRequestDetails = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/requests/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRequest(data.request);
      } else {
        setError(data.message || 'Failed to load request details.');
      }
    } catch (err) {
      setError('An error occurred while loading request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(API_BASE);

    socket.on('request:assigned', (data) => {
      console.log('Real-time request:assigned event received in TrackRequest:', data);
      if (data._id === id) {
        fetchRequestDetails();
      }
    });

    socket.on('request:cancelled', (data) => {
      console.log('Real-time request:cancelled event received in TrackRequest:', data);
      if (data._id === id) {
        fetchRequestDetails();
      }
    });

    socket.on('request:updated', (data) => {
      console.log('Real-time request:updated event received in TrackRequest:', data);
      if (data._id === id) {
        fetchRequestDetails();
      }
    });

  }, [id]);

  // Fetch helper's schedule whenever helper, date, time, or duration changes
  useEffect(() => {
    if (!assignHelperId || !assignDate) {
      setHelperSchedule([]);
      setHasConflict(false);
      setConflictReason('');
      return;
    }
    const fetchSchedule = async () => {
      setScheduleLoading(true);
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/admin/helpers/${assignHelperId}/schedule?date=${assignDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const slots = data.success ? (data.slots || []) : [];
        
        // Filter out the booking slot for the CURRENT request so it doesn't conflict with itself!
        const filteredSlots = slots.filter(s => s.bookingId !== id && s.bookingId?._id !== id);
        
        setHelperSchedule(filteredSlots);

        // Conflict check
        if (assignTime && assignDuration) {
          const [h, m] = assignTime.split(':').map(Number);
          const proposedStart = h * 60 + m;
          const proposedEnd   = proposedStart + Number(assignDuration) * 60;

          // 1. Working hours check
          if (proposedStart < WORK_START) {
            setHasConflict(true);
            setConflictReason(`Start time ${assignTime} is before working hours (9:00 AM)`);
            return;
          }
          if (proposedEnd > WORK_END) {
            setHasConflict(true);
            setConflictReason(`End time (${Math.floor(proposedEnd/60)}:${String(proposedEnd%60).padStart(2,'0')}) exceeds working hours (9:00 PM cutoff)`);
            return;
          }

          // 2. Slot + buffer zone check
          const conflict = filteredSlots.some(slot => {
            const sStart = new Date(slot.startTime);
            const bEnd   = new Date(slot.bufferEndTime || slot.endTime);
            const slotStartMin  = sStart.getHours() * 60 + sStart.getMinutes();
            const bufferEndMin  = bEnd.getHours()   * 60 + bEnd.getMinutes();
            return proposedStart < bufferEndMin && proposedEnd > slotStartMin;
          });

          if (conflict) {
            const slot = filteredSlots.find(slot => {
              const sStart = new Date(slot.startTime);
              const bEnd   = new Date(slot.bufferEndTime || slot.endTime);
              const slotStartMin = sStart.getHours() * 60 + sStart.getMinutes();
              const bufferEndMin = bEnd.getHours()   * 60 + bEnd.getMinutes();
              return proposedStart < bufferEndMin && proposedEnd > slotStartMin;
            });
            const bEndTime = new Date(slot.bufferEndTime || slot.endTime);
            setHasConflict(true);
            setConflictReason(`Helper busy until ${bEndTime.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} (includes recovery buffer after ${slot.serviceType?.replace('_',' ')} job)`);
          } else {
            setHasConflict(false);
            setConflictReason('');
          }
        }
      } catch (err) {
        console.error('Failed to fetch helper schedule:', err);
      } finally {
        setScheduleLoading(false);
      }
    };
    fetchSchedule();
  }, [assignHelperId, assignDate, assignTime, assignDuration, id]);

  const handleStartEdit = () => {
    if (request && request.preferredDate) {
      const d = new Date(request.preferredDate);
      const pad = (n) => String(n).padStart(2, '0');
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      setNewSchedule(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      setNewSchedule('');
    }
    setIsEditingSchedule(true);
  };

  const handleSaveSchedule = async () => {
    if (!newSchedule) {
      toast.error('Please select a valid date and time.');
      return;
    }
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/requests/${id}/schedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ preferredDate: newSchedule })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(request.helperId ? 'Schedule change proposed to helper for approval!' : 'Preferred schedule updated successfully!');
        setIsEditingSchedule(false);
        fetchRequestDetails();
      } else {
        toast.error(data.message || 'Failed to update schedule.');
      }
    } catch (err) {
      toast.error('An error occurred while updating the schedule.');
    }
  };

  const handleRespondSchedule = async (action) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/requests/${id}/schedule/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Schedule change ${action}ed successfully!`);
        fetchRequestDetails();
      } else {
        toast.error(data.message || `Failed to ${action} schedule change.`);
      }
    } catch (err) {
      toast.error('An error occurred.');
    }
  };

  const handleOpenAssignModal = async (req) => {
    // Set current assigned garage and helper if any
    const curGarageId = req.garageId?._id || '';
    const curHelperId = req.helperId?._id || '';
    setAssignGarageId(curGarageId);
    setAssignHelperId(curHelperId);

    // Fetch lists
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const garagesRes = await fetch(`${API_BASE}/api/garages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const garagesData = await garagesRes.json();

      const helpersRes = await fetch(`${API_BASE}/api/admin/available-helpers?requestId=${req._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const helpersData = await helpersRes.json();

      if (garagesRes.ok && garagesData.success) {
        setGaragesList(garagesData.garages || []);
      }
      if (helpersRes.ok && helpersData.success) {
        let helpers = helpersData.helpers || [];
        // Ensure currently assigned helper is in the list
        if (req.helperId && !helpers.some(h => h._id === req.helperId._id)) {
          helpers = [{
            ...req.helperId,
            garageId: req.garageId || req.helperId.garageId
          }, ...helpers];
        }
        setAvailableHelpersList(helpers);
      }
    } catch (err) {
      console.error('Failed to fetch modal lists:', err);
    }

    // Smart date pre-fill
    let reqDate = new Date();
    if (req.scheduledArrivalDate) {
      reqDate = new Date(req.scheduledArrivalDate);
    } else if (req.preferredDate) {
      reqDate = new Date(req.preferredDate);
    } else {
      const urgency = req.urgency || 'flexible';
      if (urgency === 'asap') {
        reqDate.setMinutes(0, 0, 0);
        reqDate.setHours(reqDate.getHours() + 1);
      } else if (urgency === 'today') {
        reqDate.setMinutes(0, 0, 0);
        reqDate.setHours(reqDate.getHours() + 2);
      }
    }
    const fmt = (n) => String(n).padStart(2, '0');
    setAssignDate(`${reqDate.getFullYear()}-${fmt(reqDate.getMonth() + 1)}-${fmt(reqDate.getDate())}`);
    setAssignTime(`${fmt(reqDate.getHours())}:${fmt(reqDate.getMinutes())}`);
    setAssignDuration(String(req.estimatedDuration || (req.urgency === 'asap' ? 2 : 4)));
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignGarageId || !assignHelperId) {
      toast.error("Please select both a garage and a helper.");
      return;
    }

    setSubmittingAssign(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/api/admin/requests/${id}/manual-assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          garageId: assignGarageId,
          helperId: assignHelperId,
          scheduledDate: assignDate,
          scheduledTime: assignTime,
          estimatedDuration: assignDuration
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Assignment updated successfully!");
        setShowAssignModal(false);
        fetchRequestDetails();
      } else {
        toast.error(data.message || "Failed to update assignment.");
      }
    } catch (err) {
      console.error("Error during manual assignment:", err);
      toast.error("Error during assignment.");
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleCancel = async () => {
    confirm({
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking request?',
      confirmText: 'Yes, Cancel',
      cancelText: 'No, Keep It',
      isDelete: true,
      onConfirm: async () => {
        try {
          const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/api/requests/${id}/cancel`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            toast.success('Booking cancelled successfully.');
            fetchRequestDetails();
          } else {
            toast.error(data.message || 'Failed to cancel booking.');
          }
        } catch (err) {
          toast.error('An error occurred.');
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="alert alert-danger max-width-600 mx-auto">{error || 'Request not found'}</div>
        <Link to="/my-requests" className="btn btn-primary-garro mt-3">Back to My Bookings</Link>
      </div>
    );
  }

  const steps = [
    { label: 'Pending Assignment', key: 'new', icon: 'assignment_late' },
    { label: 'Garage Assigned', key: 'assigned', icon: 'garage' },
    { label: 'In Progress', key: 'in_progress', icon: 'build' },
    { label: 'Completed', key: 'completed', icon: 'check_circle' }
  ];

  const getStepIndex = (status) => {
    if (status === 'cancelled') return -1;
    if (status === 'new' || status === 'quote_pending') return 0;
    if (status === 'assigned') return 1;
    if (status === 'in_progress' || status === 'working') return 2;
    if (status === 'completed') return 3;
    return 0;
  };

  const currentStepIdx = getStepIndex(request.status);

  return (
    <div className="container py-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Back Link */}
      <div className="mb-4">
        <Link to="/my-requests" className="text-decoration-none d-inline-flex align-items-center text-muted fw-semibold">
          <span className="material-icons-round me-2">arrow_back</span> Back to My Bookings
        </Link>
      </div>

      {/* Booking Header Card */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
        <div className="card-body p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <span className="text-white-50 small fw-medium">Booking ID: #{request._id}</span>
            <h4 className="fw-bold mt-1 mb-0">
              {request.garageId ? request.garageId.name : 'Pending Garage Assignment'}
            </h4>
            <div className="text-white-50 small mt-1">
              <span className="material-icons-round" style={{ fontSize: '14px', verticalAlign: 'middle' }}>location_on</span>{' '}
              {request.location?.address || 'Dubai'}
            </div>
          </div>
          <div className="text-end">
            <span className={`badge px-3 py-2 fs-7 ${
              request.status === 'completed' ? 'bg-success' :
              request.status === 'cancelled' ? 'bg-danger' :
              request.status === 'new' ? 'bg-warning text-dark' : 'bg-primary'
            }`}>
              {request.status.toUpperCase()}
            </span>
            <div className="fw-bold fs-4 mt-2" style={{ color: '#ff8c42' }}>
              AED {request.estimatedCost || 299}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Stepper */}
      {request.status !== 'cancelled' && (
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
          <div className="card-body p-4">
            <h6 className="fw-bold text-dark mb-4">Service Progress Tracker</h6>
            <div className="row position-relative g-0 align-items-center" style={{ minHeight: '120px' }}>
              {steps.map((step, idx) => {
                const isActive = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={idx} className="col-12 col-md-3 text-center mb-3 mb-md-0 position-relative" style={{ zIndex: 2 }}>
                    {/* Segment Connector Line to Next Step */}
                    {idx < steps.length - 1 && (
                      <div className="d-none d-md-block position-absolute" style={{
                        height: '3px',
                        background: idx < currentStepIdx ? 'var(--brand)' : '#e2e8f0',
                        top: '24px',
                        left: '50%',
                        right: '-50%',
                        zIndex: -1,
                        transition: 'background 0.4s ease'
                      }}></div>
                    )}

                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: isCurrent ? 'var(--brand)' : isActive ? 'var(--brand-dark)' : '#f1f5f9',
                      color: isActive ? '#fff' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 10px',
                      boxShadow: isCurrent ? '0 0 15px rgba(255, 92, 26, 0.4)' : 'none',
                      position: 'relative',
                      zIndex: 3
                    }}>
                      <span className="material-icons-round">{step.icon}</span>
                    </div>
                    <div className={`small fw-bold ${isActive ? 'text-dark' : 'text-muted'}`}>{step.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Detail Sections */}
      <div className="row g-4">
        {/* Left Side: Service Details & Description */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold text-dark mb-3">Service Details</h5>
              
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="text-muted small">Service Type</div>
                  <span className="badge bg-light text-dark py-2 px-3 fw-semibold mt-1" style={{ fontSize: '13px' }}>
                    {request.serviceType ? request.serviceType.replace('_', ' ').toUpperCase() : 'GENERAL SERVICE'}
                  </span>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small">Preferred Schedule</div>
                  {isEditingSchedule ? (
                    <div className="mt-2 d-flex flex-column gap-2">
                      <input 
                        type="datetime-local" 
                        className="form-control form-control-sm"
                        style={{ maxWidth: '240px', background: '#f8fafc', color: '#0f172a' }}
                        value={newSchedule}
                        onChange={(e) => setNewSchedule(e.target.value)}
                      />
                      <div className="d-flex gap-2">
                        <button className="btn-garro btn-primary-garro btn-sm py-1 px-3" onClick={handleSaveSchedule}>Save</button>
                        <button className="btn-garro btn-clear-garro btn-sm py-1 px-3" onClick={() => setIsEditingSchedule(false)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="fw-semibold text-dark mt-1 d-flex align-items-center gap-2">
                      <span>
                        {request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : 'N/A'} at{' '}
                        {request.preferredDate ? new Date(request.preferredDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </span>
                      {!['in_garage', 'work_complete', 'ready_for_delivery', 'delivered', 'closed', 'cancelled'].includes(request.status) && 
                        request.proposedDateStatus !== 'pending' && 
                        user?.role === 'customer' && (
                          <button 
                            className="btn btn-link p-0 text-decoration-none fw-semibold" 
                            style={{ fontSize: '13px', color: '#ff5c1a' }}
                            onClick={handleStartEdit}
                          >
                            ✏️ Edit
                          </button>
                      )}
                    </div>
                  )}

                  {/* Customer view: proposal feedback */}
                  {request.proposedDateStatus === 'pending' && request.proposedDate && user?.role === 'customer' && (
                    <div className="alert alert-info mt-3 mb-0" style={{ fontSize: '12.5px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', background: 'rgba(59, 130, 246, 0.05)' }}>
                      ⏳ Proposed new schedule: <strong>{new Date(request.proposedDate).toLocaleString()}</strong>. Waiting for helper confirmation.
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Estimated Arrival & Duration Row */}
              <div className="row g-3 mt-1">
                <div className="col-md-6">
                  <div className="text-muted small">Estimated Helper Arrival</div>
                  {request.scheduledArrivalDate ? (
                    <div className="fw-bold text-dark mt-1 d-flex align-items-center gap-1">
                      <span className="material-icons-round text-primary" style={{ fontSize: '18px', verticalAlign: 'middle' }}>schedule</span>
                      <span>
                        ~{new Date(request.scheduledArrivalDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(request.scheduledArrivalDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })})
                      </span>
                      <span className="badge bg-light text-secondary fw-normal ms-1">Est.</span>
                    </div>
                  ) : (
                    <div className="text-secondary mt-1 small" style={{ fontStyle: 'italic' }}>
                      Waiting for scheduling...
                    </div>
                  )}
                </div>
                {request.estimatedDuration && (
                  <div className="col-md-6">
                    <div className="text-muted small">Estimated Duration</div>
                    <div className="fw-semibold text-dark mt-1 d-flex align-items-center gap-1">
                      <span className="material-icons-round text-secondary" style={{ fontSize: '18px', verticalAlign: 'middle' }}>hourglass_empty</span>
                      <span>{request.estimatedDuration} Hours</span>
                    </div>
                  </div>
                )}

                {/* Helper/Staff view: accept or reject proposed schedule */}
                {request.proposedDateStatus === 'pending' && request.proposedDate && user?.role !== 'customer' && (
                  <div className="col-12">
                    <div className="alert alert-warning mt-2 mb-0" style={{ borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', background: 'rgba(245, 158, 11, 0.05)' }}>
                      <div className="fw-bold mb-1 text-dark" style={{ fontSize: '13.5px' }}>🕒 Schedule Change Requested:</div>
                      <div className="mb-2 text-muted small">Customer proposed: <strong>{new Date(request.proposedDate).toLocaleString()}</strong></div>
                      <div className="d-flex gap-2">
                        <button className="btn-garro btn-primary-garro btn-sm py-1 px-3" onClick={() => handleRespondSchedule('accept')}>Accept</button>
                        <button className="btn-garro btn-clear-garro btn-sm py-1 px-3" onClick={() => handleRespondSchedule('reject')}>Decline</button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-12 border-top pt-3">
                  <div className="text-muted small">Problem Description</div>
                  <p className="text-dark fw-medium mt-1 mb-0" style={{ lineHeight: '1.6', fontSize: '14.5px' }}>
                    {request.description || 'No description provided.'}
                  </p>
                </div>

                {request.photos && request.photos.length > 0 && (
                  <div className="col-12 border-top pt-3">
                    <div className="text-muted small mb-2">Attached Photos</div>
                    <div className="d-flex flex-wrap gap-2">
                      {request.photos.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="d-block">
                          <img src={url} alt={`Issue ${i}`} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Vehicle Info & Garage / Helper details */}
        <div className="col-12 col-lg-5">
          <div className="d-flex flex-column gap-4">
            {/* Vehicle Details */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold text-dark mb-3">Vehicle Information</h5>
                {request.vehicleId ? (
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ fontSize: '2.5rem' }}>🚗</div>
                    <div>
                      <div className="fw-bold text-dark">{request.vehicleId.make} {request.vehicleId.model}</div>
                      <div className="text-muted small">Year: {request.vehicleId.year}</div>
                      {/* Show Registration Details to staff only */}
                      {user?.role !== 'customer' && (
                        <span className="badge bg-secondary mt-1 px-2 py-1" style={{ fontSize: '11px' }}>
                          {request.vehicleId.registrationNumber || 'N/A'}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted">No vehicle details linked.</div>
                )}
              </div>
            </div>

            {/* Customer Contact Details (Only visible to Staff/Helpers) */}
            {user?.role !== 'customer' && request.userId && (
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                  <h5 className="fw-bold text-dark mb-3">Client Contact</h5>
                  <div className="d-flex align-items-start gap-3">
                    <div style={{ fontSize: '2rem' }}>👤</div>
                    <div>
                      <div className="fw-bold text-dark">{request.userId.name}</div>
                      <div className="text-muted small">Phone: {request.userId.phone || 'N/A'}</div>
                      <div className="text-muted small">Email: {request.userId.email || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Garage & Helper Details */}
            {(request.garageId || request.helperId || ['superadmin', 'manager', 'admin'].includes(user?.role)) && (
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">Assigned Team</h5>
                    {['superadmin', 'manager', 'admin'].includes(user?.role) && (
                      <button 
                        onClick={() => handleOpenAssignModal(request)}
                        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 py-1 px-2 fw-semibold"
                        style={{ fontSize: '12.5px', borderRadius: '8px' }}
                      >
                        <span className="material-icons-round" style={{ fontSize: '16px' }}>edit</span>
                        {request.garageId || request.helperId ? 'Edit' : 'Assign'}
                      </button>
                    )}
                  </div>
                  
                  {request.garageId ? (
                    <div className="d-flex align-items-start gap-3 mb-3 pb-3 border-bottom">
                      <div style={{ fontSize: '2.5rem' }}>🏪</div>
                      <div>
                        <div className="fw-bold text-dark">{request.garageId.name}</div>
                        <div className="text-muted small">Contact: {request.garageId.phone || 'N/A'}</div>
                        <div className="text-muted small">Area: {request.garageId.address || 'N/A'}</div>
                      </div>
                    </div>
                  ) : (
                    ['superadmin', 'manager', 'admin'].includes(user?.role) && (
                      <div className="text-muted small pb-2 border-bottom mb-3">No garage assigned yet.</div>
                    )
                  )}

                  {request.helperId ? (
                    <div className="d-flex align-items-start gap-3">
                      <div style={{ fontSize: '2.5rem' }}>🧑‍🔧</div>
                      <div>
                        <div className="fw-bold text-dark">{request.helperId.name}</div>
                        <div className="text-muted small">Designation: Service Helper</div>
                        <div className="text-muted small">Contact: {request.helperId.phone || 'N/A'}</div>
                      </div>
                    </div>
                  ) : (
                    ['superadmin', 'manager', 'admin'].includes(user?.role) && (
                      <div className="text-muted small">No helper assigned yet.</div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {['new', 'assigned', 'quote_pending'].includes(request.status) && (
              <button onClick={handleCancel} className="btn btn-outline-danger w-100 py-3 fw-bold" style={{ borderRadius: '12px' }}>
                Cancel Booking Request
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modal Overlay */}
      {showAssignModal && (
        <div className="modal-overlay-custom" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="modal-card-custom" style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: '820px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px',
            border: '1px solid #e2e8f0'
          }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Assign Garage &amp; Helper</h4>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="btn-close"
                style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div className="mb-3 p-3 rounded-3" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
              <div className="small text-muted fw-semibold mb-2">📋 Request Details</div>
              <div className="fw-bold text-dark">{request.userId?.name || 'Unknown User'}</div>
              <div className="small text-secondary">{request.vehicleId ? `${request.vehicleId.make} ${request.vehicleId.model} (${request.vehicleId.year})` : 'Unknown Vehicle'}</div>
              <div className="small text-secondary mt-1">Issue: {request.description}</div>
              <hr className="my-2" style={{ borderColor: '#bae6fd' }} />
              <div className="d-flex gap-3 flex-wrap">
                <div>
                  <div className="small text-muted">Customer Urgency</div>
                  <span className={`badge mt-1 px-2 py-1 ${
                    request.urgency === 'asap' ? 'bg-danger' :
                    request.urgency === 'today' ? 'bg-warning text-dark' :
                    request.urgency === 'this_week' ? 'bg-info text-dark' : 'bg-secondary'
                  }`} style={{ fontSize: '11px' }}>
                    {request.urgency === 'asap' ? '🚨 ASAP — Urgent' :
                     request.urgency === 'today' ? '📅 Today' :
                     request.urgency === 'this_week' ? '📆 This Week' : '⏳ Flexible'}
                  </span>
                </div>
                {request.preferredDate && (
                  <div>
                    <div className="small text-muted">Preferred Date/Time</div>
                    <div className="small fw-semibold text-dark mt-1">
                      📅 {new Date(request.preferredDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
                      🕐 {new Date(request.preferredDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Select Garage *</label>
                <CustomDropdown
                  name="garageId"
                  placeholder="Choose Garage..."
                  options={garagesList
                    .filter(g => {
                      if (!request) return true;
                      
                      // 1. Service check: garage supports requested serviceType (supporting human-readable or key format)
                      const serviceMapping = {
                        minor_service: ['Minor Service', 'minor_service'],
                        major_service: ['Major Service', 'major_service'],
                        ac_repair: ['AC Repair', 'ac_repair'],
                        brake_repair: ['Brake Repair', 'brake_repair'],
                        electrical: ['Electrical Repair', 'electrical'],
                        diagnostics: ['Diagnostics', 'Diagnostics / Inspection', 'diagnostics'],
                        battery: ['Battery Replacement', 'battery'],
                        other: ['General Repair', 'Other Repair / Service', 'other']
                      };
                      const possibleServices = serviceMapping[request.serviceType] || [request.serviceType];
                      const supportsService = g.services && g.services.some(srv => possibleServices.includes(srv));

                      // 2. Area check: request location address contains any of garage's covered areas
                      const reqAddress = request.location?.address || '';
                      const coversArea = g.areas && g.areas.some(area => 
                        reqAddress.toLowerCase().includes(area.toLowerCase())
                      );
                      return supportsService && coversArea;
                    })
                    .map(g => ({
                      value: g._id,
                      label: `${g.name} (${g.areas ? g.areas.join(', ') : 'Dubai'})`
                    }))}
                  value={assignGarageId}
                  onChange={(val) => {
                    setAssignGarageId(val);
                    setAssignHelperId('');
                  }}
                  required
                />
                {request && garagesList.filter(g => {
                  const serviceMapping = {
                    minor_service: ['Minor Service', 'minor_service'],
                    major_service: ['Major Service', 'major_service'],
                    ac_repair: ['AC Repair', 'ac_repair'],
                    brake_repair: ['Brake Repair', 'brake_repair'],
                    electrical: ['Electrical Repair', 'electrical'],
                    diagnostics: ['Diagnostics', 'Diagnostics / Inspection', 'diagnostics'],
                    battery: ['Battery Replacement', 'battery'],
                    other: ['General Repair', 'Other Repair / Service', 'other']
                  };
                  const possibleServices = serviceMapping[request.serviceType] || [request.serviceType];
                  const supportsService = g.services && g.services.some(srv => possibleServices.includes(srv));

                  const reqAddress = request.location?.address || '';
                  const coversArea = g.areas && g.areas.some(area => 
                    reqAddress.toLowerCase().includes(area.toLowerCase())
                  );
                  return supportsService && coversArea;
                }).length === 0 && (
                  <p className="text-danger small mt-1">
                    ⚠️ No garages found supporting <strong>{request.serviceType?.replace('_',' ')}</strong> in area <strong>"{request.location?.address || 'N/A'}"</strong>.
                  </p>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Select Helper *</label>
                <CustomDropdown
                  name="helperId"
                  placeholder={assignGarageId ? "Choose Helper..." : "Please select a garage first"}
                  options={availableHelpersList
                    .filter(h => h.garageId?._id === assignGarageId)
                    .map(h => ({
                      value: h._id,
                      label: `${h.name} (⭐ ${h.rating || 5}/5) ${h.upcomingSlots && h.upcomingSlots.length > 0 ? `[${h.upcomingSlots.length} booking(s)]` : '[Free]'}`
                    }))
                  }
                  value={assignHelperId}
                  onChange={setAssignHelperId}
                  required
                />
                {!assignGarageId && <p className="text-muted small mt-1">Please select a garage first to view available helpers.</p>}
                {assignGarageId && availableHelpersList.filter(h => h.garageId?._id === assignGarageId).length === 0 && (
                  <p className="text-danger small mt-1">No available helpers found for this garage.</p>
                )}
              </div>

              {/* ── Schedule time config ── */}
              <div className="p-3 mb-4 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="small fw-bold text-dark">🕐 Schedule Helper Visit</div>
                  {hasConflict && (
                    <span className="badge bg-danger px-2 py-1" style={{ fontSize: '11px' }}>⚠️ Time Conflict!</span>
                  )}
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark mb-1">Date *</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={assignDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setAssignDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark mb-1">Arrival Time *</label>
                    <input
                      type="time"
                      className="form-control form-control-sm"
                      value={assignTime}
                      onChange={e => setAssignTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-semibold text-dark mb-1">Est. Duration *</label>
                  <select
                    className="form-select form-select-sm"
                    value={assignDuration}
                    onChange={e => setAssignDuration(e.target.value)}
                    required
                  >
                    <option value="1">1 Hour</option>
                    <option value="2">2 Hours</option>
                    <option value="3">3 Hours</option>
                    <option value="4">4 Hours (Standard)</option>
                    <option value="5">5 Hours</option>
                    <option value="6">6 Hours</option>
                    <option value="8">8 Hours</option>
                    <option value="12">12 Hours (Full Day)</option>
                  </select>
                </div>

                {/* Visual Timeline */}
                {assignDate && assignTime && (
                  <div className="mt-3">
                    <div className="small fw-semibold text-dark mb-1">
                      📊 Helper Schedule — {assignDate}
                      {scheduleLoading && <span className="text-muted ms-2" style={{ fontWeight: 'normal' }}>Loading...</span>}
                    </div>
                    <div className="d-flex gap-3 mb-2 flex-wrap" style={{ fontSize: '11px' }}>
                      <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#94a3b8', marginRight:4 }}></span>Off hours</span>
                      <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#ef4444', marginRight:4 }}></span>Booked</span>
                      <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#f59e0b', marginRight:4 }}></span>Recovery buffer</span>
                      <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#f97316', marginRight:4 }}></span>Your slot</span>
                      <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#22c55e', marginRight:4 }}></span>Free</span>
                    </div>
                    {(() => {
                      const HOURS_START = 6, HOURS_END = 22;
                      const [ph, pm] = assignTime.split(':').map(Number);
                      const propStart = ph * 60 + pm;
                      const propEnd   = propStart + Number(assignDuration) * 60;
                      const busyIntervals = helperSchedule.map(slot => {
                        const s = new Date(slot.startTime), e = new Date(slot.endTime);
                        return { start: s.getHours()*60+s.getMinutes(), end: e.getHours()*60+e.getMinutes(), label: slot.serviceType?.replace('_',' ')||'Busy' };
                      });
                      const bufferIntervals = helperSchedule.map(slot => {
                        const jobEnd = new Date(slot.endTime);
                        const bufEnd = new Date(slot.bufferEndTime || slot.endTime);
                        return {
                          start: jobEnd.getHours() * 60 + jobEnd.getMinutes(),
                          end:   bufEnd.getHours() * 60 + bufEnd.getMinutes(),
                          label: `Recovery buffer (${slot.bufferHours || '?'}h after job)`
                        };
                      });
                      const cells = [];
                      for (let t = HOURS_START*60; t < HOURS_END*60; t += 30) {
                        const tEnd = t + 30;
                        const isOffHours = t < WORK_START || tEnd > WORK_END;
                        const isBusy     = !isOffHours && busyIntervals.some(b => t < b.end && tEnd > b.start);
                        const isBuffer   = !isOffHours && !isBusy && bufferIntervals.some(b => t < b.end && tEnd > b.start);
                        const isProp     = !isOffHours && t < propEnd && tEnd > propStart;
                        const isConflCell = isProp && (isBusy || isBuffer || isOffHours);
                        const h = Math.floor(t/60), min = t%60;
                        const lbl = min===0 ? `${h>12?h-12:h===0?12:h}${h>=12?'pm':'am'}` : '';

                        let bg = '#22c55e'; // free
                        if (isOffHours) bg = '#94a3b8';
                        else if (isBusy && isProp) bg = '#7f1d1d';
                        else if (isBusy) bg = '#ef4444';
                        else if (isBuffer && isProp) bg = '#92400e';
                        else if (isBuffer) bg = '#f59e0b';
                        else if (isProp) bg = '#f97316';

                        const titleStr = isOffHours ? 'Outside working hours (9AM–9PM)' :
                          (isBusy && isProp) ? '⚠️ CONFLICT — Overlaps a booking!' :
                          (isBuffer && isProp) ? '⚠️ CONFLICT — Inside recovery buffer!' :
                          isBusy ? `Booked: ${busyIntervals.find(b=>t>=b.start&&t<b.end)?.label||''}` :
                          isBuffer ? `${bufferIntervals.find(b=>t>=b.start&&t<b.end)?.label||'Recovery'}` :
                          isProp ? `Your slot: ${assignTime} + ${assignDuration}h` : 'Free';

                        cells.push(
                          <div key={t} title={titleStr}
                            style={{ flex:1, height:'28px', background:bg, borderRight:'1px solid rgba(255,255,255,0.25)', position:'relative', cursor:'default' }}>
                            {lbl && <span style={{ position:'absolute', top:'100%', left:0, fontSize:'9px', color:'#64748b', whiteSpace:'nowrap', marginTop:'2px' }}>{lbl}</span>}
                          </div>
                        );
                      }
                      return (
                        <div>
                          <div style={{ display:'flex', borderRadius:'8px', overflow:'hidden', border:'1px solid #e2e8f0', height:'28px' }}>{cells}</div>
                          <div style={{ height:'16px' }}></div>
                        </div>
                      );
                    })()}
                    {hasConflict ? (
                      <div className="alert alert-danger py-2 px-3 mb-0" style={{ fontSize:'12.5px', borderRadius:'8px' }}>
                        ⚠️ <strong>Cannot assign:</strong> {conflictReason}
                      </div>
                    ) : (
                      <div className="alert alert-success py-2 px-3 mb-0" style={{ fontSize:'12.5px', borderRadius:'8px' }}>
                        ✅ <strong>{assignTime}</strong> for <strong>{assignDuration} hr(s)</strong> — available, no conflicts.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="d-flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAssignModal(false)}
                  className="btn btn-light w-100 py-2.5 fw-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary-garro w-100 py-2.5 fw-semibold text-white"
                  disabled={submittingAssign || !assignGarageId || !assignHelperId || hasConflict}
                  title={hasConflict ? 'Resolve the time conflict first' : ''}
                >
                  {submittingAssign ? 'Assigning...' : hasConflict ? '⚠️ Conflict — Change Time' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackRequest;
