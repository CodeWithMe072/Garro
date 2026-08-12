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



    </div>
  );
};

export default Insurance;
