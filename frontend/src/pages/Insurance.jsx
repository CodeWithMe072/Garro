import React, { useState } from 'react';
import {
  LuShield,
  LuArrowRight,
  LuBell,
  LuFileText,
  LuClock,
  LuTrendingUp,
  LuHeadphones,
  LuCheck
} from 'react-icons/lu';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';

const Insurance = () => {
  const { t } = useLanguage();
  const { toast } = useNotification();
  const [notified, setNotified] = useState(false);

  const handleNotifyMe = () => {
    setNotified(true);
    toast.success("Thank you! We'll notify you as soon as Motor Insurance launches.");
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - var(--nav-h, 80px))', fontFamily: "'Poppins', sans-serif" }}>
      {/* ── HERO SECTION ── */}
      <section className="container py-4">
        <div style={{
          background: 'radial-gradient(circle at 75% 30%, #152238 0%, #090d16 65%)',
          borderRadius: '28px',
          padding: '56px 48px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(9, 13, 22, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Background Decorative Shield Light Glow */}
          <div style={{
            position: 'absolute',
            right: '-10%',
            top: '-20%',
            width: '650px',
            height: '650px',
            background: 'radial-gradient(circle, rgba(255, 92, 26, 0.15) 0%, rgba(255, 92, 26, 0.02) 55%, transparent 70%)',
            pointerEvents: 'none',
            borderRadius: '50%'
          }} />

          <div className="row align-items-center g-5 position-relative" style={{ zIndex: 2 }}>
            {/* Left Content */}
            <div className="col-lg-6">
              {/* Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                color: 'rgba(255, 255, 255, 0.9)',
                padding: '6px 16px',
                borderRadius: '50px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '24px'
              }}>
                <LuShield size={14} style={{ color: '#ff5c1a' }} /> MOTOR INSURANCE
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
                fontWeight: 900,
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
                marginBottom: '20px'
              }}>
                <span className="d-block" style={{ color: '#ffffff' }}>Motor Insurance,</span>
                <span style={{ color: '#ff5c1a' }}>Reimagined.</span>
              </h1>

              {/* Description */}
              <p style={{
                fontSize: '15.5px',
                color: '#94a3b8',
                lineHeight: 1.65,
                maxWidth: '460px',
                marginBottom: '36px'
              }}>
                A simpler and more convenient way to manage your motor insurance with Garro. All in one place, coming soon.
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #ff5c1a 0%, #ff7336 100%)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  padding: '13px 28px',
                  borderRadius: '50px',
                  boxShadow: '0 10px 25px rgba(255, 92, 26, 0.35)'
                }}>
                  Coming Soon <LuArrowRight size={16} />
                </div>

                <button
                  onClick={handleNotifyMe}
                  disabled={notified}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: notified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                    border: notified ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.2)',
                    color: notified ? '#10b981' : '#ffffff',
                    fontSize: '14px',
                    fontWeight: 600,
                    padding: '13px 26px',
                    borderRadius: '50px',
                    cursor: notified ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {notified ? <><LuCheck size={16} /> Notified!</> : <><LuBell size={16} /> Get Notified</>}
                </button>
              </div>
            </div>

            {/* Right Hero Graphic & Floating Card */}
            <div className="col-lg-6 position-relative d-flex justify-content-center justify-content-lg-end">
              <div style={{ position: 'relative', width: '100%', maxWidth: '520px', minHeight: '340px' }} className="d-flex align-items-center justify-content-center">

                {/* Car Graphic Container */}
                <div style={{ position: 'relative', zIndex: 1, width: '100%', textAlign: 'center' }}>
                  <img
                    src="/assets/images/hero-car-trans.png"
                    alt="Garro Motor Insurance Car"
                    onError={(e) => { e.target.src = '/assets/images/hero-home.jpg'; }}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '290px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.7))'
                    }}
                  />
                  {/* Glowing Shield Ring SVG */}
                  <svg style={{ position: 'absolute', top: '50%', left: '45%', transform: 'translate(-50%, -50%)', width: '380px', height: '380px', pointerEvents: 'none', zIndex: -1 }}>
                    <path
                      d="M 190 20 C 270 20, 360 80, 360 200 C 360 300, 270 350, 190 370 C 110 350, 20 300, 20 200 C 20 80, 110 20, 190 20 Z"
                      fill="none"
                      stroke="#ff5c1a"
                      strokeWidth="2.5"
                      strokeOpacity="0.6"
                      style={{ filter: 'drop-shadow(0 0 12px rgba(255, 92, 26, 0.8))' }}
                    />
                  </svg>
                </div>

                {/* Floating Glassmorphism Stat Card */}
                <div style={{
                  position: 'absolute',
                  right: '0',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(15, 23, 42, 0.82)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '20px',
                  padding: '24px 22px',
                  width: '240px',
                  zIndex: 2,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }}>
                  <div className="mb-3">
                    <div style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 500, lineHeight: 1.2 }}>Your Drive</div>
                    <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: 800, lineHeight: 1.2 }}>Our Priority</div>
                  </div>

                  <div className="d-flex flex-column gap-2.5 mb-3">
                    <div className="d-flex align-items-center gap-2.5" style={{ color: '#e2e8f0', fontSize: '13px' }}>
                      <span style={{ color: '#ff5c1a', display: 'flex' }}><LuFileText size={15} /></span>
                      <span>Policy Management</span>
                    </div>
                    <div className="d-flex align-items-center gap-2.5" style={{ color: '#e2e8f0', fontSize: '13px' }}>
                      <span style={{ color: '#ff5c1a', display: 'flex' }}><LuClock size={15} /></span>
                      <span>Easy Renewal</span>
                    </div>
                    <div className="d-flex align-items-center gap-2.5" style={{ color: '#e2e8f0', fontSize: '13px' }}>
                      <span style={{ color: '#ff5c1a', display: 'flex' }}><LuTrendingUp size={15} /></span>
                      <span>Smart Comparisons</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '12px', marginTop: '12px' }}>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>A Better</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>Driving Tomorrow</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE ROW SECTION ── */}
      <section className="container py-5">
        <div className="row g-4">
          <div className="col-md-4">
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '32px 28px',
              border: '1px solid #e2e8f0',
              height: '100%',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(15, 23, 42, 0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.03)'; }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#fff4ef',
                color: '#ff5c1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <LuFileText size={24} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                One Place Access
              </h4>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                View, manage and renew your policies easily.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '32px 28px',
              border: '1px solid #e2e8f0',
              height: '100%',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(15, 23, 42, 0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.03)'; }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#fff4ef',
                color: '#ff5c1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <LuTrendingUp size={24} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Smart Comparisons
              </h4>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Find the right cover for your needs.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '32px 28px',
              border: '1px solid #e2e8f0',
              height: '100%',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(15, 23, 42, 0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.03)'; }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#fff4ef',
                color: '#ff5c1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <LuHeadphones size={24} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Dedicated Policy Support
              </h4>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Get help whenever you need it from our team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM BANNER SECTION ── */}
      <section className="py-5 text-center" style={{ background: '#f1f5f9', borderTop: '1px solid #e2e8f0' }}>
        <div className="container py-4">
          <div style={{
            display: 'inline-block',
            background: 'rgba(255, 92, 26, 0.08)',
            color: '#ff5c1a',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '6px 16px',
            borderRadius: '50px',
            marginBottom: '16px'
          }}>
            BUILT FOR A SMOOTHER TOMORROW
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
            fontWeight: 800,
            color: '#0f172a',
            margin: 0
          }}>
            Insurance, Made for What's Next.
          </h2>
        </div>
      </section>
    </div>
  );
};

export default Insurance;
