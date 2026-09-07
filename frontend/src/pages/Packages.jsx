import React, { useState, useEffect } from 'react';
import {
  LuArrowRight,
  LuShieldCheck,
  LuCar,
  LuHeadphones,
  LuWrench,
  LuSettings,
  LuCrown,
  LuCheck,
  LuSlidersHorizontal,
  LuHandshake,
  LuFileText,
  LuTrendingUp,
  LuMapPin,
  LuZap
} from 'react-icons/lu';
import { API_BASE } from '../config/api';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import CustomDropdown from '../components/CustomDropdown';

const DEFAULT_PACKAGES = [
  {
    _id: 'default-1',
    title: 'Essential Care',
    subtitle: 'Routine maintenance, done right.',
    price: 499,
    currency: 'AED',
    icon: 'wrench',
    isPopular: false,
    includesHeader: 'Includes:',
    includes: [
      'Engine oil & filter change',
      'Basic inspection (key components)',
      'Top-up of essential fluids',
      'Tyre & brake visual check',
      'Pickup & delivery (where applicable)'
    ],
    bestForNote: 'Best for everyday vehicle owners who want reliable, hassle-free service.'
  },
  {
    _id: 'default-2',
    title: 'Smart Care',
    subtitle: 'More coverage. More peace of mind.',
    price: 999,
    currency: 'AED',
    icon: 'gear',
    isPopular: true,
    includesHeader: 'Includes everything in Essential, plus:',
    includes: [
      'Full vehicle inspection',
      'Diagnostic scan',
      'A/C system check',
      'Battery check',
      'Brake inspection (detailed)',
      'Suspension check',
      'Pickup & delivery (where applicable)'
    ],
    bestForNote: 'Best for drivers who want more preventative care and fewer surprises.'
  },
  {
    _id: 'default-3',
    title: 'Signature Care',
    subtitle: 'For those who expect more.',
    price: 1499,
    currency: 'AED',
    icon: 'crown',
    isPopular: false,
    includesHeader: 'Includes everything in Smart, plus:',
    includes: [
      'Extended vehicle health check',
      'Priority booking',
      'Dedicated service support',
      'Detailed inspection report',
      'Service coordination for additional work',
      'Pickup & delivery (where applicable)'
    ],
    bestForNote: 'Best for premium/luxury vehicles or owners who value maximum convenience.'
  }
];

const getIcon = (iconName) => {
  switch ((iconName || '').toLowerCase()) {
    case 'gear':
    case 'settings':
      return <LuSettings size={22} />;
    case 'crown':
      return <LuCrown size={22} />;
    case 'zap':
      return <LuZap size={22} />;
    case 'shield':
      return <LuShieldCheck size={22} />;
    default:
      return <LuWrench size={22} />;
  }
};

const makeOptions = [
  'Toyota', 'Nissan', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Hyundai', 'Kia', 'Other'
];

const modelOptions = [
  'Camry', 'Corolla', 'Patrol', 'Altima', 'Civic', 'Accord', '3 Series', 'C-Class', 'X5', 'Other'
];

const yearOptions = Array.from({ length: 25 }, (_, i) => String(2024 - i));

