import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { LuStar, LuMessageSquare, LuChevronRight, LuCalendar } from 'react-icons/lu';

const MyReviews = () => {
  const { t, lang } = useLanguage();
  const { toast } = useNotification();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/reviews/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch reviews.');
      }
      setReviews(data.reviews || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <LuStar 
        key={i} 
        size={16} 
        style={{ 
          fill: i < rating ? '#ff5c1a' : 'none', 
          color: i < rating ? '#ff5c1a' : '#cbd5e1', 
          marginRight: '2px' 
        }} 
      />
    ));
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - var(--nav-h))', padding: '48px 24px', color: '#1e293b' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        
        {/* Page Header */}
        <div className="d-flex align-items-center justify-content-between mb-5">
          <div>
            <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
              {lang === 'ar' ? 'تقييماتي وآرائي' : (lang === 'ur' ? 'میرے جائزے اور تاثرات' : 'My Reviews & Feedback')}
            </h2>
            <p className="text-muted mb-0">
              Manage and view the service feedback you've submitted for helpers and garages.
            </p>
          </div>
          <span 
            className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2 fw-bold"
            style={{ fontSize: '13px' }}
          >
            {reviews.length} Total Reviews
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="card border-0 shadow-sm p-5 text-center" style={{ borderRadius: '20px', background: '#fff' }}>
            <LuMessageSquare size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
            <h5 className="fw-bold text-dark mb-1">No Reviews Found</h5>
            <p className="text-muted small">You haven't submitted any garage or helper reviews yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map((rev) => {
              const vehicleInfo = rev.jobId?.requestId?.vehicleId;
              const dateStr = new Date(rev.createdAt).toLocaleDateString();
              return (
                <div 
                  key={rev._id} 
                  className="card border-0 shadow-sm p-4" 
                  style={{ borderRadius: '16px', background: '#fff', borderLeft: '4px solid #ff5c1a' }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      {rev.garageId && (
                        <h6 className="fw-bold mb-0 text-dark">
                          Garage: <span style={{ color: '#ff5c1a' }}>{rev.garageId.name}</span>
                        </h6>
                      )}
                      {rev.helperId && (
                        <h6 className="fw-bold mb-0 text-dark">
                          Helper: <span style={{ color: '#ff5c1a' }}>{rev.helperId.name}</span>
                        </h6>
                      )}
                      <p className="text-muted small mb-0 mt-1 d-flex align-items-center gap-1">
                        <LuCalendar size={13} /> {dateStr}
                      </p>
                    </div>
                    <div className="d-flex">
                      {renderStars(rev.rating)}
                    </div>
                  </div>

                  <p className="text-dark bg-light p-3 rounded" style={{ fontSize: '14.5px', lineHeight: '1.6', margin: '0 0 16px' }}>
                    "{rev.comment || 'No comment provided.'}"
                  </p>

                  {vehicleInfo && (
                    <div className="d-flex align-items-center gap-2 border-top pt-3 text-muted small">
                      <span>Vehicle:</span>
                      <strong className="text-dark">{vehicleInfo.make} {vehicleInfo.model}</strong>
                      <LuChevronRight size={14} />
                      <span>Job ID:</span>
                      <strong className="text-dark">#{rev.jobId?._id?.slice(-8).toUpperCase()}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyReviews;
