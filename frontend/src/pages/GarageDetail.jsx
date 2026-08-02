import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const GarageDetail = () => {
  const { id } = useParams();
  const [garage, setGarage] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { toast } = useNotification();
  
  const [reviewsList, setReviewsList] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const serviceDetailsMap = {
    minor_service: { id: 1, service: { name: 'Minor Service', get_category_display: 'Maintenance' }, duration_hours: 2, price: 299 },
    major_service: { id: 2, service: { name: 'Major Service', get_category_display: 'Maintenance' }, duration_hours: 4, price: 599 },
    ac_repair: { id: 3, service: { name: 'AC Gas Topup & Repair', get_category_display: 'A/C' }, duration_hours: 1, price: 149 },
    brake_repair: { id: 4, service: { name: 'Brake Pad Replacement', get_category_display: 'Repair' }, duration_hours: 2, price: 199 },
    electrical: { id: 5, service: { name: 'Electrical Diagnostics & Repair', get_category_display: 'Electrical' }, duration_hours: 3, price: 249 },
    diagnostics: { id: 6, service: { name: 'Engine Diagnostics', get_category_display: 'Diagnostics' }, duration_hours: 1, price: 99 },
    battery: { id: 7, service: { name: 'Battery Diagnostics & Change', get_category_display: 'Battery' }, duration_hours: 0.5, price: 349 },
    other: { id: 8, service: { name: 'General Mechanical Repair', get_category_display: 'Repair' }, duration_hours: 3, price: 399 }
  };

  const fetchReviews = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/reviews/garage/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setReviewsList(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  useEffect(() => {
    const fetchGarage = async () => {
      try {
                const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/garages/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setGarage(data.garage);
        }
      } catch (err) {
        console.error('Failed to fetch garage:', err);
      } finally {
        setLoading(false);
      }
    };
    window.scrollTo(0, 0);
    fetchGarage();
  }, [id]);

  useEffect(() => {
    fetchReviews();
    // Real-time updates: poll reviews every 5 seconds
    const interval = setInterval(fetchReviews, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          garageId: id,
          rating: Number(newRating),
          comment: newComment
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Review submitted successfully!');
        setNewComment('');
        setNewRating(5);
        fetchReviews(); // Refresh immediately
      } else {
        toast.error(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error('Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const garage_services = garage && garage.services
    ? garage.services.map(s => serviceDetailsMap[s] || { id: s, service: { name: s, get_category_display: 'Service' }, duration_hours: 2, price: 299 })
    : [];

  const avg_rating = garage ? (garage.rating || 4.8) : 4.8;


  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="mt-3">Loading garage details...</h5>
      </div>
    );
  }

  if (!garage) {
    return (
      <div className="container py-5 text-center">
        <h4>Garage not found</h4>
        <Link to="/search" className="btn btn-primary-garro mt-3">Back to Search</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/home" className="text-decoration-none">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/garages" className="text-decoration-none">Garages</Link></li>
          <li className="breadcrumb-item active">{garage.name}</li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* Main Info */}
        <div className="col-lg-8">
          {/* Garage Header Card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="garage-detail-banner d-flex align-items-center justify-content-center">
              <span style={{ fontSize: '5rem' }}>🏪</span>
            </div>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h3 className="fw-bold mb-1">{garage.name}</h3>
                  <p className="text-muted mb-2">
                    <i className="bi bi-geo-alt me-1"></i>
                    {garage.areas ? garage.areas.join(', ') : 'Dubai'}
                    {garage.address && ` — ${garage.address}`}
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-warning text-dark py-2 px-3">⭐ {garage.rating || 0} / 5</span>
                    <span className="badge bg-light text-dark py-2 px-3">124 Reviews</span>
                    <span className="badge bg-success py-2 px-3">✅ Free Pickup &amp; Drop</span>
                    <span className="badge bg-info text-dark py-2 px-3">🕐 08:00 AM – 08:00 PM</span>
                  </div>
                </div>
                <Link to={`/garage/${garage._id}/book`} className="btn btn-primary-garro px-4 py-2 flex-shrink-0">Book Now</Link>
              </div>

              {(garage.phone || garage.website) && (
                <div className="mt-3 pt-3 border-top d-flex flex-wrap gap-3">
                  {garage.phone && (
                    <a href={`tel:${garage.phone}`} className="text-decoration-none text-muted small"><i className="bi bi-telephone me-1"></i>{garage.phone}</a>
                  )}
                  {garage.website && (
                    <a href={garage.website} target="_blank" rel="noreferrer" className="text-decoration-none text-muted small"><i className="bi bi-globe me-1"></i>Website</a>
                  )}
                </div>
              )}

              {garage.description && (
                <div className="mt-3">
                  <p className="text-muted">{garage.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Services Offered */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0 py-3 px-4">
              <h5 className="fw-bold mb-0">Services &amp; Pricing</h5>
            </div>
            <div className="card-body p-0">
              {garage_services.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Service</th>
                        <th>Category</th>
                        <th>Duration</th>
                        <th>Price</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {garage_services.map(gs => (
                        <tr key={gs.id}>
                          <td className="ps-4 fw-medium">{gs.service.name}</td>
                          <td><span className="badge bg-light text-dark">{gs.service.get_category_display}</span></td>
                          <td className="text-muted small">{gs.duration_hours}h</td>
                          <td className="fw-semibold" style={{ color: '#ff6b35' }}>AED {gs.price}</td>
                          <td><Link to={`/garage/${garage._id}/book`} className="btn btn-sm btn-outline-primary">Book</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-muted">
                  <p>Contact the garage for service details and pricing.</p>
                  {garage.phone && <a href={`tel:${garage.phone}`} className="btn btn-primary-garro">Call Now</a>}
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Customer Reviews</h5>
              <span className="badge bg-warning text-dark">⭐ {avg_rating.toFixed(1)} avg</span>
            </div>
            <div className="card-body p-4">
              {/* Add review */}
              {isAuthenticated ? (
                <div className="mb-4 p-3 bg-light rounded-3">
                  <h6 className="fw-semibold mb-3">Write a Review</h6>
                  <form onSubmit={handleSubmitReview}>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label small">Rating</label>
                        <select
                          className="form-select"
                          value={newRating}
                          onChange={(e) => setNewRating(e.target.value)}
                          required
                        >
                          <option value="5">5 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="3">3 Stars</option>
                          <option value="2">2 Stars</option>
                          <option value="1">1 Star</option>
                        </select>
                      </div>
                      <div className="col-md-8">
                        <label className="form-label small">Your Review</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          required
                        ></textarea>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="btn btn-primary-garro btn-sm mt-2"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-light rounded-3 text-center">
                  <p className="small text-muted mb-0">Please <Link to="/login">login</Link> to write a review.</p>
                </div>
              )}

              {/* Review list */}
              {reviewsList.length > 0 ? reviewsList.map((review, index) => {
                const author = review.customerId || {};
                const displayName = author.first_name
                  ? `${author.first_name} ${author.last_name || ''}`.trim()
                  : (author.email || 'Anonymous User');
                const initial = (author.first_name || author.email || 'A').charAt(0).toUpperCase();
                const formattedDate = review.createdAt
                  ? new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Just now';

                return (
                  <div key={review._id || review.id} className={`review-item ${index !== reviewsList.length - 1 ? 'border-bottom pb-3 mb-3' : ''}`}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex gap-2">
                        <div className="reviewer-avatar">{initial}</div>
                        <div>
                          <div className="fw-semibold small">{displayName}</div>
                          <div className="stars small">
                            {'⭐'.repeat(review.rating)}
                          </div>
                        </div>
                      </div>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{formattedDate}</span>
                    </div>
                    <p className="text-muted small mt-2 mb-0">{review.comment}</p>
                  </div>
                );
              }) : (
                <p className="text-muted text-center py-3">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Quick Book Card */}
          <div className="card border-0 shadow-sm mb-4 sticky-top" style={{ top: '80px' }}>
            <div className="card-header text-white border-0 py-3 px-4" style={{ background: 'linear-gradient(135deg,#ff6b35,#f7a23a)', borderRadius: '12px 12px 0 0' }}>
              <h5 className="mb-0">Book This Garage</h5>
            </div>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted small">Rating</span>
                <span className="fw-semibold">⭐ {garage.rating || 0} / 5</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted small">Pickup Available</span>
                <span className="fw-semibold">✅ Yes</span>
              </div>
              <div className="d-flex justify-content-between mb-4">
                <span className="text-muted small">Working Hours</span>
                <span className="fw-semibold small">08:00 AM – 08:00 PM</span>
              </div>
              <Link to={`/garage/${garage._id}/book`} className="btn btn-primary-garro w-100 py-2 fw-semibold">Book Now</Link>
              {garage.phone && (
                <a href={`tel:${garage.phone}`} className="btn btn-outline-secondary w-100 py-2 mt-2">
                  <i className="bi bi-telephone me-1"></i>Call Garage
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GarageDetail;
