import React from 'react';

const Privacy = () => {
  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 80px)', padding: '60px 20px', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ maxWidth: '840px', margin: '0 auto', background: '#ffffff', borderRadius: '24px', padding: '48px 36px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px', borderBottom: '1px solid #e2e8f0', pb: '16px' }}>
          Last Updated: January 2026 • Garro Car Care Platform UAE
        </p>

        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>1. Information We Collect</h3>
          <p style={{ fontSize: '14.5px', lineHeight: 1.8, color: '#475569' }}>
            We collect personal information necessary to facilitate vehicle service requests, quotations, and account management. This includes your name, email address, mobile phone number, vehicle specifications (Brand, Model, Year, Registration Plate, VIN), and service locations in the UAE.
          </p>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>2. How We Use Your Data</h3>
          <p style={{ fontSize: '14.5px', lineHeight: 1.8, color: '#475569' }}>
            Your information is used strictly to process service bookings, coordinate vehicle pickup/delivery, send quotation updates and OTP verification codes, and connect you with certified partner garages.
          </p>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>3. Data Protection & Sharing</h3>
          <p style={{ fontSize: '14.5px', lineHeight: 1.8, color: '#475569' }}>
            Garro does not sell or rent your personal data to third parties. Vehicle and contact details are shared securely only with assigned certified garages and logistics helpers required to fulfill your requested car service.
          </p>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>4. Security</h3>
          <p style={{ fontSize: '14.5px', lineHeight: 1.8, color: '#475569' }}>
            We implement industry-standard encryption and security protocols to safeguard your account information, passwords, and transaction records against unauthorized access.
          </p>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>5. Contact Privacy Team</h3>
          <p style={{ fontSize: '14.5px', lineHeight: 1.8, color: '#475569' }}>
            If you have questions about our privacy practices or wish to request data updates, please contact us at <strong>hello@garro.ae</strong> or <strong>+971 50 123 4567</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
