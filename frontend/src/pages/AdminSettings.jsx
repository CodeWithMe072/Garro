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
  LuMessageCircle,
  LuDollarSign,
  LuTrendingUp
} from 'react-icons/lu';
import { useLanguage } from '../context/LanguageContext';

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import AdminSidebar from '../components/AdminSidebar';

const AdminSettings = () => {
  const [vat, setVat] = useState(5);
  const [serviceFee, setServiceFee] = useState(10);
  const [assignMode, setAssignMode] = useState('manual');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { toast } = useNotification();
  const navigate = useNavigate();

  const { t, lang, changeLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);


  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch settings.');
      }
      const s = data.settings;
      setVat(s.vatPercentage);
      setServiceFee(s.serviceFeePercentage);
      setAssignMode(s.assignMode || 'manual');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vatPercentage: vat,
          serviceFeePercentage: serviceFee,
          assignMode
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save settings.');
      }
      toast.success('System settings updated successfully.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dash-wrapper">
      {/* ── SIDEBAR ── */}
      <AdminSidebar />

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main" style={{ background: '#f1f5f9', minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          
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

          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: '#1e293b', letterSpacing: '-0.025em' }}>
            ⚙️ {lang === 'ar' ? 'تهيئة النظام' : (lang === 'ur' ? 'سسٹم کنفیگریشن' : 'System Configuration')}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
            {lang === 'ar' ? 'إدارة رسوم السوق العالمية، معلمات الضرائب، وتكوينات تعيين المساعدين.' : (lang === 'ur' ? 'عالمی مارکیٹ پلیس کی فیس، ٹیکس کے پیرامیٹرز اور مددگاروں کے تفویض کی ترتیبات کا انتظام کریں۔' : 'Manage global marketplace fees, tax parameters, and helper assignment configurations.')}
          </p>

          {loading ? (
            <p style={{ color: '#64748b' }}>{t('loading')}</p>
          ) : (
          <form onSubmit={handleSubmit} style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
                {lang === 'ar' ? 'ضريبة القيمة المضافة (VAT %)' : (lang === 'ur' ? 'ویلیو ایڈڈ ٹیکس (VAT %)' : 'Value Added Tax (VAT %)')}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={vat}
                onChange={(e) => setVat(e.target.value)}
                style={{
                  width: '100%',
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#1e293b',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
                required
              />
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '6px' }}>
                {lang === 'ar' ? 'تطبق عالمياً على المجموع الفرعي ورسوم الخدمة في الفواتير. الافتراضي هو 5٪.' : (lang === 'ur' ? 'انوائسز پر کل رقم اور سروس فیس پر لاگو ہوتا ہے۔ ڈیفالٹ 5% ہے۔' : 'Applied globally to the subtotal and service fee on invoices. Default is 5%.')}
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
                {lang === 'ar' ? 'رسوم خدمة السوق (٪)' : (lang === 'ur' ? 'مارکیٹ پلیس سروس فیس (%)' : 'Marketplace Service Fee (%)')}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={serviceFee}
                onChange={(e) => setServiceFee(e.target.value)}
                style={{
                  width: '100%',
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#1e293b',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
                required
              />
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '6px' }}>
                {lang === 'ar' ? 'يتم خصم رسوم منصة غارو من المجموع الفرعي لقطع الغيار والعمالة. الافتراضي هو 10٪.' : (lang === 'ur' ? 'حصوں اور لیبر کے کل مجموعہ سے گارو پلیٹ فارم فیس کاٹی جائے گی۔ ڈیفالٹ 10% ہے۔' : 'Garro marketplace platform fee deducted from the total parts and labor subtotal. Default is 10%.')}
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
                {lang === 'ar' ? 'وضع تعيين المساعد' : (lang === 'ur' ? 'مددگار تفویض کا طریقہ' : 'Helper Assignment Mode')}
              </label>
              <select
                value={assignMode}
                onChange={(e) => setAssignMode(e.target.value)}
                style={{
                  width: '100%',
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#1e293b',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
                required
              >
                <option value="manual">{lang === 'ar' ? 'تعيين يدوي (يختاره المسؤول)' : (lang === 'ur' ? 'دستی تفویض (ایڈمن کے ذریعہ منتخب کردہ)' : 'Manual Assignment (Admin selected)')}</option>
              </select>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '6px' }}>
                {lang === 'ar' ? 'التحكم في كيفية تعيين المساعدين لبطاقات الحجز. حالياً يتم دعم الوضع اليدوي فقط.' : (lang === 'ur' ? 'بکنگ کارڈز پر ہیلپرز کو تفویض کرنے کا طریقہ کار۔ فی الحال صرف دستی طریقہ سپورٹڈ ہے۔' : 'Control how helpers are assigned to booking cards. Currently only Manual mode is supported.')}
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                background: 'linear-gradient(135deg, #ff5c1a 0%, #e04a0e 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '14px',
                color: 'white',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                opacity: saving ? 0.7 : 1,
                marginTop: '12px'
              }}
            >
              {saving ? (lang === 'ar' ? 'جاري الحفظ...' : (lang === 'ur' ? 'محفوظ ہو رہا ہے...' : 'Saving Config...')) : (lang === 'ar' ? 'حفظ الإعدادات' : (lang === 'ur' ? 'ترتیبات محفوظ کریں' : 'Save Configuration'))}
            </button>
          </form>
        )}
      </div>
      </main>
    </div>
  );
};

export default AdminSettings;
