import React, { useState, useEffect } from 'react';
import { LuX, LuSend, LuCircleCheck } from 'react-icons/lu';

const EOLRequestModal = ({ isOpen, onClose, initialServiceType }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    emirate: 'Dubai',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    serviceType: 'Certified Car Scrapping',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (initialServiceType) {
      setFormData(prev => ({ ...prev, serviceType: initialServiceType }));
    }
  }, [initialServiceType, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 1500);
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      emirate: 'Dubai',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      serviceType: 'Certified Car Scrapping',
      notes: ''
    });
    setSubmitSuccess(false);
    onClose();
  };

  const emirates = [
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'
  ];

  const serviceTypes = [
    'Certified Car Scrapping', 'Trade-In Valuation', 'Eco-Friendly Disposal', 
    'Parts Salvage', 'Deregistration Support', 'General Inquiry'
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '540px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header banner */}
        <div style={{
          background: 'linear-gradient(135deg, #ff5c1a, #ff8c42)',
          padding: '24px 32px',
          color: '#ffffff',
          position: 'relative'
        }}>
          <h4 style={{ margin: 0, fontWeight: 800, fontSize: '18px', fontFamily: "'Poppins', sans-serif" }}>
            {submitSuccess ? 'Request Submitted!' : 'End-of-Life Request'}
          </h4>
          <p style={{ margin: '4px 0 0', fontSize: '12.5px', opacity: 0.9, fontFamily: "'Poppins', sans-serif" }}>
            {submitSuccess ? 'Thank you for choosing Garro' : 'Provide your details to initiate the process'}
          </p>
          <button 
            onClick={handleReset}
            style={{
              position: 'absolute',
              right: '24px',
              top: '24px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <LuX size={16} />
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: '32px', maxHeight: '75vh', overflowY: 'auto' }}>
          {submitSuccess ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f0fdf4',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
              }}>
                <LuCircleCheck size={36} />
              </div>
              <h5 style={{ fontWeight: 800, fontSize: '16.5px', color: '#0f172a', marginBottom: '8px', fontFamily: "'Poppins', sans-serif" }}>
                We have received your request
              </h5>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto 24px', fontFamily: "'Poppins', sans-serif" }}>
                Our recycling operations team is currently preparing for our official launch. We will review your details and contact you as soon as the service goes live.
              </p>
              <button
                onClick={handleReset}
                style={{
                  background: 'linear-gradient(135deg, #ff5c1a, #ff8c42)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 32px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 92, 26, 0.3)',
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Full name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    style={{
                      width: '100%', padding: '11px 16px', borderRadius: '12px',
                      border: '1.5px solid #e2e8f0', fontSize: '13.5px', outline: 'none',
                      fontFamily: "'Poppins', sans-serif", color: '#0f172a'
                    }}
                  />
                </div>

                {/* Contact row */}
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+971 50 123 4567"
                      style={{
                        width: '100%', padding: '11px 16px', borderRadius: '12px',
                        border: '1.5px solid #e2e8f0', fontSize: '13.5px', outline: 'none',
                        fontFamily: "'Poppins', sans-serif", color: '#0f172a'
                      }}
                    />
                  </div>
                  <div className="col-sm-6">
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      style={{
                        width: '100%', padding: '11px 16px', borderRadius: '12px',
                        border: '1.5px solid #e2e8f0', fontSize: '13.5px', outline: 'none',
                        fontFamily: "'Poppins', sans-serif", color: '#0f172a'
                      }}
                    />
                  </div>
                </div>

                {/* Location + Service row */}
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                      Emirate
                    </label>
                    <select
                      name="emirate"
                      value={formData.emirate}
                      onChange={handleChange}
                      style={{
                        width: '100%', padding: '11px 16px', borderRadius: '12px',
                        border: '1.5px solid #e2e8f0', fontSize: '13.5px', outline: 'none',
                        fontFamily: "'Poppins', sans-serif", color: '#0f172a', background: '#fff'
                      }}
                    >
                      {emirates.map(em => (
                        <option key={em} value={em}>{em}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-sm-6">
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                      Service Type
                    </label>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      style={{
                        width: '100%', padding: '11px 16px', borderRadius: '12px',
                        border: '1.5px solid #e2e8f0', fontSize: '13.5px', outline: 'none',
                        fontFamily: "'Poppins', sans-serif", color: '#0f172a', background: '#fff'
                      }}
                    >
                      {serviceTypes.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vehicle make, model, year */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                    Vehicle Specifications
                  </label>
                  <div className="row g-2">
                    <div className="col-5">
                      <input
                        type="text"
                        name="vehicleMake"
                        required
                        value={formData.vehicleMake}
                        onChange={handleChange}
                        placeholder="Make (e.g. Toyota)"
                        style={{
                          width: '100%', padding: '11px 16px', borderRadius: '12px',
                          border: '1.5px solid #e2e8f0', fontSize: '13.5px', outline: 'none',
                          fontFamily: "'Poppins', sans-serif", color: '#0f172a'
                        }}
                      />
                    </div>
                    <div className="col-4">
                      <input
                        type="text"
                        name="vehicleModel"
                        required
                        value={formData.vehicleModel}
                        onChange={handleChange}
                        placeholder="Model (e.g. Camry)"
                        style={{
                          width: '100%', padding: '11px 16px', borderRadius: '12px',
                          border: '1.5px solid #e2e8f0', fontSize: '13.5px', outline: 'none',
                          fontFamily: "'Poppins', sans-serif", color: '#0f172a'
                        }}
                      />
                    </div>
                    <div className="col-3">
                      <input
                        type="number"
                        name="vehicleYear"
                        required
                        value={formData.vehicleYear}
                        onChange={handleChange}
                        placeholder="Year"
                        style={{
                          width: '100%', padding: '11px 16px', borderRadius: '12px',
                          border: '1.5px solid #e2e8f0', fontSize: '13.5px', outline: 'none',
                          fontFamily: "'Poppins', sans-serif", color: '#0f172a'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. Car condition, missing parts, engine issues, etc."
                    rows="3"
                    style={{
                      width: '100%', padding: '11px 16px', borderRadius: '12px',
                      border: '1.5px solid #e2e8f0', fontSize: '13.5px', outline: 'none',
                      fontFamily: "'Poppins', sans-serif", color: '#0f172a', resize: 'none'
                    }}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: 'linear-gradient(135deg, #ff5c1a, #ff8c42)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 20px rgba(255, 92, 26, 0.2)',
                    opacity: isSubmitting ? 0.8 : 1,
                    transition: 'all 0.2s',
                    marginTop: '8px',
                    fontFamily: "'Poppins', sans-serif"
                  }}
                >
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <LuSend size={15} /> Send Request
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EOLRequestModal;
