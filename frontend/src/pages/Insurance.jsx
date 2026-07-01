import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ComingSoonOverlay from '../components/ComingSoonOverlay';

const Insurance = () => {
  const [showOverlay, setShowOverlay] = useState(true);

  return (
    <>
      {showOverlay && <ComingSoonOverlay onClose={() => setShowOverlay(false)} />}
      
      {/* HERO */}
      <section className="ins-page-hero">
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <span className="sec-tag">Insurance &amp; Protection</span>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: '#fff', fontSize: 'clamp(2rem,4vw,3rem)', letterSpacing: '-.03em', marginBottom: '14px' }}>
            Drive with <span style={{ background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Complete Confidence</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '15.5px', maxWidth: '560px', lineHeight: 1.75, marginBottom: '32px', fontFamily: "'Poppins', sans-serif" }}>
            Garro connects you with UAE's top insurance providers. Get the right coverage for your vehicle — comprehensive, third-party, extended warranty and more.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Link to="/garages" className="btn-orange">
              <span className="material-icons-round">shield</span> Get a Quote
            </Link>
            <Link to="/home" style={{ border: '2px solid rgba(255,255,255,.3)', borderRadius: '12px', padding: '12px 28px', fontSize: '14.5px', fontWeight: 600, color: 'rgba(255,255,255,.85)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all .2s', fontFamily: "'Poppins', sans-serif" }}>
              <span className="material-icons-round">arrow_back</span> Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <span className="sec-tag">Our Plans</span>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: '#0f172a' }}>Insurance &amp; Protection Plans</h2>
            <p style={{ color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>Choose the right protection for your vehicle</p>
          </div>
          <div className="row g-4">

            <div className="col-md-4">
              <div className="ins-card">
                <div className="ins-icon" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                  <span className="material-icons-round">shield</span>
                </div>
                <div className="ins-badge mb-3"><span className="material-icons-round">check_circle</span> Most Popular</div>
                <h5 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#0f172a' }}>Comprehensive Insurance</h5>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.75, fontFamily: "'Poppins', sans-serif", margin: '12px 0 20px' }}>
                  Full coverage including accidental damage, theft, fire, and natural disasters. The complete protection your car deserves.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li className="feature-row"><div className="feature-row-icon"><span className="material-icons-round">check</span></div><div style={{ fontSize: '13.5px', color: '#374151', fontFamily: "'Poppins', sans-serif" }}>Accidental damage cover</div></li>
                  <li className="feature-row"><div className="feature-row-icon"><span className="material-icons-round">check</span></div><div style={{ fontSize: '13.5px', color: '#374151', fontFamily: "'Poppins', sans-serif" }}>Theft &amp; fire protection</div></li>
                  <li className="feature-row"><div className="feature-row-icon"><span className="material-icons-round">check</span></div><div style={{ fontSize: '13.5px', color: '#374151', fontFamily: "'Poppins', sans-serif" }}>24/7 roadside assistance</div></li>
                  <li className="feature-row"><div className="feature-row-icon"><span className="material-icons-round">check</span></div><div style={{ fontSize: '13.5px', color: '#374151', fontFamily: "'Poppins', sans-serif" }}>Natural disaster coverage</div></li>
                </ul>
                <button onClick={() => setShowOverlay(true)} className="btn-orange mt-4 w-100 justify-content-center">Get Quote</button>
              </div>
            </div>

            <div className="col-md-4">
              <div className="ins-card">
                <div className="ins-icon" style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
                  <span className="material-icons-round">security</span>
                </div>
                <h5 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#0f172a' }}>Third-Party Insurance</h5>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.75, fontFamily: "'Poppins', sans-serif", margin: '12px 0 20px' }}>
                  Mandatory UAE cover protecting you from liability towards third parties. Quick, affordable, legally compliant.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li className="feature-row"><div className="feature-row-icon"><span className="material-icons-round">check</span></div><div style={{ fontSize: '13.5px', color: '#374151', fontFamily: "'Poppins', sans-serif" }}>Legal compliance in UAE</div></li>
                  <li className="feature-row"><div className="feature-row-icon"><span className="material-icons-round">check</span></div><div style={{ fontSize: '13.5px', color: '#374151', fontFamily: "'Poppins', sans-serif" }}>Third-party damage cover</div></li>
                  <li className="feature-row"><div className="feature-row-icon"><span className="material-icons-round">check</span></div><div style={{ fontSize: '13.5px', color: '#374151', fontFamily: "'Poppins', sans-serif" }}>Medical expense coverage</div></li>
                  <li className="feature-row"><div className="feature-row-icon"><span className="material-icons-round">check</span></div><div style={{ fontSize: '13.5px', color: '#374151', fontFamily: "'Poppins', sans-serif" }}>Affordable premiums</div></li>
                </ul>
                <button onClick={() => setShowOverlay(true)} className="btn-orange mt-4 w-100 justify-content-center">Get Quote</button>
              </div>
            </div>

            <div className="col-md-4">
              <div className="ins-card">
                <div className="ins-icon" style={{ background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)' }}>
                  <span className="material-icons-round">verified_user</span>
                </div>
                <h5 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#0f172a' }}>Extended Warranty</h5>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.75, fontFamily: "'Poppins', sans-serif", margin: '12px 0 20px' }}>
                  Extend your vehicle's factory warranty with Garro's certified repair guarantee — covering parts, labour and more.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li className="feature-row"><div className="feature-row-icon"><span className="material-icons-round">check</span></div><div style={{ fontSize: '13.5px', color: '#374151', fontFamily: "'Poppins', sans-serif" }}>Engine &amp; gearbox cover</div></li>
                  <li className="feature-row"><div className="feature-row-icon"><span className="material-icons-round">check</span></div><div style={{ fontSize: '13.5px', color: '#374151', fontFamily: "'Poppins', sans-serif" }}>Electrical systems cover</div></li>
                  <li className="feature-row"><div className="feature-row-icon"><span className="material-icons-round">check</span></div><div style={{ fontSize: '13.5px', color: '#374151', fontFamily: "'Poppins', sans-serif" }}>Genuine parts guaranteed</div></li>
                  <li className="feature-row"><div className="feature-row-icon"><span className="material-icons-round">check</span></div><div style={{ fontSize: '13.5px', color: '#374151', fontFamily: "'Poppins', sans-serif" }}>Up to 3 years coverage</div></li>
                </ul>
                <button onClick={() => setShowOverlay(true)} className="btn-orange mt-4 w-100 justify-content-center">Get Quote</button>
              </div>
            </div>

            <div className="col-md-4">
              <div className="ins-card">
                <div className="ins-icon" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' }}>
                  <span className="material-icons-round">assignment</span>
                </div>
                <h5 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#0f172a' }}>Insurance Claim Assist</h5>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.75, fontFamily: "'Poppins', sans-serif", margin: '12px 0' }}>
                  Our experts handle your claim from start to finish — paperwork, assessments, and garage coordination.
                </p>
                <button onClick={() => setShowOverlay(true)} className="btn-orange mt-4 w-100 justify-content-center">Get Help</button>
              </div>
            </div>

            <div className="col-md-4">
              <div className="ins-card">
                <div className="ins-icon" style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)' }}>
                  <span className="material-icons-round">lock</span>
                </div>
                <h5 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#0f172a' }}>Theft Protection</h5>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.75, fontFamily: "'Poppins', sans-serif", margin: '12px 0' }}>
                  Full replacement value protection in case of vehicle theft, with rapid claim processing and minimal downtime.
                </p>
                <button onClick={() => setShowOverlay(true)} className="btn-orange mt-4 w-100 justify-content-center">Get Quote</button>
              </div>
            </div>

            <div className="col-md-4">
              <div className="ins-card">
                <div className="ins-icon" style={{ background: 'linear-gradient(135deg,#0ea5e9,#0369a1)' }}>
                  <span className="material-icons-round">thunderstorm</span>
                </div>
                <h5 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#0f172a' }}>Natural Disaster Cover</h5>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.75, fontFamily: "'Poppins', sans-serif", margin: '12px 0' }}>
                  Protection against floods, sandstorms, and other weather-related damage — critical in the UAE climate.
                </p>
                <button onClick={() => setShowOverlay(true)} className="btn-orange mt-4 w-100 justify-content-center">Get Quote</button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="cta-box">
            <div className="row align-items-center g-4 position-relative" style={{ zIndex: 2 }}>
              <div className="col-lg-8">
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: '#fff', fontSize: 'clamp(1.4rem,3vw,2rem)', marginBottom: '10px' }}>
                  Not sure which plan fits you?
                </h2>
                <p style={{ color: 'rgba(255,255,255,.6)', fontFamily: "'Poppins', sans-serif", fontSize: '14.5px', margin: 0 }}>
                  Our insurance experts will guide you to the best coverage for your car and budget.
                </p>
              </div>
              <div className="col-lg-4 text-center text-lg-end">
                <Link to="/garages" className="btn-orange">
                  <span className="material-icons-round">support_agent</span> Talk to an Expert
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Insurance;
