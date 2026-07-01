import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const plansData = {
  comprehensive: {
    title: 'Comprehensive Insurance',
    category: 'Full Protection',
    tag_bg: '#ecfdf5',
    tag_color: '#059669',
    hero_desc: 'Get full peace of mind with our most popular plan covering accidental damage, theft, fire, and third-party liabilities.',
    icon: 'shield',
    icon_bg: 'linear-gradient(135deg,#10b981,#059669)',
    short_desc: 'The ultimate protection for your vehicle, offering extensive coverage against unforeseen events.',
    features: ['Accidental damage cover', 'Theft & fire protection', '24/7 roadside assistance', 'Natural disaster coverage'],
    extra_field_label: 'Current Insurer (If any)',
    extra_field_placeholder: 'e.g. AXA, Oman Insurance'
  },
  'third-party': {
    title: 'Third-Party Insurance',
    category: 'Essential',
    tag_bg: '#eff6ff',
    tag_color: '#2563eb',
    hero_desc: 'Mandatory UAE coverage protecting you from liability towards third parties. Quick, affordable, legally compliant.',
    icon: 'security',
    icon_bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
    short_desc: 'Meet legal requirements efficiently with our cost-effective third-party protection.',
    features: ['Legal compliance in UAE', 'Third-party damage cover', 'Medical expense coverage', 'Affordable premiums'],
    extra_field_label: 'Emirates ID',
    extra_field_placeholder: '784-XXXX-XXXXXXX-X'
  }
};

const defaultPlan = {
  title: 'Insurance Plan',
  category: 'Protection',
  tag_bg: '#fff4ef',
  tag_color: '#ff5c1a',
  hero_desc: 'Garro connects you with UAE\'s top insurance providers. Get the right coverage for your vehicle.',
  icon: 'verified_user',
  icon_bg: 'linear-gradient(135deg,#ff5c1a,#ff8c42)',
  short_desc: 'Comprehensive coverage customized to your needs.',
  features: ['Customized Coverage', 'Fast Claims', '24/7 Support'],
  extra_field_label: 'Additional Info',
  extra_field_placeholder: 'Any specific requests'
};

