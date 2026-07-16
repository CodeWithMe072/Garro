import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
<<<<<<< HEAD
  LuDroplets, LuSettings, LuWrench, LuPaintbrush, LuWind,
  LuCircle, LuBattery, LuSparkles, LuArrowRight, LuSearch, LuSlidersHorizontal
} from 'react-icons/lu';

const allServices = [
  { name: 'Car Wash & Cleaning', icon: LuDroplets, color: '#3b82f6', price: 49, category: 'wash', desc: 'Premium exterior and interior cleaning services for a spotless finish.' },
  { name: 'Regular Maintenance', icon: LuSettings, color: '#ff5c1a', price: 299, category: 'service', desc: 'Oil changes, filters, and full vehicle health checks by certified technicians.' },
  { name: 'Mechanical Repairs', icon: LuWrench, color: '#8b5cf6', price: 150, category: 'repair', desc: 'Engine, suspension, brake repairs and comprehensive diagnostics.' },
  { name: 'Painting & Denting', icon: LuPaintbrush, color: '#ec4899', price: 399, category: 'painting', desc: 'Scratch removal, panel beating, and full body painting services.' },
  { name: 'A/C Service', icon: LuWind, color: '#06b6d4', price: 149, category: 'ac', desc: 'Gas top-up, cooling system repairs, and full A/C diagnostics.' },
  { name: 'Tyre Services', icon: LuCircle, color: '#f59e0b', price: 99, category: 'tyre', desc: 'Wheel alignment, balancing, rotation, and new tyre fitting.' },
  { name: 'Battery Change', icon: LuBattery, color: '#10b981', price: 250, category: 'battery', desc: 'On-site battery testing, jump-start, and same-day replacement.' },
  { name: 'Car Detailing', icon: LuSparkles, color: '#ff5c1a', price: 499, category: 'detailing', desc: 'Ceramic coating, paint protection, and full interior detailing.' },
];
=======
  Droplets, Settings, Wrench, Paintbrush, Wind,
  Circle, Battery, Sparkles, ArrowRight, Search, SlidersHorizontal
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
>>>>>>> f8e32b9393b7ad02ab508e5def03cb46614f49e1

const Services = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  const allServices = [
    { name: t('services_cat_wash'), icon: Droplets, color: '#3b82f6', price: 49, category: 'wash', desc: t('services_cat_wash_desc') },
    { name: t('services_cat_maintenance'), icon: Settings, color: '#ff5c1a', price: 299, category: 'service', desc: t('services_cat_maintenance_desc') },
    { name: t('services_cat_repair'), icon: Wrench, color: '#8b5cf6', price: 150, category: 'repair', desc: t('services_cat_repair_desc') },
    { name: t('services_cat_painting'), icon: Paintbrush, color: '#ec4899', price: 399, category: 'painting', desc: t('services_cat_painting_desc') },
    { name: t('services_cat_ac'), icon: Wind, color: '#06b6d4', price: 149, category: 'ac', desc: t('services_cat_ac_desc') },
    { name: t('services_cat_tyre'), icon: Circle, color: '#f59e0b', price: 99, category: 'tyre', desc: t('services_cat_tyre_desc') },
    { name: t('services_cat_battery'), icon: Battery, color: '#10b981', price: 250, category: 'battery', desc: t('services_cat_battery_desc') },
    { name: t('services_cat_detailing'), icon: Sparkles, color: '#ff5c1a', price: 499, category: 'detailing', desc: t('services_cat_detailing_desc') },
  ];

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
<<<<<<< HEAD
            <LuSlidersHorizontal size={13} /> What We Offer
=======
            <SlidersHorizontal size={13} /> <span dir="auto">{t('services_what_we_offer')}</span>
>>>>>>> f8e32b9393b7ad02ab508e5def03cb46614f49e1
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 900, color: '#0f172a',
            letterSpacing: '-.03em', marginBottom: '14px', fontFamily: "'Poppins', sans-serif"
          }}>
            <span dir="auto">{t('services_hero_title1')}</span> <span style={{ color: '#ff5c1a' }} dir="auto">{t('services_hero_title2')}</span>
          </h1>
          <p dir="auto" style={{ color: '#64748b', fontSize: '15px', maxWidth: '520px', margin: '0 auto 32px', lineHeight: 1.7, fontFamily: "'Poppins', sans-serif" }}>
            {t('services_hero_desc')}
          </p>

          {/* Search bar */}
          <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
            <LuSearch size={17} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={t('services_search_placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              dir="auto"
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
<<<<<<< HEAD
              <LuSearch size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <p style={{ fontSize: '15px' }}>No services found matching "<strong>{searchQuery}</strong>"</p>
=======
              <Search size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <p dir="auto" style={{ fontSize: '15px' }}>{t('services_no_match')} "<strong>{searchQuery}</strong>"</p>
>>>>>>> f8e32b9393b7ad02ab508e5def03cb46614f49e1
              <button onClick={() => setSearchQuery('')} style={{ marginTop: '12px', background: '#ff5c1a', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
                <span dir="auto">{t('services_clear_search')}</span>
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

                    <h5 dir="auto" style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', marginBottom: '8px', fontFamily: "'Poppins', sans-serif" }}>
                      {name}
                    </h5>
                    <p dir="auto" style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px', flexGrow: 1, fontFamily: "'Poppins', sans-serif" }}>
                      {desc}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <div dir="ltr" style={{ fontSize: '15px', color: '#ff5c1a', fontWeight: 800, fontFamily: "'Poppins', sans-serif" }}>
                        <span dir="auto" style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginRight: '4px' }}>{t('service_from_aed')}</span>
                        {price}
                      </div>
                      <Link to={`/service/${category}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
<<<<<<< HEAD
                        color, fontWeight: 700, fontSize: '13.5px',
                        textDecoration: 'none', fontFamily: "'Poppins', sans-serif",
                        transition: 'gap 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.gap = '10px'}
                      onMouseLeave={e => e.currentTarget.style.gap = '6px'}
                    >
                      View Details <LuArrowRight size={15} />
                    </Link>
=======
                        color: '#ff5c1a', fontWeight: 700, fontSize: '13.5px',
                        textDecoration: 'none', fontFamily: "'Poppins', sans-serif"
                      }}>
                        <span dir="auto">{t('service_book_now')}</span> <ArrowRight size={16} />
                      </Link>
                    </div>
>>>>>>> f8e32b9393b7ad02ab508e5def03cb46614f49e1
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
              Get a Custom Quote <LuArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
