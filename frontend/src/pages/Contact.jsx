import React, { useState } from 'react';
import {
<<<<<<< HEAD
  LuPhone, LuMail, LuMapPin, LuClock, LuSend, LuInstagram,
  LuTwitter, LuLinkedin, LuFacebook, LuMessageSquare, LuCircleCheck
} from 'react-icons/lu';
=======
  Phone, Mail, MapPin, Clock, Send, Instagram,
  Twitter, Linkedin, Facebook, MessageSquare, CheckCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
>>>>>>> f8e32b9393b7ad02ab508e5def03cb46614f49e1

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', subject: '', message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const contactInfo = [
    {
<<<<<<< HEAD
      icon: LuPhone, title: 'Phone', detail: '+971 50 123 4567',
      sub: 'Mon–Sat, 9AM–6PM', color: '#ff5c1a'
    },
    {
      icon: LuMail, title: 'Email', detail: 'hello@garro.ae',
      sub: 'We reply within 24 hours', color: '#3b82f6'
    },
    {
      icon: LuMapPin, title: 'Location', detail: 'Dubai, United Arab Emirates',
      sub: 'Also serving Kerala, India', color: '#10b981'
    },
    {
      icon: LuClock, title: 'Working Hours', detail: 'Mon–Sat: 9AM – 6PM',
      sub: 'Sunday: Closed', color: '#8b5cf6'
=======
      icon: Phone, title: t('contact_phone_title'), detail: '+971 50 123 4567',
      sub: t('contact_phone_sub'), color: '#ff5c1a'
    },
    {
      icon: Mail, title: t('contact_email_title'), detail: 'hello@garro.ae',
      sub: t('contact_email_sub'), color: '#3b82f6'
    },
    {
      icon: MapPin, title: t('contact_loc_title'), detail: 'Dubai, United Arab Emirates',
      sub: t('contact_loc_sub'), color: '#10b981'
    },
    {
      icon: Clock, title: t('contact_hours_title'), detail: 'Mon–Sat: 9AM – 6PM',
      sub: t('contact_hours_sub'), color: '#8b5cf6'
>>>>>>> f8e32b9393b7ad02ab508e5def03cb46614f49e1
    },
  ];

  const socials = [
    { icon: LuInstagram, href: '#', label: 'Instagram', color: '#e1306c' },
    { icon: LuTwitter, href: '#', label: 'Twitter', color: '#1da1f2' },
    { icon: LuLinkedin, href: '#', label: 'LinkedIn', color: '#0a66c2' },
    { icon: LuFacebook, href: '#', label: 'Facebook', color: '#1877f2' },
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
<<<<<<< HEAD
            <LuMessageSquare size={13} /> Get In Touch
=======
            <MessageSquare size={13} /> <span dir="auto">{t('contact_get_in_touch')}</span>
>>>>>>> f8e32b9393b7ad02ab508e5def03cb46614f49e1
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#0f172a',
            letterSpacing: '-.03em', marginBottom: '14px', fontFamily: "'Poppins', sans-serif"
          }}>
            <span dir="auto">{t('contact_hero_title1')}</span> <span style={{ color: '#ff5c1a' }} dir="auto">{t('contact_hero_title2')}</span>
          </h1>
          <p dir="auto" style={{ color: '#64748b', fontSize: '15px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7, fontFamily: "'Poppins', sans-serif" }}>
            {t('contact_hero_desc')}
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section style={{ padding: '60px 0 80px' }}>
        <div className="container">
          <div className="row g-5 align-items-start">

            {/* LEFT — Contact Info */}
            <div className="col-lg-5">
              <h3 dir="auto" style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '6px', fontFamily: "'Poppins', sans-serif" }}>
                {t('contact_details_title')}
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
                      <div dir="auto" style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: "'Poppins', sans-serif", marginBottom: '4px' }}>
                        {title}
                      </div>
                      <div dir="ltr" style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>
                        {detail}
                      </div>
                      <div dir="auto" style={{ fontSize: '12.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif", marginTop: '2px' }}>
                        {sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div>
                <div dir="auto" style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', fontFamily: "'Poppins', sans-serif" }}>
                  {t('contact_follow')}
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
                      <LuCircleCheck size={40} strokeWidth={1.5} />
                    </div>
                    <h4 dir="auto" style={{ fontWeight: 800, color: '#0f172a', fontFamily: "'Poppins', sans-serif", marginBottom: '10px' }}>
                      {t('contact_success_title')}
                    </h4>
                    <p dir="auto" style={{ color: '#64748b', fontSize: '14px', fontFamily: "'Poppins', sans-serif" }}>
                      {t('contact_success_desc')}
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
                      <span dir="auto">{t('contact_send_msg')}</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <h4 dir="auto" style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', fontFamily: "'Poppins', sans-serif", marginBottom: '6px' }}>
                      {t('contact_send_msg')}
                    </h4>
                    <p dir="auto" style={{ fontSize: '13.5px', color: '#64748b', fontFamily: "'Poppins', sans-serif", marginBottom: '28px' }}>
                      {t('contact_msg_placeholder')}
                    </p>

                    <form onSubmit={handleSubmit}>
                      <div className="row g-3">
                        <div className="col-6">
                          <label dir="auto" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', fontFamily: "'Poppins', sans-serif" }}>{t('contact_fname')} *</label>
                          <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange} placeholder="John" style={inputStyle} />
                        </div>
                        <div className="col-6">
                          <label dir="auto" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', fontFamily: "'Poppins', sans-serif" }}>{t('contact_lname')} *</label>
                          <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange} placeholder="Doe" style={inputStyle} />
                        </div>
                        <div className="col-md-6">
                          <label dir="auto" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', fontFamily: "'Poppins', sans-serif" }}>{t('contact_email_title')} *</label>
                          <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder={t('contact_email_placeholder')} style={inputStyle} />
                        </div>
                        <div className="col-md-6">
                          <label dir="auto" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', fontFamily: "'Poppins', sans-serif" }}>{t('contact_phone')}</label>
                          <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+971 50 123 4567" style={inputStyle} />
                        </div>
                        <div className="col-12">
                          <label dir="auto" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', fontFamily: "'Poppins', sans-serif" }}>{t('contact_subject')} *</label>
                          <select name="subject" required value={formData.subject} onChange={handleChange}
                            style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }} dir="auto">
                            <option value="">{t('contact_subject')}...</option>
                            <option value="general">{t('contact_subj_general')}</option>
                            <option value="service">{t('contact_subj_service')}</option>
                            <option value="partnership">{t('contact_subj_partner')}</option>
                            <option value="billing">{t('contact_subj_billing')}</option>
                            <option value="other">{t('contact_subj_other')}</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label dir="auto" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', fontFamily: "'Poppins', sans-serif" }}>{t('contact_message')} *</label>
                          <textarea name="message" required rows={5} value={formData.message} onChange={handleChange}
                            placeholder={t('contact_msg_placeholder')}
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
<<<<<<< HEAD
                            <LuSend size={18} /> Send Message
=======
                            <Send size={18} /> <span dir="auto">{t('contact_btn_send')}</span>
>>>>>>> f8e32b9393b7ad02ab508e5def03cb46614f49e1
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
