import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { io } from 'socket.io-client';
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

  const [cancelModalReq, setCancelModalReq] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalReq) return;

    const trimmed = cancelReason.trim();
    const placeholders = ['no', 'na', 'n/a', 'test', 'none', 'nothing', 'a', 'x', 'nil'];
    if (!trimmed || trimmed.length < 5 || placeholders.includes(trimmed.toLowerCase())) {
      toast.error('Please enter a detailed cancellation reason (at least 5 characters).');
      return;
    }

    setIsSubmittingCancel(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/requests/${cancelModalReq._id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cancellationReason: cancelReason })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Cancellation request failed.');
      }
      toast.success(data.message || 'Cancellation & refund requested successfully!');
      setCancelModalReq(null);
      setCancelReason('');
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

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

    const socket = io(API_BASE);

    socket.on('request:updated', () => {
      fetchData();
    });

    socket.on('job:status', () => {
      fetchData();
    });

    socket.on('request:assigned', () => {
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
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

  // Map invoice by quoteId, jobId, or requestId for quick lookup
  const invoiceMap = {};
  invoices.forEach(inv => {
    const qId = inv.quoteId?._id?.toString?.() || inv.quoteId?.toString?.();
    if (qId) invoiceMap[qId] = inv;

    const reqId = inv.quoteId?.requestId?._id?.toString?.() || inv.quoteId?.requestId?.toString?.();
    if (reqId) invoiceMap[reqId] = inv;

    const jId = inv.jobId?._id?.toString?.() || inv.jobId?.toString?.();
    if (jId) invoiceMap[jId] = inv;
  });

  const getStatusColor = (status) => {
    const map = {
      pending_payment: '#f59e0b',
      new:             '#10b981',
      assigned:        '#3b82f6',
      quote_pending:   '#8b5cf6',
      quote_approved:  '#f59e0b',
      approved:        '#10b981',
      paid:            '#10b981',
      in_progress:     '#0ea5e9',
      completed:       '#6366f1',
      cancelled:       '#ef4444',
      closed:          '#64748b'
    };
    return map[status] || '#94a3b8';
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_payment':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LuClock /> Pending Payment</span>;
      case 'new':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LuCircleCheck /> Paid — Pending Garage</span>;
      case 'assigned':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LuUser /> Garage Assigned</span>;
      case 'quote_pending':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LuFileText /> Quote Pending</span>;
      case 'quote_approved':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LuClock /> Quote Approved — Pay Now</span>;
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

  const mockTransactions = [
    {
      id: 'TXN-984120',
      bookingId: '478516CE',
      service: 'Ceramic Coating & Paint Protection',
      date: '2026-07-27T18:30:00Z',
      amount: 229.85,
      method: 'Visa •••• 4242',
      status: 'success'
    },
    {
      id: 'TXN-872109',
      bookingId: 'F4031B9C',
      service: 'Major Service Package (Toyota Camry)',
      date: '2026-07-10T14:15:00Z',
      amount: 450.00,
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
    { key: 'completed', label: `✅ ${t('completed') || 'Completed'} (${requests.filter(r => ['delivered', 'completed', 'closed'].includes(r.status)).length})` },
    { key: 'quotes',    label: `✉️ ${t('my_service_quotes') || 'Pending Quotes'} (${quotes.length})` },
    { key: 'invoices',  label: `📄 ${t('invoices')} (${invoices.length})` },
    { key: 'transactions', label: `💳 Transaction History` }
  ];

  const activeStatuses = [
    'pending_payment', 'new', 'assigned', 'quote_pending', 'quote_sent', 'quote_approved',
    'pickup_scheduled', 'arrived_at_customer', 'picked_up', 'in_garage', 'inspection_done',
    'repair_in_progress', 'work_complete', 'ready_for_delivery', 'approved', 'in_progress'
  ];
  const completedStatuses = ['delivered', 'completed', 'closed'];

  const filteredRequests = activeTab === 'active'
    ? requests.filter(r => activeStatuses.includes(r.status))
    : activeTab === 'completed'
    ? requests.filter(r => completedStatuses.includes(r.status))
    : requests;

  const downloadInvoice = (invoiceId) => {
    const token = localStorage.getItem('token');
    window.open(`${API_BASE}/api/invoices/${invoiceId}/pdf?token=${token}`, '_blank');
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
            { label: 'Completed', value: requests.filter(r => completedStatuses.includes(r.status)).length, icon: <LuCircleCheck style={{ color: '#10b981' }} />, color: '#10b981' },
            { label: 'Invoices', value: invoices.length, icon: <LuFileText style={{ color: '#8b5cf6' }} />, color: '#8b5cf6' }
          ].map(s => (
            <div key={s.label} style={{
              background: 'white', borderRadius: 14, padding: '16px 18px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
                  {s.value}
                </div>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: s.color + '12',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18
              }}>
                {s.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
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
                      <LuDownload size={13} /> PDF
                    </button>
                  </div>
                </div>
              ))}
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
                        #{txn.bookingId} ({txn.service})
                      </td>
                      <td style={{ padding: '16px 16px' }}>
                        {txn.method}
                      </td>
                      <td style={{ padding: '16px 16px', fontWeight: 700, color: '#0f172a' }}>
                        AED {txn.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '16px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: txn.status === 'success' ? '#dcfce7' : '#fee2e2',
                          color:      txn.status === 'success' ? '#16a34a' : '#dc2626'
                        }}>
                          {txn.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Requests & Quotes Tabs Content */}
        {activeTab !== 'invoices' && activeTab !== 'transactions' && (
          filteredRequests.length === 0 ? (
            <div style={{
              background: 'white', borderRadius: 16, padding: 48, textAlign: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}>
              <div style={{ marginBottom: 16, color: '#ff5c1a', display: 'flex', justifyContent: 'center' }}>
                <LuClipboardList size={48} />
              </div>
              <h4 style={{ color: '#0f172a', marginBottom: 8 }}>{t('no_requests_found')}</h4>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
                {t('no_requests_sub')}
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
                const inv = invoiceMap[req._id] || invoiceMap[req.quoteId?._id] || invoiceMap[req.quoteId] || null;
                const quoteApproved = req.status === 'quote_approved';
                const isPaid = req.status === 'new' || req.status === 'assigned' || (inv && inv.status === 'paid');

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

                      {/* Pay Now button — if pending_payment or quote_approved and not paid */}
                      {(req.status === 'pending_payment' || req.status === 'quote_approved' || (quoteApproved && !inv)) && !isPaid && (
                        <div style={{
                          background: '#fffbeb', border: '1px solid #fde68a',
                          borderRadius: 10, padding: '12px 16px', marginBottom: 14,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontSize: 11, color: '#d97706', fontWeight: 700, marginBottom: 2 }}>
                              ⏳ PAYMENT REQUIRED
                            </div>
                            <div style={{ fontSize: 13, color: '#92400e' }}>
                              Complete your payment to confirm your booking and begin service.
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const targetQuoteId = req.quoteId?._id || req.quoteId || req._id;
                              navigate(`/payment?quoteId=${targetQuoteId}`);
                            }}
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

                      {/* Cancellation Pending Banner */}
                      {req.status === 'cancellation_requested' && (
                        <div style={{
                          background: '#fef2f2', border: '1px solid #fecaca',
                          borderRadius: 10, padding: '12px 16px', marginBottom: 14,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, marginBottom: 2 }}>
                              ⏳ CANCELLATION &amp; REFUND PENDING ADMIN APPROVAL
                            </div>
                            <div style={{ fontSize: 12.5, color: '#991b1b' }}>
                              Reason: "{req.cancellationReason || 'Customer requested refund'}"
                            </div>
                          </div>
                          <span style={{ padding: '4px 12px', background: '#fee2e2', color: '#dc2626', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            Pending Refund
                          </span>
                        </div>
                      )}

                      {/* Approved Refund Banner */}
                      {req.refundStatus === 'processed' && (
                        <div style={{
                          background: '#f0fdf4', border: '1px solid #bbf7d0',
                          borderRadius: 10, padding: '12px 16px', marginBottom: 14,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginBottom: 2, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <LuCircleCheck /> REFUND APPROVED &amp; PROCESSED
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#14532d' }}>
                              AED {Number(req.refundAmount || 0).toFixed(2)} refunded to your payment card
                            </div>
                            {req.adminNotes && (
                              <div style={{ fontSize: 11.5, color: '#166534', marginTop: 2 }}>
                                Note: {req.adminNotes}
                              </div>
                            )}
                          </div>
                          <span style={{ padding: '4px 12px', background: '#dcfce7', color: '#15803d', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            Refunded
                          </span>
                        </div>
                      )}

                      {/* Rejected Refund Banner */}
                      {req.refundStatus === 'rejected' && (
                        <div style={{
                          background: '#fff1f2', border: '1px solid #fecdd3',
                          borderRadius: 10, padding: '12px 16px', marginBottom: 14
                        }}>
                          <div style={{ fontSize: 11, color: '#e11d48', fontWeight: 700, marginBottom: 2 }}>
                            ✕ CANCELLATION REQUEST REJECTED BY ADMIN
                          </div>
                          <div style={{ fontSize: 12.5, color: '#9f1239' }}>
                            Reason: {req.adminNotes || 'Service is already underway.'}
                          </div>
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

                        {!['completed', 'delivered', 'closed', 'cancelled', 'cancellation_requested'].includes(req.status) && (
                          <button
                            onClick={() => {
                              setCancelModalReq(req);
                              setCancelReason('');
                            }}
                            style={{
                              padding: '8px 16px', background: '#fff1f2', color: '#e11d48',
                              border: '1px solid #fecdd3', borderRadius: 8, cursor: 'pointer',
                              fontWeight: 600, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6
                            }}
                          >
                            <LuX size={13} /> {isPaid ? 'Cancel & Request Refund' : 'Cancel Booking'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Cancel & Refund Request Modal */}
      {cancelModalReq && (() => {
        const modalInv = invoiceMap[cancelModalReq._id] || invoiceMap[cancelModalReq.quoteId?._id] || invoiceMap[cancelModalReq.quoteId] || null;
        const modalIsPaid = modalInv && modalInv.status === 'paid';

        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)',
            zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
          }}>
            <div style={{
              background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px',
              padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h5 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
                  {modalIsPaid ? 'Cancel Booking & Request Refund' : 'Cancel Booking'}
                </h5>
                <button onClick={() => setCancelModalReq(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <LuX size={20} />
                </button>
              </div>

              <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '16px' }}>
                Are you sure you want to cancel Booking <strong>#{cancelModalReq._id.slice(-8).toUpperCase()}</strong>?
                {modalIsPaid ? (
                  <span style={{ display: 'block', marginTop: '6px', color: '#dc2626', fontWeight: 600 }}>
                    Since this booking is paid, your cancellation request will be sent to Admin for immediate refund approval.
                  </span>
                ) : (
                  <span style={{ display: 'block', marginTop: '6px', color: '#475569' }}>
                    This booking has not been paid yet and will be cancelled immediately.
                  </span>
                )}
              </p>

              <form onSubmit={handleCancelSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    Reason for Cancellation:
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please explain why you wish to cancel (e.g., Change of plans, selected wrong date)..."
                    style={{
                      width: '100%', borderRadius: '10px', border: '1px solid #cbd5e1',
                      padding: '10px 12px', fontSize: '13px', color: '#0f172a'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setCancelModalReq(null)}
                    style={{
                      padding: '10px 18px', background: '#f1f5f9', color: '#475569',
                      border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Keep Booking
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCancel}
                    style={{
                      padding: '10px 20px', background: '#dc2626', color: 'white',
                      border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    {isSubmittingCancel ? 'Submitting...' : (modalIsPaid ? 'Submit Cancellation & Refund' : 'Confirm Cancel Booking')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default MyRequests;
