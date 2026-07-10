import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { io } from 'socket.io-client';
import CustomDropdown from '../components/CustomDropdown';
import AdminSidebar from '../components/AdminSidebar';

  const MyBookings = () => {
  const { user } = useAuth();
  const { toast, confirm } = useNotification();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogServices, setCatalogServices] = useState([]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/vehicles/catalog/services`);
        const data = await res.json();
        if (data.success && data.categories) {
          setCatalogServices(data.categories);
        }
      } catch (err) {
        console.error('Failed to load catalog services:', err);
      }
    };
    fetchCatalog();
  }, []);

  const getMatchingGarages = (req, garages) => {
    if (!req) return [];
    
    const reqSub = req.subCategory?.toLowerCase()?.trim() || req.serviceType?.toLowerCase()?.trim();
    let parentCatName = '';
    let parentCatSlug = '';
    
    for (const cat of catalogServices) {
      if (cat.slug?.toLowerCase()?.trim() === reqSub || cat.name?.toLowerCase()?.trim() === reqSub) {
        parentCatName = cat.name;
        parentCatSlug = cat.slug;
        break;
      }
      if (cat.subCategories) {
        const foundSub = cat.subCategories.find(sub => 
          sub.slug?.toLowerCase()?.trim() === reqSub || sub.name?.toLowerCase()?.trim() === reqSub
        );
        if (foundSub) {
          parentCatName = cat.name;
          parentCatSlug = cat.slug;
          break;
        }
      }
    }
    
    if (!parentCatName) {
      const sub = reqSub || '';
      if (sub.includes('minor') || sub.includes('oil') || sub.includes('mainten')) {
        parentCatName = 'General Maintenance';
        parentCatSlug = 'general_maintenance';
      } else if (sub.includes('ac') || sub.includes('aircond') || sub.includes('elect') || sub.includes('diagn') || sub.includes('inspect') || sub.includes('batter')) {
        parentCatName = 'Electrical & AC';
        parentCatSlug = 'electrical_ac';
      } else if (sub.includes('brake') || sub.includes('mechan')) {
        parentCatName = 'Mechanical Repair';
        parentCatSlug = 'mechanical_repair';
      } else {
        parentCatName = 'Mechanical Repair';
        parentCatSlug = 'mechanical_repair';
      }
    }

    const cleanParentName = parentCatName.toLowerCase().trim();
    const cleanParentSlug = parentCatSlug.toLowerCase().trim();
    const reqAddress = req.location?.address || '';
    const reqArea = reqAddress.includes(',') 
      ? reqAddress.split(',')[0].trim().toLowerCase() 
      : reqAddress.trim().toLowerCase();

    return garages.filter(g => {
      const supportsService = g.services && g.services.some(srv => {
        const cleanSrv = srv.toLowerCase().trim();
        return cleanSrv === cleanParentName || cleanSrv === cleanParentSlug || cleanSrv === reqSub || cleanSrv.includes(cleanParentName) || cleanParentName.includes(cleanSrv);
      });
      
      const coversArea = !reqArea || reqArea === 'self drop at garage' || (g.areas && g.areas.some(area => {
        const cleanArea = area.toLowerCase().trim();
        return reqArea.includes(cleanArea) || cleanArea.includes(reqArea);
      }));
      
      return supportsService && coversArea;
    });
  };

  const [selectedRequest, setSelectedRequest] = useState(null);
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

  // Working hours: 9AM-9PM (must match backend)
  const WORK_START = 9 * 60;  // 9:00 in minutes
  const WORK_END   = 21 * 60; // 21:00 in minutes

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
        setHelperSchedule(slots);

        // Conflict check (mirrors backend logic exactly)
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
          const conflict = slots.some(slot => {
            const sStart = new Date(slot.startTime);
            const bEnd   = new Date(slot.bufferEndTime || slot.endTime);
            const slotStartMin  = sStart.getHours() * 60 + sStart.getMinutes();
            const bufferEndMin  = bEnd.getHours()   * 60 + bEnd.getMinutes();
            return proposedStart < bufferEndMin && proposedEnd > slotStartMin;
          });

          if (conflict) {
            const slot = slots.find(slot => {
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
  }, [assignHelperId, assignDate, assignTime, assignDuration]);

  const fetchBookings = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setBookings(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    // Socket.IO Listeners
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(API_BASE);

    socket.on('request:new', (data) => {
      console.log('Real-time new request received in Bookings:', data);
      fetchBookings();
    });

    socket.on('request:assigned', (data) => {
      console.log('Real-time request assigned received in Bookings:', data);
      fetchBookings();
    });

    socket.on('request:cancelled', (data) => {
      console.log('Real-time request cancelled received in Bookings:', data);
      fetchBookings();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenAssignModal = async (req) => {
    setSelectedRequest(req);
    setAssignGarageId('');
    setAssignHelperId('');

    // Smart date pre-fill based on customer urgency
    const urgency = req.urgency || 'flexible';
    let reqDate = new Date();
    if (urgency === 'asap') {
      reqDate.setMinutes(0, 0, 0);
      reqDate.setHours(reqDate.getHours() + 1);
    } else if (urgency === 'today') {
      reqDate.setMinutes(0, 0, 0);
      reqDate.setHours(reqDate.getHours() + 2);
    } else if (req.preferredDate) {
      reqDate = new Date(req.preferredDate);
    }
    const fmt = (n) => String(n).padStart(2, '0');
    setAssignDate(`${reqDate.getFullYear()}-${fmt(reqDate.getMonth() + 1)}-${fmt(reqDate.getDate())}`);
    setAssignTime(`${fmt(reqDate.getHours())}:${fmt(reqDate.getMinutes())}`);
    setAssignDuration(urgency === 'asap' ? '2' : '4');

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
        setAvailableHelpersList(helpersData.helpers || []);
      }
    } catch (err) {
      console.error('Failed to fetch modal lists:', err);
    }
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
      
      const response = await fetch(`${API_BASE}/api/admin/requests/${selectedRequest._id}/manual-assign`, {
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
        toast.success("Request manual assignment completed successfully!");
        setSelectedRequest(null);
        fetchBookings();
      } else {
        toast.error(data.message || "Failed to complete manual assignment.");
      }
    } catch (err) {
      console.error("Error during manual assignment:", err);
      toast.error("Error during assignment.");
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleCancel = async (id) => {
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
          const response = await fetch(`${API_BASE}/api/requests/${id}/cancel`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (response.ok && data.success) {
            toast.success('Booking cancelled successfully.');
            fetchBookings();
          } else {
            toast.error(data.message || 'Failed to cancel booking.');
          }
        } catch (err) {
          console.error('Error cancelling booking:', err);
          toast.error('Error cancelling booking.');
        }
      }
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'assigned': return <span className="badge bg-success py-2 px-3 mb-2">Assigned</span>;
      case 'new': return <span className="badge bg-warning text-dark py-2 px-3 mb-2">New</span>;
      case 'quote_pending': return <span className="badge bg-info text-dark py-2 px-3 mb-2">Quote Pending</span>;
      case 'in_garage': return <span className="badge bg-info text-dark py-2 px-3 mb-2">In Garage</span>;
      case 'completed': return <span className="badge bg-secondary py-2 px-3 mb-2">Completed</span>;
      case 'cancelled': return <span className="badge bg-danger py-2 px-3 mb-2">Cancelled</span>;
      default: return <span className="badge bg-secondary py-2 px-3 mb-2">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="mt-3">Loading your bookings...</h5>
      </div>
    );
  }

  const isAdmin = ['manager', 'superadmin', 'admin'].includes(user?.role);

  const renderContent = () => (
    <div className="container py-5" style={{ minHeight: 'calc(100vh - 80px)', width: '100%' }}>
      <h3 className="fw-bold mb-4">My Bookings</h3>

      {bookings.length > 0 ? (
        <div className="row g-4">
          {bookings.map(booking => {
            const dateStr = booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString() : 'N/A';
            const timeStr = booking.preferredDate ? new Date(booking.preferredDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
            const pickupStr = booking.location && booking.location.address !== 'Self Drop at Garage' ? 'Free Pickup' : 'Self Drop';
            const servicesList = [booking.subCategory ? booking.subCategory.replace(/_/g, ' ').toUpperCase() : (booking.serviceType ? booking.serviceType.replace('_', ' ').toUpperCase() : 'GENERAL SERVICE')];
            const priceVal = booking.estimatedCost || 299;

            return (
              <div key={booking._id} className="col-12 col-xl-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                    <span className="text-muted small fw-medium">Booking #{booking._id.substring(18)}</span>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                      <div className="garage-icon-wrapper me-3" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.5rem' }}>🏪</span>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">{booking.garageId ? booking.garageId.name : 'Pending Assignment'}</h6>
                        <span className="text-muted small">
                          <i className="bi bi-geo-alt me-1"></i>
                          {booking.location ? booking.location.address : 'Dubai'}
                        </span>
                      </div>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-6">
                        <div className="text-muted small mb-1">Date &amp; Time</div>
                        <div className="fw-semibold small">{dateStr} at {timeStr}</div>
                      </div>
                      <div className="col-6">
                        <div className="text-muted small mb-1">Pickup</div>
                        <div className="fw-semibold small">{pickupStr}</div>
                      </div>
                      <div className="col-12">
                        <div className="text-muted small mb-1">Services</div>
                        {servicesList.map((service, index) => (
                          <span key={index} className="badge bg-light text-dark me-2 mb-1">{service}</span>
                        ))}
                      </div>
                      <div className="col-12 mt-3">
                        <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
                          <span className="fw-semibold text-muted">Estimated Cost</span>
                          <span className="fw-bold fs-5" style={{ color: '#ff6b35' }}>AED {priceVal}</span>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <Link 
                        to={`/track/${booking._id}`}
                        className="btn btn-outline-primary btn-sm w-100 py-2 fw-semibold"
                        style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
                      >
                        View Details
                      </Link>
                      
                      {booking.status === 'new' && ['superadmin', 'manager', 'admin'].includes(user?.role) && (
                        <button 
                          onClick={() => handleOpenAssignModal(booking)}
                          className="btn btn-primary-garro btn-sm w-100 py-2 text-white fw-semibold"
                        >
                          Assign Garage
                        </button>
                      )}

                      {['new', 'assigned', 'quote_pending'].includes(booking.status) && (
                        <button 
                          onClick={() => handleCancel(booking._id)}
                          className="btn btn-outline-danger btn-sm w-100 py-2 fw-semibold"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {booking.status === 'completed' && booking.garageId && (
                        <Link to={`/garage/${booking.garageId._id}`} className="btn btn-primary-garro btn-sm w-100 py-2 fw-semibold">
                          Review Garage
                        </Link>
                      )}
                      {booking.status === 'approved' && user?.role === 'customer' && (
                        <div style={{ width: '100%' }}>
                          <button
                            onClick={() => navigate(`/payment?quoteId=${booking.quoteId || booking._id}`)}
                            className="btn btn-sm w-100 py-2 fw-bold"
                            style={{ background: 'linear-gradient(135deg, #185FA5, #1e7bc2)', color: 'white', border: 'none' }}
                          >
                            💳 Pay Now
                          </button>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-5 bg-white rounded-3 shadow-sm">
          <div style={{ fontSize: '4rem', opacity: 0.5, marginBottom: '20px' }}>🗓️</div>
          <h5 className="fw-bold">No bookings yet</h5>
          <p className="text-muted">You haven't made any garage bookings yet.</p>
          <Link to="/get-quote" className="btn btn-primary-garro mt-2">Book Now</Link>
        </div>
      )}

      {/* Assignment Modal Overlay */}
      {selectedRequest && (
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
                onClick={() => setSelectedRequest(null)}
                className="btn-close"
                style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div className="mb-3 p-3 rounded-3" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
              <div className="small text-muted fw-semibold mb-2">📋 Request Details</div>
              <div className="fw-bold text-dark">{selectedRequest.userId?.name || 'Unknown User'}</div>
              <div className="small text-secondary">{selectedRequest.vehicleId ? `${selectedRequest.vehicleId.make} ${selectedRequest.vehicleId.model} (${selectedRequest.vehicleId.year})` : 'Unknown Vehicle'}</div>
              <div className="small text-secondary mt-1">Issue: {selectedRequest.description}</div>
              <hr className="my-2" style={{ borderColor: '#bae6fd' }} />
              <div className="d-flex gap-3 flex-wrap">
                <div>
                  <div className="small text-muted">Customer Urgency</div>
                  <span className={`badge mt-1 px-2 py-1 ${
                    selectedRequest.urgency === 'asap' ? 'bg-danger' :
                    selectedRequest.urgency === 'today' ? 'bg-warning text-dark' :
                    selectedRequest.urgency === 'this_week' ? 'bg-info text-dark' : 'bg-secondary'
                  }`} style={{ fontSize: '11px' }}>
                    {selectedRequest.urgency === 'asap' ? '🚨 ASAP — Urgent' :
                     selectedRequest.urgency === 'today' ? '📅 Today' :
                     selectedRequest.urgency === 'this_week' ? '📆 This Week' : '⏳ Flexible'}
                  </span>
                </div>
                {selectedRequest.preferredDate && (
                  <div>
                    <div className="small text-muted">Preferred Date/Time</div>
                    <div className="small fw-semibold text-dark mt-1">
                      📅 {new Date(selectedRequest.preferredDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
                      🕐 {new Date(selectedRequest.preferredDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  options={getMatchingGarages(selectedRequest, garagesList)
                    .map(g => ({
                      value: g._id,
                      label: `${g.name} - AED ${selectedRequest ? (selectedRequest.estimatedCost || 299) : 299}`
                    }))}
                  value={assignGarageId}
                  onChange={(val) => {
                    setAssignGarageId(val);
                    setAssignHelperId('');
                  }}
                  required
                />
                {selectedRequest && getMatchingGarages(selectedRequest, garagesList).length === 0 && (
                  <p className="text-danger small mt-1">
                    ⚠️ No garages found supporting <strong>{(selectedRequest.subCategory || selectedRequest.serviceType)?.replace('_',' ')}</strong> in area <strong>"{selectedRequest.location?.address || 'N/A'}"</strong>.
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
                      label: `${h.name} (⭐ ${h.rating || 5}/5) ${!h.isAvailable ? '[⚠️ Shift Conflict]' : (h.upcomingSlots && h.upcomingSlots.length > 0 ? `[${h.upcomingSlots.length} job(s)]` : '[Free]')}`
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

              {/* ── Scheduling section ── */}
              <div className="p-3 mb-3 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
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
                <div>
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
                {assignDate && assignTime && (
                  <div className="mt-3">
                    {/* Visual Timeline */}
                    <div className="small fw-semibold text-dark mb-1">
                      📊 Helper Schedule — {assignDate}
                      {scheduleLoading && <span className="text-muted ms-2" style={{ fontWeight: 'normal' }}>Loading...</span>}
                    </div>

                    {/* Legend */}
                    <div className="d-flex gap-3 mb-2 flex-wrap" style={{ fontSize: '11px' }}>
                      <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#94a3b8', marginRight:4 }}></span>Off hours</span>
                      <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#ef4444', marginRight:4 }}></span>Booked</span>
                      <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#f59e0b', marginRight:4 }}></span>Recovery buffer</span>
                      <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#f97316', marginRight:4 }}></span>Your slot</span>
                      <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#22c55e', marginRight:4 }}></span>Free</span>
                    </div>

                    {/* Hour Grid 6AM–10PM */}
                    {(() => {
                      const HOURS_START = 6;
                      const HOURS_END   = 22;
                      const W_START = WORK_START; // 9*60
                      const W_END   = WORK_END;   // 21*60

                      // Proposed block
                      const [ph, pm] = assignTime.split(':').map(Number);
                      const propStart = ph * 60 + pm;
                      const propEnd   = propStart + Number(assignDuration) * 60;

                      // Build busy intervals (actual job time)
                      const busyIntervals = helperSchedule.map(slot => {
                        const s = new Date(slot.startTime);
                        const e = new Date(slot.endTime);
                        return {
                          start: s.getHours() * 60 + s.getMinutes(),
                          end:   e.getHours() * 60 + e.getMinutes(),
                          label: slot.serviceType?.replace('_',' ') || 'Job'
                        };
                      });

                      // Build buffer intervals (after each job, job-duration length, max 4hrs)
                      const bufferIntervals = helperSchedule.map(slot => {
                        const jobEnd = new Date(slot.endTime);
                        const bufEnd = new Date(slot.bufferEndTime || slot.endTime);
                        return {
                          start: jobEnd.getHours() * 60 + jobEnd.getMinutes(),
                          end:   bufEnd.getHours() * 60 + bufEnd.getMinutes(),
                          label: `Recovery buffer (${slot.bufferHours || '?'}h after job)`
                        };
                      });

                      // Render each 30-min cell
                      const cells = [];
                      for (let t = HOURS_START * 60; t < HOURS_END * 60; t += 30) {
                        const tEnd       = t + 30;
                        const isOffHours = t < W_START || tEnd > W_END;
                        const isBusy     = !isOffHours && busyIntervals.some(b => t < b.end && tEnd > b.start);
                        const isBuffer   = !isOffHours && !isBusy && bufferIntervals.some(b => t < b.end && tEnd > b.start);
                        const isProp     = !isOffHours && t < propEnd && tEnd > propStart;
                        const isConflCell = isProp && (isBusy || isBuffer || isOffHours);
                        const h = Math.floor(t / 60), min = t % 60;
                        const lbl = min === 0 ? `${h > 12 ? h-12 : h === 0 ? 12 : h}${h >= 12 ? 'pm' : 'am'}` : '';

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
                          <div key={t} title={titleStr} style={{
                            flex: 1, height: '28px', background: bg,
                            borderRight: '1px solid rgba(255,255,255,0.2)',
                            position: 'relative', cursor: 'default'
                          }}>
                            {lbl && <span style={{ position:'absolute', top:'100%', left:0, fontSize:'9px', color:'#64748b', whiteSpace:'nowrap', marginTop:'2px' }}>{lbl}</span>}
                          </div>
                        );
                      }

                      return (
                        <div>
                          <div style={{ display:'flex', borderRadius:'8px', overflow:'hidden', border:'1px solid #e2e8f0', height:'28px' }}>{cells}</div>
                          <div style={{ height:'18px' }}></div>
                        </div>
                      );
                    })()}

                    {/* Conflict / OK Alert */}
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
                  onClick={() => setSelectedRequest(null)}
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

  if (isAdmin) {
    return (
      <div className="dash-wrapper">
        <AdminSidebar pendingBookings={bookings.filter(b => b.status === 'new').length} />
        <main className="dash-main w-100" style={{ padding: '0 2rem' }}>
          {renderContent()}
        </main>
      </div>
    );
  }

  return renderContent();
};

export default MyBookings;
