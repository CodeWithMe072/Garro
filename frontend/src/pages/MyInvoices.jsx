import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

const MyInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useNotification();
  const navigate = useNavigate();
  const { t } = useLanguage();

  
  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/invoices/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch invoices.');
      }
      setInvoices(data.invoices || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDownload = (invoiceId) => {
    const token = localStorage.getItem('token');
    // Open standard download link in a new window/tab
    const downloadUrl = `${API_BASE}/api/invoices/${invoiceId}/download?token=${encodeURIComponent(token)}`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      color: '#f8fafc',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Navigation */}
        <div style={{ marginBottom: '24px' }}>
          <button onClick={() => navigate('/home')} style={{
            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline'
          }}>
            ← {t('back_to_dashboard')}
          </button>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.025em' }}>
          📄 {t('my_service_invoices')}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>
          {t('invoices_desc')}
        </p>

        {loading ? (
          <p style={{ color: '#64748b' }}>{t('loading')}</p>
        ) : invoices.length === 0 ? (
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '50px 20px', textAlign: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🧾</span>
            {t('no_invoices')}
          </div>
        ) : (
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '20px', padding: '24px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>
                  <th style={{ padding: '12px 16px' }}>{t('invoice_no')}</th>
                  <th style={{ padding: '12px 16px' }}>{t('date')}</th>
                  <th style={{ padding: '12px 16px' }}>{t('vehicle')}</th>
                  <th style={{ padding: '12px 16px' }}>{t('total_due')}</th>
                  <th style={{ padding: '12px 16px' }}>{t('status')}</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                    <td style={{ padding: '16px', fontWeight: '700' }}>
                      {inv.invoiceNumber || `INV-${inv._id.slice(-6).toUpperCase()}`}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {inv.quoteId?.requestId?.vehicleId ? (
                        `${inv.quoteId.requestId.vehicleId.make} ${inv.quoteId.requestId.vehicleId.model}`
                      ) : 'Vehicle Repair'}
                    </td>
                    <td style={{ padding: '16px', fontWeight: '700', color: '#10b981' }}>
                      {t('aed')} {(inv.totalAmount || inv.total || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {inv.status === 'paid' ? (
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                          borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '700'
                        }}>
                          ✓ {t('paid')}
                        </span>
                      ) : (
                        <span style={{
                          background: 'rgba(239, 68, 68, 0.1)', color: '#f87171',
                          borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '700'
                        }}>
                          ⏳ {t('unpaid')}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'end' }}>
                        <button
                          onClick={() => handleDownload(inv._id)}
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          📥 {t('download_invoice')}
                        </button>
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => navigate(`/payment?quoteId=${inv.quoteId._id || inv.quoteId}`)}
                            style={{
                              background: 'linear-gradient(135deg, #ff5c1a 0%, #ff8c42 100%)',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 14px',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(255, 92, 26, 0.2)'
                            }}
                          >
                            💳 {t('pay_now')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyInvoices;
