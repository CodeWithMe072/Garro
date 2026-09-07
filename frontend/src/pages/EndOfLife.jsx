import React, { useState } from 'react';
import {
  LuRecycle,
  LuArrowRight,
  LuShieldCheck,
  LuClock,
  LuUsers,
  LuCar,
  LuTruck,
  LuBanknote,
  LuMapPin,
  LuFileText,
  LuSearch,
  LuScale,
  LuCreditCard,
  LuFileCheck
} from 'react-icons/lu';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import CustomDropdown from '../components/CustomDropdown';

const makeOptions = [
  'Toyota', 'Nissan', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Hyundai', 'Kia', 'Other'
];

const modelOptions = [
  'Camry', 'Corolla', 'Patrol', 'Altima', 'Civic', 'Accord', '3 Series', 'C-Class', 'Other'
];

const yearOptions = Array.from({ length: 25 }, (_, i) => String(2024 - i));

const conditionOptions = [
  'Scrap / Non-Runner', 'Accident Damaged', 'Engine Fault', 'High Mileage', 'Used / Running'
];

const EndOfLife = () => {
  const { t } = useLanguage();
  const { toast } = useNotification();
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    condition: '',
    phone: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Thank you! Your scrap car quote request has been submitted. Our team will contact you shortly.");
  };

  const steps = [
    {
      num: "01",
      title: "Submit Details",
      desc: "Tell us about your car (make, model, year, and condition).",
      icon: <LuFileText size={22} />
    },
    {
      num: "02",
      title: "Get Assessment",
      desc: "Receive a fair offer based on our evaluation.",
      icon: <LuSearch size={22} />
    },
    {
      num: "03",
      title: "Schedule Pickup",
      desc: "Choose a convenient date and time.",
      icon: <LuTruck size={22} />
    },
    {
      num: "04",
      title: "Get Paid",
      desc: "We pick up your car and you get paid.",
      icon: <LuBanknote size={22} />
    }
  ];

  const features = [
    {
      title: "Fair Valuation",
      desc: "Transparent and competitive offers based on your car's actual condition.",
      icon: <LuScale size={24} />
    },
    {
      title: "Free Pickup",
      desc: "We collect your car from anywhere in the UAE, at no extra cost.",
      icon: <LuTruck size={24} />
    },
    {
      title: "Fast Payment",
      desc: "Get paid quickly and securely after pickup and verification.",
      icon: <LuCreditCard size={24} />
    },
    {
      title: "Hassle-Free Process",
      desc: "Simple, online and handled by our team from start to finish.",
      icon: <LuFileCheck size={24} />
    }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - var(--nav-h, 80px))', fontFamily: "'Poppins', sans-serif" }}>
      {/* ── HERO SECTION (Single Full-Bleed Card with Background Image) ── */}
      <section style={{ width: '95%', maxWidth: '1440px', margin: '0 auto', padding: '24px 0' }}>
        <div style={{
          position: 'relative',
          borderRadius: '28px',
          overflow: 'hidden',
          minHeight: '480px',
          boxShadow: '0 25px 50px -12px rgba(9, 13, 22, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(to right, #070c17 0%, #070c17 28%, rgba(7, 12, 23, 0.75) 42%, transparent 58%), url("/assets/images/scrap-hero-visual.png") no-repeat center right / cover',
          padding: '56px 48px',
          color: '#ffffff'
        }}>
          <div className="row align-items-center position-relative" style={{ zIndex: 2 }}>
            {/* Left Content Column */}
            <div className="col-lg-5 col-xl-5">
              {/* Category Subtitle */}
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#94a3b8',
                marginBottom: '20px'
              }}>
                TURN YOUR OLD CAR INTO REAL VALUE
              </div>

              {/* Two-Line Headline */}
              <h1 style={{
                fontSize: 'clamp(2.4rem, 4.2vw, 3.6rem)',
                fontWeight: 900,
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
                marginBottom: '20px'
              }}>
                <span className="d-block" style={{ color: '#ffffff' }}>Scrap Your Car.</span>
                <span style={{ color: '#ff5c1a' }}>Get Paid</span> <span style={{ color: '#ffffff' }}>with Ease.</span>
              </h1>

              {/* Description */}
              <p style={{
                fontSize: '15px',
                color: '#94a3b8',
                lineHeight: 1.65,
                maxWidth: '460px',
                marginBottom: '32px'
              }}>
                Submit your car details, receive an assessment, schedule a pickup, and get paid — across the UAE.
              </p>

              {/* Primary CTA Button */}
              <div style={{ marginBottom: '36px' }}>
                <a
                  href="#scrap-quote-form"
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
                    textDecoration: 'none',
                    boxShadow: '0 10px 25px rgba(255, 92, 26, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Request My Offer <LuArrowRight size={18} />
                </a>
              </div>

              {/* Trust Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                flexWrap: 'wrap',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: '12px',
                color: '#cbd5e1'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LuShieldCheck size={16} style={{ color: '#94a3b8' }} />
                  <span style={{ fontWeight: 600 }}>Trusted & Secure</span>
                </div>
                <span style={{ opacity: 0.3 }}>|</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LuClock size={16} style={{ color: '#94a3b8' }} />
                  <span style={{ fontWeight: 600 }}>All Across the UAE</span>
                </div>
                <span style={{ opacity: 0.3 }}>|</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LuUsers size={16} style={{ color: '#94a3b8' }} />
                  <span style={{ fontWeight: 600 }}>Thousands of Cars Handled</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── OVERLAY FLOATING SEQUENCE CARDS (Directly over the Hero Background) ── */}

          {/* 1. Tag on Old Car Roof */}
          <div className="d-none d-lg-flex" style={{
            position: 'absolute',
            top: '38%',
            left: '49%',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            padding: '5px 14px',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 700,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            alignItems: 'center',
            gap: '4px',
            zIndex: 4
          }}>
            Your Old Car
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </div>

          {/* 2. Estimated Offer Card */}
          <div className="d-none d-lg-flex" style={{
            position: 'absolute',
            top: '12%',
            left: '58%',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '12px 18px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid #e2e8f0',
            zIndex: 5
          }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LuCar size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Estimated Offer</div>
              <div style={{ fontSize: '17px', fontWeight: 900, color: '#ff5c1a', lineHeight: 1.1 }}>AED 4,800</div>
            </div>
          </div>

          {/* Orange Right Arrow -> connecting Estimated Offer to Schedule Pickup */}
          <div className="d-none d-lg-block" style={{
            position: 'absolute',
            top: '17%',
            left: '73.5%',
            color: '#ff5c1a',
            fontWeight: 800,
            fontSize: '20px',
            zIndex: 5
          }}>
            <LuArrowRight />
          </div>

          {/* 3. Schedule Pickup Card */}
          <div className="d-none d-lg-flex" style={{
            position: 'absolute',
            top: '12%',
            right: '4%',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '12px 18px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid #e2e8f0',
            zIndex: 5
          }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LuTruck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Schedule Pickup</div>
              <div style={{ width: '40px', height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '4px' }}></div>
            </div>
          </div>

          {/* Curved Arrow pointing down from Schedule Pickup to Tow Truck */}
          <div className="d-none d-lg-block" style={{
            position: 'absolute',
            top: '26%',
            right: '9%',
            color: '#cbd5e1',
            zIndex: 4
          }}>
            <svg width="24" height="30" viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2 Q 20 15 10 26 M 6 20 L 10 26 L 16 22" />
            </svg>
          </div>

          {/* 4. Get Paid Card */}
          <div className="d-none d-lg-flex" style={{
            position: 'absolute',
            bottom: '22%',
            left: '73%',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '12px 18px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid #e2e8f0',
            zIndex: 5
          }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LuBanknote size={20} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Get Paid</div>
              <div style={{ width: '30px', height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '4px' }}></div>
            </div>
          </div>

          {/* Orange Left-Right Arrow connecting car to Get Paid */}
          <div className="d-none d-lg-block" style={{
            position: 'absolute',
            bottom: '27%',
            left: '68.5%',
            color: '#ff5c1a',
            fontWeight: 800,
            fontSize: '18px',
            zIndex: 5
          }}>
            <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 8h16M7 4L3 8l4 4M17 4l4 4-4 4"/>
            </svg>
          </div>

          {/* 5. Location Pill Badge */}
          <div className="d-none d-lg-flex" style={{
            position: 'absolute',
            bottom: '8%',
            right: '3%',
            background: '#ffffff',
            borderRadius: '50px',
            padding: '8px 18px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 800,
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            zIndex: 5
          }}>
            <LuMapPin size={16} style={{ color: '#ff5c1a' }} /> Across the UAE
          </div>
        </div>
      </section>

      {/* ── SECTION: A SIMPLE 4-STEP PROCESS (White Background) ── */}
      <section style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '84px 0' }}>
        <div style={{ width: '95%', maxWidth: '1440px', margin: '0 auto' }}>
          <div className="row align-items-center g-4">
            {/* Left Header */}
            <div className="col-lg-3">
              <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, marginBottom: '12px' }}>
                A Simple<br />4-Step Process
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                From your old car to cash, in just a few steps.
              </p>
            </div>

            {/* 4 Steps Row with Arrows */}
            <div className="col-lg-9">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {steps.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <div style={{
                      flex: '1 1 180px',
                      minWidth: '180px',
                      minHeight: '230px',
                      background: '#ffffff',
                      borderRadius: '20px',
                      padding: '32px 24px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.03)'; }}
                    >
                      {/* Top Row: Light Square Icon + Orange Step Number */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: '#f1f5f9',
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {step.icon}
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 900, color: '#ff5c1a' }}>
                          {step.num}
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                          {step.title}
                        </h4>

                        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>

                    {/* Arrow Connector */}
                    {idx < steps.length - 1 && (
                      <div className="d-none d-xl-block" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center' }}>
                        <LuArrowRight size={18} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: QUOTE FORM + WHY CHOOSE GARRO ── */}
      <section id="scrap-quote-form" style={{ width: '95%', maxWidth: '1440px', margin: '0 auto', padding: '56px 0 64px' }}>
        <div className="row g-4 align-items-start">
          {/* Left Column — Quote Form Card */}
          <div className="col-lg-4">
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '36px 28px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)'
            }}>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                Get Your Scrap Car Quote
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '24px' }}>
                It only takes a minute.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                      Make
                    </label>
                    <CustomDropdown
                      options={makeOptions}
                      value={formData.make}
                      onChange={val => setFormData({ ...formData, make: val })}
                      placeholder="Select Make"
                      required
                    />
                  </div>

                  <div className="col-6">
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                      Model
                    </label>
                    <CustomDropdown
                      options={modelOptions}
                      value={formData.model}
                      onChange={val => setFormData({ ...formData, model: val })}
                      placeholder="Select Model"
                      required
                    />
                  </div>

                  <div className="col-6">
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                      Year
                    </label>
                    <CustomDropdown
                      options={yearOptions}
                      value={formData.year}
                      onChange={val => setFormData({ ...formData, year: val })}
                      placeholder="Select Year"
                      allowCustom={true}
                      required
                    />
                  </div>

                  <div className="col-6">
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                      Condition
                    </label>
                    <CustomDropdown
                      options={conditionOptions}
                      value={formData.condition}
                      onChange={val => setFormData({ ...formData, condition: val })}
                      placeholder="Select Condition"
                      required
                    />
                  </div>
                </div>

                {/* Phone Contact Field */}
                <div className="mb-3">
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+971 50 000 0000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #ff5c1a 0%, #ff7336 100%)',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 700,
                    padding: '14px',
                    borderRadius: '50px',
                    border: 'none',
                    boxShadow: '0 8px 20px rgba(255, 92, 26, 0.35)',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  Request My Offer <LuArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column — Why Choose Garro */}
          <div className="col-lg-8">
            <div style={{ paddingLeft: '12px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#ff5c1a',
                marginBottom: '6px'
              }}>
                WHY CHOOSE GARRO
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, color: '#0f172a', marginBottom: '28px', lineHeight: 1.2 }}>
                A Smarter, Easier Way to Scrap Your Car
              </h2>

              {/* 4 Feature Cards Grid */}
              <div className="row g-3">
                {features.map((item, idx) => (
                  <div key={idx} className="col-md-6">
                    <div style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      padding: '24px 22px',
                      border: '1px solid #e2e8f0',
                      height: '100%',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.03)'; }}
                    >
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: '#fff0eb',
                        color: '#ff5c1a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px'
                      }}>
                        {item.icon}
                      </div>

                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                        {item.title}
                      </h4>

                      <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EndOfLife;