const Packages = () => {
  const { t } = useLanguage();
  const { toast } = useNotification();
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [pkgLoading, setPkgLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/packages`);
        const data = await res.json();
        if (data.success && data.packages && data.packages.length > 0) {
          setPackages(data.packages);
        }
      } catch (err) {
        console.error('Failed to load packages from API, using defaults:', err);
      } finally {
        setPkgLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const [recForm, setRecForm] = useState({
    make: '',
    model: '',
    year: '',
    mileage: ''
  });

  const [recommendedPackage, setRecommendedPackage] = useState(null);

  const handleBookNow = (pkgName) => {
    toast.info(`Booking feature for ${pkgName} is coming soon! Our team will assist you shortly.`);
  };

  const handleCustomPackage = () => {
    toast.info("Custom Service Package request received! A Garro advisor will contact you to build your tailored package.");
  };

  const handleRecommend = (e) => {
    e.preventDefault();
    const mileageNum = parseInt(recForm.mileage, 10) || 0;
    const yearNum = parseInt(recForm.year, 10) || 2020;
    const isLuxury = ['BMW', 'Mercedes-Benz', 'Audi'].includes(recForm.make);

    let result = 'Smart Care';
    if (mileageNum > 100000 || yearNum <= 2015 || isLuxury) {
      result = 'Signature Care';
    } else if (mileageNum <= 40000 && yearNum >= 2021) {
      result = 'Essential Care';
    }

    setRecommendedPackage(result);
    toast.success(`Based on your vehicle details, we recommend: ${result}`);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - var(--nav-h, 80px))', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* ── HERO SECTION ── */}
      <section style={{ width: '95%', maxWidth: '1440px', margin: '0 auto', padding: '24px 0' }}>
        <div style={{
          position: 'relative',
          borderRadius: '28px',
          overflow: 'hidden',
          minHeight: '500px',
          boxShadow: '0 25px 50px -12px rgba(9, 13, 22, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(to right, rgb(9, 19, 36) 0%, rgb(9, 19, 36) 32%, rgba(9, 19, 36, 0.75) 48%, transparent 68%), url(/assets/images/packages-hero-visual.png) right center / 80% auto no-repeat rgb(9, 19, 36)',
          padding: '56px 48px',
          color: '#ffffff'
        }}>
          {/* Watermark Vertical Text on Right Edge */}
          <div className="d-none d-xl-block" style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%) rotate(90deg)',
            transformOrigin: 'right center',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.25em',
            color: 'rgba(255, 255, 255, 0.35)',
            textTransform: 'uppercase',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}>
            BETTER CARS BRIGHTER JOURNEYS.
          </div>

          <div className="row align-items-center position-relative" style={{ zIndex: 2 }}>
            {/* Left Content */}
            <div className="col-lg-6 col-xl-5">
              
              {/* Handwritten Script Tag near top */}
              <div style={{
                fontFamily: "'Caveat', 'Brush Script MT', cursive",
                fontSize: '24px',
                color: '#ff7336',
                transform: 'rotate(-4deg)',
                marginBottom: '8px',
                fontWeight: 700,
                display: 'inline-block'
              }}>
                We keep you moving
              </div>

              {/* Small Category Label */}
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#ff5c1a',
                marginBottom: '16px'
              }}>
                SERVICE PACKAGES
              </div>

              {/* Headline */}
              <h1 style={{
                fontSize: 'clamp(2.4rem, 4.2vw, 3.6rem)',
                fontWeight: 900,
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
                marginBottom: '20px'
              }}>
                <span className="d-block" style={{ color: '#ffffff' }}>Car Care,</span>
                <span style={{ color: '#ffffff' }}>Made Simple.</span>
              </h1>

              {/* Description */}
              <p style={{
                fontSize: '15px',
                color: '#cbd5e1',
                lineHeight: 1.65,
                maxWidth: '460px',
                marginBottom: '32px'
              }}>
                Choose a service package designed around your car and how you drive.
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '36px' }}>
                <a
                  href="#package-cards"
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
                  View Packages <LuArrowRight size={18} />
                </a>

                <a
                  href="#package-recommender"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'transparent',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: 700,
                    padding: '14px 28px',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Find My Package
                </a>
              </div>

              {/* Trust Items Row */}
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
                  <LuShieldCheck size={18} style={{ color: '#ff5c1a' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Quality</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>partner garages</div>
                  </div>
                </div>

                <span style={{ opacity: 0.3 }}>|</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LuCar size={18} style={{ color: '#ff5c1a' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Pickup & delivery</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>where applicable</div>
                  </div>
                </div>

                <span style={{ opacity: 0.3 }}>|</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LuHeadphones size={18} style={{ color: '#ff5c1a' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Managed by Garro</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>from start to finish</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: PACKAGE CARDS ── */}
      <section id="package-cards" style={{ background: '#f8fafc', padding: '72px 0 64px' }}>
        <div style={{ width: '95%', maxWidth: '1440px', margin: '0 auto' }}>
          <div className="row g-4 align-items-stretch">
            
            {packages.map((pkg) => {
              const isPopular = pkg.isPopular;
              return (
                <div key={pkg._id || pkg.title} className="col-lg-4">
                  <div style={{
                    position: 'relative',
                    background: '#ffffff',
                    borderRadius: '24px',
                    padding: isPopular ? '40px 28px 36px' : '36px 28px',
                    border: isPopular ? '2px solid #ff5c1a' : '1px solid #e2e8f0',
                    boxShadow: isPopular ? '0 20px 40px rgba(255, 92, 26, 0.15)' : '0 8px 24px rgba(15, 23, 42, 0.04)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transform: isPopular ? 'translateY(-8px)' : 'none',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}>
                    {/* Most Popular Top Banner */}
                    {isPopular && (
                      <div style={{
                        position: 'absolute',
                        top: '-1px',
                        left: 0,
                        right: 0,
                        background: '#ff5c1a',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 900,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                        padding: '6px 0',
                        borderTopLeftRadius: '22px',
                        borderTopRightRadius: '22px'
                      }}>
                        Most Popular
                      </div>
                    )}

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', marginTop: isPopular ? '8px' : '0' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fff0eb', color: '#ff5c1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getIcon(pkg.icon)}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{pkg.title}</h3>
                          {pkg.subtitle && <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>{pkg.subtitle}</p>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '24px 0 20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>From</span>
                          <span style={{
                            fontSize: '26px',
                            fontWeight: 900,
                            color: isPopular ? '#ff5c1a' : '#0f172a',
                            filter: 'blur(6px)',
                            userSelect: 'none'
                          }}>
                            {pkg.currency || 'AED'} {pkg.price}
                          </span>
                        </div>
                        <button
                          onClick={() => handleBookNow(pkg.title)}
                          style={{
                            background: isPopular ? 'linear-gradient(135deg, #ff5c1a 0%, #ff7336 100%)' : 'transparent',
                            border: isPopular ? 'none' : '1.5px solid #cbd5e1',
                            color: isPopular ? '#ffffff' : '#0f172a',
                            fontSize: '13.5px',
                            fontWeight: 700,
                            padding: isPopular ? '10px 26px' : '10px 24px',
                            borderRadius: '50px',
                            boxShadow: isPopular ? '0 8px 20px rgba(255, 92, 26, 0.3)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {pkg.buttonText || 'Book Now'}
                        </button>
                      </div>

                      {pkg.includes && pkg.includes.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                            {pkg.includesHeader || 'Includes:'}
                          </div>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {pkg.includes.map((item, idx) => (
                              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#334155' }}>
                                <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff0eb', color: '#ff5c1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                  <LuCheck size={11} />
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {pkg.bestForNote && (
                      <div style={{
                        background: isPopular ? '#fff4ef' : '#f8fafc',
                        borderRadius: '14px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: isPopular ? '1px solid #fed7aa' : '1px solid #f1f5f9'
                      }}>
                        <LuCar size={20} style={{ color: isPopular ? '#ff5c1a' : '#64748b', flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: isPopular ? '#334155' : '#64748b', lineHeight: 1.4, fontWeight: isPopular ? 600 : 400 }}>
                          {pkg.bestForNote}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* ── SECTION: CUSTOM SERVICE PACKAGE BANNER ── */}
      <section style={{ width: '95%', maxWidth: '1440px', margin: '0 auto', padding: '0 0 64px' }}>
        <div style={{
          background: '#fff4ef',
          borderRadius: '24px',
          border: '1px solid #ffedd5',
          padding: '32px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: '#ff5c1a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LuSlidersHorizontal size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                Custom Service Package
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>
                Have specific needs? Tell us about your car and we'll build the right service package for you.
              </p>
            </div>
          </div>

          <button
            onClick={handleCustomPackage}
            style={{
              background: '#ffffff',
              border: '1.5px solid #ff5c1a',
              color: '#ff5c1a',
              fontSize: '14px',
              fontWeight: 700,
              padding: '12px 28px',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255, 92, 26, 0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            Get a Custom Package
          </button>
        </div>
      </section>

      {/* ── SECTION: WHAT'S INCLUDED WITH EVERY GARRO PACKAGE ── */}
      <section style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '64px 0' }}>
        <div style={{ width: '95%', maxWidth: '1440px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, color: '#0f172a', marginBottom: '40px', textAlign: 'center' }}>
            What's included with every Garro package
          </h2>

          <div className="row g-4 justify-content-center">
            {[
              { icon: <LuHandshake size={22} />, title: "Garro-managed", subtitle: "service experience" },
              { icon: <LuShieldCheck size={22} />, title: "Selected,", subtitle: "trusted garages" },
              { icon: <LuCar size={22} />, title: "Pickup & delivery", subtitle: "(where applicable)" },
              { icon: <LuFileText size={22} />, title: "Quote approval", subtitle: "before paid work" },
              { icon: <LuTrendingUp size={22} />, title: "Progress updates", subtitle: "at every stage" },
              { icon: <LuHeadphones size={22} />, title: "Support from", subtitle: "Garro" }
            ].map((feat, idx) => (
              <div key={idx} className="col-6 col-md-4 col-lg-2">
                <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#fff0eb',
                    color: '#ff5c1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    {feat.icon}
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                    {feat.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {feat.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION: PACKAGE RECOMMENDER ── */}
      <section id="package-recommender" style={{ width: '95%', maxWidth: '1440px', margin: '0 auto', padding: '64px 0' }}>
        <div style={{
          position: 'relative',
          borderRadius: '28px',
          overflow: 'visible',
          background: '#091324',
          padding: '56px 48px',
          color: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(9, 13, 22, 0.4)'
        }}>
          <div className="row align-items-center g-4 position-relative" style={{ zIndex: 2 }}>
            {/* Left Content */}
            <div className="col-lg-5">
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#ff5c1a',
                marginBottom: '16px'
              }}>
                NOT SURE WHICH PACKAGE YOU NEED?
              </div>

              <h2 style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                fontWeight: 900,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                marginBottom: '16px',
                color: '#ffffff'
              }}>
                Tell us about your car and we'll recommend the right package.
              </h2>

              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                It takes less than a minute.
              </p>

              {recommendedPackage && (
                <div style={{
                  marginTop: '24px',
                  background: 'rgba(255, 92, 26, 0.15)',
                  border: '1px solid #ff5c1a',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <LuZap size={22} style={{ color: '#ff5c1a', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Recommended Package:</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff' }}>{recommendedPackage}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Form 2x2 Grid */}
            <div className="col-lg-7">
              <form onSubmit={handleRecommend}>
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                      Car Make
                    </label>
                    <CustomDropdown
                      options={makeOptions}
                      value={recForm.make}
                      onChange={val => setRecForm({ ...recForm, make: val })}
                      placeholder="Select Make"
                      theme="dark"
                      required
                    />
                  </div>

                  <div className="col-6">
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                      Model
                    </label>
                    <CustomDropdown
                      options={modelOptions}
                      value={recForm.model}
                      onChange={val => setRecForm({ ...recForm, model: val })}
                      placeholder="Select Model"
                      theme="dark"
                      required
                    />
                  </div>

                  <div className="col-6">
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                      Year
                    </label>
                    <CustomDropdown
                      options={yearOptions}
                      value={recForm.year}
                      onChange={val => setRecForm({ ...recForm, year: val })}
                      placeholder="Select Year"
                      theme="dark"
                      allowCustom={true}
                      required
                    />
                  </div>

                  <div className="col-6">
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                      Mileage (km)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 50,000"
                      value={recForm.mileage}
                      onChange={e => setRecForm({ ...recForm, mileage: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        fontSize: '13.5px',
                        color: '#ffffff',
                        background: 'rgba(255, 255, 255, 0.05)',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                  Recommend My Package <LuArrowRight size={18} />
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER BAR ── */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '24px 0' }}>
        <div style={{ width: '95%', maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ff5c1a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LuCar size={16} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>Garro</span>
          </div>

          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            Your Car. Our Care. Always On Your Side.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
            <LuMapPin size={16} style={{ color: '#ff5c1a' }} />
            <span>Available across Dubai & UAE</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Packages;
