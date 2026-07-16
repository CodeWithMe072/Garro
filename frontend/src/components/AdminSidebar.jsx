import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  LuLayoutDashboard,
  LuStore,
  LuSearch,
  LuSettings,
  LuDollarSign,
  LuUsers,
  LuTriangleAlert,
  LuClipboardList,
  LuUser,
  LuBriefcase,
  LuGlobe
} from 'react-icons/lu';

const AdminSidebar = ({ pendingBookings = 0 }) => {
  const { t } = useLanguage();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return 'active';
    if (path !== '/admin' && location.pathname.includes(path)) return 'active';
    return '';
  };

  return (
    <aside className="dash-sidebar" dir="ltr">
      <span className="sidebar-label">{t('overview')}</span>
      <div className="sidebar-section">
        <Link to="/admin" className={`sidebar-link ${isActive('/admin')}`}>
          <span className="icon"><LuLayoutDashboard /></span><span dir="auto">{t('dashboard')}</span>
        </Link>
      </div>

      <span className="sidebar-label" dir="auto">{t('operations')}</span>
      <div className="sidebar-section">
        <Link to="/admin/manage-garages" className={`sidebar-link ${isActive('/admin/manage-garages')}`}>
          <span className="icon"><LuStore /></span><span dir="auto">{t('manage_garages')}</span>
        </Link>
        <Link to="/search" className={`sidebar-link ${isActive('/search')}`}>
          <span className="icon"><LuSearch /></span><span dir="auto">{t('find_garages')}</span>
        </Link>
        <Link to="/admin/catalog" className={`sidebar-link ${isActive('/admin/catalog')}`}>
          <span className="icon"><LuSettings /></span><span dir="auto">{t('system_catalog')}</span>
        </Link>
        <Link to="/admin/quote-builder" className={`sidebar-link ${isActive('/admin/quote-builder')}`}>
          <span className="icon"><LuDollarSign /></span><span dir="auto">{t('quote_builder')}</span>
        </Link>
        <Link to="/admin/customers" className={`sidebar-link ${isActive('/admin/customers')}`}>
          <span className="icon"><LuUsers /></span><span dir="auto">{t('customer_search')}</span>
        </Link>
        <Link to="/admin/complaints" className={`sidebar-link ${isActive('/admin/complaints')}`}>
          <span className="icon"><LuTriangleAlert /></span><span dir="auto">{t('complaints')}</span>
        </Link>
        <Link to="/my-bookings" className={`sidebar-link ${isActive('/my-bookings')}`}>
          <span className="icon"><LuClipboardList /></span><span dir="auto">{t('bookings')}</span>
          {pendingBookings > 0 && <span className="sidebar-badge">{pendingBookings}</span>}
        </Link>
      </div>

      <div className="sidebar-divider"></div>
      <span className="sidebar-label" dir="auto">{t('people')}</span>
      <div className="sidebar-section">
        <Link to="/admin/manage-staff" className={`sidebar-link ${isActive('/admin/manage-staff')}`}>
          <span className="icon"><LuUser /></span><span dir="auto">{t('all_users')}</span>
        </Link>
        <Link to="/admin/staff" className={`sidebar-link ${isActive('/admin/staff')}`}>
          <span className="icon"><LuBriefcase /></span><span dir="auto">{t('staff_view')}</span>
        </Link>
      </div>

      <div className="sidebar-divider"></div>
      <div className="sidebar-section">
        <Link to="/home" className="sidebar-link">
          <span className="icon"><LuGlobe /></span><span dir="auto">{t('back_to_site')}</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
