import { API_BASE } from '../config/api';
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
      <main className="dash-main">
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>

          <div className="dash-header mb-4" style={{ display: 'block' }}>
            <div className="dash-title d-flex align-items-center gap-2">
              <LuSettings className="text-primary-garro" />
              <span>{lang === 'ar' ? 'تهيئة النظام' : (lang === 'ur' ? 'سسٹم کنفیگریشن' : 'System Configuration')}</span>
            </div>
            <div className="dash-subtitle">{lang === 'ar' ? 'إدارة رسوم السوق العالمية، معلمات الضرائب، وتكوينات تعيين المساعدين.' : (lang === 'ur' ? 'عالمی مارکیٹ پلیس کی فیس، ٹیکس کے پیرامیٹرز اور مددگاروں کے تفویض کی ترتیبات کا انتظام کریں۔' : 'Manage global marketplace fees, tax parameters, and helper assignment configurations.')}</div>
          </div>

          {loading ? (
            <p style={{ color: '#64748b' }}>{t('loading')}</p>
          ) : (
          <form onSubmit={handleSubmit} className="complaint-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
                {lang === 'ar' ? 'ضريبة القيمة المضافة (VAT %)' : (lang === 'ur' ? 'ویلیو ایڈڈ ٹیکس (VAT %)' : 'Value Added Tax (VAT %)')}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={vat}
                onChange={(e) => setVat(e.target.value)}
                className="chat-search-input"
                required
              />
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '6px' }}>
                {lang === 'ar' ? 'تطبق عالمياً على المجموع الفرعي ورسوم الخدمة في الفواتير. الافتراضي هو 5٪.' : (lang === 'ur' ? 'انوائسز پر کل رقم اور سروس فیس پر لاگو ہوتا ہے۔ ڈیفالٹ 5% ہے۔' : 'Applied globally to the subtotal and service fee on invoices. Default is 5%.')}
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
                {lang === 'ar' ? 'رسوم خدمة السوق (٪)' : (lang === 'ur' ? 'مارکیٹ پلیس سروس فیس (%)' : 'Marketplace Service Fee (%)')}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={serviceFee}
                onChange={(e) => setServiceFee(e.target.value)}
                className="chat-search-input"
                required
              />
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '6px' }}>
                {lang === 'ar' ? 'يتم خصم رسوم منصة غارو من المجموع الفرعي لقطع الغيار والعمالة. الافتراضي هو 10٪.' : (lang === 'ur' ? 'حصوں اور لیبر کے کل مجموعہ سے گارو پلیٹ فارم فیس کاٹی جائے گی۔ ڈیفالٹ 10% ہے۔' : 'Garro marketplace platform fee deducted from the total parts and labor subtotal. Default is 10%.')}
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
                {lang === 'ar' ? 'وضع تعيين المساعد' : (lang === 'ur' ? 'مددگار تفویض کا طریقہ' : 'Helper Assignment Mode')}
              </label>
              <select
                value={assignMode}
                onChange={(e) => setAssignMode(e.target.value)}
                className="form-select text-dark"
                style={{
                  background: '#fff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '13.5px'
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
              className="btn-garro btn-primary-garro w-100 py-2.5"
              style={{
                height: '46px',
                fontSize: '14.5px',
                fontWeight: '700',
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
