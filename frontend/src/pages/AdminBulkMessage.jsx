import { API_BASE } from '../config/api';
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import AdminSidebar from '../components/AdminSidebar';
import { LuMegaphone, LuMail, LuUsers, LuCircleCheck } from 'react-icons/lu';

const STATUS_STEPS = [
  { id: 'new', label: 'New Request' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'quote_sent', label: 'Quote Sent' },
  { id: 'quote_approved', label: 'Quote Approved' },
  { id: 'pickup_scheduled', label: 'Pickup Scheduled' },
  { id: 'in_garage', label: 'In Garage' },
  { id: 'work_complete', label: 'Work Complete' },
  { id: 'delivered', label: 'Delivered' }
];

const AdminBulkMessage = () => {
  const { t, lang } = useLanguage();
  const { toast } = useNotification();

  const [target, setTarget] = useState('all'); // all, by-status
  const [statusFilter, setStatusFilter] = useState('new');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentCount, setSentCount] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return toast.error('Message content is required');

    setLoading(true);
    setSentCount(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/notifications/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          target,
          statusFilter: target === 'by-status' ? statusFilter : undefined,
          subject,
          message
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to dispatch bulk notifications.');
      }
      setSentCount(data.count || 0);
      toast.success(`🎉 Dispatched bulk message to ${data.count} customers!`);
      setSubject('');
      setMessage('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dash-wrapper">
      <AdminSidebar />

      <main className="dash-main">
        {/* Title Block */}
        <div className="dash-header mb-4" style={{ display: 'block' }}>
          <div className="dash-title d-flex align-items-center gap-2">
            <LuMegaphone className="text-primary-garro" />
            <span>{lang === 'ar' ? 'إرسال رسائل جماعية' : (lang === 'ur' ? 'بلک پیغامات بھیجیں' : 'Send Bulk Notifications')}</span>
          </div>
          <div className="dash-subtitle">
            {lang === 'ar' ? 'بث رسائل البريد الإلكتروني والإشعارات لجميع العملاء أو فئات معينة.' : (lang === 'ur' ? 'کسٹمرز کو مخصوص فلٹرز کے مطابق بلک ای میل اور نوٹیفکیشنز بھیجیں۔' : 'Draft and broadcast notifications to all registered customers or filter by their ongoing request statuses.')}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          {/* Main Draft Card */}
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: '#fff', color: '#1e293b' }}>
            <h5 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
              <LuMail size={20} style={{ color: '#ff5c1a' }} /> Draft Message
            </h5>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                  Target Audience
                </label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: '14px' }}>
                    <input 
                      type="radio" 
                      name="target" 
                      value="all" 
                      checked={target === 'all'} 
                      onChange={() => setTarget('all')}
                      style={{ cursor: 'pointer' }}
                    />
                    All Active Customers
                  </label>
                  <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: '14px' }}>
                    <input 
                      type="radio" 
                      name="target" 
                      value="by-status" 
                      checked={target === 'by-status'} 
                      onChange={() => setTarget('by-status')}
                      style={{ cursor: 'pointer' }}
                    />
                    By Current Request Status
                  </label>
                </div>
              </div>

              {target === 'by-status' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                    Select Request Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px', background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '10px', color: '#0f172a', fontSize: '14px', outline: 'none'
                    }}
                  >
                    {STATUS_STEPS.map(step => (
                      <option key={step.id} value={step.id}>{step.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                  Notification Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. System Maintenance Notice / Ramadan Timings Update"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '10px', color: '#0f172a', fontSize: '14px', outline: 'none'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                  Message Body
                </label>
                <textarea
                  placeholder="Type your announcement content here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  style={{
                    width: '100%', padding: '12px', background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '10px', color: '#0f172a', fontSize: '14px', outline: 'none', resize: 'vertical'
                  }}
                  required
                />
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #ff5c1a 0%, #ff8c42 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    color: 'white',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 92, 26, 0.2)',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Sending messages...' : 'Send Broadcast Notification 📣'}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Guidance Panel */}
          <div>
            <div className="card border-0 shadow-sm p-4 bg-light mb-4" style={{ borderRadius: '16px' }}>
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <LuUsers style={{ color: '#ff5c1a' }} size={18} /> Delivery Channels
              </h6>
              <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>
                Bulk broadcasts are fanned out through:
                <br /><br />
                <strong>1. In-App Notifications</strong>: Displayed directly in the customer portal inbox.
                <br /><br />
                <strong>2. Automated Email Services</strong>: Dispatched to customers' registered email addresses using Resend.
              </p>
            </div>

            {sentCount !== null && (
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', textAlign: 'center' }}>
                <LuCircleCheck size={36} style={{ color: '#22c55e', margin: '0 auto 12px' }} />
                <h6 className="fw-bold mb-1">Broadcast Completed</h6>
                <p className="small mb-0">Sent successfully to <strong>{sentCount}</strong> customers.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminBulkMessage;
