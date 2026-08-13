import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import GarageSidebar from '../components/GarageSidebar';
import {
  LuZap,
  LuDollarSign,
  LuCircleCheck,
  LuStar,
  LuBell,
  LuCar,
  LuCheck,
  LuX,
  LuChevronRight,
  LuWrench
} from 'react-icons/lu';

const GarageDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { toast } = useNotification();
  const { lang } = useLanguage();
  const navigate = useNavigate();

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
      setRecentJobs(data.recentJobs || []);
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
      fetchDashboardData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const garageName = user?.name || user?.firstName || 'Partner';

  if (loading) {
    return (
      <div className="staff-wrapper">
        <GarageSidebar activeJobsCount={0} />
        <main className="staff-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status"></div>
            <p className="mt-3 text-muted fw-semibold">Loading Garage Dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="staff-wrapper">
      {/* ── SIDEBAR ── */}
      <GarageSidebar activeJobsCount={stats?.activeJobs || 0} />

      {/* ── MAIN CONTENT ── */}
      <main className="staff-main">
        {/* Header */}
        <div className="dash-header mb-4">
          <div>
            <div className="dash-title">
              {lang === 'ar' ? 'لوحة تحكم شريك الكراج' : 'Garage Partner Dashboard'}
            </div>
            <div className="dash-subtitle">
              {lang === 'ar'
                ? `مرحباً بعودتك، ${garageName}! إدارة بطاقات الإصلاح، الأسعار، والدفعات.`
                : `Welcome back, ${garageName}! Manage repair cards, quotes, and payouts.`}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="stats-grid mb-4">
            {/* Active Repairs */}
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold text-uppercase">Active Repairs</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LuZap size={18} />
                </div>
              </div>
              <div className="h2 fw-bold text-dark mb-1">{stats.activeJobs}</div>
              <div className="small fw-semibold" style={{ color: '#d97706' }}>In-Progress &amp; Picked Up</div>
            </div>

            {/* Total Earnings */}
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold text-uppercase">Total Earnings</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LuDollarSign size={18} />
                </div>
              </div>
              <div className="h2 fw-bold mb-1" style={{ color: '#059669' }}>
                AED {stats.totalEarnings ? stats.totalEarnings.toFixed(2) : '0.00'}
              </div>
              <div className="small text-muted fw-semibold">Paid / Settled Invoices</div>
            </div>

            {/* Completed Repairs */}
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold text-uppercase">Completed Repairs</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LuCircleCheck size={18} />
                </div>
              </div>
              <div className="h2 fw-bold text-dark mb-1">{stats.completedJobs}</div>
              <div className="small text-muted fw-semibold">Delivered &amp; Closed</div>
            </div>

            {/* Garage Rating */}
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold text-uppercase">Garage Rating</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fffef0', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LuStar size={18} />
                </div>
              </div>
              <div className="h2 fw-bold mb-1" style={{ color: '#d97706' }}>
                {stats.avgRating} <span className="fs-6 text-muted font-normal">/ 5.0</span>
              </div>
              <div className="small text-muted fw-semibold">Based on {stats.reviewsCount || 0} reviews</div>
            </div>
          </div>
        )}

        {/* Live Job Assignments & Leads Card */}
        <div className="schedule-card">
          <div className="schedule-head d-flex justify-content-between align-items-center mb-3">
            <h4 className="m-0 d-flex align-items-center gap-2 font-bold" style={{ fontSize: '17px', color: '#0f172a' }}>
              <LuBell className="text-primary-garro" size={18} />
              {lang === 'ar' ? 'مهام وأعمال البث المباشر' : 'Live Job Assignments & Leads'}
            </h4>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {recentJobs.length} {lang === 'ar' ? 'مهام متاحة' : 'assignments'}
            </span>
          </div>

          {recentJobs.length === 0 ? (
            <div className="text-center py-5">
              <LuWrench size={48} className="text-muted mb-3" style={{ opacity: 0.4 }} />
              <div className="fw-bold text-dark fs-6 mb-1">No pending job assignments</div>
              <div className="text-muted small">New job requests assigned to your garage will appear here in real-time.</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '12px 16px', borderRadius: '8px 0 0 8px' }}>JOB ID</th>
                    <th style={{ padding: '12px 16px' }}>VEHICLE</th>
                    <th style={{ padding: '12px 16px' }}>SERVICE TYPE</th>
                    <th style={{ padding: '12px 16px' }}>DESCRIPTION</th>
                    <th style={{ padding: '12px 16px' }}>ASSIGN STATUS</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', borderRadius: '0 8px 8px 0' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map(job => (
                    <tr key={job._id} style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a', borderRadius: '8px 0 0 8px' }}>
                        #{job._id.slice(-6).toUpperCase()}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div className="fw-bold text-dark" style={{ fontSize: '13.5px' }}>
                          <LuCar className="me-1 text-primary-garro" size={14} />
                          {job.requestId?.vehicleId ? (
                            `${job.requestId.vehicleId.make} ${job.requestId.vehicleId.model} (${job.requestId.vehicleId.year})`
                          ) : 'Unknown Vehicle'}
                        </div>
                        {job.requestId?.vehicleId?.registrationNumber && (
                          <div className="text-muted small">
                            Reg: {job.requestId.vehicleId.registrationNumber}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: '#fff4ef',
                          color: '#ff5c1a',
                          border: '1px solid #ffe2d5',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '800',
                          textTransform: 'uppercase'
                        }}>
                          {job.requestId?.subCategory || job.requestId?.serviceType?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', maxWidth: '240px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>
                          {job.requestId?.description || 'No description provided'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {job.acceptedByGarage === 'pending' ? (
                          <span className="badge bg-warning text-dark px-3 py-2 fw-bold" style={{ borderRadius: '8px', fontSize: '12px' }}>
                            ⏳ Response Needed
                          </span>
                        ) : job.acceptedByGarage === 'accepted' ? (
                          <span className="badge bg-success text-white px-3 py-2 fw-bold" style={{ borderRadius: '8px', fontSize: '12px' }}>
                            ✓ Accepted
                          </span>
                        ) : (
                          <span className="badge bg-danger text-white px-3 py-2 fw-bold" style={{ borderRadius: '8px', fontSize: '12px' }}>
                            ✗ Declined
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', borderRadius: '0 8px 8px 0' }}>
                        {job.acceptedByGarage === 'pending' ? (
                          <div className="d-inline-flex gap-2">
                            <button
                              onClick={() => handleRespond(job._id, 'accept')}
                              className="btn btn-sm btn-success fw-bold d-inline-flex align-items-center gap-1 px-3 py-1.5"
                              style={{ borderRadius: '8px', fontSize: '12.5px' }}
                            >
                              <LuCheck size={14} /> Accept
                            </button>
                            <button
                              onClick={() => handleRespond(job._id, 'decline')}
                              className="btn btn-sm btn-outline-danger fw-bold d-inline-flex align-items-center gap-1 px-3 py-1.5"
                              style={{ borderRadius: '8px', fontSize: '12.5px' }}
                            >
                              <LuX size={14} /> Decline
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => navigate(`/garage-portal/jobs`)}
                            className="btn btn-sm btn-light border fw-bold d-inline-flex align-items-center gap-1 px-3 py-1.5"
                            style={{ borderRadius: '8px', fontSize: '12.5px', color: '#0f172a' }}
                          >
                            Manage Card <LuChevronRight size={14} />
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
      </main>
    </div>
  );
};

export default GarageDashboard;
