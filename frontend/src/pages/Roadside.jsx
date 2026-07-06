import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  Clock, 
  MapPin, 
  BadgeCheck, 
  Wrench, 
  Zap, 
  Fuel, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Users, 
  ThumbsUp, 
  Info,
  HardHat
} from 'lucide-react';

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
                <Truck size={14} /> Roadside Assistance
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
                    background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '12px 28px',
                    fontWeight: 700,
                    fontSize: '14.5px',
                    textDecoration: 'none',
                    fontFamily: "'Poppins', sans-serif",
                    boxShadow: '0 6px 20px rgba(255,92,26,.25)',
                    transition: 'all 0.2s'
                  }}
                >
                  <Truck size={16} /> Request Emergency Tow
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
                  <Info size={16} />
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

                {/* Floating Callout 1: Battery Jump Start */}
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
                    <Zap size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '11px', color: '#0f172a' }}>Battery Jump</div>
                    <div style={{ fontSize: '9.5px', color: '#64748b' }}>Get back on the road quick</div>
                  </div>
                </div>

                {/* Floating Callout 2: Flat Tire Assistance */}
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
                    <Wrench size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '11px', color: '#0f172a' }}>Flat Tyre Assist</div>
                    <div style={{ fontSize: '9.5px', color: '#64748b' }}>On-spot tire replacement</div>
                  </div>
                </div>

                {/* Floating Callout 3: Fuel Delivery */}
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
                    <Fuel size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '11px', color: '#0f172a' }}>Fuel Delivery</div>
                    <div style={{ fontSize: '9.5px', color: '#64748b' }}>We deliver fuel to you</div>
                  </div>
                </div>

                {/* Floating Callout 4: Towing Service */}
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
                    <Truck size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '11px', color: '#0f172a' }}>Towing Service</div>
                    <div style={{ fontSize: '9.5px', color: '#64748b' }}>Safe towing to location</div>
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
            {/* Card 1: 24/7 Support */}
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
                  <Clock size={32} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>24x7 Support</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
                  Available round the clock, every day of the year.
                </p>
                <div style={{ position: 'absolute', bottom: 0, left: '28px', right: '28px', height: '4px', background: '#ff5c1a', borderRadius: '2px 2px 0 0' }}></div>
              </div>
            </div>

            {/* Card 2: Nationwide Coverage */}
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
                  <MapPin size={32} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Nationwide Coverage</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
                  Coming soon to all major cities across UAE.
                </p>
                <div style={{ position: 'absolute', bottom: 0, left: '28px', right: '28px', height: '4px', background: '#3b82f6', borderRadius: '2px 2px 0 0' }}></div>
              </div>
            </div>

            {/* Card 3: Trusted Professionals */}
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
                  <HardHat size={32} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Trusted Professionals</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
                  Verified experts to assist you on the road.
                </p>
                <div style={{ position: 'absolute', bottom: 0, left: '28px', right: '28px', height: '4px', background: '#8b5cf6', borderRadius: '2px 2px 0 0' }}></div>
              </div>
            </div>

            {/* Card 4: Safe & Reliable */}
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
                  <BadgeCheck size={32} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Safe &amp; Reliable</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
                  Your safety is our top priority, always.
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
                  "24x7 Roadside Support", "Fuel Delivery Service",
                  "Towing & Vehicle Recovery", "Lockout Assistance",
                  "Flat Tyre Assistance", "On-Spot Minor Repairs",
                  "Battery Jump Start", "Live Request Tracking"
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
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Illustration Mockup */}
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
                    Live Tracker
                  </div>
                  <h4 style={{ fontWeight: 800, fontSize: '17px', color: '#0f172a', marginBottom: '8px' }}>Real-time Dispatch</h4>
                  <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                    We are engineering a seamless GPS request flow. Track the allocated tow operator live on your phone till they reach you.
                  </p>
                </div>
                
                {/* Mobile Device mockup */}
                <div style={{
                  background: '#f1f5f9',
                  border: '2px solid #cbd5e1',
                  borderRadius: '24px',
                  width: '130px',
                  height: '200px',
                  padding: '16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ width: '40px', height: '4px', background: '#94a3b8', borderRadius: '2px', position: 'absolute', top: '10px' }}></div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#ff5c1a', marginBottom: '4px' }}>HELP</div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>24/7</div>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#fff4ef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff5c1a', margin: '14px auto 0' }}>
                      <Clock size={16} />
                    </div>
                  </div>
                  <div style={{ width: '12px', height: '12px', border: '2px solid #cbd5e1', borderRadius: '50%', position: 'absolute', bottom: '8px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <section style={{ padding: '40px 0', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '20px',
            padding: '24px 32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <div className="row g-4 text-center align-items-center">
              <div className="col-6 col-md-3">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff4ef', display: 'flex', alignItems: 'center', color: '#ff5c1a', justifyContent: 'center' }}>
                    <Truck size={18} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>500+</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Verified Garages</div>
                  </div>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff4ef', display: 'flex', alignItems: 'center', color: '#ff5c1a', justifyContent: 'center' }}>
                    <Users size={18} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>50K+</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Customers</div>
                  </div>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff4ef', display: 'flex', alignItems: 'center', color: '#ff5c1a', justifyContent: 'center' }}>
                    <ThumbsUp size={18} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>98%</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Satisfaction Rate</div>
                  </div>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff4ef', display: 'flex', alignItems: 'center', color: '#ff5c1a', justifyContent: 'center' }}>
                    <Clock size={18} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>24x7</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Support</div>
                  </div>
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
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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

      {/* ══ LAUNCHING SOON FOOTER BANNER ══ */}
      <section style={{ padding: '0 0 60px' }}>
        <div className="container">
          <div style={{ background: 'linear-gradient(135deg, #fffcf9, #fff8f2)', border: '1.5px solid #ffe8dd', borderRadius: '24px', padding: '36px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 2 }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#fff4ef', border: '1px solid #ffe3d5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff5c1a', flexShrink: 0 }}>
                <Truck size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Launching Soon</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Garro Roadside Assistance is currently under development. Stay tuned for updates!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Roadside;
