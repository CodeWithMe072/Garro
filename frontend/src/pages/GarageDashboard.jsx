import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const GarageDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { toast } = useNotification();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/garages/portal/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch dashboard data.');
      }
      setStats(data.stats);
      setRecentJobs(data.recentJobs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRespond = async (jobId, action) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/garages/portal/jobs/${jobId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to respond to job.');
      }
      toast.success(data.message || `Job ${action}ed successfully!`);
      fetchDashboardData(); // Reload stats and recent jobs
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }} role="status"></div>
          <p style={{ marginTop: '16px', color: '#94a3b8' }}>Loading Garage Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      color: '#f8fafc',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.025em' }}>
              Welcome back, Partner
            </h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
              Manage repair cards, quotes, and payouts.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/garage-portal/jobs" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '10px 20px',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'background 0.2s'
            }}>
              📋 View Job Cards
            </Link>
            <Link to="/garage-portal/earnings" style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              borderRadius: '12px',
              padding: '10px 20px',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 4px 15px rgba(249, 115, 22, 0.2)'
            }}>
              💰 Earnings Ledger
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {/* Active Jobs */}
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Active Repairs</span>
                <span style={{ fontSize: '20px' }}>⚡</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800' }}>{stats.activeJobs}</div>
              <div style={{ color: '#f97316', fontSize: '12px', marginTop: '6px', fontWeight: '600' }}>In-Progress & Picked Up</div>
            </div>

            {/* Total Earnings */}
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Total Earnings</span>
                <span style={{ fontSize: '20px' }}>💰</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>AED {stats.totalEarnings.toFixed(2)}</div>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px' }}>Paid / Settled Invoices</div>
            </div>

            {/* Completed Repairs */}
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Completed Repairs</span>
                <span style={{ fontSize: '20px' }}>✅</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800' }}>{stats.completedJobs}</div>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px' }}>Delivered & Closed</div>
            </div>

            {/* Garage Rating */}
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Garage Rating</span>
                <span style={{ fontSize: '20px' }}>⭐</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#fbbf24' }}>{stats.avgRating} <span style={{ fontSize: '16px', color: '#94a3b8' }}>/ 5.0</span></div>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px' }}>Based on {stats.reviewsCount} reviews</div>
            </div>
          </div>
        )}

        {/* Recent Job Offers / Alerts */}
        <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔔 Live Job Assignments & Leads
          </h3>

          {recentJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>📭</span>
              No recent jobs assigned to your garage. Keep this window open to receive real-time notifications!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>
                    <th style={{ padding: '12px 16px' }}>JOB ID</th>
                    <th style={{ padding: '12px 16px' }}>VEHICLE</th>
                    <th style={{ padding: '12px 16px' }}>SERVICE TYPE</th>
                    <th style={{ padding: '12px 16px' }}>DESCRIPTION</th>
                    <th style={{ padding: '12px 16px' }}>ASSIGN STATUS</th>
                    <th style={{ padding: '12px 16px' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map(job => (
                    <tr key={job._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                      <td style={{ padding: '16px', fontWeight: '600' }}>
                        #{job._id.slice(-6).toUpperCase()}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {job.requestId?.vehicleId ? (
                          `${job.requestId.vehicleId.make} ${job.requestId.vehicleId.model} (${job.requestId.vehicleId.year})`
                        ) : 'Unknown Vehicle'}
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                          {job.requestId?.vehicleId?.registrationNumber}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          background: 'rgba(249, 115, 22, 0.1)',
                          color: '#f97316',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase'
                        }}>
                          {job.requestId?.subCategory || job.requestId?.serviceType?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#cbd5e1', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {job.requestId?.description}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {job.acceptedByGarage === 'pending' ? (
                          <span style={{ color: '#fbbf24', fontWeight: '600' }}>⏳ Response Needed</span>
                        ) : job.acceptedByGarage === 'accepted' ? (
                          <span style={{ color: '#10b981', fontWeight: '600' }}>✓ Accepted</span>
                        ) : (
                          <span style={{ color: '#f87171', fontWeight: '600' }}>✗ Declined</span>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {job.acceptedByGarage === 'pending' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleRespond(job._id, 'accept')}
                              style={{
                                background: '#10b981',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespond(job._id, 'decline')}
                              style={{
                                background: '#ef4444',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => navigate(`/garage-portal/jobs`)}
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              color: 'white',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Manage Card
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GarageDashboard;
