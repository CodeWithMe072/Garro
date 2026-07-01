import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ComingSoonOverlay from '../components/ComingSoonOverlay';

const EndOfLife = () => {
  const [showOverlay, setShowOverlay] = useState(true);

  const benefits = [
    "RTA-approved & fully compliant process",
    "Free vehicle pickup across UAE",
    "Eco-certified recycling facility",
    "Same-day End-of-Life certificate",
    "Best trade-in value guaranteed",
    "Expert deregistration support"
  ];

  return (
    <>
      {showOverlay && <ComingSoonOverlay onClose={() => setShowOverlay(false)} />}

      {/* HERO */}
      <section className="eol-page-hero">
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <span className="sec-tag green">♻️ End-of-Life &amp; Scrap</span>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: '#fff', fontSize: 'clamp(2rem,4vw,3rem)', letterSpacing: '-.03em', marginBottom: '14px' }}>
            Retire Your Vehicle<br/>
            <span style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              The Right Way.
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '15.5px', maxWidth: '560px', lineHeight: 1.75, marginBottom: '32px', fontFamily: "'Poppins', sans-serif" }}>
            When your vehicle has reached the end of its life, Garro ensures a smooth, compliant, and eco-friendly retirement — from deregistration to certified scrapping.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button onClick={() => setShowOverlay(true)} className="btn-green">
              <span className="material-icons-round">recycling</span> Start the Process
            </button>
            <Link to="/home" style={{ border: '2px solid rgba(255,255,255,.3)', borderRadius: '12px', padding: '12px 28px', fontSize: '14.5px', fontWeight: 600, color: 'rgba(255,255,255,.85)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Poppins', sans-serif" }}>
              <span className="material-icons-round">arrow_back</span> Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* ENV STATS */}
      <section className="py-4" style={{ background: '#f0fdf4', borderBottom: '1px solid #d1fae5' }}>
        <div className="container">
          <div className="row g-3">
            <div className="col-6 col-md-3"><div className="env-stat"><div className="num">500+</div><div className="label">Vehicles Recycled</div></div></div>
            <div className="col-6 col-md-3"><div className="env-stat"><div className="num">95%</div><div className="label">Parts Recovered &amp; Reused</div></div></div>
            <div className="col-6 col-md-3"><div className="env-stat"><div className="num">0</div><div className="label">Illegal Dumping Incidents</div></div></div>
            <div className="col-6 col-md-3"><div className="env-stat"><div className="num">48h</div><div className="label">Average Process Time</div></div></div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: '#0f172a' }}>Our End-of-Life Services</h2>
            <p style={{ color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>Everything handled — from pickup to final certificate</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="eol-card">
                <div className="eol-icon" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                  <span className="material-icons-round">recycling</span>
                </div>
                <h5 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#0f172a' }}>Certified Car Scrapping</h5>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.75, fontFamily: "'Poppins', sans-serif", margin: '10px 0' }}>
                  RTA-approved scrapping process with full documentation and compliance. We handle everything from pickup to the final certificate.
                </p>
                <button onClick={() => setShowOverlay(true)} className="btn-green mt-3">Book Now</button>
              </div>
            </div>
            <div className="col-md-4">
              <div className="eol-card">
                <div className="eol-icon" style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
                  <span className="material-icons-round">description</span>
                </div>
                <h5 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#0f172a' }}>End-of-Life Certificate</h5>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.75, fontFamily: "'Poppins', sans-serif", margin: '10px 0' }}>
                  Official government-approved deregistration certificate. Required by RTA to legally retire your vehicle from UAE roads.
                </p>
                <button onClick={() => setShowOverlay(true)} className="btn-green mt-3">Get Certificate</button>
              </div>
            </div>
            <div className="col-md-4">
              <div className="eol-card">
                <div className="eol-icon" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                  <span className="material-icons-round">sell</span>
                </div>
                <h5 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#0f172a' }}>Trade-In Valuation</h5>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.75, fontFamily: "'Poppins', sans-serif", margin: '10px 0' }}>
                  Get a fair market valuation for your end-of-life vehicle. We'll assess and offer the best trade-in value before scrapping.
                </p>
                <button onClick={() => setShowOverlay(true)} className="btn-green mt-3">Get Valuation</button>
              </div>
            </div>
            <div className="col-md-4">
              <div className="eol-card">
                <div className="eol-icon" style={{ background: 'linear-gradient(135deg,#64748b,#475569)' }}>
                  <span className="material-icons-round">construction</span>
                </div>
                <h5 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#0f172a' }}>Parts Salvage</h5>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.75, fontFamily: "'Poppins', sans-serif", margin: '10px 0' }}>
                  We carefully dismantle your vehicle to salvage and resell usable parts — maximising the residual value before full scrapping.
                </p>
                <button onClick={() => setShowOverlay(true)} className="btn-green mt-3">Learn More</button>
              </div>
            </div>
            <div className="col-md-4">
              <div className="eol-card">
                <div className="eol-icon" style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                  <span className="material-icons-round">eco</span>
                </div>
                <h5 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#0f172a' }}>Eco-Friendly Disposal</h5>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.75, fontFamily: "'Poppins', sans-serif", margin: '10px 0' }}>
                  All fluids, batteries, and hazardous materials are disposed of in strict accordance with UAE environmental regulations.
                </p>
                <button onClick={() => setShowOverlay(true)} className="btn-green mt-3">Learn More</button>
              </div>
            </div>
            <div className="col-md-4">
              <div className="eol-card">
                <div className="eol-icon" style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)' }}>
                  <span className="material-icons-round">how_to_reg</span>
                </div>
                <h5 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#0f172a' }}>Deregistration Support</h5>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.75, fontFamily: "'Poppins', sans-serif", margin: '10px 0' }}>
                  Full support with RTA deregistration paperwork, plate return, and all associated government procedures.
                </p>
                <button onClick={() => setShowOverlay(true)} className="btn-green mt-3">Get Help</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-5" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="row g-5 align-items-start">
            <div className="col-lg-6">
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Simple 4-Step Process</h2>
              <p style={{ color: '#64748b', fontFamily: "'Poppins', sans-serif", marginBottom: '28px' }}>We make retiring your vehicle completely hassle-free</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li className="process-step">
                  <div className="ps-num">1</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>Request &amp; Valuation</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontFamily: "'Poppins', sans-serif" }}>Submit your vehicle details. We'll assess and provide a same-day valuation and quote.</div>
                  </div>
                </li>
                <li className="process-step">
                  <div className="ps-num">2</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>Free Vehicle Pickup</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontFamily: "'Poppins', sans-serif" }}>We collect the vehicle from your location at no cost — even if it's not driveable.</div>
                  </div>
                </li>
                <li className="process-step">
                  <div className="ps-num">3</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>Processing &amp; Scrapping</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontFamily: "'Poppins', sans-serif" }}>Certified eco-friendly dismantling and recycling at our approved facility.</div>
                  </div>
                </li>
                <li className="process-step">
                  <div className="ps-num">4</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>Certificate &amp; Payment</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontFamily: "'Poppins', sans-serif" }}>Receive your official End-of-Life certificate and any agreed payment — same day.</div>
                  </div>
                </li>
              </ul>
              <button onClick={() => setShowOverlay(true)} className="btn-green mt-4">
                <span className="material-icons-round">recycling</span> Start My End-of-Life Request
              </button>
            </div>
            
            <div className="col-lg-6">
              <div style={{ background: 'linear-gradient(135deg,#0a0f1e,#052e16)', borderRadius: '20px', padding: '36px', border: '1px solid rgba(16,185,129,.2)' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '20px', fontFamily: "'Poppins', sans-serif" }}>
                  Why scrap with Garro?
                </div>
                {benefits.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                    <span className="material-icons-round" style={{ fontSize: '20px', color: '#10b981' }}>check_circle</span>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,.75)', fontFamily: "'Poppins', sans-serif" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EndOfLife;
