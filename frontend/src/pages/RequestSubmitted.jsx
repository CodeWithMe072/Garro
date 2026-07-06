import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const RequestSubmitted = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchRequest = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/requests/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setRequest(data.request);
        }
      } catch (err) {
        console.error('Failed to load request details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const dateStr = request?.preferredDate ? new Date(request.preferredDate).toLocaleDateString('en-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Flexible';
  const serviceTypeStr = request?.serviceType ? request.serviceType.replace(/_/g, ' ').toUpperCase() : 'GENERAL SERVICE';

  return (
    <div style={{ minHeight: '85vh', background: '#f8fafc', padding: '60px 16px', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', width: '100%' }}>
        <div style={{
          background: 'white',
          borderRadius: 24,
          padding: '48px 36px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          textAlign: 'center',
          border: '1px solid #f1f5f9'
        }}>
          
          {/* Success Checkmark Circle */}
          <div style={{
            width: 90, height: 90, borderRadius: '50%',
            background: 'linear-gradient(135deg, #185FA5, #1e7bc2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: 44, color: 'white',
            boxShadow: '0 8px 24px rgba(24,95,165,0.2)'
          }}>
            ✓
          </div>

          <h2 style={{ fontWeight: 800, color: '#1a1a2e', marginBottom: 12, fontSize: 26 }}>
            Request Submitted!
          </h2>
          <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6, maxWidth: 500, margin: '0 auto 32px' }}>
            We've received your request. Our system is finding the best top-rated garages in your area to prepare a quote for you.
          </p>

          {/* Details Card */}
          {!loading && request && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              padding: 24,
              textAlign: 'left',
              marginBottom: 32
            }}>
              <h6 style={{ fontWeight: 800, color: '#1a1a2e', marginBottom: 16, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                📋 Request Details
              </h6>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Request ID</div>
                  <strong style={{ fontSize: 13, color: '#1a1a2e' }}>#{id.slice(-8).toUpperCase()}</strong>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Service Category</div>
                  <strong style={{ fontSize: 13, color: '#1a1a2e' }}>{serviceTypeStr}</strong>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Vehicle Info</div>
                  <strong style={{ fontSize: 13, color: '#1a1a2e' }}>
                    {request.vehicleId?.make || request.make || 'Toyota'} {request.vehicleId?.model || request.model || 'Camry'} ({request.vehicleId?.year || request.year || '2020'})
                  </strong>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Preferred Time</div>
                  <strong style={{ fontSize: 13, color: '#1a1a2e' }}>{dateStr}</strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Location</div>
                  <strong style={{ fontSize: 13, color: '#1a1a2e' }}>{request.location?.address || 'Dubai, UAE'}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Stepper / Timeline Explanation */}
          <div style={{ textAlign: 'left', maxWidth: 520, margin: '0 auto 36px' }}>
            <h6 style={{ fontWeight: 800, color: '#1a1a2e', marginBottom: 16, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              What happens next?
            </h6>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { step: '1', title: 'Finding Garages', desc: 'Garro invites top-rated local garages matching your service requirements to quote.' },
                { step: '2', title: 'Receive & Approve Quotes', desc: 'Review the detailed quotes, pricing breakdown, and select your preferred garage.' },
                { step: '3', title: 'Helper Dispatched', desc: 'Once paid, a dedicated helper is assigned to pick up your car and take it to the garage.' }
              ].map((s, index) => (
                <div key={s.step} style={{ display: 'flex', gap: 16 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: index === 0 ? '#185FA5' : '#e2e8f0',
                    color: index === 0 ? 'white' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2
                  }}>{s.step}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 14 }}>{s.title}</div>
                    <div style={{ color: '#64748b', fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/track/${id}`} style={{
              background: 'linear-gradient(135deg, #185FA5, #1e7bc2)',
              color: 'white',
              padding: '14px 28px',
              borderRadius: 10,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 14,
              boxShadow: '0 4px 12px rgba(24,95,165,0.15)'
            }}>
              🔍 Live Tracking
            </Link>
            <Link to="/my-requests" style={{
              background: 'white',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '14px 28px',
              borderRadius: 10,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 14
            }}>
              📋 View All Bookings
            </Link>
            <Link to="/home" style={{
              background: 'none',
              color: '#94a3b8',
              padding: '14px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 13,
              width: '100%',
              textAlign: 'center'
            }}>
              ← Back to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RequestSubmitted;
