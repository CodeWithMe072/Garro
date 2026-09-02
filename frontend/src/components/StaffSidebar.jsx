import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { API_BASE } from '../config/api';
import {
  LuLayoutDashboard,
  LuClipboardList,
  LuTrendingUp,
  LuGlobe,
  LuUser,
  LuLogOut
} from 'react-icons/lu';

const StaffSidebar = ({ pendingJobsCount }) => {
  const { user, logout } = useAuth();
  const { t, lang } = useLanguage();
  const { toast } = useNotification();
  const location = useLocation();

  const [isOnDuty, setIsOnDuty] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/helpers/me/duty-status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setIsOnDuty(data.dutyStatus !== 'off_duty' && data.isAvailable !== false);
        }
      } catch (err) {
        // silent catch
      }
    };
    fetchStatus();
  }, []);

  const handleToggleDuty = async () => {
    setStatusLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/helpers/me/toggle-duty`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newOnDuty = data.dutyStatus !== 'off_duty' && data.isAvailable !== false;
        setIsOnDuty(newOnDuty);
        toast.success(newOnDuty ? 'Duty status updated to ON DUTY' : 'Duty status updated to OFF DUTY');
      } else {
        toast.error(data.message || 'Failed to update duty status');
      }
    } catch (err) {
      toast.error('Failed to update duty status');
    } finally {
      setStatusLoading(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <aside className="staff-sidebar">
      <div className="sb-profile">
        <div className="sb-profile-av">{user?.firstName?.[0] || 'S'}</div>
        <div>
          <div className="sb-profile-name">{user?.name || user?.firstName || 'Staff'}</div>
          <div className="sb-profile-role">{user?.role || 'staff'}</div>
        </div>
      </div>

      <div className="px-3 mb-3">
        <button
          onClick={handleToggleDuty}
          disabled={statusLoading}
          className={`btn btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-2 py-1.5 ${
            isOnDuty ? 'btn-success text-white' : 'btn-warning text-dark'
          }`}
          style={{ borderRadius: '10px', fontSize: '12px', transition: 'all 0.2s ease' }}
          title={isOnDuty ? 'Click to set OFF DUTY' : 'Click to set ON DUTY'}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnDuty ? '#ffffff' : '#000000', display: 'inline-block' }}></span>
          {statusLoading ? (lang === 'ar' ? 'جارٍ التحديث...' : 'Updating...') : (isOnDuty ? (lang === 'ar' ? 'على رأس العمل 🟢' : 'ON DUTY 🟢') : (lang === 'ar' ? 'خارج الخدمة 🔴' : 'OFF DUTY 🔴'))}
        </button>
      </div>

      <span className="sb-label">{t('my_work')}</span>
      <Link to="/admin/staff" className={`sb-link ${isActive('/admin/staff') || isActive('/staff')}`}>
        <span className="si"><LuLayoutDashboard /></span>{t('my_dashboard')}
      </Link>
      <Link to="/my-bookings" className={`sb-link ${isActive('/my-bookings')}`}>
        <span className="si"><LuClipboardList /></span>{t('all_bookings')}
        {pendingJobsCount > 0 && <span className="sb-badge">{pendingJobsCount}</span>}
      </Link>
      <Link to="/profile" className={`sb-link ${isActive('/profile')}`}>
        <span className="si"><LuUser /></span>{lang === 'ar' ? 'الملف الشخصي' : 'My Profile'}
      </Link>

      {['manager', 'superadmin', 'admin'].includes(user?.role) && (
        <>
          <div className="sb-divider"></div>
          <span className="sb-label">{lang === 'ar' ? 'وصول المسؤول' : 'Admin Access'}</span>
          <Link to="/admin" className={`sb-link ${isActive('/admin')}`}>
            <span className="si"><LuTrendingUp /></span>{t('full_dashboard')}
          </Link>
        </>
      )}

      <div className="sb-divider"></div>
      <button
        onClick={async () => {
          await logout();
          window.location.href = '/login';
        }}
        className="sb-link text-danger border-0 bg-transparent w-100 text-start"
        style={{ cursor: 'pointer' }}
      >
        <span className="si"><LuLogOut /></span>{t('sign_out') || 'Sign Out'}
      </button>
    </aside>
  );
};

export default StaffSidebar;
