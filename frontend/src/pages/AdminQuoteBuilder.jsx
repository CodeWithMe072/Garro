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
  LuClipboardList
} from 'react-icons/lu';
import { useLanguage } from '../context/LanguageContext';

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const AdminQuoteBuilder = () => {
  const [requests, setRequests] = useState([]);
  const [garages, setGarages] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Quote inputs
  const [selectedGarageId, setSelectedGarageId] = useState('');
  const [partsCost, setPartsCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [reqRes, garRes] = await Promise.all([
        fetch(`${API_BASE}/api/requests`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/garages`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const reqData = await reqRes.json();
      const garData = await garRes.json();

      if (reqData.success) {
        // Filter requests needing quotes
        const filtered = (reqData.requests || []).filter(r => ['quote_pending', 'assigned', 'new'].includes(r.status));
        setRequests(filtered);
      }
      if (garData.success) {
        setGarages(garData.garages || []);
      }
    } catch (err) {
      toast.error('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBuildQuote = async (e) => {
    e.preventDefault();
    if (!selectedReq || !selectedGarageId) {
      toast.error('Please select a request and a partner garage.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: selectedReq._id,
          garageId: selectedGarageId,
          partsCost: parseFloat(partsCost),
          laborCost: parseFloat(laborCost)
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create quote.');
      }

      toast.success('Quote generated and sent to customer successfully!');
      setSelectedReq(null);
      setSelectedGarageId('');
      setPartsCost('');
      setLaborCost('');
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const parts = parseFloat(partsCost) || 0;
  const labor = parseFloat(laborCost) || 0;
  const subtotal = parts + labor;
  const serviceFee = parseFloat((subtotal * 0.10).toFixed(2));
  const vat = parseFloat(((subtotal + serviceFee) * 0.05).toFixed(2));
  const total = parseFloat((subtotal + serviceFee + vat).toFixed(2));

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
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
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

          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '32px', color: '#1e293b', letterSpacing: '-0.025em' }}>
            🛠️ {lang === 'ar' ? 'منشئ عروض الأسعار' : (lang === 'ur' ? 'ایڈمن کوٹ بلڈر' : 'Admin Quote Builder')}
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px' }}>
            
            {/* Left: Pending Requests */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '20px', color: '#64748b' }}>
                {lang === 'ar' ? 'إجراءات عروض الأسعار المعلقة' : (lang === 'ur' ? 'معلق کوٹیشن اقدامات' : 'Pending Quote Actions')}
              </h3>

              {loading ? (
                <p style={{ color: '#64748b' }}>{lang === 'ar' ? 'جاري تحميل الطلبات...' : (lang === 'ur' ? 'درخواستیں لوڈ ہو رہی ہیں...' : 'Loading requests...')}</p>
              ) : requests.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
                  {lang === 'ar' ? 'لا توجد طلبات تتطلب عروض أسعار حالياً.' : (lang === 'ur' ? 'فی الحال کسی درخواست کے لیے کوٹیشن درکار نہیں ہے۔' : 'No requests currently require quotes.')}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {requests.map(r => (
                    <div
                      key={r._id}
                      onClick={() => {
                        setSelectedReq(r);
                        setSelectedGarageId(r.garageId?._id || r.garageId || '');
                      }}
                      style={{
                        background: selectedReq?._id === r._id ? '#fff4ef' : '#fff',
                        border: selectedReq?._id === r._id ? '1.5px solid #ff5c1a' : '1.5px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        color: '#1e293b'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px' }}>
                          #{r._id.slice(-6).toUpperCase()}
                        </span>
                        <span style={{
                          background: 'rgba(255,92,26,0.1)', color: '#ff5c1a', borderRadius: '6px', padding: '2px 6px', fontSize: '10px', fontWeight: '700'
                        }}>
                          {r.status.toUpperCase()}
                        </span>
                      </div>

                      <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '600', color: selectedReq?._id === r._id ? '#ff5c1a' : '#1e293b' }}>
                        {r.vehicleId ? `${r.vehicleId.make} ${r.vehicleId.model}` : 'Unknown Vehicle'}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                        <span>Client: {r.userId?.name || 'Customer'}</span>
                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Builder Console */}
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid #e2e8f0',
              color: '#1e293b',
              alignSelf: 'start'
            }}>
              {selectedReq ? (
                <div>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px' }}>
                    {lang === 'ar' ? 'إنشاء عرض سعر للطلب' : (lang === 'ur' ? 'درخواست کے لیے کوٹیشن بنائیں' : 'Generate Quote for Request')} #{selectedReq._id.slice(-6).toUpperCase()}
                  </h3>

                  {/* Details grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
                    <div>
                      <h5 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>{lang === 'ar' ? 'المركبة' : (lang === 'ur' ? 'گاڑی' : 'Vehicle')}</h5>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                        {selectedReq.vehicleId ? `${selectedReq.vehicleId.make} ${selectedReq.vehicleId.model} (${selectedReq.vehicleId.year})` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h5 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>{lang === 'ar' ? 'العميل' : (lang === 'ur' ? 'کسٹمر' : 'Customer')}</h5>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                        {selectedReq.userId?.name || 'N/A'} ({selectedReq.userId?.phone || 'N/A'})
                      </p>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleBuildQuote}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                        {lang === 'ar' ? 'تعيين كراج شريك' : (lang === 'ur' ? 'پارٹنر گیراج تفویض کریں' : 'Assign Partner Garage')}
                      </label>
                      <select
                        value={selectedGarageId}
                        onChange={(e) => setSelectedGarageId(e.target.value)}
                        required
                        style={{
                          width: '100%', padding: '12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#1e293b'
                        }}
                      >
                        <option value="">-- {lang === 'ar' ? 'اختر كراج شريك' : (lang === 'ur' ? 'پارٹنر گیراج منتخب کریں' : 'Choose Partner Garage')} --</option>
                        {garages.map(g => (
                          <option key={g._id} value={g._id}>{g.name} ({g.location?.city || 'UAE'})</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                          {lang === 'ar' ? 'تكلفة قطع الغيار التقديرية (AED)' : (lang === 'ur' ? 'پرزوں کی تخمینی لاگت (AED)' : 'Estimated Parts Cost (AED)')}
                        </label>
                        <input
                          type="number"
                          value={partsCost}
                          onChange={(e) => setPartsCost(e.target.value)}
                          required
                          placeholder="0.00"
                          style={{
                            width: '100%', padding: '12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#1e293b'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                          {lang === 'ar' ? 'تكلفة العمالة التقديرية (AED)' : (lang === 'ur' ? 'لیبر کی تخمینی لاگت (AED)' : 'Estimated Labor Cost (AED)')}
                        </label>
                        <input
                          type="number"
                          value={laborCost}
                          onChange={(e) => setLaborCost(e.target.value)}
                          required
                          placeholder="0.00"
                          style={{
                            width: '100%', padding: '12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#1e293b'
                          }}
                        />
                      </div>
                    </div>

                    {/* Pricing Sheet Preview */}
                    <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '24px', marginBottom: '30px', border: '1px solid #cbd5e1' }}>
                      <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#64748b', marginBottom: '14px' }}>
                        {lang === 'ar' ? 'معاينة تفاصيل الفاتورة الضريبية' : (lang === 'ur' ? 'ٹیکس انوائس کے بریک ڈاؤن کا پیش نظارہ' : 'Tax Invoice breakdown preview')}
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', color: '#475569' }}>
                        <span>{lang === 'ar' ? 'المجموع الفرعي لقطع الغيار + العمالة' : (lang === 'ur' ? 'پرزے + لیبر کا کل مجموعہ' : 'Subtotal Parts + Labor')}</span>
                        <span>AED {subtotal.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', color: '#475569' }}>
                        <span>{lang === 'ar' ? 'رسوم خدمة المنصة (10٪)' : (lang === 'ur' ? 'پلیٹ فارم سروس فیس (10%)' : 'Platform Service Fee (10%)')}</span>
                        <span>AED {serviceFee.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', color: '#475569', borderBottom: '1px dashed #cbd5e1', paddingBottom: '10px' }}>
                        <span>VAT (5%)</span>
                        <span>AED {vat.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontSize: '18px', fontWeight: '800' }}>
                        <span>{lang === 'ar' ? 'إجمالي المستحق على العميل' : (lang === 'ur' ? 'کسٹمر کے ذمہ کل رقم' : 'Total Customer Due')}</span>
                        <span style={{ color: '#10b981' }}>AED {total.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: 'linear-gradient(135deg, #ff5c1a 0%, #e04a0e 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.7 : 1
                      }}
                    >
                      {submitting ? (lang === 'ar' ? 'جاري الإنشاء...' : (lang === 'ur' ? 'بن رہا ہے...' : 'Generating...')) : (lang === 'ar' ? 'اعتماد وإرسال عرض السعر للعميل' : (lang === 'ur' ? 'منظور کریں اور کسٹمر کو کوٹیشن بھیجیں' : 'Approve & Send Quote to Customer'))}
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '100px 20px', color: '#64748b' }}>
                  <span style={{ fontSize: '56px', display: 'block', marginBottom: '16px' }}>👈</span>
                  {lang === 'ar' ? 'اختر طلب عرض سعر معلق من اللوحة اليسرى لتكوين ورقة الفوترة الخاصة به.' : (lang === 'ur' ? 'اس کی بلنگ کوٹ شیٹ کو ترتیب دینے کے لیے بائیں پینل سے ایک معلق کوٹیشن درخواست منتخب کریں۔' : 'Select a pending quote request from the left panel to configure its billing quote sheet.')}
                </div>
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminQuoteBuilder;
