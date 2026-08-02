import React, { useState } from 'react';
import { 
  LuShieldCheck, 
  LuShield, 
  LuFileText, 
  LuFilePenLine, 
  LuTruck, 
  LuChevronDown, 
  LuChevronUp, 
  LuCheck, 
  LuBadgeCheck, 
  LuUsers, 
  LuClock, 
  LuThumbsUp, 
  LuSiren,
  LuSparkles,
  LuInfo
} from 'react-icons/lu';

const Insurance = () => {
  // FAQ accordion states
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "Which insurance companies will Garro support?",
      a: "Garro will partner with top-rated insurance providers in the UAE (including AXA, RSA, Oman Insurance, and ADNIC) to offer you competitive premiums and comprehensive coverage options directly in the platform."
    },
    {
      q: "Can I compare multiple insurance plans?",
      a: "Yes! Our comparison tool will allow you to compare up to 5 insurance quotes side-by-side, detailing policy limits, deductibles, garage repair coverage, and added benefits like roadside assistance."
    },
    {
      q: "Will claim assistance be available?",
      a: "Absolutely. Garro will provide end-to-end digital claim assistance. You can upload accident reports, track claim status, and coordinate repairs directly with RTA-approved garages through our portal."
    },
    {
      q: "Is roadside assistance included in all plans?",
      a: "Roadside assistance is included as a standard benefit in all Comprehensive plans and can be added as an optional rider for Third-Party liability policies."
    },
    {
      q: "How will policy renewal work?",
      a: "Garro will automatically notify you 30 days before your policy expiry. You can renew instantly in one click with your pre-saved vehicle and owner documentation."
    },
    {
      q: "When will Garro Insurance launch?",
      a: "We are currently in active beta testing with our insurance partners and plan to roll out full comparison, purchase, and claim tracking features in the coming months. Stay tuned!"
    }
  ];

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* ══ HERO SECTION ══ */}
      <section style={{ 
        position: 'relative', 
        padding: '80px 0 60px', 
        background: 'radial-gradient(circle at 75% 50%, rgba(255,92,26,0.04) 0%, transparent 60%)',
        overflow: 'hidden'
      }}>
        {/* Abstract Skyline backdrop representation */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '50%',
          height: '100%',
          backgroundImage: 'linear-gradient(to top, rgba(255,255,255,1) 10%, rgba(255,255,255,0) 100%), url("https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=1000&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          zIndex: 1,
          pointerEvents: 'none'
        }}></div>

        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center g-5">
            {/* Left Content */}
            <div className="col-lg-6">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,92,26,0.06)',
                border: '1px solid rgba(255,92,26,0.15)',
                color: '#ff5c1a',
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.08em',
                marginBottom: '28px'
              }}>
                <LuShieldCheck size={14} /> Insurance &amp; Protection
              </div>

              <h1 style={{ 
                fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', 
                fontWeight: 900, 
                lineHeight: 1.1, 
                letterSpacing: '-.03em', 
                marginBottom: '20px',
                color: '#0f172a'
              }}>
                Drive Protected.<br />
                We're <span style={{ color: '#ff5c1a' }}>Coming Soon!</span>
              </h1>

              <p style={{ 
                fontSize: '15.5px', 
                color: '#64748b', 
                lineHeight: 1.75, 
                marginBottom: '32px',
                maxWidth: '520px'
              }}>
                Garro is building a complete vehicle protection ecosystem that lets you compare insurance plans, manage claims, extend warranties and protect your vehicle—all in one place.
              </p>

              {/* Warning/Info Box */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                background: '#fffbf7', 
                border: '1px solid #ffedd5', 
                padding: '16px 20px', 
                borderRadius: '16px',
                maxWidth: '520px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  minWidth: '32px',
                  borderRadius: '50%',
                  background: '#fff7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ff5c1a'
                }}>
                  <LuInfo size={16} />
                </div>
                <p style={{ fontSize: '13px', color: '#b45309', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                  We're working hard to bring you the most reliable and transparent vehicle protection experience.
                </p>
              </div>
            </div>

            {/* Right Graphic Section */}
            <div className="col-lg-6 position-relative">
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: '500px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                {/* Glowing Circles behind car */}
                <div style={{
                  position: 'absolute',
                  width: '420px',
                  height: '420px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,92,26,0.12) 0%, transparent 70%)',
                  zIndex: 1
                }}></div>

                {/* White Crossover SUV Image */}
                <img 
                  src="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=1000&auto=format&fit=crop" 
                  alt="Premium SUV" 
                  style={{
                    width: '95%',
                    maxHeight: '340px',
                    objectFit: 'contain',
                    zIndex: 2,
                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.18))'
                  }}
                />

                {/* Floating Shield Check */}
                <div style={{
                  position: 'absolute',
                  top: '8%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #ff5c1a, #ff8c42)',
                  width: '72px',
                  height: '72px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 12px 28px rgba(255,92,26,0.4)',
                  zIndex: 3,
                  border: '2.5px solid #ffffff'
                }}>
                  <LuShieldCheck size={38} strokeWidth={1.8} />
                </div>

                {/* Floating Callout 1: Comprehensive Insurance */}
                <div className="d-none d-sm-block" style={{
                  position: 'absolute',
                  top: '5%',
                  left: '0%',
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                  zIndex: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '185px'
                }}>
                  <div style={{ color: '#ff5c1a', background: '#fff4ef', padding: '6px', borderRadius: '8px' }}>
                    <LuShield size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '11px', color: '#0f172a' }}>Comprehensive</div>
                    <div style={{ fontSize: '9.5px', color: '#64748b' }}>Full vehicle coverage</div>
                  </div>
                </div>

                {/* Floating Callout 2: Roadside Assistance */}
                <div className="d-none d-sm-block" style={{
                  position: 'absolute',
                  top: '5%',
                  right: '0%',
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                  zIndex: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '185px'
                }}>
                  <div style={{ color: '#ff8c42', background: '#fff4ef', padding: '6px', borderRadius: '8px' }}>
                    <LuTruck size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '11px', color: '#0f172a' }}>Roadside Assist</div>
                    <div style={{ fontSize: '9.5px', color: '#64748b' }}>24/7 recovery support</div>
                  </div>
                </div>

                {/* Floating Callout 3: Extended Warranty */}
                <div className="d-none d-sm-block" style={{
                  position: 'absolute',
                  bottom: '12%',
                  left: '0%',
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                  zIndex: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '185px'
                }}>
                  <div style={{ color: '#3b82f6', background: '#eff6ff', padding: '6px', borderRadius: '8px' }}>
                    <LuBadgeCheck size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '11px', color: '#0f172a' }}>Extended Warranty</div>
                    <div style={{ fontSize: '9.5px', color: '#64748b' }}>Up to 5 years protection</div>
                  </div>
                </div>

                {/* Floating Callout 4: Claims Support */}
                <div className="d-none d-sm-block" style={{
                  position: 'absolute',
                  bottom: '12%',
                  right: '0%',
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                  zIndex: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '185px'
                }}>
                  <div style={{ color: '#8b5cf6', background: '#f5f3ff', padding: '6px', borderRadius: '8px' }}>
                    <LuFilePenLine size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '11px', color: '#0f172a' }}>Claims Support</div>
                    <div style={{ fontSize: '9.5px', color: '#64748b' }}>Fast &amp; easy digital claims</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 4 SERVICES CARDS SECTION ══ */}
      <section style={{ padding: '60px 0', background: '#ffffff' }}>
        <div className="container">
          <div className="row g-4">
            {/* Card 1: Insurance Comparison */}
            <div className="col-md-6 col-lg-3">
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '20px',
                padding: '28px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.01)',
                height: '100%'
              }}>
                <div style={{ color: '#ff5c1a', marginBottom: '20px' }}>
                  <LuFileText size={32} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Insurance Comparison</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
                  Compare plans from top insurance providers in UAE.
                </p>
                <div style={{ position: 'absolute', bottom: 0, left: '28px', right: '28px', height: '4px', background: '#ff5c1a', borderRadius: '2px 2px 0 0' }}></div>
              </div>
            </div>

            {/* Card 2: Extended Warranty */}
            <div className="col-md-6 col-lg-3">
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '20px',
                padding: '28px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.01)',
                height: '100%'
              }}>
                <div style={{ color: '#3b82f6', marginBottom: '20px' }}>
                  <LuBadgeCheck size={32} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Extended Warranty</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
                  Extend your vehicle's warranty up to 5 years.
                </p>
                <div style={{ position: 'absolute', bottom: 0, left: '28px', right: '28px', height: '4px', background: '#3b82f6', borderRadius: '2px 2px 0 0' }}></div>
              </div>
            </div>

            {/* Card 3: Claims Assistance */}
            <div className="col-md-6 col-lg-3">
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '20px',
                padding: '28px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.01)',
                height: '100%'
              }}>
                <div style={{ color: '#8b5cf6', marginBottom: '20px' }}>
                  <LuFilePenLine size={32} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Claims Assistance</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
                  Quick, digital and hassle-free claim support.
                </p>
                <div style={{ position: 'absolute', bottom: 0, left: '28px', right: '28px', height: '4px', background: '#8b5cf6', borderRadius: '2px 2px 0 0' }}></div>
              </div>
            </div>

            {/* Card 4: Roadside Coverage */}
            <div className="col-md-6 col-lg-3">
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '20px',
                padding: '28px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.01)',
                height: '100%'
              }}>
                <div style={{ color: '#10b981', marginBottom: '20px' }}>
                  <LuTruck size={32} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Roadside Coverage</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
                  24x7 roadside help whenever you need.
                </p>
                <div style={{ position: 'absolute', bottom: 0, left: '28px', right: '28px', height: '4px', background: '#10b981', borderRadius: '2px 2px 0 0' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHAT'S COMING SECTION ══ */}
      <section style={{ padding: '60px 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a' }}>What's Coming?</h2>
            <div style={{ width: '40px', height: '3px', background: '#ff5c1a', margin: '8px auto 0', borderRadius: '2px' }}></div>
          </div>

          <div className="row align-items-center g-5">
            {/* Checkpoints Checklist */}
            <div className="col-lg-6">
              <div className="row g-4">
                {[
                  "Insurance Marketplace", "Claim Tracking",
                  "Compare 30+ Providers", "Vehicle History",
                  "Instant Premium Calculator", "Renewal Reminder",
                  "Digital Policy Storage", "EMI Insurance Plans",
                  "Digital Policy Store"
                ].map((item, idx) => (
                  <div className="col-sm-6" key={idx}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#fff4ef',
                        border: '1px solid #ffecd5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ff5c1a',
                        flexShrink: 0
                      }}>
                        <LuCheck size={14} strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Illustration Mockup (Clipboard / Car under Umbrella style) */}
            <div className="col-lg-6">
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'inline-block',
                    background: '#fff4ef',
                    color: '#ff5c1a',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '50px',
                    marginBottom: '12px',
                    textTransform: 'uppercase'
                  }}>
                    Beta Testing
                  </div>
                  <h4 style={{ fontWeight: 800, fontSize: '17px', color: '#0f172a', marginBottom: '8px' }}>Compare Providers</h4>
                  <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                    We are testing instant claim submissions and premium computation engines with leading UAE partners.
                  </p>
                </div>
                
                {/* 3D Clipboard lookalike */}
                <div style={{
                  background: '#f1f5f9',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '16px',
                  width: '140px',
                  padding: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  position: 'relative'
                }}>
                  <div style={{ width: '40px', height: '10px', background: '#94a3b8', borderRadius: '5px', margin: '-24px auto 14px' }}></div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', borderBottom: '1.5px solid #cbd5e1', paddingBottom: '6px', marginBottom: '8px' }}>INSURANCE</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}><div style={{ width: '8px', height: '8px', background: '#ff5c1a', borderRadius: '50%' }}></div><div style={{ width: '50px', height: '6px', background: '#94a3b8', borderRadius: '3px' }}></div></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}><div style={{ width: '8px', height: '8px', background: '#ff5c1a', borderRadius: '50%' }}></div><div style={{ width: '60px', height: '6px', background: '#94a3b8', borderRadius: '3px' }}></div></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', background: '#ff5c1a', borderRadius: '50%' }}></div><div style={{ width: '40px', height: '6px', background: '#94a3b8', borderRadius: '3px' }}></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ SECTION ══ */}
      <section style={{ padding: '70px 0', background: '#ffffff' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Insurance &amp; Protection – FAQ</h2>
            <div style={{ width: '45px', height: '3px', background: '#ff5c1a', margin: '8px auto 0', borderRadius: '2px' }}></div>
          </div>

          <div className="row g-4">
            {/* Left FAQ Column */}
            <div className="col-md-6">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {faqData.slice(0, 3).map((faq, index) => {
                  const isOpen = activeFaq === index;
                  return (
                    <div key={index} style={{
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      transition: 'all 0.2s'
                    }}>
                      <button 
                        onClick={() => toggleFaq(index)}
                        style={{
                          width: '100%',
                          background: isOpen ? '#fff4ef' : '#ffffff',
                          border: 'none',
                          padding: '18px 20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '13.5px',
                          color: isOpen ? '#ff5c1a' : '#0f172a',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
                      </button>
                      {isOpen && (
                        <div style={{ 
                           padding: '16px 20px', 
                           background: '#ffffff', 
                           fontSize: '12.5px', 
                           color: '#64748b', 
                           lineHeight: 1.65,
                           borderTop: '1px solid #e2e8f0'
                        }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right FAQ Column */}
            <div className="col-md-6">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {faqData.slice(3, 6).map((faq, index) => {
                  const actualIndex = index + 3;
                  const isOpen = activeFaq === actualIndex;
                  return (
                    <div key={actualIndex} style={{
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      transition: 'all 0.2s'
                    }}>
                      <button 
                        onClick={() => toggleFaq(actualIndex)}
                        style={{
                          width: '100%',
                          background: isOpen ? '#fff4ef' : '#ffffff',
                          border: 'none',
                          padding: '18px 20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '13.5px',
                          color: isOpen ? '#ff5c1a' : '#0f172a',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
                      </button>
                      {isOpen && (
                        <div style={{ 
                           padding: '16px 20px', 
                           background: '#ffffff', 
                           fontSize: '12.5px', 
                           color: '#64748b', 
                           lineHeight: 1.65,
                           borderTop: '1px solid #e2e8f0'
                        }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ LAUNCHING SOON FOOTER BANNER ══ */}
      <section style={{ padding: '0 0 60px' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, #fffcf9, #fff8f2)',
            border: '1.5px solid #ffe8dd',
            borderRadius: '24px',
            padding: '36px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 2 }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: '#fff4ef',
                border: '1px solid #ffe3d5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff5c1a',
                flexShrink: 0
              }}>
                <LuShield size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Launching Soon</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Garro Insurance &amp; Protection is currently under development. Stay tuned for updates!
                </p>
              </div>
            </div>

            {/* Vector car decoration outline */}
            <div style={{ opacity: 0.15, zIndex: 1 }} className="d-none d-lg-block">
              <svg width="200" height="60" viewBox="0 0 200 60" fill="none">
                <path d="M10 40 C20 40, 30 35, 40 25 C50 15, 70 12, 100 12 C130 12, 150 15, 160 25 C170 35, 180 40, 190 40 L195 48 L5 48 Z" stroke="#ff5c1a" strokeWidth="3" strokeLinecap="round" />
                <circle cx="45" cy="48" r="10" stroke="#ff5c1a" strokeWidth="3" fill="#fff" />
                <circle cx="155" cy="48" r="10" stroke="#ff5c1a" strokeWidth="3" fill="#fff" />
              </svg>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Insurance;
