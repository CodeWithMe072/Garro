import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { API_BASE } from '../config/api';
import {
  LuLayoutDashboard,
  LuWrench,
  LuDollarSign,
  LuUsers,
  LuUser,
  LuLogOut
} from 'react-icons/lu';

const GarageSidebar = ({ activeJobsCount }) => {
  const { user, logout } = useAuth();
  const { t, lang } = useLanguage();
  const { toast } = useNotification();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/garages/portal/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setIsOpen(data.isOpen !== false);
        }
      } catch (err) {
        // silent catch
      }
    };
    fetchStatus();
  }, []);

  const handleToggleOpen = async () => {
    setStatusLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/garages/portal/toggle-open`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsOpen(data.isOpen);
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to toggle garage status');
      }
    } catch (err) {
      toast.error('Failed to toggle garage status');
    } finally {
      setStatusLoading(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const garageName = user?.name || user?.firstName || 'Garage Partner';

  return (
    <aside className="staff-sidebar">
      <div className="sb-profile">
        <div className="sb-profile-av">{garageName[0]?.toUpperCase() || 'G'}</div>
        <div>
          <div className="sb-profile-name">{garageName}</div>
          <div className="sb-profile-role">{lang === 'ar' ? 'شريك الكراج' : 'Garage Partner'}</div>
        </div>
      </div>

      <div className="px-3 mb-3">
        <button
          onClick={handleToggleOpen}
          disabled={statusLoading}
          className={`btn btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-2 py-1.5 ${
            isOpen ? 'btn-success text-white' : 'btn-danger text-white'
          }`}
          style={{ borderRadius: '10px', fontSize: '12px', transition: 'all 0.2s ease' }}
          title={isOpen ? 'Click to Mark Garage CLOSED' : 'Click to Mark Garage OPEN'}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffffff', display: 'inline-block' }}></span>
          {statusLoading ? (lang === 'ar' ? 'جارٍ التحديث...' : 'Updating...') : (isOpen ? (lang === 'ar' ? 'الكراج مفتوح 🟢' : 'Garage OPEN 🟢') : (lang === 'ar' ? 'الكراج مغلق 🔴' : 'Garage CLOSED 🔴'))}
        </button>
      </div>

      <span className="sb-label">{lang === 'ar' ? 'بوابة الكراج' : 'GARAGE PORTAL'}</span>
      
      <Link to="/garage-portal" className={`sb-link ${isActive('/garage-portal')}`}>
        <span className="si"><LuLayoutDashboard /></span>
        {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
      </Link>

      <Link to="/garage-portal/jobs" className={`sb-link ${isActive('/garage-portal/jobs')}`}>
        <span className="si"><LuWrench /></span>
        {lang === 'ar' ? 'بطاقات الأعمال والطلبات' : 'Job Cards & Leads'}
        {activeJobsCount > 0 && <span className="sb-badge">{activeJobsCount}</span>}
      </Link>

      <Link to="/garage-portal/earnings" className={`sb-link ${isActive('/garage-portal/earnings')}`}>
        <span className="si"><LuDollarSign /></span>
        {lang === 'ar' ? 'الأرباح والدفعات' : 'Earnings & Ledger'}
      </Link>

      <Link to="/garage-portal/staff" className={`sb-link ${isActive('/garage-portal/staff')}`}>
        <span className="si"><LuUsers /></span>
        {lang === 'ar' ? 'طاقم العمل والفنيين' : 'Garage Staff'}
      </Link>

      <Link to="/profile" className={`sb-link ${isActive('/profile')}`}>
        <span className="si"><LuUser /></span>
        {lang === 'ar' ? 'الملف الشخصي' : 'My Profile'}
      </Link>

      <div className="sb-divider"></div>
      
      <button
        onClick={async () => {
          await logout();
          window.location.href = '/login';
        }}
        className="sb-link text-danger border-0 bg-transparent w-100 text-start"
        style={{ cursor: 'pointer' }}
      >
        <span className="si"><LuLogOut /></span>
        {t('sign_out') || 'Sign Out'}
      </button>
    </aside>
  );
};

export default GarageSidebar;
