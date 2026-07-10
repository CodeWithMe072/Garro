import React, { useState } from 'react';
import {
  Phone, Mail, MapPin, Clock, Send, Instagram,
  Twitter, Linkedin, Facebook, MessageSquare, CheckCircle
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', subject: '', message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const contactInfo = [
    {
      icon: Phone, title: 'Phone', detail: '+971 50 123 4567',
      sub: 'Mon–Sat, 9AM–6PM', color: '#ff5c1a'
    },
    {
      icon: Mail, title: 'Email', detail: 'hello@garro.ae',
      sub: 'We reply within 24 hours', color: '#3b82f6'
    },
    {
      icon: MapPin, title: 'Location', detail: 'Dubai, United Arab Emirates',
      sub: 'Also serving Kerala, India', color: '#10b981'
    },
    {
      icon: Clock, title: 'Working Hours', detail: 'Mon–Sat: 9AM – 6PM',
      sub: 'Sunday: Closed', color: '#8b5cf6'
    },
  ];

  const socials = [
    { icon: Instagram, href: '#', label: 'Instagram', color: '#e1306c' },
    { icon: Twitter, href: '#', label: 'Twitter', color: '#1da1f2' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: '#0a66c2' },
    { icon: Facebook, href: '#', label: 'Facebook', color: '#1877f2' },
  ];

  const inputStyle = {
    width: '100%', background: '#fff', border: '1.5px solid #e2e8f0',
    borderRadius: '10px', padding: '11px 14px', fontSize: '13.5px',
    color: '#0f172a', outline: 'none', fontFamily: "'Poppins', sans-serif",
    transition: 'border 0.2s'
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - var(--nav-h))' }}>

      {/* ── HERO ── */}
      <section style={{ background: '#ffffff', padding: '64px 0 52px', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container text-center">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,92,26,0.08)', border: '1px solid rgba(255,92,26,0.18)',
            color: '#ff5c1a', padding: '5px 14px', borderRadius: '50px',
            fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '.08em', marginBottom: '20px'
          }}>
            <MessageSquare size={13} /> Get In Touch
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#0f172a',
            letterSpacing: '-.03em', marginBottom: '14px', fontFamily: "'Poppins', sans-serif"
          }}>
            Contact <span style={{ color: '#ff5c1a' }}>Garro</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7, fontFamily: "'Poppins', sans-serif" }}>
            Have a question, feedback, or need support? We're here to help — 6 days a week.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section style={{ padding: '60px 0 80px' }}>
        <div className="container">
          <div className="row g-5 align-items-start">

            {/* LEFT — Contact Info */}
            <div className="col-lg-5">
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '6px', fontFamily: "'Poppins', sans-serif" }}>
                Our Contact Details
              </h3>
              <div style={{ width: '36px', height: '3px', background: '#ff5c1a', borderRadius: '2px', marginBottom: '28px' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                {contactInfo.map(({ icon: Icon, title, detail, sub, color }) => (
                  <div key={title} style={{
                    display: 'flex', gap: '16px', alignItems: 'flex-start',
                    background: '#fff', border: '1.5px solid #e2e8f0',
                    borderRadius: '16px', padding: '18px 20px',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: `${color}15`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color, flexShrink: 0
                    }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: "'Poppins', sans-serif", marginBottom: '4px' }}>
                        {title}
                      </div>
                      <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>
                        {detail}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif", marginTop: '2px' }}>
                        {sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', fontFamily: "'Poppins', sans-serif" }}>
                  Follow Us
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {socials.map(({ icon: Icon, href, label, color }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: '#fff', border: '1.5px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#64748b', textDecoration: 'none', transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; e.currentTarget.style.background = `${color}10`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#fff'; }}
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Contact Form */}
            <div className="col-lg-7">
              <div style={{
                background: '#fff', border: '1.5px solid #e2e8f0',
                borderRadius: '24px', padding: '36px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.03)'
              }}>
                {submitted ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 24px', color: '#10b981'
                    }}>
                      <CheckCircle size={40} strokeWidth={1.5} />
                    </div>
                    <h4 style={{ fontWeight: 800, color: '#0f172a', fontFamily: "'Poppins', sans-serif", marginBottom: '10px' }}>
                      Message Sent!
                    </h4>
                    <p style={{ color: '#64748b', fontSize: '14px', fontFamily: "'Poppins', sans-serif" }}>
                      Thank you for reaching out. Our team will get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setFormData({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' }); }}
                      style={{
                        marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', color: '#fff',
                        border: 'none', borderRadius: '10px', padding: '11px 24px',
                        fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                        fontFamily: "'Poppins', sans-serif"
                      }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h4 style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', fontFamily: "'Poppins', sans-serif", marginBottom: '6px' }}>
                      Send Us a Message
                    </h4>
                    <p style={{ fontSize: '13.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif", marginBottom: '28px' }}>
                      Fill in the form below and we'll respond as soon as possible.
                    </p>

                    <form onSubmit={handleSubmit}>
                      <div className="row g-3">
                        <div className="col-6">
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', fontFamily: "'Poppins', sans-serif" }}>First Name *</label>
                          <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange} placeholder="John" style={inputStyle} />
                        </div>
                        <div className="col-6">
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', fontFamily: "'Poppins', sans-serif" }}>Last Name *</label>
                          <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange} placeholder="Doe" style={inputStyle} />
                        </div>
                        <div className="col-md-6">
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', fontFamily: "'Poppins', sans-serif" }}>Email *</label>
                          <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="john@example.com" style={inputStyle} />
                        </div>
                        <div className="col-md-6">
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', fontFamily: "'Poppins', sans-serif" }}>Phone</label>
                          <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+971 50 123 4567" style={inputStyle} />
                        </div>
                        <div className="col-12">
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', fontFamily: "'Poppins', sans-serif" }}>Subject *</label>
                          <select name="subject" required value={formData.subject} onChange={handleChange}
                            style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}>
                            <option value="">Select a subject...</option>
                            <option value="general">General Inquiry</option>
                            <option value="service">Service Issue</option>
                            <option value="partnership">Partnership</option>
                            <option value="billing">Billing</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', fontFamily: "'Poppins', sans-serif" }}>Message *</label>
                          <textarea name="message" required rows={5} value={formData.message} onChange={handleChange}
                            placeholder="Tell us how we can help you..."
                            style={{ ...inputStyle, resize: 'vertical' }} />
                        </div>
                        <div className="col-12">
                          <button
                            type="submit"
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              gap: '8px', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)',
                              color: '#fff', border: 'none', borderRadius: '12px',
                              padding: '14px', fontWeight: 700, fontSize: '15px',
                              cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
                              boxShadow: '0 6px 20px rgba(255,92,26,0.3)', transition: 'all 0.2s'
                            }}
                          >
                            <Send size={18} /> Send Message
                          </button>
                        </div>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
