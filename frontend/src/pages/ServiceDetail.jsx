import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const servicesData = {
  wash: {
    name: 'Car Wash',
    category: 'Aesthetics',
    icon: 'local_car_wash',
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,.15)',
    tagline: 'Premium exterior and interior cleaning.',
    description: 'A thorough cleaning process that leaves your car looking brand new. Includes exterior wash, interior vacuuming, and dashboard polishing.',
    duration: '1-2 Hours',
    price_from: 'AED 49',
    warranty: 'N/A',
    benefits: ['Eco-friendly products used', 'Deep interior vacuuming', 'Tire shining included'],
    includes: ['Exterior hand wash', 'Interior vacuuming', 'Window cleaning inside/out', 'Dashboard wipe down'],
    faqs: [
      ['Do you use waterless products?', 'We offer both traditional and eco-friendly waterless options depending on the service level chosen.'],
      ['Is polishing included?', 'Basic polishing is included in our premium wash packages, but full detailing is a separate service.']
    ]
  },
  repair: {
    name: 'Car Repair',
    category: 'Mechanical',
    icon: 'build',
    color: '#ff5c1a',
    bg: 'rgba(255,92,26,.15)',
    tagline: 'Expert diagnostics and mechanical repairs.',
    description: 'Comprehensive repair services by certified technicians for all makes and models. From engine issues to suspension repairs, we handle it all with OEM parts.',
    duration: 'Varies',
    price_from: 'AED 150',
    warranty: '6 Months',
    benefits: ['Certified Mechanics', 'OEM or Equivalent Parts', 'Transparent Pricing'],
    includes: ['Initial diagnostics report', 'Digital photo updates', 'Road test after repair', 'Service history update'],
    faqs: [
      ['Do you use genuine parts?', 'Yes, we default to using genuine OEM parts. We also offer high-quality aftermarket options if requested to suit your budget.'],
      ['Is there a warranty on repairs?', 'We provide a 6-month or 10,000km warranty on all mechanical repairs and parts provided by our garages.']
    ]
  }
};

const defaultService = {
  name: 'Car Service',
  category: 'Maintenance',
  icon: 'settings',
  color: '#10b981',
  bg: 'rgba(16,185,129,.15)',
  tagline: 'Keep your vehicle running smoothly.',
  description: 'Regular maintenance and servicing to ensure optimal performance and longevity of your vehicle.',
  duration: '3-4 Hours',
  price_from: 'AED 299',
  warranty: '3 Months',
  benefits: ['Comprehensive Checkup', 'Oil & Filter Change', 'Fluid Top-ups'],
  includes: ['Oil and filter replacement', '360-degree health check', 'Brake inspection', 'Battery health check'],
  faqs: [
    ['How often should I service my car?', 'Generally, it is recommended every 10,000 km or 6 months, whichever comes first.'],
    ['Is pickup included?', 'Yes, free pickup and drop-off is included in all our major service packages.']
  ]
};

