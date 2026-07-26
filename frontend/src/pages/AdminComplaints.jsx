import { 
  LuLayoutDashboard, 
  LuStore, 
  LuSearch, 
  LuSettings, 
  LuUser, 
  LuBriefcase, 
  LuUsers, 
  LuGlobe,
  LuChevronLeft,
  LuChevronRight,
  LuClipboardList,
  LuTriangleAlert,
  LuPartyPopper,
  LuDollarSign,
  LuMessageCircle,
  LuTrendingUp
} from 'react-icons/lu';
import { useLanguage } from '../context/LanguageContext';

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import AdminSidebar from '../components/AdminSidebar';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  
  // Local state for resolution form
  const [showResolveForm, setShowResolveForm] = useState(null);
  const [resolutionType, setResolutionType] = useState('no_action');
  const [resolutionAmount, setResolutionAmount] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  
  const { toast } = useNotification();
  const navigate = useNavigate();

  const { t, lang, changeLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);


  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/complaints`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch complaints list.');
      }
      setComplaints(data.complaints || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolveSubmit = async (e, id) => {
    e.preventDefault();
    setResolvingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/complaints/${id}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resolution: {
            type: resolutionType,
            amount: ['refund', 'compensation'].includes(resolutionType) ? parseFloat(resolutionAmount) : 0,
            notes: resolutionNotes
          }
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to resolve complaint.');
      }
      toast.success('Complaint resolved successfully.');
      setShowResolveForm(null);
      // Reset form fields
      setResolutionType('no_action');
      setResolutionAmount('');
      setResolutionNotes('');
      fetchComplaints();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="dash-wrapper">
      {/* ── SIDEBAR ── */}
      <AdminSidebar />

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <div className="dash-header mb-4" style={{ display: 'block' }}>
            <div className="dash-title d-flex align-items-center gap-2">
              <LuTriangleAlert className="text-primary-garro" />
              <span>{lang === 'ar' ? 'سجل شكاوى العملاء' : (lang === 'ur' ? 'کسٹمر شکایات کا کھاتہ' : 'Customer Complaints Ledger')}</span>
            </div>
            <div className="dash-subtitle">{lang === 'ar' ? 'تتبع وحل الشكاوى المقدمة من العملاء بخصوص المهام أو المساعدين.' : (lang === 'ur' ? 'کاموں یا مددگاروں کے بارے میں صارفین کی طرف سے اٹھائی گئی شکایات کو ٹریک اور حل کریں۔' : 'Track and resolve complaints raised by customers regarding jobs or helpers.')}</div>
          </div>

          {loading ? (
            <p style={{ color: '#64748b' }}>{t('loading')}</p>
          ) : complaints.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 border shadow-sm" style={{ borderColor: '#e2e8f0' }}>
              <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-success-subtle text-success mb-3" style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
                <LuPartyPopper size={36} />
              </div>
              <h5 className="fw-bold text-dark mb-1">
                {lang === 'ar' ? 'لم يتم تسجيل أي شكاوى!' : (lang === 'ur' ? 'کوئی شکایت رجسٹرڈ نہیں ہے!' : 'All Clear!')}
              </h5>
              <p className="text-muted small mb-0 px-3">
                {lang === 'ar' ? 'لم يتم تسجيل أي شكاوى من العملاء! عمليات عالية الجودة.' : (lang === 'ur' ? 'کوئی کسٹمر شکایت رجسٹرڈ نہیں ہے! اعلیٰ معیار کے آپریشنز۔' : 'No customer complaints registered! High-quality operations.')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {complaints.map(c => (
              <div key={c._id} className="complaint-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1, marginRight: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                      <span className={`sbadge ${c.status === 'resolved' ? 'completed' : 'cancelled'}`}>
                        {c.status}
                      </span>
                      <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                        {lang === 'ar' ? 'تاريخ التقديم:' : (lang === 'ur' ? 'جمع کرایا گیا:' : 'Submitted:')}: {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
 
                    <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 10px', color: '#0f172a' }}>
                      {c.title || 'Service Complaint'}
                    </h3>
                    
                    <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: '0 0 16px' }}>
                      {c.description}
                    </p>
 
                    <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#64748b' }}>
                      <span>{lang === 'ar' ? 'العميل:' : (lang === 'ur' ? 'کلائنٹ:' : 'Client:')} <strong>{c.customerId?.name || 'Customer'}</strong> ({c.customerId?.email})</span>
                      {c.jobId && (
                        <span>{lang === 'ar' ? 'بطاقة المهمة:' : (lang === 'ur' ? 'جاب کارڈ:' : 'Job Card:')} <strong>#{c.jobId.slice(-6).toUpperCase()}</strong></span>
                      )}
                    </div>
                  </div>
 
                  {c.status !== 'resolved' && showResolveForm !== c._id && (
                    <button
                      onClick={() => {
                        setShowResolveForm(c._id);
                        setResolutionType('no_action');
                        setResolutionAmount('');
                        setResolutionNotes('');
                      }}
                      className="btn-garro btn-primary-garro btn-sm py-2 px-3"
                      style={{ minWidth: '130px' }}
                    >
                      {lang === 'ar' ? 'حل الشكوى' : (lang === 'ur' ? 'شکایت حل کریں' : 'Resolve Complaint')}
                    </button>
                  )}
                </div>
 
                {/* Structured Resolution Display */}
                {c.status === 'resolved' && c.resolution && (
                  <div className="mt-3" style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '13.5px'
                  }}>
                    <div style={{ fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
                      {lang === 'ar' ? 'تفاصيل قرار الحل:' : (lang === 'ur' ? 'حل کی تفصیلات:' : 'Resolved Resolution Details:')}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', color: '#1e293b' }}>
                      <div>{lang === 'ar' ? 'النوع:' : (lang === 'ur' ? 'قسم:' : 'Type:')}: <strong style={{ textTransform: 'capitalize' }}>{c.resolution.type?.replace(/_/g, ' ')}</strong></div>
                      {['refund', 'compensation'].includes(c.resolution.type) && (
                        <div>{lang === 'ar' ? 'المبلغ المسترد:' : (lang === 'ur' ? 'واپس کی گئی رقم:' : 'Refunded Amount:')}: <strong>AED {c.resolution.amount?.toFixed(2)}</strong></div>
                      )}
                      {c.resolution.resolvedAt && (
                        <div>{lang === 'ar' ? 'تاريخ الحل:' : (lang === 'ur' ? 'حل ہونے کی تاریخ:' : 'Resolved On:')}: <strong>{new Date(c.resolution.resolvedAt).toLocaleDateString()}</strong></div>
                      )}
                    </div>
                    {c.resolution.notes && (
                      <div style={{ marginTop: '8px', color: '#64748b', fontSize: '13px' }}>
                        {lang === 'ar' ? 'ملاحظات:' : (lang === 'ur' ? 'نوٹس:' : 'Notes:')} "{c.resolution.notes}"
                      </div>
                    )}
                  </div>
                )}
 
                {/* Form to submit structured resolution */}
                {showResolveForm === c._id && (
                  <form onSubmit={(e) => handleResolveSubmit(e, c._id)} className="bg-light border rounded-3 p-4 mt-3" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ fontWeight: '700', fontSize: '14.5px', color: '#0f172a' }}>{lang === 'ar' ? 'تحديد قرار الشكوى:' : (lang === 'ur' ? 'شکایت کا حل متعین کریں:' : 'Specify Complaint Resolution:')}</div>
                    
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '12.5px', marginBottom: '6px', color: '#64748b', fontWeight: '500' }}>{lang === 'ar' ? 'نوع القرار' : (lang === 'ur' ? 'حل کی قسم' : 'Resolution Type')}</label>
                        <select
                          value={resolutionType}
                          onChange={(e) => setResolutionType(e.target.value)}
                          className="form-select text-dark"
                          style={{
                            background: '#fff',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            fontSize: '13.5px'
                          }}
                        >
                          <option value="refund">{lang === 'ar' ? 'إصدار استرداد (معاملة Stripe)' : (lang === 'ur' ? 'ریفنڈ جاری کریں (اسٹرائپ ٹرانزیکشن)' : 'Issue Refund (Stripe Transaction)')}</option>
                          <option value="compensation">{lang === 'ar' ? 'التعويض (ائتمان مباشر)' : (lang === 'ur' ? 'معاوضہ (براہ راست کریڈٹ)' : 'Compensation (Direct Credit)')}</option>
                          <option value="fix_at_garage">Fix vehicle at Garage</option>
                          <option value="replacement">Replacement vehicle provided</option>
                          <option value="no_action">{lang === 'ar' ? 'إغلاق بدون إجراء' : (lang === 'ur' ? 'بغیر کسی اقدام کے بند کریں' : 'Close No Action')}</option>
                        </select>
                      </div>
 
                      {['refund', 'compensation'].includes(resolutionType) && (
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <label style={{ display: 'block', fontSize: '12.5px', marginBottom: '6px', color: '#64748b', fontWeight: '500' }}>{lang === 'ar' ? 'المبلغ المسترد (AED)' : (lang === 'ur' ? 'رقم (AED)' : 'Refund Amount (AED)')} *</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={resolutionAmount}
                            onChange={(e) => setResolutionAmount(e.target.value)}
                            className="chat-search-input py-2.5"
                            required
                          />
                        </div>
                      )}
                    </div>
 
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', marginBottom: '6px', color: '#64748b', fontWeight: '500' }}>{lang === 'ar' ? 'ملاحظات الحل / تفاصيل التسوية' : (lang === 'ur' ? 'حل کے نوٹس / تصفیہ کی تفصیلات' : 'Resolution Notes / Settlement Details')} *</label>
                      <textarea
                        rows="3"
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="chat-search-input"
                        placeholder={lang === 'ar' ? 'أدخل ملاحظات داخلية توضح التوافق مع العميل...' : (lang === 'ur' ? 'گاہک کے ساتھ تصفیہ کی وضاحت کرتے ہوئے اندرونی نوٹ درج کریں...' : 'Enter internal notes explaining the customer alignment...')}
                        required
                      />
                    </div>
 
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'end' }}>
                      <button
                        type="button"
                        onClick={() => setShowResolveForm(null)}
                        className="btn-garro btn-outline-garro py-2 px-4"
                        style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={resolvingId === c._id}
                        className="btn-garro btn-primary-garro py-2 px-4"
                        style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: resolvingId === c._id ? 0.7 : 1 }}
                      >
                        {resolvingId === c._id ? 'Saving...' : 'Confirm Resolve'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default AdminComplaints;
