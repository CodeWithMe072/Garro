import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ComingSoonOverlay from '../components/ComingSoonOverlay';

const Roadside = () => {
  const [showOverlay, setShowOverlay] = useState(true);

  return (
    <>
      {showOverlay && <ComingSoonOverlay onClose={() => setShowOverlay(false)} />}

      {/* ══ HERO ══ */}
      <section className="rs-hero">
        <div className="container rs-hero-inner">
          {/* LEFT */}
          <div className="rs-hero-left">
            <div className="rs-tag">
              <span className="material-icons-round" style={{ fontSize: '14px' }}>schedule</span> 24/7 Roadside Assistance
            </div>
            <h1 className="rs-h1">
              We're Always<br/>There When You<br/>
              <span>Need Us Most.</span>
            </h1>
            <p className="rs-sub">24/7 roadside assistance across UAE.<br/>Quick help for any breakdown, anywhere.</p>

            <div className="rs-btns">
              <a href="tel:8004277" className="btn-rs-primary">
                <span className="material-icons-round" style={{ fontSize: '18px' }}>call</span> Call 800 GARRO
              </a>
              <button onClick={() => setShowOverlay(true)} className="btn-rs-outline">
                Request Assistance
              </button>
            </div>

            <div className="rs-stats">
              <div className="rs-stat">
                <span className="material-icons-round">schedule</span>
                <div><div className="rs-stat-num">24/7</div><div className="rs-stat-lbl">Support</div></div>
              </div>
              <div className="rs-stat">
                <span className="material-icons-round">timer</span>
                <div><div className="rs-stat-num">12 Min</div><div className="rs-stat-lbl">Avg. Response</div></div>
              </div>
              <div className="rs-stat">
                <span className="material-icons-round">location_on</span>
                <div><div className="rs-stat-num">Nationwide</div><div className="rs-stat-lbl">Coverage</div></div>
              </div>
              <div className="rs-stat">
                <span className="material-icons-round">verified_user</span>
                <div><div className="rs-stat-num">Trusted</div><div className="rs-stat-lbl">Professionals</div></div>
              </div>
            </div>
          </div>

          {/* RIGHT: tow truck image + cards */}
          <div className="rs-hero-right">
            <div className="rs-img-wrap">
              <img src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2070&auto=format&fit=crop" alt="Roadside assistance" className="rs-img" />
            </div>

            {/* How We Assist floating card */}
            <div className="assist-card">
              <div className="assist-title">How We Assist You</div>
              <div className="assist-step">
                <div className="assist-dot"><span className="material-icons-round">notifications</span></div>
                <div style={{ flex: 1 }}>
                  <div className="assist-step-title">Request Received</div>
                  <div className="assist-step-sub">We receive your request instantly.</div>
                </div>
                <div className="assist-time">10:24 AM</div>
              </div>
              <div className="assist-line"></div>
              <div className="assist-step">
                <div className="assist-dot"><span className="material-icons-round">person</span></div>
                <div style={{ flex: 1 }}>
                  <div className="assist-step-title">Team Assigned</div>
                  <div className="assist-step-sub">Nearest expert assigned.</div>
                </div>
                <div className="assist-time">10:25 AM</div>
              </div>
              <div className="assist-line"></div>
              <div className="assist-step">
                <div className="assist-dot"><span className="material-icons-round">directions_car</span></div>
                <div style={{ flex: 1 }}>
                  <div className="assist-step-title">On The Way</div>
                  <div className="assist-step-sub">Help is on the way.</div>
                </div>
                <div className="assist-time">10:28 AM</div>
              </div>
              <div className="assist-line"></div>
              <div className="assist-step">
                <div className="assist-dot"><span className="material-icons-round">location_on</span></div>
                <div style={{ flex: 1 }}>
                  <div className="assist-step-title">Arrived At Location</div>
                  <div className="assist-step-sub">Expert has arrived.</div>
                </div>
                <div className="assist-time">10:36 AM</div>
              </div>
              <div className="assist-line"></div>
              <div className="assist-step" style={{ marginBottom: 0 }}>
                <div className="assist-dot"><span className="material-icons-round">build</span></div>
                <div style={{ flex: 1 }}>
                  <div className="assist-step-title">Assistance In Progress</div>
                  <div className="assist-step-sub">Getting you back on road.</div>
                </div>
                <div className="assist-time">10:40 AM</div>
              </div>
            </div>

            {/* Immediate help card */}
            <div className="immed-card">
              <div className="immed-title">Need Immediate Help?</div>
              <div className="immed-sub">Call us now for instant support.</div>
              <a href="tel:8004277" className="btn-call">
                <span className="material-icons-round" style={{ fontSize: '16px' }}>call</span> Call 800 GARRO
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section className="py-5" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: '#0f172a', fontSize: '1.7rem', marginBottom: '6px' }}>
              Our <span style={{ color: '#ff5c1a' }}>24/7</span> Roadside Assistance Services
            </h2>
          </div>
          <div className="row g-3">
            <div className="col-6 col-md-4 col-lg-2">
              <div className="rs-svc-card">
                <div className="rs-svc-icon"><span className="material-icons-round">local_shipping</span></div>
                <div className="rs-svc-name">Towing Service</div>
                <div className="rs-svc-desc">Safe towing to nearest garage or your preferred location.</div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="rs-svc-card">
                <div className="rs-svc-icon"><span className="material-icons-round">battery_charging_full</span></div>
                <div className="rs-svc-name">Battery Jump Start</div>
                <div className="rs-svc-desc">Quick jump start for dead batteries anytime, anywhere.</div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="rs-svc-card">
                <div className="rs-svc-icon"><span className="material-icons-round">tire_repair</span></div>
                <div className="rs-svc-name">Flat Tyre Help</div>
                <div className="rs-svc-desc">On-spot tyre replacement assistance.</div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="rs-svc-card">
                <div className="rs-svc-icon"><span className="material-icons-round">local_gas_station</span></div>
                <div className="rs-svc-name">Fuel Delivery</div>
                <div className="rs-svc-desc">We deliver fuel straight to your location.</div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="rs-svc-card">
                <div className="rs-svc-icon"><span className="material-icons-round">lock_open</span></div>
                <div className="rs-svc-name">Lockout Service</div>
                <div className="rs-svc-desc">Locked out of your car? We'll help you get back in.</div>
              </div>
            </div>
            {/* Emergency dark card */}
            <div className="col-6 col-md-4 col-lg-2">
              <div className="emergency-dark h-100">
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '15px', color: '#fff', marginBottom: '6px' }}>
                    Emergency?<br/>We're Just One Call Away.
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.6)', fontFamily: "'Poppins', sans-serif", marginBottom: '16px' }}>
                    Our support team is available 24/7 across UAE.
                  </p>
                  <a href="tel:8004277" className="btn-call">
                    <span className="material-icons-round" style={{ fontSize: '15px' }}>call</span> Call 800 GARRO
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHY CHOOSE ══ */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: '#0f172a', fontSize: '1.7rem', marginBottom: '32px' }}>
            Why Choose <span style={{ color: '#ff5c1a' }}>Garro</span> Roadside Assistance?
          </h2>
          <div className="row g-4">
            <div className="col-6 col-md-4 col-lg">
              <div className="why-item">
                <div className="why-icon"><span className="material-icons-round">speed</span></div>
                <div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>Fastest Response</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>Average 12 minutes response time.</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg">
              <div className="why-item">
                <div className="why-icon"><span className="material-icons-round">location_on</span></div>
                <div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>Nationwide Coverage</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>Across all major cities in UAE.</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg">
              <div className="why-item">
                <div className="why-icon"><span className="material-icons-round">engineering</span></div>
                <div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>Expert Technicians</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>Trained professionals you can trust.</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg">
              <div className="why-item">
                <div className="why-icon"><span className="material-icons-round">payments</span></div>
                <div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>Transparent Pricing</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>No hidden charges, ever.</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg">
              <div className="why-item">
                <div className="why-icon"><span className="material-icons-round">card_membership</span></div>
                <div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>Member Benefits</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>Exclusive benefits for Garro members.</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button onClick={() => setShowOverlay(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', color: '#fff', borderRadius: '12px', padding: '14px 32px', fontWeight: 700, fontSize: '15px', textDecoration: 'none', fontFamily: "'Poppins', sans-serif", boxShadow: '0 6px 20px rgba(255,92,26,.3)', border: 'none', cursor: 'pointer' }}>
              <span className="material-icons-round">request_quote</span> Request Roadside Assistance
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Roadside;
