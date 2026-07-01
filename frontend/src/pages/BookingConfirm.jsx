import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const BookingConfirm = () => {
  const { id } = useParams();

  // Mock booking data
  const booking = {
    id: id || '1042',
    garage: { name: 'SuperTech Auto Garage' },
    booking_date: 'Jun 28, 2026',
    booking_time: '10:00 AM',
    get_pickup_type_display: 'Free Pickup',
    get_status_display: 'Confirmed',
    services: [
      { service: { name: 'Full Car Service' } },
      { service: { name: 'AC Gas Topup' } }
    ],
    total_price: '648'
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 text-center">
          <div className="confirmation-icon mb-4" style={{ fontSize: '4rem' }}>✅</div>
          <h2 className="fw-bold mb-2">Booking Confirmed!</h2>
          <p className="text-muted mb-4">
            Your booking #{booking.id} has been placed successfully. You'll receive a confirmation shortly.
          </p>

          <div className="card border-0 shadow-sm text-start mb-4">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3 border-bottom pb-2">Booking Details</h6>
              <div className="row g-3">
                <div className="col-6">
                  <div className="text-muted small">Garage</div>
                  <div className="fw-semibold">{booking.garage.name}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted small">Date &amp; Time</div>
                  <div className="fw-semibold">{booking.booking_date} at {booking.booking_time}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted small">Pickup Type</div>
                  <div className="fw-semibold">{booking.get_pickup_type_display}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted small">Status</div>
                  <span className="badge bg-warning text-dark">{booking.get_status_display}</span>
                </div>
                <div className="col-6">
                  <div className="text-muted small">Services</div>
                  {booking.services.map((s, idx) => (
                    <div key={idx} className="fw-semibold small">{s.service.name}</div>
                  ))}
                </div>
                <div className="col-6">
                  <div className="text-muted small">Total</div>
                  <div className="fw-bold fs-5" style={{ color: '#ff6b35' }}>AED {booking.total_price}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex gap-3 justify-content-center">
            <Link to="/bookings" className="btn btn-primary-garro px-4">View My Bookings</Link>
            <Link to="/home" className="btn btn-outline-secondary px-4">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirm;
