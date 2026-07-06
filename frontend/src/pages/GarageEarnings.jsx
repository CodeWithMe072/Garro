import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const GarageEarnings = () => {
  const [payouts, setPayouts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useNotification();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/garages/portal/earnings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch earnings ledger.');
      }
      setPayouts(data.payouts || []);
      setSummary(data.summary || null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }} role="status"></div>
          <p style={{ marginTop: '16px', color: '#94a3b8' }}>Retrieving earnings ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      color: '#f8fafc',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Navigation */}
        <div style={{ marginBottom: '24px' }}>
          <button onClick={() => navigate('/garage-portal')} style={{
            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline'
          }}>
            ← Return to Dashboard
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.025em' }}>
              💰 Earnings & Payouts Ledger
            </h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
              Track payouts and settlements from completed repairs.
            </p>
          </div>
        </div>

        {/* Finance Cards */}
        {summary && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {/* Total Volume */}
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Total Payout Volume</span>
              <div style={{ fontSize: '32px', fontWeight: '800' }}>AED {summary.totalAmount.toFixed(2)}</div>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px' }}>Combined total of all repairs</div>
            </div>

            {/* Processed Payouts */}
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Settled Payouts</span>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>AED {summary.processedAmount.toFixed(2)}</div>
              <div style={{ color: '#10b981', fontSize: '12px', marginTop: '6px', fontWeight: '600' }}>Transferred to your bank account</div>
            </div>

            {/* Pending Payouts */}
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Pending Payouts</span>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#fbbf24' }}>AED {summary.pendingAmount.toFixed(2)}</div>
              <div style={{ color: '#fbbf24', fontSize: '12px', marginTop: '6px', fontWeight: '600' }}>Awaiting admin processing</div>
            </div>
          </div>
        )}

        {/* Ledger Table */}
        <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
            📜 Payout Settlement History
          </h3>

          {payouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              No payout records found. Settlements will show here as soon as invoice payments are processed.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>
                    <th style={{ padding: '12px 16px' }}>TRANSACTION ID</th>
                    <th style={{ padding: '12px 16px' }}>DATE</th>
                    <th style={{ padding: '12px 16px' }}>JOB REF</th>
                    <th style={{ padding: '12px 16px' }}>INVOICE REF</th>
                    <th style={{ padding: '12px 16px' }}>AMOUNT (90%)</th>
                    <th style={{ padding: '12px 16px' }}>PAYOUT STATUS</th>
                    <th style={{ padding: '12px 16px' }}>SETTLED ON</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                      <td style={{ padding: '16px', fontWeight: '600' }}>
                        #{p._id.slice(-6).toUpperCase()}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px', fontWeight: '600' }}>
                        {p.jobId ? `#JC-${p.jobId._id ? p.jobId._id.slice(-6).toUpperCase() : p.jobId.slice(-6).toUpperCase()}` : 'N/A'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {p.invoiceId?.invoiceNumber || 'N/A'}
                      </td>
                      <td style={{ padding: '16px', fontWeight: '700', color: '#10b981' }}>
                        AED {p.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {p.status === 'processed' ? (
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                            borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '700'
                          }}>
                            ✓ Processed
                          </span>
                        ) : (
                          <span style={{
                            background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24',
                            borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '700'
                          }}>
                            ⏳ Pending
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px', color: '#cbd5e1' }}>
                        {p.processedAt ? new Date(p.processedAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GarageEarnings;
