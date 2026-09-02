import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Terms = () => {
  const { t } = useLanguage();

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 80px)', padding: '60px 20px', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ maxWidth: '840px', margin: '0 auto', background: '#ffffff', borderRadius: '24px', padding: '48px 36px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>
          Terms & Conditions
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px', borderBottom: '1px solid #e2e8f0', pb: '16px' }}>
          Last Updated: January 2026 • Garro Car Care Platform UAE
        </p>

        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>1. Introduction</h3>
          <p style={{ fontSize: '14.5px', lineHeight: 1.8, color: '#475569' }}>
            Welcome to Garro. By accessing or using our platform, vehicle service requests, quotations, and vehicle management features in the UAE, you agree to be bound by these Terms & Conditions. If you do not agree to all of these terms, please do not use our services.
          </p>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>2. Car Care & Quotation Services</h3>
          <p style={{ fontSize: '14.5px', lineHeight: 1.8, color: '#475569' }}>
            Garro acts as an end-to-end car care management platform connecting customers with certified partner garages in the UAE. Quotations provided through the platform are estimates based on user-provided vehicle details and diagnostic inspections. Final pricing is confirmed prior to service authorization.
          </p>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>3. Vehicle Pickup & Delivery</h3>
          <p style={{ fontSize: '14.5px', lineHeight: 1.8, color: '#475569' }}>
            Vehicle pickup and delivery services are complimentary within Dubai. Pickup and delivery outside of Dubai depend on service availability and location, with any applicable charges clearly confirmed before booking authorization.
          </p>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>4. Customer Accounts & Responsibilities</h3>
          <p style={{ fontSize: '14.5px', lineHeight: 1.8, color: '#475569' }}>
            Customers must provide accurate vehicle information (Brand, Model, Year, Registration Plate) and contact details. Account credentials must be kept secure. Garro reserves the right to suspend or cancel requests containing fraudulent or invalid contact information.
          </p>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>5. Contact & Support</h3>
          <p style={{ fontSize: '14.5px', lineHeight: 1.8, color: '#475569' }}>
            If you have any questions regarding these Terms & Conditions, please contact our support team at <strong>hello@garro.ae</strong> or call <strong>+971 50 123 4567</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