const ServiceDetail = () => {
  const { slug } = useParams();
  const [service, setService] = useState(defaultService);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug && servicesData[slug]) {
      setService(servicesData[slug]);
    }
  }, [slug]);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      {/* ── HERO ── */}
      <section className="sd-page-hero" style={{ '--svc-color': service.color, '--svc-bg': service.bg }}>
        <div className="container position-relative" style={{ zIndex: 2 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <Link to="/home" style={{ color: 'rgba(255,255,255,.45)', fontSize: '13px', textDecoration: 'none', fontFamily: "'Poppins', sans-serif", transition: 'color .15s' }}>Home</Link>
            <span className="material-icons-round" style={{ fontSize: '15px', color: 'rgba(255,255,255,.25)' }}>chevron_right</span>
            <Link to="/home#services" style={{ color: 'rgba(255,255,255,.45)', fontSize: '13px', textDecoration: 'none', fontFamily: "'Poppins', sans-serif", transition: 'color .15s' }}>Car Services</Link>
            <span className="material-icons-round" style={{ fontSize: '15px', color: 'rgba(255,255,255,.25)' }}>chevron_right</span>
            <span style={{ color: 'rgba(255,255,255,.7)', fontSize: '13px', fontFamily: "'Poppins', sans-serif" }}>{service.name}</span>
          </div>

          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <div className="sd-hero-badge">
                <span className="material-icons-round">{service.icon}</span>
                {service.category}
              </div>
              <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: '#fff', fontSize: 'clamp(2rem,4.5vw,3.2rem)', letterSpacing: '-.03em', lineHeight: 1.12, marginBottom: '12px' }}>
                {service.name}
              </h1>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,.55)', fontFamily: "'Poppins', sans-serif", fontWeight: 500, marginBottom: '24px' }}>
                {service.tagline}
              </p>
              <p style={{ fontSize: '14.5px', color: 'rgba(255,255,255,.5)', fontFamily: "'Poppins', sans-serif", lineHeight: 1.75, maxWidth: '650px' }}>
                {service.description}
              </p>

              {/* Meta info */}
              <div className="sd-hero-meta">
                <div className="sd-meta-item">
                  <span className="material-icons-round" style={{ color: service.color }}>schedule</span>
                  <div><div className="sd-meta-label">Duration</div><div className="sd-meta-value">{service.duration}</div></div>
                </div>
                <div className="sd-meta-item">
                  <span className="material-icons-round" style={{ color: service.color }}>payments</span>
                  <div><div className="sd-meta-label">Starting from</div><div className="sd-meta-value">{service.price_from}</div></div>
                </div>
                <div className="sd-meta-item">
                  <span className="material-icons-round" style={{ color: service.color }}>verified</span>
                  <div><div className="sd-meta-label">Warranty</div><div className="sd-meta-value">{service.warranty}</div></div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 d-flex flex-column gap-3">
              <Link to={`/garages?service=${slug}`} className="sd-btn-book">
                <span className="material-icons-round" style={{ fontSize: '20px' }}>request_quote</span>
                Get Instant Quote
              </Link>
              <Link to="/home" className="sd-btn-back">
                <span className="material-icons-round" style={{ fontSize: '18px' }}>arrow_back</span>
                All Services
              </Link>
              {/* Trust badge */}
              <div style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-icons-round" style={{ fontSize: '22px', color: '#10b981' }}>shield</span>
                <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,.6)', fontFamily: "'Poppins', sans-serif" }}>100% Certified Garages · Free Pickup &amp; Drop · Transparent Pricing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="py-5" style={{ background: '#f8fafc', '--svc-color': service.color, '--svc-bg': service.bg }}>
        <div className="container">
          <div className="row g-4">

            {/* Benefits */}
            <div className="col-lg-4">
              <div className="sd-content-card">
                <div className="sd-card-title" style={{ color: service.color }}>
                  <span className="material-icons-round">thumb_up</span> Why Choose Garro for This
                </div>
                {service.benefits.map((b, idx) => (
                  <div key={idx} className="sd-benefit-item">
                    <div className="sd-benefit-check" style={{ background: service.bg }}><span className="material-icons-round" style={{ color: service.color }}>check</span></div>
                    <div className="sd-benefit-text">{b}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="col-lg-4">
              <div className="sd-content-card">
                <div className="sd-card-title" style={{ color: service.color }}>
                  <span className="material-icons-round">checklist</span> What's Included
                </div>
                {service.includes.map((item, idx) => (
                  <div key={idx} className="sd-include-item">
                    <div className="sd-include-num">{idx + 1}</div>
                    <div className="sd-include-text">{item}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works mini */}
            <div className="col-lg-4">
              <div className="sd-content-card">
                <div className="sd-card-title" style={{ color: service.color }}>
                  <span className="material-icons-round">directions</span> How Garro Works
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div style={{ display: 'flex', gap: '14px', paddingBottom: '20px', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', color: '#fff', fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', sans-serif" }}>1</div>
                      <div style={{ width: '2px', flex: 1, background: '#f1f5f9', marginTop: '6px' }}></div>
                    </div>
                    <div style={{ paddingTop: '6px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>Book Online</div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif", marginTop: '3px', lineHeight: 1.5 }}>Select this service and get instant quotes from certified garages near you.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', paddingBottom: '20px', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', color: '#fff', fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', sans-serif" }}>2</div>
                      <div style={{ width: '2px', flex: 1, background: '#f1f5f9', marginTop: '6px' }}></div>
                    </div>
                    <div style={{ paddingTop: '6px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>Free Pickup</div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif", marginTop: '3px', lineHeight: 1.5 }}>We collect your car from your home or office — completely free of charge.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', paddingBottom: '20px', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', color: '#fff', fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', sans-serif" }}>3</div>
                      <div style={{ width: '2px', flex: 1, background: '#f1f5f9', marginTop: '6px' }}></div>
                    </div>
                    <div style={{ paddingTop: '6px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>Service &amp; Track</div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif", marginTop: '3px', lineHeight: 1.5 }}>Our certified garage performs the service. Track progress live via your dashboard.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', sans-serif" }}>4</div>
                    <div style={{ paddingTop: '6px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>Car Returned ✓</div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif", marginTop: '3px', lineHeight: 1.5 }}>Your car is delivered back, with a full digital service report and warranty.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      {service.faqs && service.faqs.length > 0 && (
        <section className="py-5 bg-white" style={{ '--svc-color': service.color, '--svc-bg': service.bg }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="text-center mb-4">
                  <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: '#0f172a' }}>Frequently Asked Questions</h2>
                  <p style={{ color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>Everything you need to know about {service.name}</p>
                </div>
                {service.faqs.map((faq, index) => (
                  <div key={index} className="sd-faq-item">
                    <button className={`sd-faq-q ${openFaq === index ? 'open' : ''}`} onClick={() => toggleFaq(index)} style={{ color: openFaq === index ? service.color : undefined }}>
                      {faq[0]}
                      <span className="material-icons-round" style={{ color: openFaq === index ? service.color : undefined }}>expand_more</span>
                    </button>
                    <div className={`sd-faq-a ${openFaq === index ? 'open' : ''}`}>
                      {faq[1]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-5" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="sd-cta-strip">
            <div className="row align-items-center g-4 position-relative" style={{ zIndex: 2 }}>
              <div className="col-lg-7">
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: '#fff', fontSize: 'clamp(1.4rem,3vw,2rem)', marginBottom: '10px' }}>
                  Ready to book your {service.name}?
                </h2>
                <p style={{ color: 'rgba(255,255,255,.55)', fontFamily: "'Poppins', sans-serif", fontSize: '14.5px', margin: 0 }}>
                  Get instant quotes from certified garages · Free pickup &amp; drop · 20% OFF your first booking
                </p>
              </div>
              <div className="col-lg-5 d-flex flex-wrap gap-3 justify-content-lg-end">
                <Link to={`/garages?service=${slug}`} className="sd-btn-book">
                  <span className="material-icons-round">request_quote</span> Get Instant Quote
                </Link>
                <Link to="/home" style={{ border: '2px solid rgba(255,255,255,.25)', borderRadius: '13px', padding: '13px 24px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,.8)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' }}>
                  <span className="material-icons-round">arrow_back</span> Browse All
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default ServiceDetail;
