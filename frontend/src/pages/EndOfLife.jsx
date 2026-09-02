import React from 'react';
import { LuRecycle } from 'react-icons/lu';

const EndOfLife = () => {
  return (
    <div style={{
      background: '#f8fafc',
      minHeight: 'calc(100vh - var(--nav-h, 80px))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: "'Poppins', sans-serif"
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '24px',
        padding: '48px 36px',
        textAlign: 'center',
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Category Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 92, 26, 0.1)',
          color: '#ff5c1a',
          padding: '6px 16px',
          borderRadius: '50px',
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '24px'
        }}>
          <LuRecycle size={16} /> VEHICLE SCRAPPING
        </div>

        {/* Main Title */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: '16px',
          lineHeight: '1.2'
        }}>
          Ready to Scrap Your Car? We'll Take Care of It.
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: '#64748b',
          lineHeight: '1.6',
          marginBottom: '32px'
        }}>
          A simple and convenient way to scrap your vehicle with Garro.
        </p>

        {/* Coming Soon Badge */}
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #ff5c1a 0%, #ff8c42 100%)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '14px',
          padding: '10px 28px',
          borderRadius: '50px',
          boxShadow: '0 6px 20px rgba(255, 92, 26, 0.3)'
        }}>
          Coming Soon
        </div>
      </div>
    </div>
  );
};

export default EndOfLife;
