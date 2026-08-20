import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LuTruck, 
  LuClock, 
  LuMapPin, 
  LuBadgeCheck, 
  LuWrench, 
  LuZap, 
  LuFuel, 
  LuChevronDown, 
  LuChevronUp, 
  LuCheck, 
  LuUsers, 
  LuThumbsUp, 
  LuInfo,
  LuHardHat
} from 'react-icons/lu';

const Roadside = () => {
  // FAQ accordion states
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "Is roadside assistance available 24x7?",
      a: "Yes! Our roadside assistance network will operate 24 hours a day, 7 days a week, 365 days a year. No matter when you experience a breakdown, fuel shortage, or flat tyre, our dispatchers will be ready to help."
    },
    {
      q: "What areas will be covered?",
      a: "Garro Roadside Assistance will provide full coverage across all seven emirates in the UAE, including Dubai, Abu Dhabi, Sharjah, Ajman, Fujairah, Ras Al Khaimah, and Umm Al Quwain."
    },
    {
      q: "Will there be any charges for the service?",
      a: "We will offer competitive pay-on-demand rates for non-members. For Garro membership holders, basic roadside assistance services (like jump-starts, tyre changes, and local towing) will be completely free of charge."
    },
    {
      q: "What services will be included?",
      a: "Our coverage includes flatbed & wheel-lift towing, battery jump-starts, fuel delivery, flat tyre replacement, key lockout support, and minor on-spot mechanical or electrical troubleshooting."
    },
    {
      q: "How quickly will help arrive?",
      a: "Our dispatch algorithm automatically routes the closest available recovery vehicle to your GPS coordinates. We aim for an average response time of 12 to 20 minutes in urban areas."
    },
    {
      q: "How can I request roadside assistance?",
      a: "Once launched, you can request immediate help with one tap in the Garro app. We'll automatically capture your location, assign a driver, and let you track their tow truck live on the map."
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
        {/* Skyline backdrop */}
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
                <LuTruck size={14} /> Roadside Assistance
              </div>

              <h1 style={{ 
                fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', 
                fontWeight: 900, 
                lineHeight: 1.1, 
                letterSpacing: '-.03em', 
                marginBottom: '20px',
                color: '#0f172a'
              }}>
                Help When You<br />
                <span style={{ color: '#ff5c1a' }}>Need It Most.</span>
              </h1>

              <p style={{ 
                fontSize: '15.5px', 
                color: '#64748b', 
                lineHeight: 1.75, 
                marginBottom: '24px',
                maxWidth: '520px'
              }}>
                Garro Roadside Assistance provides 24x7 support across the UAE. From flat tires to towing, request help instantly and track our operators.
              </p>

              {/* Action Button */}
              <div style={{ marginBottom: '32px' }}>
                <Link
                  to="/emergency-pickup"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '12px 28px',
                    fontWeight: 700,
                    fontSize: '14.5px',
                    textDecoration: 'none',
                    fontFamily: "'Poppins', sans-serif",
                    boxShadow: '0 6px 20px rgba(239,68,68,.25)',
                    transition: 'all 0.2s'
                  }}
                >
                  <LuTruck size={16} /> Request Emergency Pickup
                </Link>
              </div>

              {/* Notice/Info Box */}
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
                  Fast. Reliable. Professional. We're on the way to keep you moving.
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
                {/* Glowing Circles behind truck */}
                <div style={{
                  position: 'absolute',
                  width: '420px',
                  height: '420px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,92,26,0.12) 0%, transparent 70%)',
                  zIndex: 1
                }}></div>

                {/* Flatbed Tow Truck Image */}
                <img 
                  src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1000&auto=format&fit=crop" 
                  alt="Flatbed Recovery Tow Truck" 
                  style={{
                    width: '95%',
                    maxHeight: '340px',
                    objectFit: 'contain',
                    zIndex: 2,
                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))'
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
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Roadside Assistance – FAQ</h2>
            <div style={{ width: '45px', height: '3px', background: '#ff5c1a', margin: '8px auto 0', borderRadius: '2px' }}></div>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {faqData.slice(0, 3).map((faq, index) => {
                  const isOpen = activeFaq === index;
                  return (
                    <div key={index} style={{ border: '1.5px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', transition: 'all 0.2s' }}>
                      <button onClick={() => toggleFaq(index)} style={{ width: '100%', background: isOpen ? '#fff4ef' : '#ffffff', border: 'none', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', cursor: 'pointer', fontWeight: 700, fontSize: '13.5px', color: isOpen ? '#ff5c1a' : '#0f172a', transition: 'all 0.2s' }}>
                        <span>{faq.q}</span>
                        {isOpen ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
                      </button>
                      {isOpen && (
                        <div style={{ padding: '16px 20px', background: '#ffffff', fontSize: '12.5px', color: '#64748b', lineHeight: 1.65, borderTop: '1px solid #e2e8f0' }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="col-md-6">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {faqData.slice(3, 6).map((faq, index) => {
                  const actualIndex = index + 3;
                  const isOpen = activeFaq === actualIndex;
                  return (
                    <div key={actualIndex} style={{ border: '1.5px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', transition: 'all 0.2s' }}>
                      <button onClick={() => toggleFaq(actualIndex)} style={{ width: '100%', background: isOpen ? '#fff4ef' : '#ffffff', border: 'none', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', cursor: 'pointer', fontWeight: 700, fontSize: '13.5px', color: isOpen ? '#ff5c1a' : '#0f172a', transition: 'all 0.2s' }}>
                        <span>{faq.q}</span>
                        {isOpen ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
                      </button>
                      {isOpen && (
                        <div style={{ padding: '16px 20px', background: '#ffffff', fontSize: '12.5px', color: '#64748b', lineHeight: 1.65, borderTop: '1px solid #e2e8f0' }}>
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

export default Roadside;
