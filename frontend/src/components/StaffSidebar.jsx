import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LuLayoutDashboard,
  LuClipboardList,
  LuTrendingUp,
  LuGlobe
} from 'react-icons/lu';

const StaffSidebar = ({ pendingJobsCount }) => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <aside className="staff-sidebar">
      <div className="sb-profile">
        <div className="sb-profile-av">{user?.firstName?.[0] || 'S'}</div>
        <div>
          <div className="sb-profile-name">{user?.firstName || 'Staff'}</div>
          <div className="sb-profile-role">{user?.role || 'staff'}</div>
        </div>
      </div>

      <span className="sb-label">{t('my_work')}</span>
      <Link to="/admin/staff" className={`sb-link ${isActive('/admin/staff') || isActive('/staff')}`}>
        <span className="si"><LuLayoutDashboard /></span>{t('my_dashboard')}
      </Link>
      <Link to="/my-bookings" className={`sb-link ${isActive('/my-bookings')}`}>
        <span className="si"><LuClipboardList /></span>{t('all_bookings')}
        {pendingJobsCount > 0 && <span className="sb-badge">{pendingJobsCount}</span>}
      </Link>

      {['manager', 'superadmin', 'admin'].includes(user?.role) && (
        <>
          <div className="sb-divider"></div>
          <span className="sb-label">{lang === 'ar' ? 'وصول المسؤول' : (lang === 'ur' ? 'ایڈمن رسائی' : 'Admin Access')}</span>
          <Link to="/admin" className={`sb-link ${isActive('/admin')}`}>
            <span className="si"><LuTrendingUp /></span>{t('full_dashboard')}
          </Link>
        </>
      )}

    </aside>
  );
};

export default StaffSidebar;
