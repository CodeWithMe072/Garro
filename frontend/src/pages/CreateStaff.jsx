import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { 
  LuCircleCheck, 
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
  LuStar
} from 'react-icons/lu';
import { useLanguage } from '../context/LanguageContext';

const CreateStaff = () => {
  const navigate = useNavigate();
  const { toast } = useNotification();
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

  const [role, setRole] = useState('staff');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    password: '',
    confirmPassword: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone || '+971501111111',
          password: formData.password,
          role: role === 'staff' ? 'helper' : 'manager'
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create staff account.');
      }

      toast.success('Staff account created successfully!');
      navigate('/admin/manage-staff');
    } catch (err) {
      toast.error(err.message || 'Error creating staff account.');
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
          <Link to="/my-bookings" className="sidebar-link">
            <span className="icon"><LuClipboardList /></span>
            <span className="link-text">{t('bookings')}</span>
          </Link>
        </div>

        <div className="sidebar-divider"></div>
        <span className="sidebar-label">{t('people')}</span>
        <div className="sidebar-section">
          <Link to="/admin/manage-staff" className="sidebar-link active">
            <span className="icon"><LuUser /></span>
            <span className="link-text">{t('all_users')}</span>
          </Link>
          <Link to="/admin/staff" className="sidebar-link">
            <span className="icon"><LuBriefcase /></span>
            <span className="link-text">{t('staff_view')}</span>
          </Link>
          <Link to="/admin/manage-staff" className="sidebar-link active">
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
        <div className="card" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div className="card-head" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/admin/manage-staff" className="back" style={{ textDecoration: 'none' }}>
                <span className="material-icons-round" style={{ fontSize: '16px', verticalAlign: 'middle' }}>arrow_back</span> 
                {lang === 'ar' ? 'العودة لإدارة الموظفين' : (lang === 'ur' ? 'اسٹاف مینیجمنٹ پر واپس جائیں' : 'Back to Staff Management')}
              </Link>

              {/* Language Switcher */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  style={{ borderRadius: '10px', padding: '6px 12px', fontSize: '12.5px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
                >
                  <LuGlobe size={13} /> {lang === 'en' ? 'English' : (lang === 'ar' ? 'العربية' : 'اردو')}
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

            <h1 className="d-flex align-items-center gap-2"><LuBriefcase /> {t('add_new_helper')}</h1>
            <p>{t('create_internal_credentials')}</p>
          </div>

        <div className="card-body">
          <div className="info-box">
            <span className="material-icons-round">info</span>
            <div>The staff member will be able to log in immediately with the password you set. You can also <Link to="/admin/manage-staff" style={{ color: '#1d4ed8', fontWeight: '600' }}>send an invite link</Link> instead so they set their own password.</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="section-title">Personal Information</div>
            <div className="form-row">
              <div className="fg">
                <label>First Name *</label>
                <input type="text" className="inp" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="fg">
                <label>Last Name *</label>
                <input type="text" className="inp" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="fg">
              <label>Email Address *</label>
              <div className="inp-wrap">
                <span className="material-icons-round">email</span>
                <input type="email" className="inp" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="hint">This will be their login username.</div>
            </div>

            <div className="form-row">
              <div className="fg">
                <label>Phone</label>
                <div className="inp-wrap">
                  <span className="material-icons-round">phone</span>
                  <input type="text" className="inp" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
              </div>
              <div className="fg">
                <label>Employee ID</label>
                <div className="inp-wrap">
                  <span className="material-icons-round">badge</span>
                  <input type="text" className="inp" name="employeeId" value={formData.employeeId} onChange={handleChange} />
                </div>
                <div className="hint">Optional, e.g. EMP-001</div>
              </div>
            </div>

            <div className="fg">
              <label>Department</label>
              <div className="inp-wrap">
                <span className="material-icons-round">business</span>
                <input type="text" className="inp" name="department" value={formData.department} onChange={handleChange} />
              </div>
            </div>

            <div className="section-title">Role</div>
            <div className="role-cards">
              <label className={`role-card ${role === 'staff' ? 'selected' : ''}`}>
                <input type="radio" name="role" value="staff" checked={role === 'staff'} onChange={() => setRole('staff')} />
                <div className="rc-check"><span className="material-icons-round" style={{ color: 'white', fontSize: '14px' }}>check</span></div>
                <div className="rc-icon"><LuUser /></div>
                <div className="rc-name">Staff</div>
                <div className="rc-desc">Can manage assigned bookings, update statuses, view their schedule.</div>
              </label>
              <label className={`role-card ${role === 'manager' ? 'selected' : ''}`}>
                <input type="radio" name="role" value="manager" checked={role === 'manager'} onChange={() => setRole('manager')} />
                <div className="rc-check"><span className="material-icons-round" style={{ color: 'white', fontSize: '14px' }}>check</span></div>
                <div className="rc-icon" style={{ color: '#f59e0b' }}><LuStar /></div>
                <div className="rc-name">Manager</div>
                <div className="rc-desc">Full access — can view all bookings, create staff, and access analytics.</div>
              </label>
            </div>

            <div className="section-title">Set Password</div>
            <div className="form-row">
              <div className="fg">
                <label>Temporary Password *</label>
                <div className="inp-wrap">
                  <span className="material-icons-round">lock</span>
                  <input type="password" className="inp" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
                </div>
              </div>
              <div className="fg">
                <label>Confirm Password *</label>
                <div className="inp-wrap">
                  <span className="material-icons-round">lock</span>
                  <input type="password" className="inp" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength="6" />
                </div>
              </div>
            </div>

            <div className="fg">
              <label>Internal Notes</label>
              <textarea className="inp" name="notes" rows="3" value={formData.notes} onChange={handleChange}></textarea>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <Link to="/admin/manage-staff" className="btn-secondary" style={{ textDecoration: 'none' }}>{t('cancel')}</Link>
              <button type="submit" className="btn-submit d-inline-flex align-items-center"><LuCircleCheck className="me-1" /> {t('create_staff_account')}</button>
            </div>
          </form>
        </div>
      </div>
      </main>
    </div>
  );
};

export default CreateStaff;
