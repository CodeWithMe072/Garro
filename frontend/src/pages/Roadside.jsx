import React, { useState } from 'react';
import {
  LuTruck,
  LuArrowRight,
  LuZap,
  LuShieldCheck,
  LuMapPin,
  LuHeadphones,
  LuSmartphone,
  LuWrench,
  LuCar
} from 'react-icons/lu';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';

const Roadside = () => {
  const { t } = useLanguage();
  const { toast } = useNotification();
  const [requested, setRequested] = useState(false);

  const handleRequestAssistance = () => {
    setRequested(true);
    toast.info("Roadside assistance request service is coming soon to the Garro App!");
  };

  const steps = [
    {
      num: "1",
      title: "1. Request Help",
      desc: "Tell us your location and issue through the Garro platform.",
      icon: <LuSmartphone size={22} />
    },
    {
      num: "2",
      title: "2. We Coordinate",
      desc: "We arrange the right support and keep you updated.",
      icon: <LuHeadphones size={22} />
    },
    {
      num: "3",
      title: "3. On-Site Assistance",
      desc: "Our trusted partner arrives at your location.",
      icon: <LuWrench size={22} />
    },
    {
      num: "4",
      title: "4. Back on the Road",
      desc: "Get moving again with minimal disruption.",
      icon: <LuCar size={22} />
    }
  ];

  const services = [
    {
      title: "Flat Tyre Support",
      image: "/assets/images/services/flat-tyre-change.jpg"
    },
    {
      title: "Battery Jump Start",
      image: "/assets/images/services/jump-start.jpg"
    },
    {
      title: "Towing Assistance",
      image: "/assets/images/services/towing-service.jpg"
    },
    {
      title: "Emergency Fuel Delivery",
      image: "/assets/images/services/fuel-delivery.jpg"
    },
    {
      title: "Lockout Assistance",
      image: "/assets/images/services/lockout-assistance.jpg"
    },
    {
      title: "Other Roadside Issues",
      image: "/assets/images/services/other-roadside.jpg"
    }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - var(--nav-h, 80px))', fontFamily: "'Poppins', sans-serif" }}>
      {/* ── HERO SECTION (Full-Bleed Card with Background Image) ── */}
      <section style={{ width: '95%', maxWidth: '1440px', margin: '0 auto', padding: '24px 0' }}>
        <div style={{
          position: 'relative',
          borderRadius: '28px',
          overflow: 'hidden',
          minHeight: '480px',
          boxShadow: '0 25px 50px -12px rgba(9, 13, 22, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(to right, #091324 0%, #091324 25%, rgba(9, 19, 36, 0.75) 42%, transparent 60%), #091324 url("/assets/images/roadside-full-hero.png") right center / cover no-repeat',
          padding: '56px 48px',
          color: '#ffffff'
        }}>
          <div className="row align-items-center position-relative" style={{ zIndex: 2 }}>
            {/* Left Content */}
            <div className="col-lg-5 col-xl-5">
              {/* Badge / Category Subtitle */}
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#94a3b8',
                marginBottom: '20px'
              }}>
                ROADSIDE ASSISTANCE
              </div>

              {/* Two-Line Headline */}
              <h1 style={{
                fontSize: 'clamp(2.4rem, 4.2vw, 3.6rem)',
                fontWeight: 900,
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
                marginBottom: '20px'
              }}>
                <span className="d-block" style={{ color: '#ffffff' }}>Back on the Road,</span>
                <span style={{ color: '#ff5c1a' }}>Without the Hassle.</span>
              </h1>

              {/* Description */}
              <p style={{
                fontSize: '15px',
                color: '#94a3b8',
                lineHeight: 1.65,
                maxWidth: '460px',
                marginBottom: '32px'
              }}>
                Unexpected breakdown? Garro gets you the right help, quickly and conveniently, wherever you are in the UAE.
              </p>

              {/* Primary CTA Button */}
              <div style={{ marginBottom: '36px' }}>
                <button
                  onClick={handleRequestAssistance}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'linear-gradient(135deg, #ff5c1a 0%, #ff7336 100%)',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: 700,
                    padding: '14px 32px',
                    borderRadius: '50px',
                    border: 'none',
                    boxShadow: '0 10px 25px rgba(255, 92, 26, 0.35)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Request Assistance <LuArrowRight size={18} />
                </button>
              </div>

              {/* Inline Stats Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: '12px',
                color: '#cbd5e1'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LuZap size={18} style={{ color: '#ff5c1a' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Quick Response</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Across UAE</div>
                  </div>
                </div>

                <span style={{ opacity: 0.3 }}>|</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LuShieldCheck size={18} style={{ color: '#ff5c1a' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Managed End-to-End</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>by Garro</div>
                  </div>
                </div>

                <span style={{ opacity: 0.3 }}>|</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LuMapPin size={18} style={{ color: '#ff5c1a' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Support at Your</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Location</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Dark Translucent Badge (Bottom Right over photo) */}
          <div className="d-none d-lg-flex" style={{
            position: 'absolute',
            bottom: '8%',
            right: '4%',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '12px 20px',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
            zIndex: 5
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <LuHeadphones size={18} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>
                Help is just a few taps away.
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                We'll get you moving again.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section style={{ width: '95%', maxWidth: '1440px', margin: '0 auto', padding: '64px 0 48px' }}>
        {/* Header Row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: '6px'
            }}>
              HOW IT WORKS
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              Get Help in 4 Simple Steps
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '6px 0 0 0' }}>
              A faster, easier way to handle roadside issues.
            </p>
          </div>

          <button
            onClick={() => toast.info("Garro Roadside Assistance covers Dubai, Abu Dhabi, Sharjah, and all major UAE routes.")}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ff5c1a',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: 0
            }}
          >
            View Service Areas <LuArrowRight size={16} />
          </button>
        </div>

        {/* 4 Cards Row with Arrows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div style={{
                flex: '1 1 220px',
                minWidth: '220px',
                background: '#ffffff',
                borderRadius: '20px',
                padding: '36px 28px',
                minHeight: '140px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.04)'; }}
              >
                {/* Round Icon Container */}
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#fff0eb',
                  color: '#ff5c1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {step.icon}
                </div>

                {/* Text Content */}
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px', lineHeight: 1.3 }}>
                    {step.title}
                  </h4>
                  <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Arrow Connector between steps */}
              {idx < steps.length - 1 && (
                <div className="d-none d-lg-block" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center' }}>
                  <LuArrowRight size={18} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── COMMON ROADSIDE SUPPORT SECTION ── */}
      <section style={{ width: '95%', maxWidth: '1440px', margin: '0 auto', padding: '36px 0 56px' }}>
        {/* Header Row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: '6px'
            }}>
              COMMON ROADSIDE SUPPORT
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              We've Got You Covered
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '6px 0 0 0' }}>
              From flat tyres to battery issues, Garro helps with a wide range of roadside needs.
            </p>
          </div>

          <button
            onClick={() => toast.info("Viewing all roadside support services.")}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ff5c1a',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: 0
            }}
          >
            View All Services <LuArrowRight size={16} />
          </button>
        </div>

        {/* 6 Compact Photo Cards Row */}
        <div className="row g-3">
          {services.map((item, idx) => (
            <div key={idx} className="col-6 col-md-4 col-lg-2">
              <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                height: '100%',
                boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 18px rgba(15, 23, 42, 0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(15, 23, 42, 0.04)'; }}
              >
                <div style={{ width: '100%', height: '130px', overflow: 'hidden', position: 'relative', background: '#f1f5f9' }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '12px 8px', textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <h4 style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.25 }}>
                    {item.title}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM BANNER SECTION ── */}
      <section style={{ width: '95%', maxWidth: '1440px', margin: '0 auto 48px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #090d16 0%, #152238 100%)',
          borderRadius: '24px',
          padding: '40px 36px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          boxShadow: '0 20px 40px -15px rgba(9, 13, 22, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', maxWidth: '680px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(255, 92, 26, 0.15)',
              border: '1px solid rgba(255, 92, 26, 0.3)',
              color: '#ff5c1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <LuHeadphones size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
                Need Immediate Help?
              </h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                Request roadside assistance now and we'll take care of the rest.
              </p>
            </div>
          </div>

          <button
            onClick={handleRequestAssistance}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #ff5c1a 0%, #ff7336 100%)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 700,
              padding: '13px 28px',
              borderRadius: '50px',
              border: 'none',
              boxShadow: '0 8px 20px rgba(255, 92, 26, 0.35)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Request Assistance <LuArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Roadside;
