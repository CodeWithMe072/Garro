import React, { useState, useEffect } from 'react';
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
  LuGlobe,
  LuMessageCircle,
  LuTrendingUp,
  LuChevronLeft,
  LuChevronRight,
  LuSlidersHorizontal
} from 'react-icons/lu';

const AdminSidebar = ({ pendingBookings }) => {
  const { t } = useLanguage();
  const location = useLocation();

  // Load collapsed state from localStorage
  const [isCollapsed, setIsCollapsed] = useState(
    localStorage.getItem('admin_sidebar_collapsed') === 'true'
  );

  // Sync state and apply class to .dash-wrapper on mount and state change
  useEffect(() => {
    const wrapper = document.querySelector('.dash-wrapper');
    if (wrapper) {
      if (isCollapsed) {
        wrapper.classList.add('collapsed');
      } else {
        wrapper.classList.remove('collapsed');
      }
    }
  }, [isCollapsed]);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('admin_sidebar_collapsed', String(nextState));
  };

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return 'active';
    if (path !== '/admin' && location.pathname.includes(path)) return 'active';
    return '';
  };

  const [bookingsCount, setBookingsCount] = useState(pendingBookings || 0);

  useEffect(() => {
    if (pendingBookings !== undefined) {
      setBookingsCount(pendingBookings);
      return;
    }

    const fetchPendingCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/requests?limit=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          const count = data.filter(b => b.status === 'new').length;
          setBookingsCount(count);
        } else if (res.ok && data.success && Array.isArray(data.requests)) {
          const count = data.requests.filter(b => b.status === 'new').length;
          setBookingsCount(count);
        }
      } catch (err) {
        console.error('Error fetching pending bookings count:', err);
      }
    };

    fetchPendingCount();
  }, [pendingBookings]);

  return (
    <aside className="dash-sidebar">
      {isCollapsed ? (
        <div className="sidebar-toggle-container" style={{ display: 'flex', justifyContent: 'center', padding: '0 0 12px', borderBottom: '1px solid #e2e8f0', marginBottom: '8px' }}>
          <button className="sidebar-toggle-btn" onClick={toggleSidebar} title="Expand Sidebar">
            <LuChevronRight />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 12px 6px' }}>
          <span className="sidebar-label" style={{ padding: 0, margin: 0, textTransform: 'uppercase', fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', color: '#94a3b8' }}>
            {t('overview')}
          </span>
          <button className="sidebar-toggle-btn" onClick={toggleSidebar} title="Collapse Sidebar" style={{ margin: 0 }}>
            <LuChevronLeft />
          </button>
        </div>
      )}

      <div className="sidebar-section" style={{ marginTop: isCollapsed ? '0' : '8px' }}>
        <Link to="/admin" className={`sidebar-link ${isActive('/admin')}`}>
          <span className="icon"><LuLayoutDashboard /></span>
          <span className="link-text">{t('dashboard')}</span>
        </Link>
      </div>

      <span className="sidebar-label" dir="auto">{t('operations')}</span>
      <div className="sidebar-section">
        <Link to="/admin/manage-garages" className={`sidebar-link ${isActive('/admin/manage-garages')}`}>
          <span className="icon"><LuStore /></span>
          <span className="link-text">{t('manage_garages')}</span>
        </Link>
        <Link to="/search" className={`sidebar-link ${isActive('/search')}`}>
          <span className="icon"><LuSearch /></span>
          <span className="link-text">{t('find_garages')}</span>
        </Link>
        <Link to="/admin/catalog" className={`sidebar-link ${isActive('/admin/catalog')}`}>
          <span className="icon"><LuSlidersHorizontal /></span>
          <span className="link-text">{t('system_catalog')}</span>
        </Link>
        <Link to="/admin/quote-builder" className={`sidebar-link ${isActive('/admin/quote-builder')}`}>
          <span className="icon"><LuDollarSign /></span>
          <span className="link-text">{t('quote_builder')}</span>
        </Link>
        <Link to="/admin/customers" className={`sidebar-link ${isActive('/admin/customers')}`}>
          <span className="icon"><LuUser /></span>
          <span className="link-text">{t('customer_search')}</span>
        </Link>
        <Link to="/admin/complaints" className={`sidebar-link ${isActive('/admin/complaints')}`}>
          <span className="icon"><LuTriangleAlert /></span>
          <span className="link-text">{t('complaints')}</span>
        </Link>
        <Link to="/admin/support" className={`sidebar-link ${isActive('/admin/support')}`}>
          <span className="icon"><LuMessageCircle /></span>
          <span className="link-text">{t('support')}</span>
        </Link>
        <Link to="/admin/reports" className={`sidebar-link ${isActive('/admin/reports')}`}>
          <span className="icon"><LuTrendingUp /></span>
          <span className="link-text">{t('reports_analytics')}</span>
        </Link>
        <Link to="/admin/settings" className={`sidebar-link ${isActive('/admin/settings')}`}>
          <span className="icon"><LuSettings /></span>
          <span className="link-text">{t('system_settings')}</span>
        </Link>
        <Link to="/my-bookings" className={`sidebar-link ${isActive('/my-bookings')}`}>
          <span className="icon"><LuClipboardList /></span>
          <span className="link-text">{t('bookings')}</span>
          {bookingsCount > 0 && <span className="sidebar-badge">{bookingsCount}</span>}
        </Link>
      </div>

      <div className="sidebar-divider"></div>
      <span className="sidebar-label" dir="auto">{t('people')}</span>
      <div className="sidebar-section">
        <Link to="/admin/manage-staff" className={`sidebar-link ${isActive('/admin/manage-staff')}`}>
          <span className="icon"><LuUsers /></span>
          <span className="link-text">{t('all_users')}</span>
        </Link>
        <Link to="/admin/staff" className={`sidebar-link ${isActive('/admin/staff')}`}>
          <span className="icon"><LuBriefcase /></span>
          <span className="link-text">{t('staff_view')}</span>
        </Link>
        <Link to="/admin/manage-staff" className={`sidebar-link ${isActive('/admin/manage-staff')}`}>
          <span className="icon"><LuUser /></span>
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
  );
};

export default AdminSidebar;
