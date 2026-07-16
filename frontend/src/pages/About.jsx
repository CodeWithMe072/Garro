import React from 'react';
import { LuBadgeCheck, LuTruck, LuShield } from 'react-icons/lu';

const About = () => {
  return (
    <>
      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="section-tag">Our Story</span>
              <h1 className="fw-bold mt-2 mb-4" style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: 'white', lineHeight: 1.2, letterSpacing: '-.02em' }}>
                The Digital Standard for<br/>
                <span style={{ background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Trusted Automotive Service.
                </span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '15px', lineHeight: 1.8, fontFamily: "'Poppins', sans-serif", maxWidth: '580px' }}>
                Garro began with a singular mission: to simplify vehicle care. We operate as the premium marketplace connecting car owners with transparent, upfront pricing, frictionless logistics including doorstep pickup, and comprehensive real-time updates.
              </p>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '14px', lineHeight: 1.8, fontFamily: "'Poppins', sans-serif", maxWidth: '580px', marginTop: '12px' }}>
                Our platform currently serves Dubai and is expanding across the UAE. Whether you need diagnostics, major repairs, aesthetics, or roadside assistance — Garro has got you covered.
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
            <span className="section-tag">What We Stand For</span>
            <h2 className="fw-bold mt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Our Values</h2>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="values-card">
                <div className="values-icon"><LuBadgeCheck size={28} /></div>
                <h5 className="fw-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>Upfront, Verified Trust &amp; Transparency</h5>
                <ul className="text-muted mt-3" style={{ fontSize: '13.5px', lineHeight: 1.9, fontFamily: "'Poppins', sans-serif", paddingLeft: '18px' }}>
                  <li>Detailed quote provided for services, no surprises on pricing.</li>
                  <li>Receive a final, transparent digital inspection report after every service.</li>
                  <li>View and select garages based on certified ratings and customer reviews.</li>
                </ul>
              </div>
            </div>
            <div className="col-md-4">
              <div className="values-card">
                <div className="values-icon"><LuTruck size={28} /></div>
                <h5 className="fw-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>Frictionless Dispatch &amp; Live Logistics</h5>
                <ul className="text-muted mt-3" style={{ fontSize: '13.5px', lineHeight: 1.9, fontFamily: "'Poppins', sans-serif", paddingLeft: '18px' }}>
                  <li>Seamless scheduling of service times and dispatch, supported 09:00 AM – 06:00 PM (Mon–Sat).</li>
                  <li>Choose from Free Doorstep Pickup or Self-Drop options.</li>
                  <li>Track your vehicle's journey and service status through your digital portal.</li>
                </ul>
              </div>
            </div>
            <div className="col-md-4">
              <div className="values-card">
                <div className="values-icon"><LuShield size={28} /></div>
                <h5 className="fw-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>100% Certified Garages &amp; Handpicked Experts</h5>
                <ul className="text-muted mt-3" style={{ fontSize: '13.5px', lineHeight: 1.9, fontFamily: "'Poppins', sans-serif", paddingLeft: '18px' }}>
                  <li>Garro partners exclusively with Dubai's trusted car service marketplaces for unparalleled quality.</li>
                  <li>Every vehicle undergoes a comprehensive Digitally Scanned Inspection.</li>
                  <li>Trust verified, handpicked technicians with proven track records for your specific vehicle brand.</li>
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
