import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { io } from 'socket.io-client';

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

    return () => {
      socket.disconnect();
    };
  }, [id]);

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

                  {/* Helper/Staff view: accept or reject button controls */}
                  {request.proposedDateStatus === 'pending' && request.proposedDate && user?.role !== 'customer' && (
                    <div className="alert alert-warning mt-3 mb-0" style={{ borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', background: 'rgba(245, 158, 11, 0.05)' }}>
                      <div className="fw-bold mb-1 text-dark" style={{ fontSize: '13.5px' }}>🕒 Schedule Change Requested:</div>
                      <div className="mb-2 text-muted small">Customer proposed: <strong>{new Date(request.proposedDate).toLocaleString()}</strong></div>
                      <div className="d-flex gap-2">
                        <button 
                          className="btn-garro btn-primary-garro btn-sm py-1 px-3" 
                          onClick={() => handleRespondSchedule('accept')}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn-garro btn-clear-garro btn-sm py-1 px-3" 
                          onClick={() => handleRespondSchedule('reject')}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}
                </div>

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
            {(request.garageId || request.helperId) && (
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                  <h5 className="fw-bold text-dark mb-3">Assigned Team</h5>
                  
                  {request.garageId && (
                    <div className="d-flex align-items-start gap-3 mb-3 pb-3 border-bottom">
                      <div style={{ fontSize: '2rem' }}>🏪</div>
                      <div>
                        <div className="fw-bold text-dark">{request.garageId.name}</div>
                        <div className="text-muted small">Contact: {request.garageId.phone || 'N/A'}</div>
                        <div className="text-muted small">Area: {request.garageId.address || 'N/A'}</div>
                      </div>
                    </div>
                  )}

                  {request.helperId && (
                    <div className="d-flex align-items-start gap-3">
                      <div style={{ fontSize: '2rem' }}>🧑‍🔧</div>
                      <div>
                        <div className="fw-bold text-dark">{request.helperId.name}</div>
                        <div className="text-muted small">Designation: Service Helper</div>
                        <div className="text-muted small">Contact: {request.helperId.phone || 'N/A'}</div>
                      </div>
                    </div>
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
    </div>
  );
};

export default TrackRequest;
