import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

const MyQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const { toast } = useNotification();
  const navigate = useNavigate();
  const { t } = useLanguage();

  
  const fetchQuotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/quotes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch quotes.');
      }
      // Filter only pending/sent quotes
      setQuotes((data.quotes || []).filter(q => q.status === 'sent'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();

    // Setup timer to tick every second for the countdowns
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/quotes/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Approval failed.');
      }
      toast.success('Quote approved! Job created and helper dispatched.');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Warning: Rejecting this quote will cancel and delete your service request completely. Proceed?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/quotes/${id}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Rejection failed.');
      }
      toast.info('Quote rejected. Request deleted.');
      fetchQuotes();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Helper to format remaining time
  const getRemainingTime = (validUntilStr) => {
    const validUntil = new Date(validUntilStr).getTime();
    const diff = validUntil - now;
    if (diff <= 0) return 'Expired';

    const secs = Math.floor((diff / 1000) % 60);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} remaining`;
  };

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      color: '#f8fafc',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Navigation */}
        <div style={{ marginBottom: '24px' }}>
          <button onClick={() => navigate('/home')} style={{
            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline'
          }}>
            ← Return Home
          </button>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '32px', letterSpacing: '-0.025em' }}>
          ✉️ {t('my_service_quotes')}
        </h1>

        {loading ? (
          <p style={{ color: '#64748b' }}>{t('loading')}</p>
        ) : quotes.length === 0 ? (
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '50px 20px', textAlign: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>✉️</span>
            {t('no_quotes')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {quotes.map(q => {
              const timerText = getRemainingTime(q.validUntil);
              const isExpired = timerText === 'Expired';

              return (
                <div key={q._id} style={{
                  background: '#1e293b',
                  border: '1.5px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '20px',
                  padding: '28px',
                  opacity: isExpired ? 0.6 : 1,
                  pointerEvents: isExpired ? 'none' : 'auto'
                }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#f97316', fontWeight: '700', textTransform: 'uppercase' }}>
                        {q.requestId?.serviceType?.replace(/_/g, ' ') || 'Car Repair'}
                      </span>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '4px 0 0' }}>
                        {t('quote_from')} {q.garageId?.name || 'Partner Garage'}
                      </h3>
                    </div>
                    {/* Countdown */}
                    <div style={{
                      background: isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                      color: isExpired ? '#f87171' : '#fbbf24',
                      borderRadius: '30px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: '700',
                      fontFamily: 'monospace'
                    }}>
                      ⏱️ {timerText === 'Expired' ? t('expired') : timerText}
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px' }}>
                    <strong>{t('request_details')}:</strong> {q.requestId?.description || 'N/A'}
                  </p>

                  {/* Financial Table */}
                  <div style={{ background: '#0f172a', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#94a3b8' }}>
                      <span>{t('spare_parts_cost')}</span>
                      <span style={{ color: 'white', fontWeight: '600' }}>{t('aed')} {q.partsCost.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#94a3b8', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                      <span>{t('labor_cost')}</span>
                      <span style={{ color: 'white', fontWeight: '600' }}>{t('aed')} {q.laborCost.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#94a3b8', paddingTop: '10px' }}>
                      <span>{t('subtotal')}</span>
                      <span style={{ color: 'white', fontWeight: '600' }}>{t('aed')} {q.subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#94a3b8' }}>
                      <span>{t('service_fee')}</span>
                      <span style={{ color: 'white', fontWeight: '600' }}>{t('aed')} {q.serviceFee.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                      <span>{t('vat')}</span>
                      <span style={{ color: 'white', fontWeight: '600' }}>{t('aed')} {q.vat.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: '16px', fontWeight: '800' }}>
                      <span style={{ color: 'white' }}>{t('total_due')}</span>
                      <span style={{ color: '#10b981' }}>{t('aed')} {q.customerTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isExpired && (
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'end' }}>
                      <button
                        onClick={() => handleReject(q._id)}
                        style={{
                          background: 'none',
                          border: '1.5px solid rgba(239, 68, 68, 0.4)',
                          borderRadius: '10px',
                          padding: '10px 20px',
                          color: '#f87171',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        {t('reject_quote_btn')}
                      </button>
                      <button
                        onClick={() => handleApprove(q._id)}
                        style={{
                          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 24px',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
                        }}
                      >
                        Approve & Confirm Repair
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyQuotes;
