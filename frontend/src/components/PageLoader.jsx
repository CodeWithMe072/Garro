import React from 'react';

const PageLoader = () => {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '40px 20px'
    }}>
      {/* Garro Logo Badge */}
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #ff5c1a, #ff8c42)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(255,92,26,0.35)',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      </div>

      {/* Loading Bar Animation */}
      <div style={{
        width: '180px',
        height: '4px',
        background: '#ffedd5',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #ff5c1a, #ff8c42)',
          borderRadius: '10px',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          animation: 'garroBarAnim 1.2s infinite ease-in-out'
        }}></div>
      </div>

      <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', letterSpacing: '.02em', fontFamily: "'Poppins', sans-serif" }}>
        Loading Garro...
      </span>

      <style>{`
        @keyframes garroBarAnim {
          0% { left: -50%; width: 40%; }
          50% { left: 25%; width: 60%; }
          100% { left: 100%; width: 40%; }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
