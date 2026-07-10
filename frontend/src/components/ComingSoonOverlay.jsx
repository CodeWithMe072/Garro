import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, FileText, X } from 'lucide-react';

const ComingSoonOverlay = ({ onClose }) => {
  return (
    <div 
      className="coming-soon-overlay" 
      onClick={onClose}
    >
      <div 
        className="coming-soon-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="coming-soon-stripe"></div>
        <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #ff5c1a, #ff8c42)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(255,92,26,0.3)' }}>
          <Rocket size={36} color="#fff" />
        </div>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,.75)', lineHeight: 1.7, marginBottom: '6px' }}>
          We're working hard to bring you the best<br/>
          <strong style={{ color: '#fff' }}>services on this page.</strong>
        </p>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '18px', fontWeight: 800, color: '#ff5c1a', marginBottom: '28px', letterSpacing: '.02em' }}>
          Stay Tuned! 🚀
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '28px' }}>
          <div style={{ width: '28px', height: '4px', borderRadius: '2px', background: '#ff5c1a' }}></div>
          <div style={{ width: '8px', height: '4px', borderRadius: '2px', background: 'rgba(255,92,26,.4)' }}></div>
          <div style={{ width: '8px', height: '4px', borderRadius: '2px', background: 'rgba(255,92,26,.4)' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            to="/garages" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', color: '#fff', borderRadius: '50px', padding: '12px 28px', fontWeight: 700, fontSize: '14px', textDecoration: 'none', fontFamily: "'Poppins', sans-serif", boxShadow: '0 6px 20px rgba(255,92,26,.4)' }}
          >
            <FileText size={16} /> Get a Quote
          </Link>
          <button 
            onClick={onClose}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.8)', border: '1.5px solid rgba(255,255,255,.2)', borderRadius: '50px', padding: '12px 28px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}
          >
            <X size={16} /> Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonOverlay;
