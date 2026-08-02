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
  LuMail,
  LuPhone,
  LuCar,
  LuFileText,
  LuDollarSign,
  LuTriangleAlert,
  LuMessageCircle,
  LuTrendingUp,
  LuMegaphone
} from 'react-icons/lu';
import { useLanguage } from '../context/LanguageContext';

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import AdminSidebar from '../components/AdminSidebar';

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userVehicles, setUserVehicles] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const { toast } = useNotification();
  const navigate = useNavigate();

  const { t, lang, changeLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);


  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/users?role=customer${search ? `&search=${search}` : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch customer list.');
      }
      setUsers(data.users || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleSelectUser = async (userObj) => {
    setSelectedUser(userObj);
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // 1. Fetch user's vehicles (admin view fetches all vehicles, so we filter by userId)
      const vehRes = await fetch(`${API_BASE}/api/vehicles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const vehData = await vehRes.json();
      if (vehRes.ok && vehData.success) {
        const filteredVeh = (vehData.vehicles || []).filter(v => v.userId?._id === userObj._id || v.userId === userObj._id);
        setUserVehicles(filteredVeh);
      }

      // 2. Fetch user's requests (admin view fetches all requests, so we filter by userId)
      const reqRes = await fetch(`${API_BASE}/api/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reqData = await reqRes.json();
      if (reqRes.ok && reqData.success) {
        const filteredReq = (reqData.requests || []).filter(r => r.userId?._id === userObj._id || r.userId === userObj._id);
        setUserRequests(filteredReq);
      }
    } catch (err) {
      console.error('Failed to load user profile details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="dash-wrapper">
      {/* ── SIDEBAR ── */}
      <AdminSidebar />

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main">
        <div className="dash-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="dash-title d-flex align-items-center gap-2">
              <LuUsers className="text-primary-garro" />
              <span>{lang === 'ar' ? 'دليل وسجل العملاء' : (lang === 'ur' ? 'کسٹمر ڈائریکٹری اور ہسٹری' : 'Customer Directory & History')}</span>
            </div>
            <div className="dash-subtitle">{lang === 'ar' ? 'البحث عن بيانات العملاء المسجلين وعرض سجلات المعاملات والحجوزات الخاصة بهم.' : (lang === 'ur' ? 'رجسٹرڈ کسٹمر ڈیٹا بیس تلاش کریں اور ان کی بکنگ اور ادائیگی کی سرگزشت دیکھیں۔' : 'Search registered customer database and view active booking and payment histories.')}</div>
          </div>
          <Link to="/admin/bulk-message" className="btn btn-primary d-flex align-items-center gap-2" style={{ borderRadius: '24px', padding: '10px 20px', fontWeight: 600 }}>
            <LuMegaphone size={16} /> Bulk Announcement
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px' }}>
          
          {/* Left Column: Search & Customers list */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder={lang === 'ar' ? 'البحث بالاسم أو البريد الإلكتروني أو الهاتف...' : (lang === 'ur' ? 'نام، ای میل یا فون سے تلاش کریں...' : 'Search by name, email, or phone...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#1e293b', fontSize: '14px', outline: 'none'
                }}
              />
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '16px', color: '#64748b' }}>
              {lang === 'ar' ? 'العملاء المسجلين' : (lang === 'ur' ? 'رجسٹرڈ کسٹمرز' : 'Registered Customers')} ({users.length})
            </h3>

            {loading ? (
              <p style={{ color: '#64748b' }}>{t('loading')}</p>
            ) : users.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
                {lang === 'ar' ? 'لم يتم العثور على سجلات للعملاء.' : (lang === 'ur' ? 'کوئی کسٹمر ریکارڈ نہیں ملا۔' : 'No customer records found.')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '65vh', overflowY: 'auto' }}>
                {users.map(u => (
                  <div
                    key={u._id}
                    onClick={() => handleSelectUser(u)}
                    style={{
                      background: selectedUser?._id === u._id ? '#fff4ef' : '#fff',
                      border: selectedUser?._id === u._id ? '1.5px solid #ff5c1a' : '1.5px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      color: '#1e293b'
                    }}
                  >
                    <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px', color: selectedUser?._id === u._id ? '#ff5c1a' : '#1e293b' }}>{u.name}</h4>
                    <p style={{ color: '#64748b', fontSize: '12.5px', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '4px' }}><LuMail size={13} /> {u.email}</p>
                    <p style={{ color: '#64748b', fontSize: '12.5px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}><LuPhone size={13} /> {u.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Customer Dossier */}
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid #e2e8f0',
            color: '#1e293b',
            alignSelf: 'start'
          }}>
            {selectedUser ? (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#1e293b' }}>
                  {selectedUser.name}
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                  {lang === 'ar' ? 'معرف العميل' : (lang === 'ur' ? 'کسٹمر آئی ڈی' : 'Customer ID')}: #{selectedUser._id} &nbsp;|&nbsp; {lang === 'ar' ? 'تاريخ الانضمام' : (lang === 'ur' ? 'شامل ہونے کی تاریخ' : 'Joined')}: {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>

                {detailsLoading ? (
                  <p style={{ color: '#64748b' }}>{t('loading')}</p>
                ) : (
                  <div>
                    {/* Vehicles */}
                    <div style={{ marginBottom: '32px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#ff5c1a', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <LuCar /> {lang === 'ar' ? 'المركبات المسجلة' : (lang === 'ur' ? 'رجسٹرڈ گاڑیاں' : 'Registered Vehicles')} ({userVehicles.length})
                      </h4>
                      {userVehicles.length === 0 ? (
                        <p style={{ color: '#64748b', fontSize: '13px' }}>{lang === 'ar' ? 'لا توجد مركبات مسجلة في هذا الملف الشخصي.' : (lang === 'ur' ? 'اس پروفائل کے تحت کوئی گاڑیاں رجسٹرڈ نہیں ہیں۔' : 'No vehicles registered under this profile.')}</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                          {userVehicles.map(v => (
                            <div key={v._id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <strong style={{ fontSize: '14px', color: '#1e293b' }}>{v.make} {v.model}</strong>
                              <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
                                {lang === 'ar' ? 'السنة' : (lang === 'ur' ? 'سال' : 'Year')}: {v.year} <br />
                                {lang === 'ar' ? 'اللوحة' : (lang === 'ur' ? 'پلیٹ نمبر' : 'Plate')}: {v.registrationNumber}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Request History */}
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#ff5c1a', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <LuFileText /> {lang === 'ar' ? 'سجل الطلبات والوظائف' : (lang === 'ur' ? 'درخواستوں اور جابز کا لاگ' : 'Service Request & Job Logs')} ({userRequests.length})
                      </h4>
                      {userRequests.length === 0 ? (
                        <p style={{ color: '#64748b', fontSize: '13px' }}>{lang === 'ar' ? 'لا توجد طلبات مقدمة من هذا العميل.' : (lang === 'ur' ? 'اس گاہک کی طرف سے کوئی درخواست جمع نہیں کی گئی ہے۔' : 'No requests submitted by this customer.')}</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {userRequests.map(r => (
                            <div key={r._id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>#{r._id.slice(-6).toUpperCase()} — {new Date(r.createdAt).toLocaleDateString()}</span>
                                <strong style={{ display: 'block', fontSize: '14px', marginTop: '2px', color: '#1e293b' }}>{(r.subCategory || r.serviceType)?.replace(/_/g, ' ').toUpperCase()}</strong>
                                <span style={{ fontSize: '13px', color: '#475569' }}>{r.description}</span>
                              </div>
                              <span style={{
                                background: r.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,92,26,0.1)',
                                color: r.status === 'completed' ? '#10b981' : '#ff5c1a',
                                borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: '700'
                              }}>
                                {r.status.toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '120px 20px', color: '#64748b' }}>
                <span style={{ fontSize: '48px', display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#ff5c1a' }}><LuUser /></span>
                {lang === 'ar' ? 'اختر ملف تعريف العميل من اللوحة اليسرى لفحص ملفه ومركباته وسجلاته.' : (lang === 'ur' ? 'ان کی فائل، گاڑیوں اور لاگز کا معائنہ کرنے کے لیے بائیں پینل سے کسٹمر پروفائل منتخب کریں۔' : 'Select a customer profile from the left panel to inspect their dossier, vehicles, and logs.')}
              </div>
            )}
          </div>

        </div>      </main>
    </div>
  );
};

export default AdminCustomers;
