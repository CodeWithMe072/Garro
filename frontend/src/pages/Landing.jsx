import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ backgroundColor: '#fff', overflowX: 'hidden' }}>
      {/* NAV */}
      <nav className={`land-nav ${isScrolled ? 'scrolled' : ''}`} id="lnav">
        <div className="container">
          <div className="ni">
            <Link to="/" className="land-logo">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
              <span className="logo-txt">Ga<em style={{ color: 'var(--brand)', fontStyle: 'normal' }}>rro</em></span>
            </Link>
            <div className="nav-r">
              {/* Only logo in nav, sign in is in hero area */}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <img src="/assets/images/hero-garage.jpg" alt="Garro mechanics" loading="eager" />
        </div>

        <div className="container hero-inner">
          <div className="hero-left">
            <div className="hero-tag">
              <span className="hero-tag-dot"></span> UAE's Trusted Car Service Platform
            </div>
            <h1 className="hero-h1">
              Your Car,<br/>Our Care<br/>
              <span className="hero-acc">Always There!</span>
            </h1>
            <p className="hero-sub">Book car services, repairs, diagnostics or roadside assistance in just a few clicks.</p>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="material-icons-round" style={{ color: 'var(--brand)', fontSize: '20px' }}>shield</span>
                <div><div className="hero-stat-num">500+</div><div className="hero-stat-label">Verified Garages</div></div>
              </div>
              <div className="hero-stat">
                <span className="material-icons-round" style={{ color: 'var(--brand)', fontSize: '20px' }}>schedule</span>
                <div><div className="hero-stat-num">24/7</div><div className="hero-stat-label">Support</div></div>
              </div>
              <div className="hero-stat">
                <span className="material-icons-round" style={{ color: 'var(--brand)', fontSize: '20px' }}>emoji_events</span>
                <div><div className="hero-stat-num">100%</div><div className="hero-stat-label">Satisfaction</div></div>
              </div>
              <div className="hero-stat">
                <span className="material-icons-round" style={{ color: 'var(--brand)', fontSize: '20px' }}>location_on</span>
                <div><div className="hero-stat-num">Across</div><div className="hero-stat-label">UAE</div></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg,var(--brand),#ff8c42)', color: '#fff', borderRadius: '12px', padding: '14px 30px', fontWeight: '800', fontSize: '15px', textDecoration: 'none', fontFamily: "'Poppins',sans-serif", boxShadow: '0 6px 22px rgba(255,92,26,.45)', transition: 'all .2s' }}>
                <span className="material-icons-round" style={{ fontSize: '18px' }}>login</span> Sign In
              </Link>
              <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,.92)', color: 'var(--dark)', border: '2px solid rgba(255,255,255,.8)', borderRadius: '12px', padding: '14px 30px', fontWeight: '800', fontSize: '15px', textDecoration: 'none', fontFamily: "'Poppins',sans-serif", backdropFilter: 'blur(10px)', transition: 'all .2s' }}>
                <span className="material-icons-round" style={{ fontSize: '18px' }}>person_add</span> Create Account
              </Link>
            </div>
          </div>

          <div className="hero-right"></div>
        </div>
      </section>

      {/* QUICK SERVICE LINKS */}
      <div className="svc-quick-strip">
        <div className="container">
          <div className="svc-quick-row">
            <Link to="/login" className="svc-quick-item">
              <span className="material-icons-round svc-quick-icon">oil_barrel</span>
              <div><div className="svc-quick-name">Oil Change</div><div className="svc-quick-sub">&amp; Lubrication</div></div>
              <span className="material-icons-round svc-quick-arrow">arrow_forward</span>
            </Link>
            <Link to="/login" className="svc-quick-item">
              <span className="material-icons-round svc-quick-icon">stop_circle</span>
              <div><div className="svc-quick-name">Brakes</div><div className="svc-quick-sub">&amp; Suspension</div></div>
              <span className="material-icons-round svc-quick-arrow">arrow_forward</span>
            </Link>
            <Link to="/login" className="svc-quick-item">
              <span className="material-icons-round svc-quick-icon">biotech</span>
              <div><div className="svc-quick-name">Diagnostics</div><div className="svc-quick-sub">&amp; Inspection</div></div>
              <span className="material-icons-round svc-quick-arrow">arrow_forward</span>
            </Link>
            <Link to="/login" className="svc-quick-item">
              <span className="material-icons-round svc-quick-icon">tire_repair</span>
              <div><div className="svc-quick-name">Tyres</div><div className="svc-quick-sub">&amp; Alignment</div></div>
              <span className="material-icons-round svc-quick-arrow">arrow_forward</span>
            </Link>
            <Link to="/login" className="svc-quick-item">
              <span className="material-icons-round svc-quick-icon">battery_charging_full</span>
              <div><div className="svc-quick-name">Battery</div><div className="svc-quick-sub">Services</div></div>
              <span className="material-icons-round svc-quick-arrow">arrow_forward</span>
            </Link>
            <Link to="/login" className="svc-quick-item">
              <span className="material-icons-round svc-quick-icon">emergency</span>
              <div><div className="svc-quick-name">Roadside</div><div className="svc-quick-sub">Assistance</div></div>
              <span className="material-icons-round svc-quick-arrow">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="stats-bar">
        <div className="container">
          <div className="stats-bar-row">
            <div className="stats-bar-item">
              <span className="material-icons-round stats-bar-icon">group</span>
              <div><div className="stats-bar-num">500K+</div><div className="stats-bar-label">Happy Customers</div></div>
            </div>
            <div className="stats-bar-item">
              <span className="material-icons-round stats-bar-icon">garage</span>
              <div><div className="stats-bar-num">500+</div><div className="stats-bar-label">Verified Garages</div></div>
            </div>
            <div className="stats-bar-item">
              <span className="material-icons-round stats-bar-icon">build</span>
              <div><div className="stats-bar-num">50K+</div><div className="stats-bar-label">Services Completed</div></div>
            </div>
            <div className="stats-bar-item">
              <span className="material-icons-round stats-bar-icon">verified_user</span>
              <div><div className="stats-bar-num">100%</div><div className="stats-bar-label">Secure &amp; Reliable</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES STRIP */}
      <div className="feat-strip">
        <div className="container">
          <div className="row g-0">
            <div className="col-6 col-md-3">
              <div className="fi">
                <div className="fi-icon"><span className="material-icons-round">directions_car</span></div>
                <div><div className="fi-title">Multi-Brand Expertise</div><div className="fi-sub">Expert solutions for all car types</div></div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fi">
                <div className="fi-icon"><span className="material-icons-round">local_shipping</span></div>
                <div><div className="fi-title">Free Pick &amp; Drop</div><div className="fi-sub">At your doorstep</div></div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fi">
                <div className="fi-icon"><span className="material-icons-round">track_changes</span></div>
                <div><div className="fi-title">Transparent Updates</div><div className="fi-sub">Live Tracking</div></div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fi">
                <div className="fi-icon"><span className="material-icons-round">speed</span></div>
                <div><div className="fi-title">Fast Turnaround</div><div className="fi-sub">Timely Delivery</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Landing;
