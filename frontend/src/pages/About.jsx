import React from 'react';
import { LuBadgeCheck, LuTruck, LuShield } from 'react-icons/lu';

const About = () => {
  const { t } = useLanguage();
  return (
    <>
      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="section-tag" dir="auto">{t('about_story')}</span>
              <h1 className="fw-bold mt-2 mb-4" style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: 'white', lineHeight: 1.2, letterSpacing: '-.02em' }}>
                <span dir="auto">{t('about_hero_title1')}</span><br/>
                <span dir="auto" style={{ background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {t('about_hero_title2')}
                </span>
              </h1>
              <p dir="auto" style={{ color: 'rgba(255,255,255,.6)', fontSize: '15px', lineHeight: 1.8, fontFamily: "'Poppins', sans-serif", maxWidth: '580px' }}>
                {t('about_hero_desc1')}
              </p>
              <p dir="auto" style={{ color: 'rgba(255,255,255,.5)', fontSize: '14px', lineHeight: 1.8, fontFamily: "'Poppins', sans-serif", maxWidth: '580px', marginTop: '12px' }}>
                {t('about_hero_desc2')}
              </p>
            </div>
            <div className="col-lg-5 text-center d-none d-lg-block">
              {/* Trophy SVG illustration */}
              <svg viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg" width="260" style={{ filter: 'drop-shadow(0 20px 40px rgba(255,92,26,.25))' }}>
                {/* Glow */}
                <ellipse cx="140" cy="265" rx="80" ry="10" fill="rgba(255,92,26,.2)"/>
                {/* Base */}
                <rect x="95" y="240" width="90" height="18" rx="9" fill="#1e3050"/>
                <rect x="108" y="230" width="64" height="16" rx="6" fill="#253a60"/>
                {/* Stem */}
                <rect x="126" y="185" width="28" height="50" rx="6" fill="#1e3050"/>
                {/* Cup body */}
                <path d="M80 60 Q75 140 100 165 Q120 185 140 185 Q160 185 180 165 Q205 140 200 60 Z" fill="url(#grad)" />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#d4a843', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#b8891f', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <path d="M80 60 Q75 140 100 165 Q120 185 140 185 Q160 185 180 165 Q205 140 200 60 Z" fill="#c9982a" style={{ mixBlendMode: 'multiply' }}/>
                {/* Cup shine */}
                <path d="M95 70 Q90 130 108 158 Q120 175 135 180" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="8" strokeLinecap="round"/>
                {/* Handles */}
                <path d="M80 80 Q55 80 55 110 Q55 140 80 138" fill="none" stroke="#b8891f" strokeWidth="14" strokeLinecap="round"/>
                <path d="M200 80 Q225 80 225 110 Q225 140 200 138" fill="none" stroke="#b8891f" strokeWidth="14" strokeLinecap="round"/>
                {/* Star on cup */}
                <text x="140" y="135" fontSize="36" textAnchor="middle" dominantBaseline="middle">⭐</text>
                {/* Top rim */}
                <ellipse cx="140" cy="62" rx="60" ry="10" fill="#d4a843"/>
                {/* Stars around */}
                <text x="50" y="55" fontSize="16" opacity=".7">✨</text>
                <text x="215" y="55" fontSize="16" opacity=".7">✨</text>
                <text x="140" y="30" fontSize="14" opacity=".5" textAnchor="middle">🏅</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-tag" dir="auto">{t('about_values_tag')}</span>
            <h2 className="fw-bold mt-2" style={{ fontFamily: "'Poppins', sans-serif" }} dir="auto">{t('about_values_title')}</h2>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="values-card">
                <div className="values-icon"><LuBadgeCheck size={28} /></div>
                <h5 className="fw-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>Upfront, Verified Trust &amp; Transparency</h5>
                <ul className="text-muted mt-3" style={{ fontSize: '13.5px', lineHeight: 1.9, fontFamily: "'Poppins', sans-serif", paddingLeft: '18px' }}>
                  <li dir="auto">{t('about_val1_1')}</li>
                  <li dir="auto">{t('about_val1_2')}</li>
                  <li dir="auto">{t('about_val1_3')}</li>
                </ul>
              </div>
            </div>
            <div className="col-md-4">
              <div className="values-card">
                <div className="values-icon"><LuTruck size={28} /></div>
                <h5 className="fw-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>Frictionless Dispatch &amp; Live Logistics</h5>
                <ul className="text-muted mt-3" style={{ fontSize: '13.5px', lineHeight: 1.9, fontFamily: "'Poppins', sans-serif", paddingLeft: '18px' }}>
                  <li dir="auto">{t('about_val2_1')}</li>
                  <li dir="auto">{t('about_val2_2')}</li>
                  <li dir="auto">{t('about_val2_3')}</li>
                </ul>
              </div>
            </div>
            <div className="col-md-4">
              <div className="values-card">
                <div className="values-icon"><LuShield size={28} /></div>
                <h5 className="fw-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>100% Certified Garages &amp; Handpicked Experts</h5>
                <ul className="text-muted mt-3" style={{ fontSize: '13.5px', lineHeight: 1.9, fontFamily: "'Poppins', sans-serif", paddingLeft: '18px' }}>
                  <li dir="auto">{t('about_val3_1')}</li>
                  <li dir="auto">{t('about_val3_2')}</li>
                  <li dir="auto">{t('about_val3_3')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
