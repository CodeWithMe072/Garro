import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets, Settings, Wrench, Paintbrush, Wind,
  Circle, Battery, Sparkles, ArrowRight, Search, SlidersHorizontal
} from 'lucide-react';

const allServices = [
  { name: 'Car Wash & Cleaning', icon: Droplets, color: '#3b82f6', price: 49, category: 'wash', desc: 'Premium exterior and interior cleaning services for a spotless finish.' },
  { name: 'Regular Maintenance', icon: Settings, color: '#ff5c1a', price: 299, category: 'service', desc: 'Oil changes, filters, and full vehicle health checks by certified technicians.' },
  { name: 'Mechanical Repairs', icon: Wrench, color: '#8b5cf6', price: 150, category: 'repair', desc: 'Engine, suspension, brake repairs and comprehensive diagnostics.' },
  { name: 'Painting & Denting', icon: Paintbrush, color: '#ec4899', price: 399, category: 'painting', desc: 'Scratch removal, panel beating, and full body painting services.' },
  { name: 'A/C Service', icon: Wind, color: '#06b6d4', price: 149, category: 'ac', desc: 'Gas top-up, cooling system repairs, and full A/C diagnostics.' },
  { name: 'Tyre Services', icon: Circle, color: '#f59e0b', price: 99, category: 'tyre', desc: 'Wheel alignment, balancing, rotation, and new tyre fitting.' },
  { name: 'Battery Change', icon: Battery, color: '#10b981', price: 250, category: 'battery', desc: 'On-site battery testing, jump-start, and same-day replacement.' },
  { name: 'Car Detailing', icon: Sparkles, color: '#ff5c1a', price: 499, category: 'detailing', desc: 'Ceramic coating, paint protection, and full interior detailing.' },
];

const Services = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = allServices.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ background: '#ffffff', minHeight: 'calc(100vh - var(--nav-h))' }}>

      {/* ── HERO ── */}
      <section style={{
        padding: '72px 0 56px',
        background: 'radial-gradient(circle at 60% 50%, rgba(255,92,26,0.04) 0%, transparent 65%)',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div className="container text-center">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,92,26,0.08)', border: '1px solid rgba(255,92,26,0.18)',
            color: '#ff5c1a', padding: '5px 14px', borderRadius: '50px',
            fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '.08em', marginBottom: '20px'
          }}>
            <SlidersHorizontal size={13} /> What We Offer
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 900, color: '#0f172a',
            letterSpacing: '-.03em', marginBottom: '14px', fontFamily: "'Poppins', sans-serif"
          }}>
            Professional <span style={{ color: '#ff5c1a' }}>Car Services</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '520px', margin: '0 auto 32px', lineHeight: 1.7, fontFamily: "'Poppins', sans-serif" }}>
            From a quick wash to full mechanical overhaul — Garro connects you to certified garages across the UAE.
          </p>

          {/* Search bar */}
          <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
            <Search size={17} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '13px 16px 13px 44px',
                border: '1.5px solid #e2e8f0', borderRadius: '14px',
                fontSize: '14px', fontFamily: "'Poppins', sans-serif",
                color: '#0f172a', outline: 'none', background: '#fff',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
              }}
            />
          </div>
        </div>
      </section>

      {/* ── SERVICE CARDS ── */}
      <section style={{ padding: '64px 0 80px' }}>
        <div className="container">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>
              <Search size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <p style={{ fontSize: '15px' }}>No services found matching "<strong>{searchQuery}</strong>"</p>
              <button onClick={() => setSearchQuery('')} style={{ marginTop: '12px', background: '#ff5c1a', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
                Clear Search
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {filtered.map(({ name, icon: Icon, color, price, category, desc }) => (
                <div key={category} className="col-md-6 col-lg-3">
                  <div
                    style={{
                      background: '#fff', border: '1.5px solid #e2e8f0',
                      borderRadius: '20px', padding: '28px', height: '100%',
                      display: 'flex', flexDirection: 'column',
                      transition: 'all 0.25s', cursor: 'default'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = color;
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = `0 14px 36px ${color}20`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Icon box */}
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '14px',
                      background: `${color}15`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color, marginBottom: '18px', flexShrink: 0
                    }}>
                      <Icon size={26} />
                    </div>

                    <h5 style={{
                      fontWeight: 800, fontSize: '15.5px', color: '#0f172a',
                      fontFamily: "'Poppins', sans-serif", marginBottom: '8px'
                    }}>
                      {name}
                    </h5>
                    <p style={{
                      fontSize: '13px', color: '#64748b', lineHeight: 1.65,
                      fontFamily: "'Poppins', sans-serif", flex: 1, marginBottom: '18px'
                    }}>
                      {desc}
                    </p>

                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: "'Poppins', sans-serif" }}>Starting from</span>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: '#ff5c1a', fontFamily: "'Poppins', sans-serif", letterSpacing: '-.02em' }}>
                        AED {price}
                      </div>
                    </div>

                    <Link
                      to={`/service/${category}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        color, fontWeight: 700, fontSize: '13.5px',
                        textDecoration: 'none', fontFamily: "'Poppins', sans-serif",
                        transition: 'gap 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.gap = '10px'}
                      onMouseLeave={e => e.currentTarget.style.gap = '6px'}
                    >
                      View Details <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <div style={{
            marginTop: '64px',
            background: 'linear-gradient(135deg,#fffcf9,#fff8f2)',
            border: '1.5px solid #ffe8dd', borderRadius: '24px',
            padding: '40px', textAlign: 'center'
          }}>
            <h3 style={{ fontWeight: 900, fontSize: '22px', color: '#0f172a', fontFamily: "'Poppins', sans-serif", marginBottom: '10px' }}>
              Can't find what you're looking for?
            </h3>
            <p style={{ color: '#64748b', fontSize: '14.5px', fontFamily: "'Poppins', sans-serif", marginBottom: '24px' }}>
              Get a custom quote and let our certified garages handle any service you need.
            </p>
            <Link
              to="/get-quote"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)',
                color: '#fff', textDecoration: 'none', borderRadius: '12px',
                padding: '13px 32px', fontWeight: 700, fontSize: '14.5px',
                fontFamily: "'Poppins', sans-serif",
                boxShadow: '0 6px 20px rgba(255,92,26,0.3)'
              }}
            >
              Get a Custom Quote <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
