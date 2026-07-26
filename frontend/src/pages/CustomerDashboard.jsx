import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LuCar,
  LuWrench,
  LuFileText,
  LuClock,
  LuUser,
  LuChevronRight,
  LuPlus,
  LuList,
  LuDollarSign
} from 'react-icons/lu';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useNotification();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeRequests: 0,
    pendingQuotes: 0,
    totalServices: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/api/requests/customer/dashboard-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
        setUpcomingAppointments(data.upcomingAppointments || []);
      } else {
        toast.error(data.message || 'Failed to fetch dashboard statistics.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while loading dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'closed':
      case 'delivered':
        return 'badge bg-success text-white';
      case 'cancelled':
        return 'badge bg-danger text-white';
      case 'pending_payment':
      case 'quote_pending':
      case 'quote_sent':
        return 'badge bg-warning text-dark';
      default:
        return 'badge bg-info text-white';
    }
  };

  const getStatusText = (status) => {
    return status ? status.replace(/_/g, ' ').toUpperCase() : 'PENDING';
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="mt-3 text-secondary">Loading your dashboard...</h4>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Welcome Hero */}
      <div className="p-4 mb-4 rounded-4 text-white" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1">Hi, {user?.name || 'Customer'} 👋</h2>
            <p className="mb-0 opacity-80" style={{ fontSize: '0.95rem', color: '#e0e7ff' }}>
              Welcome back to your Garro portal. Manage your vehicles and service requests in one place.
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/get-quote" className="btn btn-light d-flex align-items-center gap-2 rounded-3 fw-semibold px-3 py-2 shadow-sm">
              <LuPlus size={16} /> Schedule New Service
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="row g-3 mb-4">
        {/* Vehicles */}
        <div className="col-6 col-md-3">
          <div className="card h-100 border-0 rounded-4 shadow-sm p-3" style={{ background: '#ffffff' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 rounded-3" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <LuCar size={24} />
              </div>
              <div>
                <div className="text-secondary fw-semibold mb-0" style={{ fontSize: '0.85rem' }}>Total Vehicles</div>
                <h3 className="fw-bold mb-0 text-slate-800">{stats.totalVehicles}</h3>
              </div>
            </div>
          </div>
        </div>
        {/* Active Requests */}
        <div className="col-6 col-md-3">
          <div className="card h-100 border-0 rounded-4 shadow-sm p-3" style={{ background: '#ffffff' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 rounded-3" style={{ background: '#fef3c7', color: '#d97706' }}>
                <LuWrench size={24} />
              </div>
              <div>
                <div className="text-secondary fw-semibold mb-0" style={{ fontSize: '0.85rem' }}>Active Requests</div>
                <h3 className="fw-bold mb-0 text-slate-800">{stats.activeRequests}</h3>
              </div>
            </div>
          </div>
        </div>
        {/* Pending Quotes */}
        <div className="col-6 col-md-3">
          <div className="card h-100 border-0 rounded-4 shadow-sm p-3" style={{ background: '#ffffff' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 rounded-3" style={{ background: '#fee2e2', color: '#dc2626' }}>
                <LuFileText size={24} />
              </div>
              <div>
                <div className="text-secondary fw-semibold mb-0" style={{ fontSize: '0.85rem' }}>Pending Quotes</div>
                <h3 className="fw-bold mb-0 text-slate-800">{stats.pendingQuotes}</h3>
              </div>
            </div>
          </div>
        </div>
        {/* Total Services */}
        <div className="col-6 col-md-3">
          <div className="card h-100 border-0 rounded-4 shadow-sm p-3" style={{ background: '#ffffff' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 rounded-3" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <LuClock size={24} />
              </div>
              <div>
                <div className="text-secondary fw-semibold mb-0" style={{ fontSize: '0.85rem' }}>Total Services</div>
                <h3 className="fw-bold mb-0 text-slate-800">{stats.totalServices}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Activity & Appointments (Left side) */}
        <div className="col-lg-8">
          {/* Upcoming Appointments */}
          <div className="card border-0 rounded-4 shadow-sm p-4 mb-4" style={{ background: '#ffffff' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-slate-800 mb-0">Upcoming Appointments</h5>
              <span className="badge bg-primary text-white px-2.5 py-1 rounded-pill">Next up</span>
            </div>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-4 text-secondary">
                <LuClock size={36} className="text-slate-300 mb-2" />
                <p className="mb-0" style={{ fontSize: '0.9rem' }}>No upcoming bookings scheduled.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {upcomingAppointments.map(app => (
                  <div key={app._id} className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light border-0">
                    <div>
                      <div className="fw-semibold text-slate-800" style={{ fontSize: '0.95rem' }}>
                        {app.subCategory || app.serviceType.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
                        Vehicle: {app.vehicleId?.make} {app.vehicleId?.model} ({app.vehicleId?.year})
                      </div>
                      <div className="text-indigo-600 fw-medium mt-1" style={{ fontSize: '0.85rem' }}>
                        Scheduled: {new Date(app.preferredDate).toLocaleDateString('en-AE', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <Link to={`/track/${app._id}`} className="btn btn-outline-primary btn-sm rounded-2 px-3">
                      Track
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card border-0 rounded-4 shadow-sm p-4" style={{ background: '#ffffff' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-slate-800 mb-0">Recent Activity</h5>
              <Link to="/my-requests" className="text-primary fw-semibold" style={{ fontSize: '0.9rem', textDecoration: 'none' }}>
                View All
              </Link>
            </div>
            {recentActivity.length === 0 ? (
              <div className="text-center py-4 text-secondary">
                <LuList size={36} className="text-slate-300 mb-2" />
                <p className="mb-0" style={{ fontSize: '0.9rem' }}>No recent service requests found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-borderless align-middle mb-0">
                  <thead>
                    <tr className="text-secondary" style={{ fontSize: '0.85rem' }}>
                      <th className="px-0">Service / Vehicle</th>
                      <th>Last Updated</th>
                      <th>Status</th>
                      <th className="text-end px-0">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map(act => (
                      <tr key={act._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td className="px-0 py-3">
                          <div className="fw-semibold text-slate-800" style={{ fontSize: '0.9rem' }}>
                            {act.subCategory || act.serviceType.replace(/_/g, ' ').toUpperCase()}
                          </div>
                          <div className="text-secondary" style={{ fontSize: '0.8' }}>
                            {act.vehicleId?.make} {act.vehicleId?.model}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          {new Date(act.updatedAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(act.status)}>
                            {getStatusText(act.status)}
                          </span>
                        </td>
                        <td className="text-end px-0">
                          <Link to={`/track/${act._id}`} className="btn btn-light btn-sm rounded-2">
                            <LuChevronRight size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions (Right side) */}
        <div className="col-lg-4">
          <div className="card border-0 rounded-4 shadow-sm p-4" style={{ background: '#ffffff' }}>
            <h5 className="fw-bold text-slate-800 mb-3">Quick Actions</h5>
            <div className="d-flex flex-column gap-2">
              <Link to="/get-quote" className="btn btn-outline-primary w-100 text-start d-flex align-items-center justify-content-between p-3 rounded-3 shadow-none" style={{ transition: 'all 0.2s' }}>
                <div className="d-flex align-items-center gap-3">
                  <LuPlus size={20} />
                  <div>
                    <div className="fw-semibold text-slate-800" style={{ fontSize: '0.9rem' }}>Schedule New Service</div>
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Request custom/emergency quotes</div>
                  </div>
                </div>
                <LuChevronRight size={16} className="text-secondary" />
              </Link>

              <Link to="/my-requests" className="btn btn-outline-primary w-100 text-start d-flex align-items-center justify-content-between p-3 rounded-3 shadow-none" style={{ transition: 'all 0.2s' }}>
                <div className="d-flex align-items-center gap-3">
                  <LuList size={20} />
                  <div>
                    <div className="fw-semibold text-slate-800" style={{ fontSize: '0.9rem' }}>View All Requests</div>
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Track list of all bookings</div>
                  </div>
                </div>
                <LuChevronRight size={16} className="text-secondary" />
              </Link>

              <Link to="/my-requests" state={{ activeTab: 'quotes' }} className="btn btn-outline-primary w-100 text-start d-flex align-items-center justify-content-between p-3 rounded-3 shadow-none" style={{ transition: 'all 0.2s' }}>
                <div className="d-flex align-items-center gap-3">
                  <LuFileText size={20} />
                  <div>
                    <div className="fw-semibold text-slate-800" style={{ fontSize: '0.9rem' }}>Check My Quotes</div>
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Approve or review garage prices</div>
                  </div>
                </div>
                <LuChevronRight size={16} className="text-secondary" />
              </Link>

              <Link to="/my-vehicles" className="btn btn-outline-primary w-100 text-start d-flex align-items-center justify-content-between p-3 rounded-3 shadow-none" style={{ transition: 'all 0.2s' }}>
                <div className="d-flex align-items-center gap-3">
                  <LuCar size={20} />
                  <div>
                    <div className="fw-semibold text-slate-800" style={{ fontSize: '0.9rem' }}>Manage Vehicles</div>
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Add or update your garage assets</div>
                  </div>
                </div>
                <LuChevronRight size={16} className="text-secondary" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
