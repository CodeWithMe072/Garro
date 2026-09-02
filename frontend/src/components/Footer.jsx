import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LuChevronRight, LuPhone, LuMail, LuClock, LuMapPin, LuSend
} from 'react-icons/lu';

const Footer = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
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


  const quickLinks = [
    { to: '/insurance', label: t('insurance') },
    { to: '/roadside', label: t('roadside') },
    { to: '/end-of-life', label: t('scrap') },
  ];

  const supportLinks = [
    { to: '/help-center', label: 'Help Centre' },
    { to: '/terms', label: 'Terms & Conditions' },
    { to: '/privacy', label: 'Privacy Policy' },
  ];

  const contactItems = [
    { icon: LuPhone, label: 'Direct Support', value: '+971 50 123 4567', href: 'tel:+971501234567' },
    { icon: LuMail, label: null, value: 'hello@garro.ae', href: 'mailto:hello@garro.ae' },
    { icon: LuClock, label: null, value: '09:00 AM – 06:00 PM (Mon–Sat)', href: null },
    { icon: LuMapPin, label: null, value: '1604, City Bay, Business Bay, Dubai, UAE', href: null },
  ];

  return (
    <footer className="g-footer">
      <div className="container">
        <div className="row g-5">

          {/* Brand */}
          <div className="col-lg-3">
            <div className="g-footer-logo">Ga<span>rro</span></div>
            <p style={{ fontSize: '13.5px', lineHeight: '1.8', marginBottom: '16px' }}>
              {t('footer_desc')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-lg-3 col-6">
            <h6>{t('quick_links')}</h6>
            <ul className="g-footer-links">
              {quickLinks.map(({ to, label }) => (
                <li key={label}>
                  <Link to={to}>
                    <LuChevronRight size={14} />{label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="col-lg-3 col-6">
            <h6>{t('support_title')}</h6>
            <ul className="g-footer-links">
              {supportLinks.map(({ to, href, label }) => (
                <li key={label}>
                  {to ? (
                    <Link to={to}>
                      <LuChevronRight size={14} />{label}
                    </Link>
                  ) : (
                    <a href={href}>
                      <LuChevronRight size={14} />{label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-3 col-6">
            <h6>{t('contact_us')}</h6>
            {contactItems.map(({ icon: Icon, label, value, href }) => (
              <div key={value} className="g-footer-contact-item">
                <Icon size={16} />
                <div>
                  {label && (
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Poppins',sans-serif" }}>
                      {label}
                    </div>
                  )}
                  {href ? (
                    <a href={href} style={{ color: '#334155', textDecoration: 'none', fontSize: '13.5px', fontWeight: 600, fontFamily: "'Poppins',sans-serif" }}>
                      {value}
                    </a>
                  ) : (
                    <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: '13.5px', color: '#334155', fontWeight: 600 }}>{value}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Newsletter */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '10px', fontFamily: "'Poppins',sans-serif" }}>
                {t('get_offers')}
              </div>
              <form style={{ display: 'flex', gap: '8px' }} onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder={t('your_email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ flex: 1, background: '#ffffff', border: '1px solid #ffd8c7', borderRadius: '9px', padding: '9px 12px', color: '#0f172a', fontSize: '13px', fontFamily: "'Poppins',sans-serif", outline: 'none' }}
                />
                <button type="submit" style={{ background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', border: 'none', borderRadius: '9px', padding: '9px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                  <LuSend size={16} color="white" />
                </button>
              </form>
              {showSuccess && (
                <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', fontFamily: "'Poppins',sans-serif" }}>
                  {t('subscribed_msg')}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Curved Divider Line */}
        <hr style={{ border: 'none', height: '1px', background: '#ffe7dc', borderRadius: '9999px', margin: '40px 0 24px 0', opacity: 1 }} />
        {/* Bottom bar */}
        <div className="g-footer-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
          <span>{t('copyright')}</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/privacy" style={{ color: '#64748b', fontSize: '12px', textDecoration: 'none', fontFamily: "'Poppins',sans-serif", transition: 'color .15s' }}>{t('privacy')}</Link>
            <Link to="/terms" style={{ color: '#64748b', fontSize: '12px', textDecoration: 'none', fontFamily: "'Poppins',sans-serif", transition: 'color .15s' }}>{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
