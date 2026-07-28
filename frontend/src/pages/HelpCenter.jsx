import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LuCircleHelp, LuBookOpen, LuMessageSquare, LuPhoneCall, LuChevronDown, LuChevronUp } from 'react-icons/lu';

const FAQS = [
  {
    category: 'Bookings & Process',
    q: 'How do I book a car service on Garro?',
    a: 'Simply register an account, navigate to "Get a Quote", input your vehicle make/model and describe the issue. Our partner garages will bid on your request and send you quotes.'
  },
  {
    category: 'Bookings & Process',
    q: 'Can I choose which garage works on my vehicle?',
    a: 'Yes! You can compare quotes based on pricing, distance, garage ratings, and customer reviews. You are in complete control of selecting the best bid.'
  },
  {
    category: 'Payments',
    q: 'What payment options does Garro support?',
    a: 'Garro supports secure online payments via Stripe (Visa, Mastercard, Apple Pay) as well as cash/card on delivery or collection at the garage, depending on the garage policy.'
  },
  {
    category: 'Payments',
    q: 'Are there any hidden fees or charges?',
    a: 'No. All quotes provided by garages include UAE VAT (5%) and standard service fees. You only pay the amount specified in your approved quote unless additional repairs are manually approved by you.'
  },
  {
    category: 'Vehicle Transport',
    q: 'How does the vehicle collection and delivery work?',
    a: 'Once a quote is approved, you can schedule a pickup. The assigned helper or garage driver will collect your car from your specified location, drive it to the garage, and return it safely upon completion.'
  },
  {
    category: 'Vehicle Transport',
    q: 'Is my vehicle insured during transit?',
    a: 'Yes. All registered transport helpers and garage drivers carry comprehensive transit insurance to ensure your vehicle is fully covered during transit.'
  }
];

const HelpCenter = () => {
  const { lang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - var(--nav-h))', padding: '48px 24px', color: '#1e293b' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Header Title */}
        <div className="text-center mb-5">
          <LuCircleHelp size={48} style={{ color: '#ff5c1a', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
            {lang === 'ar' ? 'مركز المساعدة والدعم' : (lang === 'ur' ? 'مدد اور سپورٹ سینٹر' : 'Help & Support Center')}
          </h2>
          <p className="text-muted" style={{ fontSize: '16px' }}>
            Find answers to frequently asked questions or contact our customer care team.
          </p>
        </div>

        {/* Contact Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
          <div className="card border-0 shadow-sm p-4 text-center" style={{ borderRadius: '16px', background: '#fff' }}>
            <LuPhoneCall size={28} style={{ color: '#ff5c1a', marginBottom: '12px' }} />
            <h5 className="fw-bold mb-1">Call Us</h5>
            <p className="text-muted small mb-2">Available 9 AM - 6 PM (Mon-Sat)</p>
            <a href="tel:+97140000000" className="fw-bold text-decoration-none" style={{ color: '#ff5c1a' }}>+971 4 000 0000</a>
          </div>
          <div className="card border-0 shadow-sm p-4 text-center" style={{ borderRadius: '16px', background: '#fff' }}>
            <LuMessageSquare size={28} style={{ color: '#ff5c1a', marginBottom: '12px' }} />
            <h5 className="fw-bold mb-1">Live Chat Support</h5>
            <p className="text-muted small mb-2">Chat with a customer success agent</p>
            <a href="/support" className="fw-bold text-decoration-none" style={{ color: '#ff5c1a' }}>Start Chat</a>
          </div>
        </div>

        {/* FAQ list */}
        <h4 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
          <LuBookOpen size={20} style={{ color: '#ff5c1a' }} /> Frequently Asked Questions
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQS.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div 
                key={index} 
                className="card border-0 shadow-sm" 
                style={{ borderRadius: '12px', background: '#fff', overflow: 'hidden', transition: 'all 0.2s' }}
              >
                <div 
                  onClick={() => toggleFaq(index)}
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 600,
                    fontSize: '15px',
                    color: isOpen ? '#ff5c1a' : '#1e293b'
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <LuChevronUp size={18} /> : <LuChevronDown size={18} />}
                </div>

                {isOpen && (
                  <div style={{ padding: '0 20px 20px', fontSize: '14.5px', color: '#64748b', lineHeight: '1.6', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <span className="badge bg-light text-muted mb-2" style={{ fontSize: '10px', textTransform: 'uppercase' }}>{faq.category}</span>
                    <p className="mb-0">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default HelpCenter;
