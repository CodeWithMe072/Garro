import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, toggleLanguage, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Notification Drawer states
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleMarkAsRead = async (id) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getInitial = (str) => (str ? str.charAt(0).toUpperCase() : '');

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`) ? 'active' : '';

  return (
    <nav className="g-nav">
      <div className="container">
        
        {/* Logo */}
        <Link className="g-logo" to={isAuthenticated ? '/home' : '/'}>
          <div className="g-logo-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
          <span className="g-logo-text">Ga<span>rro</span></span>
        </Link>

        {/* Nav Links */}
        <ul className={`g-nav-links ${isMobileMenuOpen ? 'open' : ''}`} id="navLinks">
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/home" className={isActive('/home')}>
                  <span className="material-icons-round">home</span> Home
                </Link>
              </li>
              <li>
                <Link to="/insurance" className={isActive('/insurance')}>
                  <span className="material-icons-round">shield</span> {t('insurance')}
                </Link>
              </li>
              {user?.role === 'customer' && (
                <>
                  <li>
                    <Link to="/roadside" className={isActive('/roadside')}>
                      <span className="material-icons-round">emergency</span> {t('roadside')}
                    </Link>
                  </li>

                  <li>
                    <Link to="/end-of-life" className={isActive('/end-of-life')}>
                      <span className="material-icons-round">recycling</span> {t('scrap')}
                    </Link>
                  </li>
                </>
              )}
              {['staff', 'manager', 'superadmin'].includes(user?.role) && (
                <li>
                  <Link to={user?.role === 'staff' ? '/admin/staff' : '/admin'} className={location.pathname.includes('admin') ? 'active' : ''}>
                    <span className="material-icons-round">bolt</span> {t('dashboard')}
                  </Link>
                </li>
              )}
            </>
          ) : (
            <li>
              <Link to="/"><span className="material-icons-round">home</span> {t('home')}</Link>
            </li>
          )}
        </ul>

        {/* Right Side */}
        <div className="g-nav-right">
          {isAuthenticated ? (
            <>
              {/* Role Badges */}
              {user?.role === 'staff' && (
                <Link to="/admin/staff" className="role-pill staff d-none d-md-flex">
                  <span className="dot"></span>Staff
                </Link>
              )}
              {['manager', 'superadmin'].includes(user?.role) && (
                <Link to="/admin" className={`role-pill ${user.role} d-none d-md-flex`}>
                  <span className="dot"></span>{user.role === 'manager' ? 'Manager' : 'Admin'}
                </Link>
              )}

              {/* Emergency Pickup CTA */}
              {user?.role === 'customer' && (
                <Link to="/emergency-pickup" className="btn-emergency d-none d-md-inline-flex" style={{ marginRight: '8px' }}>
                  <span className="material-icons-round" style={{ fontSize: '16px' }}>local_shipping</span>
                  Emergency Pickup
                </Link>
              )}

              {/* Language Selector Dropdown */}
              <div 
                className="g-lang-dropdown"
                style={{ position: 'relative', marginRight: '12px', paddingBottom: '8px', marginBottom: '-8px' }}
              >
                <button
                  className="g-lang-toggle"
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    color: '#475569',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.18s'
                  }}
                >
                  🌐 {lang === 'en' ? 'English' : 'العربية'}
                </button>

                <div 
                  className="g-lang-dropdown-menu"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '4px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
                    zIndex: 1000,
                    minWidth: '120px',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <button
                    onClick={() => changeLanguage('en')}
                    style={{
                      background: lang === 'en' ? '#fff4ef' : 'none',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: lang === 'en' ? '#ff5c1a' : '#475569',
                      fontSize: '13px',
                      fontWeight: lang === 'en' ? '700' : '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span>English</span>
                    {lang === 'en' && <span style={{ fontSize: '11px', fontWeight: 'bold' }}>✓</span>}
                  </button>
                  <button
                    onClick={() => changeLanguage('ar')}
                    style={{
                      background: lang === 'ar' ? '#fff4ef' : 'none',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: lang === 'ar' ? '#ff5c1a' : '#475569',
                      fontSize: '13px',
                      fontWeight: lang === 'ar' ? '700' : '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span>العربية</span>
                    {lang === 'ar' && <span style={{ fontSize: '11px', fontWeight: 'bold' }}>✓</span>}
                  </button>
                </div>
              </div>

              {/* Notification Bell */}
              <div className={`g-dropdown ${isNotifOpen ? 'open' : ''}`} ref={notifRef} style={{ marginRight: '16px', position: 'relative' }}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="g-nav-icon-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#475569',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.18s'
                  }}
                >
                  <span className="material-icons-round" style={{ fontSize: '24px' }}>notifications</span>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: '#ff5c1a',
                      color: 'white',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      fontSize: '10px',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 8px rgba(255, 92, 26, 0.4)'
                    }}>
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                <div className="g-dropdown-menu" style={{ width: '320px', right: 0, left: 'auto', maxHeight: '400px', overflowY: 'auto', padding: '12px 0' }}>
                  <div style={{ padding: '0 16px 8px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>Notifications</span>
                    <button
                      onClick={async () => {
                        const unread = notifications.filter(n => !n.read);
                        await Promise.all(unread.map(n => handleMarkAsRead(n._id)));
                      }}
                      style={{ background: 'none', border: 'none', color: '#ff5c1a', fontSize: '11px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                    >
                      Mark all read
                    </button>
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n._id}
                        onClick={() => handleMarkAsRead(n._id)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f1f5f9',
                          background: n.read ? 'transparent' : 'rgba(255, 92, 26, 0.05)',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'start'
                        }}
                      >
                        <span style={{ fontSize: '18px', marginTop: '2px' }}>
                          {n.type === 'payment_success' ? '💳' :
                           n.type === 'quote_sent' ? '💰' :
                           n.type === 'assigned' ? '🛠️' : '🔔'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '12.5px', color: n.read ? '#64748b' : '#1e293b', lineHeight: '1.4', textAlign: 'left' }}>
                            {n.message}
                          </p>
                          <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginTop: '4px', textAlign: 'left' }}>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Profile Dropdown */}
              <div className={`g-dropdown ${isDropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
                <div className="g-avatar" style={{ background: 'linear-gradient(135deg,#ff5c1a,#f97316)' }} onClick={toggleDropdown}>
                  {getInitial(user?.firstName || user?.email)}{getInitial(user?.lastName)}
                </div>
                
                <div className="g-dropdown-menu">
                  <div className="g-dropdown-header">
                    <div className="name">{user?.firstName} {user?.lastName}</div>
                    <div className="email">{user?.email}</div>
                  </div>

                  <Link to="/profile" className="g-dropdown-item" onClick={toggleDropdown}>
                    <span className="material-icons-round">person</span>{t('profile')}
                  </Link>
                  <div className="g-dropdown-divider"></div>

                  {user?.role === 'customer' && (
                    <>
                      <Link to="/my-requests" className="g-dropdown-item">
                        <span className="material-icons-round">receipt_long</span>{t('requests')}
                      </Link>
                      <Link to="/my-vehicles" className="g-dropdown-item">
                        <span className="material-icons-round">directions_car</span>{t('vehicles')}
                      </Link>
                      <Link to="/get-quote" className="g-dropdown-item">
                        <span className="material-icons-round">request_quote</span>{t('get_quote')}
                      </Link>
                      <Link to="/insurance" className="g-dropdown-item">
                        <span className="material-icons-round">shield</span>Insurance &amp; Protection
                      </Link>
                      <Link to="/roadside" className="g-dropdown-item">
                        <span className="material-icons-round">emergency</span>Roadside Assistance
                      </Link>
                      <Link to="/emergency-pickup" className="g-dropdown-item">
                        <span className="material-icons-round">local_shipping</span>Emergency Pickup
                      </Link>
                      <Link to="/end-of-life" className="g-dropdown-item">
                        <span className="material-icons-round">recycling</span>End-of-Life &amp; Scrap
                      </Link>
                    </>
                  )}

                  {user?.role === 'staff' && (
                    <Link to="/admin/staff" className="g-dropdown-item">
                      <span className="material-icons-round">speed</span>Staff Dashboard
                    </Link>
                  )}

                  {['manager', 'superadmin'].includes(user?.role) && (
                    <>
                      <Link to="/admin" className="g-dropdown-item">
                        <span className="material-icons-round">dashboard</span>Admin Dashboard
                      </Link>
                      <Link to="/admin/staff" className="g-dropdown-item">
                        <span className="material-icons-round">people</span>Staff View
                      </Link>
                    </>
                  )}

                  <div className="g-dropdown-divider"></div>
                  <button 
                    className="g-dropdown-item danger" 
                    onClick={() => { logout(); navigate('/login'); }}
                    style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    <span className="material-icons-round">logout</span>Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Sign In</Link>
              <Link to="/signup" className="btn-brand">Get Started</Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button className="g-toggler" onClick={toggleMobileMenu} aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
