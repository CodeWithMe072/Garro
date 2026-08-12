import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuRecycle, LuFileText, LuTag, LuWrench, LuLeaf, LuUserCheck,
  LuCircleCheck, LuChevronDown, LuChevronUp, LuPhone,
  LuTruck, LuClock, LuUsers, LuThumbsUp, LuBadgeCheck,
  LuStar, LuShield, LuBanknote, LuMapPin, LuClipboardList,
  LuCalendarCheck, LuPackageCheck
} from 'react-icons/lu';
import EOLRequestModal from '../components/EOLRequestModal.jsx';

const EndOfLife = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('Certified Car Scrapping');
  const [activeFaq, setActiveFaq] = useState(null);

  const handleOpenModal = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };


  const services = [
    {
      icon: LuTag,
      title: 'Instant Vehicle Valuation',
      desc: 'Get an instant valuation for your vehicle based on condition, model and market value.',
      btnLabel: 'Get Valuation',
      service: 'Trade-In Valuation',
      color: '#ff5c1a',
    },
  ];

  const steps = [
    {
      num: 1,
      icon: LuClipboardList,
      title: 'Request Valuation',
      desc: 'Share your vehicle details and get an instant quote and best estimate.',
    },
    {
      num: 2,
      icon: LuBadgeCheck,
      title: 'Receive Offer',
      desc: 'We inspect the vehicle and give you the best offer.',
    },
    {
      num: 3,
      icon: LuCalendarCheck,
      title: 'Schedule Pickup',
      desc: 'Choose a convenient time. We\'ll tow your vehicle for free.',
    },
    {
      num: 4,
      icon: LuPackageCheck,
      title: 'Get Paid & Certificate',
      desc: 'Get instant payment and receive your End-of-Life Certificate.',
    },
  ];

  const whyChoose = [
    { icon: LuBanknote, title: 'Best Market Price', desc: 'We ensure you get the highest possible value.' },
    { icon: LuTruck, title: 'Free Pickup Across UAE', desc: 'We come to you, anywhere in UAE.' },
    { icon: LuShield, title: 'No Hidden Charges', desc: 'Transparent process with zero hidden fees.' },
    { icon: LuStar, title: 'Secure & Instant Payment', desc: 'Get paid instantly through secure methods.' },
    { icon: LuCircleCheck, title: 'Government Compliant', desc: 'All processes are RTA-approved and legal.' },
  ];

  const faqs = [
    { q: 'What types of vehicles do you accept?', a: 'We accept all types of vehicles including sedans, SUVs, vans, trucks, and motorcycles — regardless of condition, age, or make. Whether it\'s running or not, we\'ll take it.' },
    { q: 'How is the scrap value determined?', a: 'Scrap value is based on vehicle weight, make, model, year, current metal market rates, and condition of salvageable parts. We provide a transparent, real-time quote.' },
    { q: 'Do you provide free pickup service?', a: 'Yes! We offer completely free vehicle pickup across all seven emirates in the UAE. Even non-driveable vehicles are collected at zero cost to you.' },
    { q: 'What documents are required?', a: 'You\'ll need your Emirates ID, vehicle registration card (Mulkiya), and a signed transfer authorization form. Our team will guide you through the paperwork.' },
    { q: 'How long does the process take?', a: 'The entire end-of-life process — from request to certificate — typically takes 24 to 48 hours. Pickup is usually arranged same-day or next-day.' },
    { q: 'Is deregistration included in the service?', a: 'Yes. We handle the complete RTA deregistration process including plate return and all associated paperwork at no additional charge.' },
  ];

  return (
    <>
      <EOLRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialServiceType={selectedService}
      />

      {/* ══ HERO SECTION ══ */}
      <section style={{
        background: '#ffffff',
        padding: '70px 0 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle BG gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 70% 50%, rgba(255,92,26,0.04) 0%, transparent 65%)',
          pointerEvents: 'none'
        }} />

        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center g-5">
            {/* Left — text */}
            <div className="col-lg-6">
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,92,26,0.08)', border: '1px solid rgba(255,92,26,0.18)',
                color: '#ff5c1a', padding: '5px 14px', borderRadius: '50px',
                fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '.08em', marginBottom: '24px'
              }}>
                <LuRecycle size={13} /> End-of-Life &amp; Scrap
              </div>

              <h1 style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', fontWeight: 900,
                lineHeight: 1.1, letterSpacing: '-.03em', color: '#0f172a', marginBottom: '16px'
              }}>
                Retire Your Vehicle<br />
                <span style={{ color: '#ff5c1a' }}>The Right Way.</span>
              </h1>

              <p style={{
                fontSize: '15px', color: '#64748b', lineHeight: 1.75,
                maxWidth: '520px', marginBottom: '32px'
              }}>
                Garro End-of-Life &amp; Scrap service helps you sell your old, damaged or non-running vehicle quickly, safely and at the best price. We handle everything from valuation to deregistration with eco-friendly disposal.
              </p>

              {/* Trust badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '36px' }}>
                {[
                  { icon: LuBadgeCheck, label: 'Best Market Price' },
                  { icon: LuShield, label: '100% Safe & Legal' },
                  { icon: LuRecycle, label: 'Hassle-free Process' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                    <Icon size={15} color="#ff5c1a" /> {label}
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  onClick={() => handleOpenModal('Trade-In Valuation')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)',
                    color: '#fff', border: 'none', borderRadius: '12px',
                    padding: '13px 28px', fontWeight: 700, fontSize: '14.5px',
                    cursor: 'pointer', boxShadow: '0 6px 20px rgba(255,92,26,0.3)',
                    transition: 'all 0.2s', fontFamily: "'Poppins', sans-serif"
                  }}
                >
                  <LuTag size={18} /> Get Valuation
                </button>
              </div>
            </div>

            {/* Right — tow truck image */}
            <div className="col-lg-6 position-relative">
              <div style={{ position: 'relative', width: '100%', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Glow */}
                <div style={{
                  position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,92,26,0.10) 0%, transparent 70%)',
                  zIndex: 1
                }} />
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000&auto=format&fit=crop"
                  alt="Tow truck for vehicle scrap pickup"
                  style={{
                    width: '100%', maxHeight: '380px', objectFit: 'contain',
                    zIndex: 2, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.12))'
                  }}
                />


              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══ SERVICES SECTION ══ */}
      <section style={{ padding: '72px 0', background: '#ffffff' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
              Our End-of-Life Services
            </h2>
            <div style={{ width: '44px', height: '3px', background: '#ff5c1a', margin: '0 auto 12px', borderRadius: '2px' }} />
            <p style={{ color: '#64748b', fontSize: '14.5px' }}>Everything handled — from pickup to final certificate</p>
          </div>

          <div className="row g-4 justify-content-center">
            {services.map(({ icon: Icon, title, desc, btnLabel, service, color }) => (
              <div className="col-12" key={title}>
                <div style={{
                  background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '20px',
                  padding: '28px', height: '100%', transition: 'all 0.25s',
                  cursor: 'default', display: 'flex', flexDirection: 'column'
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 12px 32px ${color}18`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  {/* Icon */}
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '14px',
                    background: `${color}15`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: color, marginBottom: '18px'
                  }}>
                    <Icon size={26} />
                  </div>
                  <h5 style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', marginBottom: '10px' }}>{title}</h5>
                  <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.7, marginBottom: '20px', flex: 1 }}>{desc}</p>
                  <button
                    onClick={() => handleOpenModal(service)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: color, color: '#fff', border: 'none',
                      borderRadius: '10px', padding: '10px 20px',
                      fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                      width: 'max-content', transition: 'all 0.2s',
                      fontFamily: "'Poppins', sans-serif",
                      boxShadow: `0 4px 14px ${color}30`
                    }}
                  >
                    {btnLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS + WHY CHOOSE GARRO ══ */}
      <section style={{ padding: '72px 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div className="row g-5">

            {/* How It Works */}
            <div className="col-lg-6">
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>How It Works</h2>
              <div style={{ width: '36px', height: '3px', background: '#ff5c1a', borderRadius: '2px', marginBottom: '32px' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {steps.map(({ num, icon: Icon, title, desc }, idx) => (
                  <div key={num} style={{
                    display: 'flex', gap: '18px', paddingBottom: idx < steps.length - 1 ? '24px' : '0',
                    marginBottom: idx < steps.length - 1 ? '0' : '0',
                    position: 'relative'
                  }}>
                    {/* Step number + connector line */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)',
                        color: '#fff', fontWeight: 900, fontSize: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(255,92,26,0.3)', flexShrink: 0
                      }}>
                        {num}
                      </div>
                      {idx < steps.length - 1 && (
                        <div style={{ width: '2px', flex: 1, background: '#ffe8dd', marginTop: '8px', minHeight: '24px' }} />
                      )}
                    </div>
                    <div style={{ paddingTop: '10px', paddingBottom: idx < steps.length - 1 ? '16px' : '0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Icon size={16} color="#ff5c1a" />
                        <span style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>{title}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.65, margin: 0 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certified Scrap Yard Image */}
            <div className="col-lg-6 d-flex align-items-center">
              <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1.5px solid #e2e8f0', width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                <img
                  src="https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?q=80&w=900&auto=format&fit=crop"
                  alt="Garro certified scrap yard"
                  style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>


    </>
  );
};

export default EndOfLife;
