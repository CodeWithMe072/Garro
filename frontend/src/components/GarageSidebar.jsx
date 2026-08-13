import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LuLayoutDashboard,
  LuWrench,
  LuDollarSign,
  LuUsers,
  LuLogOut
} from 'react-icons/lu';

const GarageSidebar = ({ activeJobsCount }) => {
  const { user, logout } = useAuth();
  const { t, lang } = useLanguage();
  const location = useLocation();

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
