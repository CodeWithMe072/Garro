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
  LuSettings
} from 'react-icons/lu';

const MyRequests = () => {
  const { user }        = useAuth();
  const { toast }       = useNotification();
  const navigate        = useNavigate();
  const location        = useLocation();
  const { t }           = useLanguage();

  const [requests, setRequests]   = useState([]);
  const [invoices, setInvoices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
      const [reqRes, invRes] = await Promise.all([
        fetch(`${API_BASE}/api/requests`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/invoices/my`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const reqData = await reqRes.json();
      const invData = await invRes.json();

      if (reqData.success) setRequests(reqData.requests || []);
      if (invData.success) setInvoices(invData.invoices || []);
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

  const tabs = [
    { key: 'all',       label: t('all_requests') },
    { key: 'active',    label: t('active_requests') },
    { key: 'invoices',  label: `📄 ${t('invoices')}` }
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
          <div className="spinner-border" style={{ width: 48, height: 48, color: '#185FA5' }} role="status" />
          <p style={{ marginTop: 16, color: '#64748b' }}>{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', background: '#f8fafc', paddingBottom: 60 }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #185FA5 0%, #1a1a2e 100%)',
        padding: '36px 24px 80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)'
        }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 800, margin: '0 0 6px' }}>
            {t('my_service_requests')}
          </h1>
          <p style={{ color: '#a8d4f5', fontSize: 14, margin: 0 }}>
            {t('welcome')}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '-50px auto 0', padding: '0 16px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Requests', value: requests.length, icon: <LuClipboardList style={{ color: '#185FA5' }} />, color: '#185FA5' },
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
                background: activeTab === tab.key ? '#185FA5' : 'white',
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
              <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
              <h4 style={{ color: '#1a1a2e', marginBottom: 8 }}>No Invoices Yet</h4>
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
                      background: 'linear-gradient(135deg, #185FA5, #1e7bc2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0
                    }}>📄</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 15 }}>
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
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#185FA5' }}>
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
                        padding: '8px 16px', background: '#185FA5', color: 'white',
                        border: 'none', borderRadius: 8, cursor: 'pointer',
                        fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4
                      }}
                    >
                      📥 Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Requests Tab (All / Active) */}
        {activeTab !== 'invoices' && (
          filteredRequests.length === 0 ? (
            <div style={{
              background: 'white', borderRadius: 16, padding: 48, textAlign: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🚗</div>
              <h4 style={{ color: '#1a1a2e', marginBottom: 8 }}>No Requests Yet</h4>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
                Book your first car service to get started
              </p>
              <Link to="/get-quote" style={{
                background: '#185FA5', color: 'white', padding: '12px 28px',
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
                      background: 'linear-gradient(135deg, #1a1a2e, #0f172a)',
                      padding: '16px 20px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>
                          BOOKING ID
                        </div>
                        <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>
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
                              background: 'linear-gradient(135deg, #185FA5, #1e7bc2)',
                              color: 'white', border: 'none', borderRadius: 8,
                              cursor: 'pointer', fontWeight: 700, fontSize: 13,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            💳 Pay Now
                          </button>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Link
                          to={`/track/${req._id}`}
                          style={{
                            padding: '8px 16px', background: '#f1f5f9', color: '#185FA5',
                            border: '1px solid #e2e8f0', borderRadius: 8, textDecoration: 'none',
                            fontWeight: 600, fontSize: 12
                          }}
                        >
                          🔍 Track Status
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
