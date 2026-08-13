import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import GarageSidebar from '../components/GarageSidebar';
import {
  LuDollarSign,
  LuCircleCheck,
  LuClock,
  LuFileText
} from 'react-icons/lu';

const GarageEarnings = () => {
  const [payouts, setPayouts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useNotification();
  const { lang } = useLanguage();

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
      <div className="staff-wrapper">
        <GarageSidebar activeJobsCount={0} />
        <main className="staff-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status"></div>
            <p className="mt-3 text-muted fw-semibold">Retrieving earnings ledger...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="staff-wrapper">
      {/* ── SIDEBAR ── */}
      <GarageSidebar activeJobsCount={0} />

      {/* ── MAIN CONTENT ── */}
      <main className="staff-main">
        {/* Header */}
        <div className="dash-header mb-4">
          <div>
            <div className="dash-title">
              {lang === 'ar' ? 'الأرباح والدفعات' : 'Earnings & Payouts Ledger'}
            </div>
            <div className="dash-subtitle">
              {lang === 'ar' ? 'متابعة الدفعات والتسويات المالية من الإصلاحات المكتملة.' : 'Track payouts and settlements from completed repairs.'}
            </div>
          </div>
        </div>

        {/* Finance Cards */}
        {summary && (
          <div className="stats-grid mb-4">
            {/* Total Volume */}
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold text-uppercase">Total Payout Volume</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LuDollarSign size={18} />
                </div>
              </div>
              <div className="h2 fw-bold text-dark mb-1">
                AED {summary.totalAmount ? summary.totalAmount.toFixed(2) : '0.00'}
              </div>
              <div className="small text-muted fw-semibold">Combined total of all repairs</div>
            </div>

            {/* Processed Payouts */}
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold text-uppercase">Settled Payouts</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LuCircleCheck size={18} />
                </div>
              </div>
              <div className="h2 fw-bold mb-1" style={{ color: '#059669' }}>
                AED {summary.processedAmount ? summary.processedAmount.toFixed(2) : '0.00'}
              </div>
              <div className="small fw-semibold" style={{ color: '#059669' }}>Transferred to bank account</div>
            </div>

            {/* Pending Payouts */}
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold text-uppercase">Pending Payouts</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LuClock size={18} />
                </div>
              </div>
              <div className="h2 fw-bold mb-1" style={{ color: '#d97706' }}>
                AED {summary.pendingAmount ? summary.pendingAmount.toFixed(2) : '0.00'}
              </div>
              <div className="small fw-semibold" style={{ color: '#d97706' }}>Awaiting admin processing</div>
            </div>
          </div>
        )}

        {/* Settlement History */}
        <div className="schedule-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px' }}>
          <div className="schedule-head d-flex justify-content-between align-items-center mb-3">
            <h4 className="m-0 d-flex align-items-center gap-2 font-bold" style={{ fontSize: '17px', color: '#0f172a' }}>
              <LuFileText className="text-primary-garro" size={18} />
              {lang === 'ar' ? 'سجل تسوية الدفعات' : 'Payout Settlement History'}
            </h4>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {payouts.length} transactions
            </span>
          </div>

          {payouts.length === 0 ? (
            <div className="text-center py-5">
              <LuFileText size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
              <div className="fw-bold text-dark fs-6 mb-1">No payout records found</div>
              <div className="text-muted small">Settlement records will appear here as soon as job invoices are processed.</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '12px 16px', borderRadius: '8px 0 0 8px' }}>TRANSACTION ID</th>
                    <th style={{ padding: '12px 16px' }}>DATE</th>
                    <th style={{ padding: '12px 16px' }}>JOB REF</th>
                    <th style={{ padding: '12px 16px' }}>INVOICE REF</th>
                    <th style={{ padding: '12px 16px' }}>AMOUNT (90%)</th>
                    <th style={{ padding: '12px 16px' }}>PAYOUT STATUS</th>
                    <th style={{ padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>SETTLED ON</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => (
                    <tr key={p._id} style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a', borderRadius: '8px 0 0 8px' }}>
                        #{p._id.slice(-6).toUpperCase()}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13.5px' }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a' }}>
                        {p.jobId ? `#JC-${p.jobId._id ? p.jobId._id.slice(-6).toUpperCase() : p.jobId.slice(-6).toUpperCase()}` : 'N/A'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        {p.invoiceId?.invoiceNumber || 'N/A'}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: '#059669', fontSize: '15px' }}>
                        AED {p.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {p.status === 'processed' ? (
                          <span className="badge bg-success text-white px-3 py-2 fw-bold" style={{ borderRadius: '8px', fontSize: '12px' }}>
                            ✓ Processed
                          </span>
                        ) : (
                          <span className="badge bg-warning text-dark px-3 py-2 fw-bold" style={{ borderRadius: '8px', fontSize: '12px' }}>
                            ⏳ Pending
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px', borderRadius: '0 8px 8px 0' }}>
                        {p.processedAt ? new Date(p.processedAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GarageEarnings;