const InsuranceQuote = () => {
  const { slug } = useParams();
  const [showOverlay, setShowOverlay] = useState(false);
  const [plan, setPlan] = useState(defaultPlan);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug && plansData[slug]) {
      setPlan(plansData[slug]);
    }
  }, [slug]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowOverlay(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 0' }}>
      {/* SUCCESS OVERLAY */}
      <div className={`success-overlay ${showOverlay ? 'show' : ''}`} onClick={() => setShowOverlay(false)}>
        <div className="success-box" onClick={(e) => e.stopPropagation()}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span className="material-icons-round" style={{ fontSize: '36px', color: '#fff' }}>check_circle</span>
          </div>
          <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Quote Request Sent!</h3>
          <p style={{ color: '#64748b', fontSize: '14.5px', lineHeight: 1.75, fontFamily: "'Poppins', sans-serif" }}>
            Our insurance specialist will contact you within <strong>24 hours</strong> with the best rates for <strong>{plan.title}</strong>.
          </p>
          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/insurance" className="btn-orange" style={{ textDecoration: 'none' }}>
              <span className="material-icons-round">shield</span> View All Plans
            </Link>
            <Link to="/home" style={{ color: '#64748b', fontSize: '13.5px', fontFamily: "'Poppins', sans-serif", textDecoration: 'none' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="page-hero">
        <div className="container position-relative" style={{ zIndex: 2 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <Link to="/home" style={{ color: 'rgba(255,255,255,.5)', fontSize: '13px', textDecoration: 'none', fontFamily: "'Poppins', sans-serif" }}>Home</Link>
            <span className="material-icons-round" style={{ fontSize: '16px', color: 'rgba(255,255,255,.3)', margin: '0 6px' }}>chevron_right</span>
            <Link to="/insurance" style={{ color: 'rgba(255,255,255,.5)', fontSize: '13px', textDecoration: 'none', fontFamily: "'Poppins', sans-serif" }}>Insurance</Link>
            <span className="material-icons-round" style={{ fontSize: '16px', color: 'rgba(255,255,255,.3)', margin: '0 6px' }}>chevron_right</span>
            <span style={{ color: 'rgba(255,255,255,.85)', fontSize: '13px', fontFamily: "'Poppins', sans-serif" }}>{plan.title}</span>
          </div>

          <span className="sec-tag" style={{ background: plan.tag_bg, color: plan.tag_color }}>{plan.category}</span>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: '#fff', fontSize: 'clamp(1.8rem,4vw,2.8rem)', letterSpacing: '-.03em', marginBottom: '14px' }}>
            Get a Quote for<br/>
            <span style={{ background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {plan.title}
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '15px', maxWidth: '520px', lineHeight: 1.8, fontFamily: "'Poppins', sans-serif" }}>
            {plan.hero_desc}
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-5" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="row g-4">

            {/* QUOTE FORM */}
            <div className="col-lg-7">
              <div className="quote-card">
                <div className="plan-icon-wrap" style={{ background: plan.icon_bg }}>
                  <span className="material-icons-round">{plan.icon}</span>
                </div>
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: '#0f172a', fontSize: '1.5rem', marginBottom: '6px' }}>{plan.title}</h2>
                <p style={{ color: '#64748b', fontSize: '14px', fontFamily: "'Poppins', sans-serif", marginBottom: '24px' }}>{plan.short_desc}</p>

                {/* Features chips */}
                <div style={{ marginBottom: '28px' }}>
                  {plan.features.map((feat, index) => (
                    <span key={index} className="feature-chip"><span className="material-icons-round">check_circle</span>{feat}</span>
                  ))}
                </div>

                <hr style={{ borderColor: '#f1f5f9', marginBottom: '28px' }} />
                <h5 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>Fill in Your Details</h5>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name *</label>
                      <input type="text" className="form-control" placeholder="Ahmad Al Rashid" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Mobile Number *</label>
                      <input type="tel" className="form-control" placeholder="+971 50 000 0000" required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Email Address *</label>
                      <input type="email" className="form-control" placeholder="you@example.com" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Vehicle Make</label>
                      <select className="form-select">
                        <option value="">Select Make</option>
                        <option>Toyota</option><option>Nissan</option><option>Honda</option>
                        <option>BMW</option><option>Mercedes-Benz</option><option>Audi</option>
                        <option>Hyundai</option><option>Kia</option><option>Ford</option>
                        <option>Land Rover</option><option>Lexus</option><option>Other</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Vehicle Year</label>
                      <select className="form-select">
                        <option value="">Select Year</option>
                        {years.map(y => <option key={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Emirate</label>
                      <select className="form-select">
                        <option value="">Select Emirate</option>
                        <option>Dubai</option><option>Abu Dhabi</option><option>Sharjah</option>
                        <option>Ajman</option><option>Ras Al Khaimah</option><option>Fujairah</option><option>Umm Al Quwain</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">{plan.extra_field_label}</label>
                      <input type="text" className="form-control" placeholder={plan.extra_field_placeholder} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Additional Notes</label>
                      <textarea className="form-control" rows="3" placeholder="Any specific requirements or questions..."></textarea>
                    </div>
                    <div className="col-12" style={{ marginTop: '8px' }}>
                      <button type="submit" className="btn-orange">
                        <span className="material-icons-round">send</span> Request My Quote
                      </button>
                      <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '12px', fontFamily: "'Poppins', sans-serif" }}>
                        <span className="material-icons-round" style={{ fontSize: '13px' }}>lock</span>
                        Your data is secure. We never share your details with third parties.
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="col-lg-5">

              {/* Why choose */}
              <div className="sidebar-info mb-4">
                <h5 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Why Get a Quote With Garro?</h5>
                <div className="info-row">
                  <div className="info-icon"><span className="material-icons-round">speed</span></div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>Fast Response</div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>Our team responds within 24 hours with competitive rates from top UAE insurers.</div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon"><span className="material-icons-round">compare</span></div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>Compare Providers</div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>We compare quotes from multiple licensed UAE insurance companies for you.</div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon"><span className="material-icons-round">support_agent</span></div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>Expert Guidance</div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>Our specialists help you pick the right coverage for your car and budget.</div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon"><span className="material-icons-round">verified</span></div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>100% Legitimate</div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>All insurers are licensed by the UAE Insurance Authority.</div>
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="sidebar-info">
                <h5 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>How It Works</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div className="step-badge">1</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>Submit this form</div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>Fill your vehicle & contact details above.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div className="step-badge">2</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>We compare quotes</div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>Our specialists fetch the best rates from top providers.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div className="step-badge">3</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>We call you back</div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>Expert walks you through the options within 24 hrs.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div className="step-badge">4</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>Get covered</div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>Choose your plan, pay and your policy is active.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other plans */}
              <div style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '12.5px', color: '#94a3b8', fontFamily: "'Poppins', sans-serif", marginBottom: '10px' }}>Looking for a different plan?</p>
                <Link to="/insurance" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: '#ff5c1a', fontSize: '13.5px', fontWeight: 600, fontFamily: "'Poppins', sans-serif", textDecoration: 'none' }}>
                  <span className="material-icons-round" style={{ fontSize: '16px' }}>arrow_back</span> View All Insurance Plans
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InsuranceQuote;
