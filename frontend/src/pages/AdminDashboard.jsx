import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Chart from 'chart.js/auto';
import { io } from 'socket.io-client';
import CustomDropdown from '../components/CustomDropdown';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useNotification();
  const revenueChartRef = useRef(null);
  const statusChartRef = useRef(null);

  const [dashboardStats, setDashboardStats] = useState({
    newLeads: 0,
    assigned: 0,
    inService: 0,
    systemMode: 'manual'
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [revenueHistory, setRevenueHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [garagesList, setGaragesList] = useState([]);
  const [availableHelpersList, setAvailableHelpersList] = useState([]);
  const [assignGarageId, setAssignGarageId] = useState('');
  const [assignHelperId, setAssignHelperId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const [garagesCount, setGaragesCount] = useState(12);
  const [helpersCount, setHelpersCount] = useState(45);
  const [totalBookingsCount, setTotalBookingsCount] = useState(84);

  const refreshData = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const statsRes = await fetch(`${API_BASE}/api/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      
      const reqRes = await fetch(`${API_BASE}/api/requests?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reqData = await reqRes.json();

      const garagesRes = await fetch(`${API_BASE}/api/garages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const garagesData = await garagesRes.json();

      const helpersRes = await fetch(`${API_BASE}/api/helpers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const helpersData = await helpersRes.json();

      const revRes = await fetch(`${API_BASE}/api/admin/reports/revenue?months=6`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const revData = await revRes.json();

      if (statsRes.ok && statsData.success) {
        setDashboardStats(statsData);
      }
      if (reqRes.ok && reqData.success) {
        setRecentBookings(reqData.requests || []);
        setTotalBookingsCount(reqData.total || reqData.requests.length || 0);
      }
      if (garagesRes.ok && garagesData.success) {
        setGaragesList(garagesData.garages || []);
        setGaragesCount(garagesData.garages.length);
      }
      if (helpersRes.ok && helpersData.success) {
        setHelpersCount(helpersData.helpers.length);
      }
      if (revRes.ok && revData.success) {
        setRevenueHistory(revData.revenue || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    fetchData();

    // Socket.IO Listeners
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(API_BASE);

    socket.on('request:new', (data) => {
      console.log('Real-time new request received:', data);
      refreshData();
    });

    socket.on('request:cancelled', (data) => {
      console.log('Real-time request cancelled received:', data);
      refreshData();
    });

    socket.on('request:assigned', (data) => {
      console.log('Real-time request assigned received:', data);
      refreshData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenAssignModal = async (req) => {
    setSelectedRequest(req);
    setAssignGarageId('');
    setAssignHelperId('');
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const garagesRes = await fetch(`${API_BASE}/api/garages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const garagesData = await garagesRes.json();

      const helpersRes = await fetch(`${API_BASE}/api/admin/available-helpers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const helpersData = await helpersRes.json();

      if (garagesRes.ok && garagesData.success) {
        setGaragesList(garagesData.garages || []);
      }
      if (helpersRes.ok && helpersData.success) {
        setAvailableHelpersList(helpersData.helpers || []);
      }
    } catch (err) {
      console.error('Failed to fetch modal lists:', err);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignGarageId || !assignHelperId) {
      toast.error("Please select both a garage and a helper.");
      return;
    }

    setSubmittingAssign(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/api/admin/requests/${selectedRequest._id}/manual-assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          garageId: assignGarageId,
          helperId: assignHelperId
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Request manual assignment completed successfully!");
        setSelectedRequest(null);
        refreshData();
      } else {
        toast.error(data.message || "Failed to complete manual assignment.");
      }
    } catch (err) {
      console.error("Error during manual assignment:", err);
      toast.error("Error during assignment.");
    } finally {
      setSubmittingAssign(false);
    }
  };

  useEffect(() => {
    let revenueChartInst = null;
    let statusChartInst = null;

    if (revenueChartRef.current) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      let dataPoints = [12000, 19000, 15000, 22000, 18000, 25000];

      if (revenueHistory && revenueHistory.length > 0) {
        labels = revenueHistory.map(item => {
          const m = item._id.month;
          const y = item._id.year;
          return `${monthNames[m - 1]} ${y}`;
        });
        dataPoints = revenueHistory.map(item => item.total);
      }

      revenueChartInst = new Chart(revenueChartRef.current, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Revenue (AED)',
            data: dataPoints,
            borderColor: '#ff5c1a',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(255, 92, 26, 0.1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }

    if (statusChartRef.current) {
      statusChartInst = new Chart(statusChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['New Leads', 'Assigned', 'In Service', 'Completed'],
          datasets: [{
            data: [
              dashboardStats.newLeads || 0,
              dashboardStats.assigned || 0,
              dashboardStats.inService || 0,
              dashboardStats.completed || 0
            ],
            backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }

    return () => {
      if (revenueChartInst) revenueChartInst.destroy();
      if (statusChartInst) statusChartInst.destroy();
    };
  }, [dashboardStats, revenueHistory]);

  // Mock static layout counts combined with backend counts
  const stats = {
    total_garages: garagesCount,
    today_bookings: (dashboardStats.newLeads || 0) + (dashboardStats.assigned || 0) + (dashboardStats.inService || 0),
    completed_today: dashboardStats.completed || 0,
    pending_bookings: dashboardStats.newLeads || 0,
    month_revenue: dashboardStats.monthlyRevenue || 0,
    week_revenue: Math.round((dashboardStats.monthlyRevenue || 0) / 4),
    total_users: 28,
    total_staff: helpersCount,
    avg_rating: 4.8,
    new_reviews: 12,
    unread_messages: dashboardStats.pendingComplaints || 0,
    total_bookings: totalBookingsCount
  };

  return (
    <div className="dash-wrapper">
      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        <span className="sidebar-label">Overview</span>
        <div className="sidebar-section">
          <Link to="/admin" className="sidebar-link active">
            <span className="icon">📊</span>Dashboard
          </Link>
        </div>

        <span className="sidebar-label">Operations</span>
        <div className="sidebar-section">
          <Link to="/admin/manage-garages" className="sidebar-link">
            <span className="icon">🏪</span>Manage Garages
          </Link>
          <Link to="/search" className="sidebar-link">
            <span className="icon">🔍</span>Find Garages
          </Link>
          <Link to="/my-bookings" className="sidebar-link">
            <span className="icon">📋</span>Bookings
            {stats.pending_bookings > 0 && <span className="sidebar-badge">{stats.pending_bookings}</span>}
          </Link>
        </div>

        <div className="sidebar-divider"></div>
        <span className="sidebar-label">People</span>
        <div className="sidebar-section">
          <Link to="/admin/manage-staff" className="sidebar-link">
            <span className="icon">👤</span>All Users
          </Link>
          <Link to="/admin/staff" className="sidebar-link">
            <span className="icon">👔</span>Staff View
          </Link>
          <Link to="/admin/manage-staff" className="sidebar-link">
            <span className="icon">👥</span>Manage Staff
          </Link>
        </div>

        <div className="sidebar-divider"></div>
        <div className="sidebar-section">
          <Link to="/home" className="sidebar-link">
            <span className="icon">🌐</span>Back to Site
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <div className="dash-title">Good Morning, {user?.firstName || 'Admin'} 👋</div>
            <div className="dash-subtitle">Here's what's happening at Garro today</div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="stats-grid">
          <div className="stat-card orange">
            <div className="stat-icon">🏪</div>
            <div className="stat-value">{stats.total_garages}</div>
            <div className="stat-label">Active Garages</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-icon">📅</div>
            <div className="stat-value">{stats.today_bookings}</div>
            <div className="stat-label">Today's Bookings</div>
            <div className="stat-sub">{stats.completed_today} completed</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-icon">⏳</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.pending_bookings}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon">💰</div>
            <div className="stat-value" style={{ fontSize: '20px' }}>AED {stats.month_revenue}</div>
            <div className="stat-label">Month Revenue</div>
            <div className="stat-sub">AED {stats.week_revenue} this week</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon">👤</div>
            <div className="stat-value">{stats.total_users}</div>
            <div className="stat-label">Customers</div>
            <div className="stat-sub">{stats.total_staff} staff</div>
          </div>
          <div className="stat-card pink">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{stats.avg_rating}</div>
            <div className="stat-label">Avg Rating</div>
            <div className="stat-sub">{stats.new_reviews} new this week</div>
          </div>
          <div className="stat-card red">
            <div className="stat-icon">💬</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>{stats.unread_messages}</div>
            <div className="stat-label">Unread Messages</div>
          </div>
          <div className="stat-card teal">
            <div className="stat-icon">📋</div>
            <div className="stat-value">{stats.total_bookings}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
        </div>

        {/* ── CHARTS ── */}
        <div className="charts-row">
          <div className="chart-card">
            <h4>Revenue & Bookings — Last 6 Months</h4>
            <div className="chart-sub">Completed bookings revenue trend</div>
            <div style={{ height: '200px' }}>
              <canvas ref={revenueChartRef}></canvas>
            </div>
          </div>
          <div className="chart-card">
            <h4>Booking Status</h4>
            <div className="chart-sub">Current distribution</div>
            <div style={{ height: '200px' }}>
              <canvas ref={statusChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* ── DATA TABLES ── */}
        <div className="data-row">
          <div className="data-card">
            <div className="data-head">
              <h4>🕐 Recent Bookings</h4>
              <a href="#">View all →</a>
            </div>
            <table className="g-table">
              <tbody>
                {recentBookings.map(b => {
                  const userDisplayName = b.userId ? b.userId.name : 'Unknown User';
                  const garageDisplayName = b.garageId ? b.garageId.name : 'Pending Assignment';
                  const statusDisplay = b.status.charAt(0).toUpperCase() + b.status.slice(1);
                  const price = b.estimatedCost || 299;

                  return (
                    <tr key={b._id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '11px', background: '#f1f5f9', padding: '2px 7px', borderRadius: '5px' }}>
                          #{b._id.substring(18)}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', fontSize: '13px' }}>{userDisplayName}</div>
                        <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>{garageDisplayName}</div>
                      </td>
                      <td>
                        <span className={`sbadge ${b.status}`}>{statusDisplay}</span>
                        {b.status === 'new' && (
                          <button 
                            onClick={() => handleOpenAssignModal(b)} 
                            className="btn btn-sm btn-outline-primary ms-2 py-0 px-2"
                            style={{ fontSize: '10px', borderRadius: '4px', border: '1px solid #ff5c1a', color: '#ff5c1a', background: 'none', fontWeight: 'bold' }}
                          >
                            Assign
                          </button>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '700', fontSize: '13px' }}>AED {price}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Assignment Modal Overlay */}
      {selectedRequest && (
        <div className="modal-overlay-custom" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="modal-card-custom" style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            width: '100%',
            maxWidth: '500px',
            padding: '30px',
            border: '1px solid #e2e8f0'
          }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Assign Garage &amp; Helper</h4>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="btn-close"
                style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div className="mb-3 p-3 bg-light rounded-3">
              <div className="small text-muted fw-semibold">Request details</div>
              <div className="fw-semibold text-dark mt-1">{selectedRequest.userId?.name || 'Unknown User'}</div>
              <div className="small text-secondary">{selectedRequest.vehicleId ? `${selectedRequest.vehicleId.make} ${selectedRequest.vehicleId.model} (${selectedRequest.vehicleId.year})` : 'Unknown Vehicle'}</div>
              <div className="small text-secondary mt-1">Issue: {selectedRequest.description}</div>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Select Garage *</label>
                <CustomDropdown
                  name="garageId"
                  placeholder="Choose Garage..."
                  options={garagesList.map(g => ({
                    value: g._id,
                    label: `${g.name} (${g.areas ? g.areas.join(', ') : 'Dubai'})`
                  }))}
                  value={assignGarageId}
                  onChange={(val) => {
                    setAssignGarageId(val);
                    setAssignHelperId('');
                  }}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Select Helper *</label>
                <CustomDropdown
                  name="helperId"
                  placeholder={assignGarageId ? "Choose Helper..." : "Please select a garage first"}
                  options={availableHelpersList
                    .filter(h => h.garageId?._id === assignGarageId)
                    .map(h => ({
                      value: h._id,
                      label: `${h.name} (⭐ ${h.rating || 5} / 5)`
                    }))
                  }
                  value={assignHelperId}
                  onChange={setAssignHelperId}
                  required
                />
                {!assignGarageId && <p className="text-muted small mt-1">Please select a garage first to view available helpers.</p>}
                {assignGarageId && availableHelpersList.filter(h => h.garageId?._id === assignGarageId).length === 0 && (
                  <p className="text-danger small mt-1">No available helpers found for this garage.</p>
                )}
              </div>

              <div className="d-flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedRequest(null)}
                  className="btn btn-light w-100 py-2.5 fw-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary-garro w-100 py-2.5 fw-semibold text-white"
                  disabled={submittingAssign || !assignGarageId || !assignHelperId}
                >
                  {submittingAssign ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
