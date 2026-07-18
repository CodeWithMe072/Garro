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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('admin_sidebar_collapsed', String(nextState));
  };

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
    <div className={`dash-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        <div className="sidebar-toggle-container">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar} title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
            {isCollapsed ? <LuChevronRight /> : <LuChevronLeft />}
          </button>
        </div>

        <span className="sidebar-label">{t('overview')}</span>
        <div className="sidebar-section">
          <Link to="/admin" className="sidebar-link">
            <span className="icon"><LuLayoutDashboard /></span>
            <span className="link-text">{t('dashboard')}</span>
          </Link>
        </div>

        <span className="sidebar-label">{t('operations')}</span>
        <div className="sidebar-section">
          <Link to="/admin/manage-garages" className="sidebar-link">
            <span className="icon"><LuStore /></span>
            <span className="link-text">{t('manage_garages')}</span>
          </Link>
          <Link to="/search" className="sidebar-link">
            <span className="icon"><LuSearch /></span>
            <span className="link-text">{t('find_garages')}</span>
          </Link>
          <Link to="/admin/catalog" className="sidebar-link">
            <span className="icon"><LuSettings /></span>
            <span className="link-text">{t('system_catalog')}</span>
          </Link>
          <Link to="/admin/quote-builder" className="sidebar-link">
            <span className="icon"><LuDollarSign /></span>
            <span className="link-text">{t('quote_builder')}</span>
          </Link>
          <Link to="/admin/customers" className="sidebar-link">
            <span className="icon"><LuUsers /></span>
            <span className="link-text">{t('customer_search')}</span>
          </Link>
          <Link to="/admin/complaints" className="sidebar-link active">
            <span className="icon"><LuTriangleAlert /></span>
            <span className="link-text">{t('complaints')}</span>
          </Link>
          <Link to="/admin/support" className="sidebar-link">
            <span className="icon"><LuMessageCircle /></span>
            <span className="link-text">{t('support')}</span>
          </Link>
          <Link to="/admin/reports" className="sidebar-link">
            <span className="icon"><LuTrendingUp /></span>
            <span className="link-text">Reports & Analytics</span>
          </Link>
          <Link to="/admin/settings" className="sidebar-link">
            <span className="icon"><LuSettings /></span>
            <span className="link-text">{t('system_settings')}</span>
          </Link>
          <Link to="/my-bookings" className="sidebar-link">
            <span className="icon"><LuClipboardList /></span>
            <span className="link-text">{t('bookings')}</span>
          </Link>
        </div>

        <div className="sidebar-divider"></div>
        <span className="sidebar-label">{t('people')}</span>
        <div className="sidebar-section">
          <Link to="/admin/manage-staff" className="sidebar-link">
            <span className="icon"><LuUser /></span>
            <span className="link-text">{t('all_users')}</span>
          </Link>
          <Link to="/admin/staff" className="sidebar-link">
            <span className="icon"><LuBriefcase /></span>
            <span className="link-text">{t('staff_view')}</span>
          </Link>
          <Link to="/admin/manage-staff" className="sidebar-link">
            <span className="icon"><LuUsers /></span>
            <span className="link-text">{t('manage_staff')}</span>
          </Link>
        </div>

        <div className="sidebar-divider"></div>
        <div className="sidebar-section">
          <Link to="/home" className="sidebar-link">
            <span className="icon"><LuGlobe /></span>
            <span className="link-text">{t('back_to_site')}</span>
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main" style={{ background: '#f1f5f9', minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <Link to="/admin" className="back" style={{ textDecoration: 'none', color: '#64748b', fontSize: '13.5px' }}>
              ← {t('dashboard_back')}
            </Link>

            {/* Language Switcher */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '13.5px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
              >
                <LuGlobe size={14} /> {lang === 'en' ? 'English' : (lang === 'ar' ? 'العربية' : 'اردو')}
              </button>
              {isLangOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.2)', zIndex: 1000,
                  minWidth: '120px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px'
                }}>
                  {[{ code: 'en', label: 'English' }, { code: 'ar', label: 'العربية' }, { code: 'ur', label: 'اردو' }].map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => { changeLanguage(code); setIsLangOpen(false); }}
                      style={{
                        background: lang === code ? 'rgba(255,92,26,0.15)' : 'none', border: 'none',
                        borderRadius: '8px', padding: '8px 12px',
                        color: lang === code ? '#ff8c5a' : 'rgba(255,255,255,0.6)',
                        fontSize: '13px', fontWeight: lang === code ? 700 : 500,
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', width: '100%', transition: 'all 0.15s'
                      }}
                    >
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: '#1e293b', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LuTriangleAlert /> {lang === 'ar' ? 'سجل شكاوى العملاء' : (lang === 'ur' ? 'کسٹمر شکایات کا کھاتہ' : 'Customer Complaints Ledger')}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
            {lang === 'ar' ? 'تتبع وحل الشكاوى المقدمة من العملاء بخصوص المهام أو المساعدين.' : (lang === 'ur' ? 'کاموں یا مددگاروں کے بارے میں صارفین کی طرف سے اٹھائی گئی شکایات کو ٹریک اور حل کریں۔' : 'Track and resolve complaints raised by customers regarding jobs or helpers.')}
          </p>

          {loading ? (
            <p style={{ color: '#64748b' }}>{t('loading')}</p>
          ) : complaints.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '50px 20px', textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '48px', display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#10b981' }}><LuPartyPopper /></span>
              {lang === 'ar' ? 'لم يتم تسجيل أي شكاوى من العملاء! عمليات عالية الجودة.' : (lang === 'ur' ? 'کوئی کسٹمر شکایت رجسٹرڈ نہیں ہے! اعلیٰ معیار کے آپریشنز۔' : 'No customer complaints registered! High-quality operations.')}
            </div>
          ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {complaints.map(c => (
              <div key={c._id} style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                color: '#1e293b'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1, marginRight: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        background: c.status === 'resolved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: c.status === 'resolved' ? '#10b981' : '#f87171',
                        borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase'
                      }}>
                        {c.status}
                      </span>
                      <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                        {lang === 'ar' ? 'تاريخ التقديم:' : (lang === 'ur' ? 'جمع کرایا گیا:' : 'Submitted:')}: {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 10px', color: '#1e293b' }}>
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
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 18px',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      {lang === 'ar' ? 'حل الشكوى' : (lang === 'ur' ? 'شکایت حل کریں' : 'Resolve Complaint')}
                    </button>
                  )}
                </div>

                {/* Structured Resolution Display */}
                {c.status === 'resolved' && c.resolution && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '14px'
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
                  <form onSubmit={(e) => handleResolveSubmit(e, c._id)} style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    marginTop: '8px'
                  }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{lang === 'ar' ? 'تحديد قرار الشكوى:' : (lang === 'ur' ? 'شکایت کا حل متعین کریں:' : 'Specify Complaint Resolution:')}</div>
                    
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '12.5px', marginBottom: '6px', color: '#64748b' }}>{lang === 'ar' ? 'نوع القرار' : (lang === 'ur' ? 'حل کی قسم' : 'Resolution Type')}</label>
                        <select
                          value={resolutionType}
                          onChange={(e) => setResolutionType(e.target.value)}
                          style={{
                            width: '100%',
                            background: '#fff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '8px',
                            color: '#1e293b'
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
                          <label style={{ display: 'block', fontSize: '12.5px', marginBottom: '6px', color: '#64748b' }}>{lang === 'ar' ? 'المبلغ المسترد (AED)' : (lang === 'ur' ? 'رقم (AED)' : 'Refund Amount (AED)')} *</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={resolutionAmount}
                            onChange={(e) => setResolutionAmount(e.target.value)}
                            style={{
                              width: '100%',
                              background: '#fff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '8px',
                              color: '#1e293b'
                            }}
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', marginBottom: '6px', color: '#64748b' }}>{lang === 'ar' ? 'ملاحظات الحل / تفاصيل التسوية' : (lang === 'ur' ? 'حل کے نوٹس / تصفیہ کی تفصیلات' : 'Resolution Notes / Settlement Details')} *</label>
                      <textarea
                        rows="3"
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#fff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '8px',
                          color: '#1e293b'
                        }}
                        placeholder={lang === 'ar' ? 'أدخل ملاحظات داخلية توضح التوافق مع العميل...' : (lang === 'ur' ? 'گاہک کے ساتھ تصفیہ کی وضاحت کرتے ہوئے اندرونی نوٹ درج کریں...' : 'Enter internal notes explaining the customer alignment...')}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'end' }}>
                      <button
                        type="button"
                        onClick={() => setShowResolveForm(null)}
                        style={{
                          background: 'none',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          color: '#475569',
                          fontSize: '12.5px',
                          cursor: 'pointer'
                        }}
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={resolvingId === c._id}
                        style={{
                          background: '#10b981',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 16px',
                          color: 'white',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          opacity: resolvingId === c._id ? 0.7 : 1
                        }}
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
