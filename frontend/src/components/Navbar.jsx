import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                  <span className="material-icons-round">shield</span> Insurance &amp; Protection
                </Link>
              </li>
              {user?.role === 'customer' && (
                <>
                  <li>
                    <Link to="/roadside" className={isActive('/roadside')}>
                      <span className="material-icons-round">emergency</span> Roadside Assistance
                    </Link>
                  </li>
                  <li>
                    <Link to="/end-of-life" className={isActive('/end-of-life')}>
                      <span className="material-icons-round">recycling</span> End-of-Life &amp; Scrap
                    </Link>
                  </li>
                </>
              )}
              {['staff', 'manager', 'superadmin'].includes(user?.role) && (
                <li>
                  <Link to={user?.role === 'staff' ? '/admin/staff' : '/admin'} className={location.pathname.includes('admin') ? 'active' : ''}>
                    <span className="material-icons-round">bolt</span> Dashboard
                  </Link>
                </li>
              )}
            </>
          ) : (
            <li>
              <Link to="/"><span className="material-icons-round">home</span> Home</Link>
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

              {/* Get Quote CTA */}
              {user?.role === 'customer' && (
                <Link to="/get-quote" className="btn-nav-quote d-none d-md-inline-flex">
                  <span className="material-icons-round" style={{ fontSize: '16px' }}>request_quote</span>
                  Get a Quote
                </Link>
              )}

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
                    <span className="material-icons-round">person</span>My Profile
                  </Link>
                  <div className="g-dropdown-divider"></div>

                  {user?.role === 'customer' && (
                    <>
                      <Link to="/my-requests" className="g-dropdown-item">
                        <span className="material-icons-round">receipt_long</span>My Requests
                      </Link>
                      <Link to="/get-quote" className="g-dropdown-item">
                        <span className="material-icons-round">request_quote</span>Get a Quote
                      </Link>
                      <Link to="/insurance" className="g-dropdown-item">
                        <span className="material-icons-round">shield</span>Insurance &amp; Protection
                      </Link>
                      <Link to="/roadside" className="g-dropdown-item">
                        <span className="material-icons-round">emergency</span>Roadside Assistance
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
