import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setShowSuccess(true);
      setEmail('');
      setTimeout(() => setShowSuccess(false), 4000);
    }
  };

  return (
    <footer className="g-footer">
      <div className="container">
        <div className="row g-5">

          {/* Brand */}
          <div className="col-lg-3">
            <div className="g-footer-logo">Ga<span>rro</span></div>
            <p style={{ fontSize: '13.5px', lineHeight: '1.8', marginBottom: '16px', color: 'rgba(255,255,255,.5)' }}>
              UAE's most trusted car help platform. Fast, reliable &amp; certified car service across Dubai and all UAE emirates.
            </p>
            <div className="g-social">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" title="Facebook"><span className="material-icons-round" style={{ fontSize: '18px' }}>facebook</span></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram"><span className="material-icons-round" style={{ fontSize: '18px' }}>photo_camera</span></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" title="LinkedIn"><span className="material-icons-round" style={{ fontSize: '18px' }}>work</span></a>
              <a href="https://wa.me/97180042776" target="_blank" rel="noreferrer" title="WhatsApp"><span className="material-icons-round" style={{ fontSize: '18px' }}>chat</span></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" title="Twitter/X"><span className="material-icons-round" style={{ fontSize: '18px' }}>flutter_dash</span></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-6">
            <h6>Quick Links</h6>
            <ul className="g-footer-links">
              <li><Link to="/home"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>Home</Link></li>
              <li><Link to="/insurance"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>Insurance &amp; Protection</Link></li>
              <li><Link to="/roadside"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>Roadside Assistance</Link></li>
              <li><Link to="/end-of-life"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>End-of-Life &amp; Scrap</Link></li>
              <li><Link to="/get-quote"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>Get a Quote</Link></li>
              <li><Link to="/my-requests"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>My Requests</Link></li>
            </ul>
          </div>

          {/* Our Services */}
          <div className="col-lg-2 col-6">
            <h6>Our Services</h6>
            <ul className="g-footer-links">
              <li><Link to="/get-quote"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>Car Service</Link></li>
              <li><Link to="/get-quote"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>Oil Change</Link></li>
              <li><Link to="/get-quote"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>Tyres &amp; Batteries</Link></li>
              <li><Link to="/get-quote"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>Diagnostics</Link></li>
              <li><Link to="/roadside"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>Roadside Help</Link></li>
              <li><Link to="/get-quote"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>Car Detailing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-lg-2 col-6">
            <h6>Support</h6>
            <ul className="g-footer-links">
              <li><a href="#"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>Help Centre</a></li>
              <li><a href="#"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>How It Works</a></li>
              <li><a href="#"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>Terms of Service</a></li>
              <li><a href="#"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>Privacy Policy</a></li>
              {isAuthenticated && (
                <li><Link to="/my-requests"><span className="material-icons-round" style={{ fontSize: '15px' }}>chevron_right</span>My Requests</Link></li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-3 col-6">
            <h6>Contact Us</h6>
            <div className="g-footer-contact-item">
              <span className="material-icons-round">phone</span>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Poppins',sans-serif" }}>Emergency Pickup</div>
                <a href="tel:+971501234567" style={{ color: 'rgba(255,255,255,.75)', textDecoration: 'none', fontSize: '14px', fontWeight: '600', fontFamily: "'Poppins',sans-serif" }}>+971 50 123 4567</a>
              </div>
            </div>
            <div className="g-footer-contact-item">
              <span className="material-icons-round">email</span>
              <a href="mailto:hello@garro.com" style={{ color: 'rgba(255,255,255,.55)', textDecoration: 'none', fontFamily: "'Poppins',sans-serif" }}>hello@garro.com</a>
            </div>
            <div className="g-footer-contact-item">
              <span className="material-icons-round">schedule</span>
              <span style={{ fontFamily: "'Poppins',sans-serif" }}>09:00 AM – 06:00 PM (Mon–Sat)</span>
            </div>
            <div className="g-footer-contact-item">
              <span className="material-icons-round">location_on</span>
              <span style={{ fontFamily: "'Poppins',sans-serif" }}>1604, City Bay, Business Bay<br/>Dubai, UAE</span>
            </div>
            {/* Newsletter */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '10px', fontFamily: "'Poppins',sans-serif" }}>Get Offers &amp; Updates</div>
              <form style={{ display: 'flex', gap: '8px' }} onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  placeholder="Your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ flex: '1', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.15)', borderRadius: '9px', padding: '9px 12px', color: 'white', fontSize: '13px', fontFamily: "'Poppins',sans-serif", outline: 'none' }} 
                />
                <button type="submit" style={{ background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', border: 'none', borderRadius: '9px', padding: '9px 14px', cursor: 'pointer', transition: 'all .2s' }}>
                  <span className="material-icons-round" style={{ fontSize: '18px', color: 'white' }}>send</span>
                </button>
              </form>
              {showSuccess && (
                <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', fontFamily: "'Poppins',sans-serif" }}>
                  ✓ Subscribed! Watch your inbox.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="g-footer-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
          <span>© 2025 Garro · All rights reserved · UAE's Most Trusted Car Service Platform</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,.3)', fontSize: '12px', textDecoration: 'none', fontFamily: "'Poppins',sans-serif", transition: 'color .15s' }}>Privacy</a>
            <a href="#" style={{ color: 'rgba(255,255,255,.3)', fontSize: '12px', textDecoration: 'none', fontFamily: "'Poppins',sans-serif", transition: 'color .15s' }}>Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
