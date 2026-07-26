import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LuClock,
  LuUser,
  LuFileText,
  LuCircleCheck,
  LuWrench,
  LuX,
  LuClipboardList,
  LuSettings,
  LuCar,
  LuCreditCard,
  LuSearch,
  LuDownload
} from 'react-icons/lu';

const MyRequests = () => {
  const { user }        = useAuth();
  const { toast }       = useNotification();
  const navigate        = useNavigate();
  const location        = useLocation();
  const { t }           = useLanguage();

  const [requests, setRequests]   = useState([]);
  const [invoices, setInvoices]   = useState([]);
  const [quotes, setQuotes]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'all');
  const [now, setNow]             = useState(Date.now());

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Setup timer to tick every second for quote countdowns
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Show success toast if redirected from payment page
    if (location.state?.justPaid) {
      const invoiceNo = location.state?.invoiceNumber;
      toast.success(
        invoiceNo
          ? `Payment confirmed! Invoice ${invoiceNo} is ready.`
          : 'Payment confirmed! Your invoice is being prepared.'
      );
      // Clear state so toast doesn't repeat on refresh
      window.history.replaceState({}, document.title);
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [reqRes, invRes, quoteRes] = await Promise.all([
        fetch(`${API_BASE}/api/requests`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/invoices/my`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/quotes`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const reqData = await reqRes.json();
      const invData = await invRes.json();
      const quoteData = await quoteRes.json();

      if (reqData.success) setRequests(reqData.requests || []);
      if (invData.success) setInvoices(invData.invoices || []);
      if (quoteData.success) {
        setQuotes((quoteData.quotes || []).filter(q => q.status === 'sent'));
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Map invoice by quoteId or jobId for quick lookup
  const invoiceMap = {};
  invoices.forEach(inv => {
    if (inv.quoteId) invoiceMap[inv.quoteId?.toString?.()] = inv;
    if (inv.jobId)   invoiceMap[inv.jobId?._id?.toString?.() || inv.jobId?.toString?.()] = inv;
  });

  const getStatusColor = (status) => {
    const map = {
      new:           '#f59e0b',
      assigned:      '#3b82f6',
      quote_pending: '#8b5cf6',
      approved:      '#10b981',
      paid:          '#10b981',
      in_progress:   '#0ea5e9',
      completed:     '#6366f1',
      cancelled:     '#ef4444',
      closed:        '#64748b'
    };
    return map[status] || '#94a3b8';
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LuClock /> New</span>;
      case 'assigned':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LuUser /> Assigned</span>;
      case 'quote_pending':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LuFileText /> Quote Pending</span>;
      case 'approved':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LuCircleCheck /> Approved</span>;
      case 'paid':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LuCircleCheck /> Paid</span>;
      case 'in_progress':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LuWrench /> In Progress</span>;
      case 'completed':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LuCircleCheck /> Completed</span>;
      case 'cancelled':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LuX /> Cancelled</span>;
      case 'closed':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LuClipboardList /> Closed</span>;
      default:
        return status?.replace(/_/g, ' ');
    }
  };

  const handleApproveQuote = async (id) => {
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
      toast.success('Quote approved! Repair booking confirmed.');
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRejectQuote = async (id) => {
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
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getRemainingTime = (validUntilStr) => {
    const validUntil = new Date(validUntilStr).getTime();
    const diff = validUntil - now;
    if (diff <= 0) return 'Expired';

    const secs = Math.floor((diff / 1000) % 60);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} remaining`;
  };

  const mockTransactions = [
    {
      id: 'TXN-884920',
      bookingId: '946A6687',
      service: 'Minor Service (Deira Motors)',
      date: '2026-07-01T14:30:00Z',
      amount: 299.00,
      method: 'Visa •••• 4242',
      status: 'success'
    },
    {
      id: 'TXN-773829',
      bookingId: '946A6685',
      service: 'Car Wash & Cleaning (Al Quoz Workshop)',
      date: '2026-06-15T11:15:00Z',
      amount: 49.00,
      method: 'Apple Pay',
      status: 'success'
    },
    {
      id: 'TXN-664728',
      bookingId: '946A6685',
      service: 'Engine Diagnostic (Al Quoz Workshop)',
      date: '2026-06-15T10:45:00Z',
      amount: 150.00,
      method: 'Visa •••• 4242',
      status: 'refunded'
    }
  ];

  const tabs = [
    { key: 'all',       label: t('all_requests') },
    { key: 'active',    label: t('active_requests') },
    { key: 'quotes',    label: `✉️ ${t('my_service_quotes') || 'Pending Quotes'} (${quotes.length})` },
    { key: 'invoices',  label: `📄 ${t('invoices')} (${invoices.length})` },
    { key: 'transactions', label: `💳 Transaction History` }
  ];

  const activeStatuses   = [
    'pending_payment', 'new', 'assigned', 'quote_pending', 'quote_sent', 'quote_approved',
    'pickup_scheduled', 'picked_up', 'in_garage', 'repair_in_progress',
    'work_complete', 'ready_for_delivery', 'delivered', 'approved', 'in_progress'
  ];
  const filteredRequests = activeTab === 'active'
    ? requests.filter(r => activeStatuses.includes(r.status))
    : requests;

  const downloadInvoice = (invoiceId) => {
    const token = localStorage.getItem('token');
    window.open(`${API_BASE}/api/invoices/${invoiceId}/download?token=${token}`, '_blank');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div className="spinner-border" style={{ width: 48, height: 48, color: '#ff5c1a' }} role="status" />
          <p style={{ marginTop: 16, color: '#64748b' }}>{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', background: '#ffffff', paddingBottom: 60 }}>

      {/* Header */}
      <div style={{
        background: '#ffffff',
        padding: '36px 24px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <h1 style={{ color: '#0f172a', fontSize: 28, fontWeight: 800, margin: '0 0 6px' }}>
            {t('my_service_requests')}
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            {t('my_requests_sub')}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '24px auto 0', padding: '0 16px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Requests', value: requests.length, icon: <LuClipboardList style={{ color: '#ff5c1a' }} />, color: '#ff5c1a' },
            { label: 'Active',  value: requests.filter(r => activeStatuses.includes(r.status)).length, icon: <LuSettings style={{ color: '#f59e0b' }} />, color: '#f59e0b' },
            { label: 'Completed', value: requests.filter(r => ['completed','closed','paid'].includes(r.status)).length, icon: <LuCircleCheck style={{ color: '#10b981' }} />, color: '#10b981' },
            { label: 'Invoices', value: invoices.length, icon: <LuFileText style={{ color: '#8b5cf6' }} />, color: '#8b5cf6' }
          ].map(s => (
            <div key={s.label} style={{
              background: 'white', borderRadius: 14, padding: '16px 18px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              borderTop: `3px solid ${s.color}`
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 18px',
                borderRadius: 20,
                border: 'none',
                background: activeTab === tab.key ? '#ff5c1a' : 'white',
                color:  activeTab === tab.key ? 'white' : '#64748b',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Invoice Tab */}
        {activeTab === 'invoices' && (
          invoices.length === 0 ? (
            <div style={{
              background: 'white', borderRadius: 16, padding: 48, textAlign: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}>
              <div style={{ marginBottom: 16, color: '#ff5c1a', display: 'flex', justifyContent: 'center' }}>
                <LuFileText size={48} />
              </div>
              <h4 style={{ color: '#0f172a', marginBottom: 8 }}>No Invoices Yet</h4>
              <p style={{ color: '#64748b', fontSize: 14 }}>Your invoices will appear here after payment</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {invoices.map(inv => (
                <div key={inv._id} style={{
                  background: 'white', borderRadius: 14,
                  padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: 'linear-gradient(135deg, #ff5c1a, #ff8c42)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', flexShrink: 0
                    }}>
                      <LuFileText size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>
                        {inv.invoiceNumber || `Invoice #${inv._id.slice(-6).toUpperCase()}`}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {inv.garageId?.name || 'Service Partner'} •{' '}
                        {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('en-AE') : new Date(inv.createdAt).toLocaleDateString('en-AE')}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#ff5c1a' }}>
                        AED {Number(inv.totalAmount || inv.total || 0).toFixed(2)}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        VAT: AED {Number(inv.vatAmount || inv.vat || 0).toFixed(2)}
                      </div>
                    </div>

                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: inv.status === 'paid' ? '#dcfce7' : '#fef9c3',
                      color:      inv.status === 'paid' ? '#16a34a' : '#854d0e'
                    }}>
                      {inv.status === 'paid' ? '✓ PAID' : inv.status?.toUpperCase()}
                    </span>

                    <button
                      onClick={() => downloadInvoice(inv._id)}
                      style={{
                        padding: '8px 16px', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', color: 'white',
                        border: 'none', borderRadius: 8, cursor: 'pointer',
                        fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <LuDownload size={14} /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Quotes Tab */}
        {activeTab === 'quotes' && (
          quotes.length === 0 ? (
            <div style={{
              background: 'white', borderRadius: 16, padding: 48, textAlign: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
              <h4 style={{ color: '#1a1a2e', marginBottom: 8 }}>No Pending Quotes</h4>
              <p style={{ color: '#64748b', fontSize: 14 }}>You don't have any pending quotes requiring approval at the moment.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {quotes.map(q => {
                const timerText = getRemainingTime(q.validUntil);
                const isExpired = timerText === 'Expired';

                return (
                  <div key={q._id} style={{
                    background: 'white', borderRadius: 16, padding: '24px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: '4px solid #f97316',
                    opacity: isExpired ? 0.6 : 1,
                    pointerEvents: isExpired ? 'none' : 'auto'
                  }}>
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#f97316', fontWeight: '700', textTransform: 'uppercase' }}>
                          {q.requestId?.serviceType?.replace(/_/g, ' ') || 'Car Repair'}
                        </span>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '4px 0 0', color: '#1a1a2e' }}>
                          Quote from {q.garageId?.name || 'Partner Garage'}
                        </h3>
                      </div>
                      <div style={{
                        background: 'rgba(249, 115, 22, 0.1)',
                        color: '#f97316',
                        borderRadius: '30px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: '700',
                      }}>
                        ⏱️ {timerText === 'Expired' ? 'Expired' : timerText}
                      </div>
                    </div>

                    {/* Description */}
                    <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px' }}>
                      <strong>Request Details:</strong> {q.requestId?.description || 'N/A'}
                    </p>

                    {/* Financial Table */}
                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px 20px', marginBottom: 24, border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', color: '#64748b' }}>
                        <span>Spare Parts Cost</span>
                        <span style={{ color: '#1e293b', fontWeight: '600' }}>AED {q.partsCost?.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', color: '#64748b', borderBottom: '1px dashed #e2e8f0', paddingBottom: 8 }}>
                        <span>Labor Cost</span>
                        <span style={{ color: '#1e293b', fontWeight: '600' }}>AED {q.laborCost?.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', color: '#64748b', paddingTop: 8 }}>
                        <span>Subtotal</span>
                        <span style={{ color: '#1e293b', fontWeight: '600' }}>AED {q.subtotal?.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', color: '#64748b' }}>
                        <span>Service Fee</span>
                        <span style={{ color: '#1e293b', fontWeight: '600' }}>AED {q.serviceFee?.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                        <span>VAT (5%)</span>
                        <span style={{ color: '#1e293b', fontWeight: '600' }}>AED {q.vat?.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontSize: '16px', fontWeight: '800' }}>
                        <span style={{ color: '#1e293b' }}>Total Due</span>
                        <span style={{ color: '#10b981' }}>AED {q.customerTotal?.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {!isExpired && (
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'end' }}>
                        <button
                          onClick={() => handleRejectQuote(q._id)}
                          style={{
                            background: 'none',
                            border: '1.5px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: '10px',
                            padding: '10px 20px',
                            color: '#ef4444',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          Reject Quote
                        </button>
                        <button
                          onClick={() => handleApproveQuote(q._id)}
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
                          Approve &amp; Confirm Repair
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Transaction History Tab */}
        {activeTab === 'transactions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              background: 'white', borderRadius: 16, padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 13, fontWeight: 600 }}>
                    <th style={{ padding: '12px 16px' }}>Transaction ID</th>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                    <th style={{ padding: '12px 16px' }}>Reference</th>
                    <th style={{ padding: '12px 16px' }}>Payment Method</th>
                    <th style={{ padding: '12px 16px' }}>Amount</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map(txn => (
                    <tr key={txn.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 13.5, color: '#334155' }}>
                      <td style={{ padding: '16px 16px', fontWeight: 700, color: '#0f172a' }}>
                        #{txn.id}
                      </td>
                      <td style={{ padding: '16px 16px' }}>
                        {new Date(txn.date).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#475569' }}>Booking #{txn.bookingId}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{txn.service}</div>
                      </td>
                      <td style={{ padding: '16px 16px', color: '#64748b' }}>
                        {txn.method}
                      </td>
                      <td style={{ padding: '16px 16px', fontWeight: 800, color: '#ff5c1a' }}>
                        AED {txn.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '16px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: txn.status === 'success' ? '#dcfce7' : '#fee2e2',
                          color:      txn.status === 'success' ? '#16a34a' : '#ef4444'
                        }}>
                          {txn.status === 'success' ? '✓ SUCCESS' : '✖ REFUNDED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Requests Tab (All / Active) */}
        {activeTab !== 'invoices' && activeTab !== 'quotes' && activeTab !== 'transactions' && (
          filteredRequests.length === 0 ? (
            <div style={{
              background: 'white', borderRadius: 16, padding: 48, textAlign: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}>
              <div style={{ marginBottom: 16, color: '#ff5c1a', display: 'flex', justifyContent: 'center' }}>
                <LuCar size={48} />
              </div>
              <h4 style={{ color: '#0f172a', marginBottom: 8 }}>No Requests Yet</h4>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
                Book your first car service to get started
              </p>
              <Link to="/get-quote" style={{
                background: 'linear-gradient(135deg, #ff5c1a, #ff8c42)', color: 'white', padding: '12px 28px',
                borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14
              }}>
                Get a Quote
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filteredRequests.map(req => {
                const inv = invoiceMap[req._id] || null;
                const quoteApproved = req.status === 'approved';

                return (
                  <div key={req._id} style={{
                    background: 'white', borderRadius: 16,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    overflow: 'hidden'
                  }}>
                    {/* Card header */}
                    <div style={{
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      padding: '16px 20px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>
                          BOOKING ID
                        </div>
                        <div style={{ color: '#0f172a', fontWeight: 700, fontSize: 14 }}>
                          #{req._id.slice(-8).toUpperCase()}
                        </div>
                      </div>
                      <span style={{
                        background: getStatusColor(req.status) + '22',
                        color: getStatusColor(req.status),
                        border: `1px solid ${getStatusColor(req.status)}44`,
                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700
                      }}>
                        {getStatusLabel(req.status)}
                      </span>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 3 }}>SERVICE</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
                            {req.subCategory || req.serviceType?.replace(/_/g, ' ')}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 3 }}>VEHICLE</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
                            {req.vehicleId?.make || req.make || '—'} {req.vehicleId?.model || req.model || ''}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 3 }}>DATE</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
                            {new Date(req.createdAt).toLocaleDateString('en-AE')}
                          </div>
                        </div>
                      </div>

                      {req.garageId && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '12px 16px', background: '#f8fafc',
                          borderRadius: 10, border: '1px solid #e2e8f0',
                          marginBottom: 14
                        }}>
                          <span style={{ fontSize: 18 }}>🏬</span>
                          <div>
                            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Workshop</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{req.garageId.name}</div>
                          </div>
                        </div>
                      )}

                      {/* Invoice row — if paid */}
                      {inv && inv.status === 'paid' && (
                        <div style={{
                          background: '#f0fdf4', border: '1px solid #bbf7d0',
                          borderRadius: 10, padding: '12px 16px', marginBottom: 14,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginBottom: 2, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <LuCircleCheck /> INVOICE PAID
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>
                              {inv.invoiceNumber} — AED {Number(inv.totalAmount || 0).toFixed(2)}
                            </div>
                          </div>
                          <button
                            onClick={() => downloadInvoice(inv._id)}
                            style={{
                              padding: '8px 14px', background: '#16a34a', color: 'white',
                              border: 'none', borderRadius: 8, cursor: 'pointer',
                              fontWeight: 700, fontSize: 12
                            }}
                          >
                            📥 Download Invoice
                          </button>
                        </div>
                      )}

                      {/* Pay Now button — if approved but not paid */}
                      {quoteApproved && !inv && (
                        <div style={{
                          background: '#fffbeb', border: '1px solid #fde68a',
                          borderRadius: 10, padding: '12px 16px', marginBottom: 14,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontSize: 11, color: '#d97706', fontWeight: 700, marginBottom: 2 }}>
                              ⏳ QUOTE APPROVED — PAYMENT REQUIRED
                            </div>
                            <div style={{ fontSize: 13, color: '#92400e' }}>
                              Your quote has been approved. Complete your payment to proceed.
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/payment?quoteId=${req.quoteId || req._id}`)}
                            style={{
                              padding: '10px 18px',
                              background: 'linear-gradient(135deg, #ff5c1a, #ff8c42)',
                              color: 'white', border: 'none', borderRadius: 8,
                              cursor: 'pointer', fontWeight: 700, fontSize: 13,
                              whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6
                            }}
                          >
                            <LuCreditCard size={14} /> Pay Now
                          </button>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Link
                          to={`/track/${req._id}`}
                          style={{
                            padding: '8px 16px', background: '#f1f5f9', color: '#ff5c1a',
                            border: '1px solid #e2e8f0', borderRadius: 8, textDecoration: 'none',
                            fontWeight: 600, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6
                          }}
                        >
                          <LuSearch size={13} /> Track Status
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MyRequests;
