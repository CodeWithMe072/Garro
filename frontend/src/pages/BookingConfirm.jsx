import { API_BASE } from '../config/api';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  LuCircleCheck, LuCalendar, LuClock, LuTruck, LuWrench,
  LuMapPin, LuCreditCard, LuHouse, LuClipboardList,
  LuLoader
} from 'react-icons/lu';

const BookingConfirm = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fixed: was /api/bookings/:id (non-existent route) — now uses the real requests endpoint
        const res = await fetch(`${API_BASE}/api/requests/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setBooking(data.request); // Request controller returns { success, request }
        }
      } catch {
        // fall through — booking stays null, show fallback
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBooking();
    else setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#64748b' }}>
          <LuLoader size={32} color="#ff5c1a" className="animate-spin" />
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '14px' }}>Loading booking details...</span>
        </div>
      </div>
    );
  }

  // Map Request schema fields to display values
  const displayId = booking?._id?.slice(-6)?.toUpperCase() || id?.slice(-6)?.toUpperCase() || 'N/A';
  const garageName = booking?.garageId?.name || 'Garro Partner Garage';
  const garageArea = booking?.garageId?.area || booking?.garageId?.city || 'Dubai';
  const bookingDate = booking?.preferredDate
    ? new Date(booking.preferredDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'TBC';
  const bookingTime = booking?.preferredDate
    ? new Date(booking.preferredDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : 'TBC';
  const pickupType = booking?.location?.address === 'Self Drop at Garage' ? 'Self Drop' : 'Pickup & Drop';
  const status = booking?.status || 'pending_payment';
  // Total from linked quote if available, else show pending
  const total = booking?.quoteId?.customerTotal || booking?.quoteId?.totalAmount || null;
  // Service from the serviceType / subCategory fields
  const services = booking?.serviceType
    ? [{ name: (booking.subCategory || booking.serviceType).replace(/_/g, ' ') }]
    : [];

  const statusColor = status === 'pending_payment' ? '#f59e0b'
    : status === 'new' ? '#3b82f6'
    : status === 'assigned' ? '#8b5cf6'
    : status === 'closed' || status === 'delivered' ? '#10b981'
    : status === 'cancelled' ? '#ef4444'
    : '#64748b';
  const statusLabel = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const details = [
    { icon: LuMapPin,    label: 'Garage',       value: garageName,    sub: garageArea },
    { icon: LuCalendar,  label: 'Date',          value: bookingDate,   sub: null },
    { icon: LuClock,     label: 'Time',          value: bookingTime,   sub: null },
    { icon: LuTruck,     label: 'Pickup Type',   value: pickupType,    sub: null },
    { icon: LuCreditCard,label: 'Total Amount',  value: total ? `AED ${Number(total).toFixed(2)}` : 'Pending Quote', sub: null, highlight: true },
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - var(--nav-h))', padding: '60px 0' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7">

            {/* Success Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{
                width: '88px', height: '88px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.06))',
                border: '2px solid rgba(16,185,129,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', color: '#10b981'
              }}>
                <LuCircleCheck size={44} strokeWidth={1.5} />
              </div>
              <h1 style={{
                fontSize: '28px', fontWeight: 900, color: '#0f172a',
                fontFamily: "'Poppins', sans-serif", marginBottom: '10px'
              }}>
                Booking Confirmed!
              </h1>
              <p style={{ color: '#64748b', fontSize: '14.5px', lineHeight: 1.65, fontFamily: "'Poppins', sans-serif" }}>
                Your booking <strong style={{ color: '#0f172a' }}>#{displayId}</strong> has been placed successfully.<br />
                You'll receive a confirmation SMS and email shortly.
              </p>
            </div>

            {/* Booking Details Card */}
            <div style={{
              background: '#fff', border: '1.5px solid #e2e8f0',
              borderRadius: '24px', padding: '32px', marginBottom: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h5 style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', fontFamily: "'Poppins', sans-serif", margin: 0 }}>
                  Booking Details
                </h5>
                <span style={{
                  background: `${statusColor}15`, color: statusColor,
                  border: `1px solid ${statusColor}40`,
                  borderRadius: '50px', padding: '4px 14px',
                  fontSize: '12px', fontWeight: 700, fontFamily: "'Poppins', sans-serif"
                }}>
                  {statusLabel}
                </span>
              </div>

              <div className="row g-3">
                {details.map(({ icon: Icon, label, value, sub, highlight }) => (
                  <div className="col-6" key={label}>
                    <div style={{
                      background: '#f8fafc', border: '1px solid #f1f5f9',
                      borderRadius: '12px', padding: '14px 16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Icon size={14} color="#94a3b8" />
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: "'Poppins', sans-serif" }}>
                          {label}
                        </span>
                      </div>
                      <div style={{
                        fontSize: highlight ? '18px' : '14px',
                        fontWeight: 800,
                        color: highlight ? '#ff5c1a' : '#0f172a',
                        fontFamily: "'Poppins', sans-serif"
                      }}>
                        {value}
                      </div>
                      {sub && <div style={{ fontSize: '12px', color: '#64748b', fontFamily: "'Poppins', sans-serif", marginTop: '2px' }}>{sub}</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Services booked */}
              {services.length > 0 && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '12px', fontFamily: "'Poppins', sans-serif" }}>
                    Services Booked
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {services.map((s, idx) => (
                      <div key={idx} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(255,92,26,0.06)', border: '1px solid rgba(255,92,26,0.15)',
                        borderRadius: '8px', padding: '5px 12px',
                        fontSize: '13px', fontWeight: 600, color: '#ff5c1a',
                        fontFamily: "'Poppins', sans-serif"
                      }}>
                        <LuWrench size={13} />
                        {s.name || s.service?.name || `Service ${idx + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* What's Next card */}
            <div style={{
              background: 'linear-gradient(135deg, #fffcf9, #fff8f2)',
              border: '1.5px solid #ffe8dd', borderRadius: '20px', padding: '24px',
              marginBottom: '28px'
            }}>
              <h6 style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', fontFamily: "'Poppins', sans-serif", marginBottom: '14px' }}>
                What Happens Next?
              </h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'You will receive a booking confirmation via SMS and email.',
                  'Our team will review and assign a helper to your request within 2 hours.',
                  'Arrive at the scheduled time or our driver will pick up your car.',
                  'Track your service status live from My Requests.'
                ].map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: '#ff5c1a', color: '#fff', fontSize: '11px', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontFamily: "'Poppins', sans-serif", marginTop: '1px'
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.5, fontFamily: "'Poppins', sans-serif" }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/my-requests"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)',
                  color: '#fff', textDecoration: 'none', borderRadius: '12px',
                  padding: '13px 28px', fontWeight: 700, fontSize: '14.5px',
                  fontFamily: "'Poppins', sans-serif",
                  boxShadow: '0 6px 20px rgba(255,92,26,0.3)'
                }}
              >
                <LuClipboardList size={18} /> View My Requests
              </Link>
              <Link
                to="/home"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: '#fff', color: '#0f172a', textDecoration: 'none',
                  border: '1.5px solid #e2e8f0', borderRadius: '12px',
                  padding: '13px 28px', fontWeight: 700, fontSize: '14.5px',
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                <LuHouse size={18} /> Back to Home
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirm;
