import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const BookingDetails = () => {
  // Mock bookings
  const [bookings, setBookings] = useState([
    {
      id: 1042,
      garageName: 'SuperTech Auto Garage',
      area: 'Al Quoz',
      services: ['Oil Change', 'Filter Replacement'],
      date: 'Jun 28, 2026',
      time: '10:00 AM',
      totalPrice: 250,
      pickupType: 'Self Drop',
      status: 'confirmed'
    },
    {
      id: 1039,
      garageName: 'Elite Motors Service',
      area: 'Deira',
      services: ['A/C Service'],
      date: 'Jun 15, 2026',
      time: '02:30 PM',
      totalPrice: 150,
      pickupType: 'Free Pickup',
      status: 'completed'
    }
  ]);

  const handleCancel = (id) => {
    if (window.confirm('Cancel this booking?')) {
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <span className="badge bg-success py-2 px-3 mb-2">Confirmed</span>;
      case 'pending': return <span className="badge bg-warning text-dark py-2 px-3 mb-2">Pending</span>;
      case 'in_progress': return <span className="badge bg-info text-dark py-2 px-3 mb-2">In Progress</span>;
      case 'completed': return <span className="badge bg-secondary py-2 px-3 mb-2">Completed</span>;
      case 'cancelled': return <span className="badge bg-danger py-2 px-3 mb-2">Cancelled</span>;
      default: return <span className="badge bg-secondary py-2 px-3 mb-2">{status}</span>;
    }
  };

  return (
    <div className="container py-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <h3 className="fw-bold mb-4">My Bookings</h3>
      {bookings.length > 0 ? (
        <div className="row g-3">
          {bookings.map(booking => (
            <div key={booking.id} className="col-12">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                  <div className="row g-3 align-items-center">
                    <div className="col-md-3">
                      <div className="text-muted small mb-1">Booking #{booking.id}</div>
                      <div className="fw-bold text-dark">{booking.garageName}</div>
                      <div className="text-muted small">{booking.area}</div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-muted small">Services</div>
                      {booking.services.length > 0 ? (
                        booking.services.map((s, idx) => <div key={idx} className="small text-dark">{s}</div>)
                      ) : (
                        <div className="small text-muted">N/A</div>
                      )}
                    </div>
                    <div className="col-md-2">
                      <div className="text-muted small">Date &amp; Time</div>
                      <div className="small fw-medium text-dark">{booking.date}</div>
                      <div className="small text-muted">{booking.time}</div>
                    </div>
                    <div className="col-md-2">
                      <div className="text-muted small">Total</div>
                      <div className="fw-bold" style={{ color: 'var(--brand)' }}>AED {booking.totalPrice}</div>
                      <div className="text-muted small">{booking.pickupType}</div>
                    </div>
                    <div className="col-md-2 text-md-end">
                      {getStatusBadge(booking.status)}
                      {['pending', 'confirmed'].includes(booking.status) && (
                        <div>
                          <button 
                            className="btn btn-outline-danger btn-sm mt-2" 
                            style={{ borderRadius: '8px', fontSize: '13px' }}
                            onClick={() => handleCancel(booking.id)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <div style={{ fontSize: '4rem' }}>📋</div>
          <h5 className="fw-bold mt-3 text-dark">No bookings yet</h5>
          <p className="text-muted">Start by finding a garage and booking a service.</p>
          <Link to="/get-quote" className="btn btn-primary-garro mt-2">Book Now</Link>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
