import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { io } from 'socket.io-client';
import CustomDropdown from '../components/CustomDropdown';

const MyBookings = () => {
  const { user } = useAuth();
  const { toast, confirm } = useNotification();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [garagesList, setGaragesList] = useState([]);
  const [availableHelpersList, setAvailableHelpersList] = useState([]);
  const [assignGarageId, setAssignGarageId] = useState('');
  const [assignHelperId, setAssignHelperId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

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
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const garagesRes = await fetch(`${API_BASE}/api/garages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const garagesData = await garagesRes.json();

      const helpersRes = await fetch(`${API_BASE}/api/admin/available-helpers`, {
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
          helperId: assignHelperId
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

  return (
    <div className="container py-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <h3 className="fw-bold mb-4">My Bookings</h3>

      {bookings.length > 0 ? (
        <div className="row g-4">
          {bookings.map(booking => {
            const dateStr = booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString() : 'N/A';
            const timeStr = booking.preferredDate ? new Date(booking.preferredDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
            const pickupStr = booking.location && booking.location.address !== 'Self Drop at Garage' ? 'Free Pickup' : 'Self Drop';
            const servicesList = [booking.serviceType ? booking.serviceType.replace('_', ' ').toUpperCase() : 'GENERAL SERVICE'];
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
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            width: '100%',
            maxWidth: '500px',
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

            <div className="mb-3 p-3 bg-light rounded-3">
              <div className="small text-muted fw-semibold">Request details</div>
              <div className="fw-semibold text-dark mt-1">{selectedRequest.userId?.name || 'Unknown User'}</div>
              <div className="small text-secondary">{selectedRequest.vehicleId ? `${selectedRequest.vehicleId.make} ${selectedRequest.vehicleId.model} (${selectedRequest.vehicleId.year})` : 'Unknown Vehicle'}</div>
              <div className="small text-secondary mt-1">Issue: {selectedRequest.description}</div>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Select Garage *</label>
                <CustomDropdown
                  name="garageId"
                  placeholder="Choose Garage..."
                  options={garagesList.map(g => ({
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
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Select Helper *</label>
                <CustomDropdown
                  name="helperId"
                  placeholder={assignGarageId ? "Choose Helper..." : "Please select a garage first"}
                  options={availableHelpersList
                    .filter(h => h.garageId?._id === assignGarageId)
                    .map(h => ({
                      value: h._id,
                      label: `${h.name} (⭐ ${h.rating || 5} / 5)`
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
                  disabled={submittingAssign || !assignGarageId || !assignHelperId}
                >
                  {submittingAssign ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
