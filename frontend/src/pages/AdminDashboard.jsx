import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import Chart from 'chart.js/auto';
import { io } from 'socket.io-client';
import CustomDropdown from '../components/CustomDropdown';
import {
  LuLayoutDashboard,
  LuStore,
  LuSearch,
  LuSettings,
  LuDollarSign,
  LuUsers,
  LuTriangleAlert,
  LuClipboardList,
  LuUser,
  LuBriefcase,
  LuGlobe,
  LuCalendar,
  LuHourglass,
  LuStar,
  LuMessageSquare,
  LuClock,
  LuCalendarDays,
  LuChevronLeft,
  LuChevronRight
} from 'react-icons/lu';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useNotification();
  const { t, lang, changeLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const revenueChartRef = useRef(null);
  const statusChartRef = useRef(null);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('admin_sidebar_collapsed', String(nextState));
  };

  const [catalogServices, setCatalogServices] = useState([]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/vehicles/catalog/services`);
        const data = await res.json();
        if (data.success && data.categories) {
          setCatalogServices(data.categories);
        }
      } catch (err) {
        console.error('Failed to load catalog services:', err);
      }
    };
    fetchCatalog();
  }, []);

  const getMatchingGarages = (req, garages) => {
    if (!req) return [];
    
    const reqSub = req.subCategory?.toLowerCase()?.trim() || req.serviceType?.toLowerCase()?.trim();
    let parentCatName = '';
    let parentCatSlug = '';
    
    for (const cat of catalogServices) {
      if (cat.slug?.toLowerCase()?.trim() === reqSub || cat.name?.toLowerCase()?.trim() === reqSub) {
        parentCatName = cat.name;
        parentCatSlug = cat.slug;
        break;
      }
      if (cat.subCategories) {
        const foundSub = cat.subCategories.find(sub => 
          sub.slug?.toLowerCase()?.trim() === reqSub || sub.name?.toLowerCase()?.trim() === reqSub
        );
        if (foundSub) {
          parentCatName = cat.name;
          parentCatSlug = cat.slug;
          break;
        }
      }
    }
    
    if (!parentCatName) {
      const sub = reqSub || '';
      if (sub.includes('minor') || sub.includes('oil') || sub.includes('mainten')) {
        parentCatName = 'General Maintenance';
        parentCatSlug = 'general_maintenance';
      } else if (sub.includes('ac') || sub.includes('aircond') || sub.includes('elect') || sub.includes('diagn') || sub.includes('inspect') || sub.includes('batter')) {
        parentCatName = 'Electrical & AC';
        parentCatSlug = 'electrical_ac';
      } else if (sub.includes('brake') || sub.includes('mechan')) {
        parentCatName = 'Mechanical Repair';
        parentCatSlug = 'mechanical_repair';
      } else {
        parentCatName = 'Mechanical Repair';
        parentCatSlug = 'mechanical_repair';
      }
    }

    const cleanParentName = parentCatName.toLowerCase().trim();
    const cleanParentSlug = parentCatSlug.toLowerCase().trim();
    const reqAddress = req.location?.address || '';
    const reqArea = reqAddress.includes(',') 
      ? reqAddress.split(',')[0].trim().toLowerCase() 
      : reqAddress.trim().toLowerCase();

    return garages.filter(g => {
      const supportsService = g.services && g.services.some(srv => {
        const cleanSrv = srv.toLowerCase().trim();
        return cleanSrv === cleanParentName || cleanSrv === cleanParentSlug || cleanSrv === reqSub || cleanSrv.includes(cleanParentName) || cleanParentName.includes(cleanSrv);
      });
      
      const coversArea = !reqArea || reqArea === 'self drop at garage' || (g.areas && g.areas.some(area => {
        const cleanArea = area.toLowerCase().trim();
        return reqArea.includes(cleanArea) || cleanArea.includes(reqArea);
      }));
      
      return supportsService && coversArea;
    });
  };

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
  const [assignDate, setAssignDate] = useState('');
  const [assignTime, setAssignTime] = useState('09:00');
  const [assignDuration, setAssignDuration] = useState('4');
  const [helperSchedule, setHelperSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);

  const [garagesCount, setGaragesCount] = useState(12);
  const [helpersCount, setHelpersCount] = useState(45);
  const [totalBookingsCount, setTotalBookingsCount] = useState(84);

  // Fetch helper schedule when helper or date changes
  useEffect(() => {
    if (!assignHelperId || !assignDate) {
      setHelperSchedule([]);
      setHasConflict(false);
      return;
    }
    const fetchSchedule = async () => {
      setScheduleLoading(true);
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/admin/helpers/${assignHelperId}/schedule?date=${assignDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const slots = data.success ? (data.slots || []) : [];
        setHelperSchedule(slots);
        if (assignTime && assignDuration) {
          const [h, m] = assignTime.split(':').map(Number);
          const proposedStart = h * 60 + m;
          const proposedEnd   = proposedStart + Number(assignDuration) * 60;
          const conflict = slots.some(slot => {
            const sStart = new Date(slot.startTime);
            const sEnd   = new Date(slot.endTime);
            const slotS  = sStart.getHours() * 60 + sStart.getMinutes();
            const slotE  = sEnd.getHours()   * 60 + sEnd.getMinutes();
            return proposedStart < slotE && proposedEnd > slotS;
          });
          setHasConflict(conflict);
        }
      } catch (err) {
        console.error('Failed to fetch helper schedule:', err);
      } finally {
        setScheduleLoading(false);
      }
    };
    fetchSchedule();
  }, [assignHelperId, assignDate, assignTime, assignDuration]);

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

  const downloadReport = async (reportType, format) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const endpoint = reportType === 'revenue' 
        ? `${API_BASE}/api/admin/reports/revenue/export?format=${format}&months=6`
        : `${API_BASE}/api/admin/reports/garages/export?format=${format}`;

      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to generate report export');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report.${format === 'xlsx' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Report export failed:', err);
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

    // Smart date pre-fill based on customer urgency
    let reqDate = new Date();
    const urgency = req.urgency || 'flexible';

    if (urgency === 'asap') {
      // ASAP: set to right now (today, current time rounded to next hour)
      reqDate = new Date();
      reqDate.setMinutes(0, 0, 0);
      reqDate.setHours(reqDate.getHours() + 1);
    } else if (urgency === 'today') {
      // Today: use today's date but keep a reasonable start time (next 2 hours)
      reqDate = new Date();
      reqDate.setMinutes(0, 0, 0);
      reqDate.setHours(reqDate.getHours() + 2);
    } else if (req.preferredDate) {
      // This week / flexible: use customer's preferred date
      reqDate = new Date(req.preferredDate);
    }

    const fmt = (n) => String(n).padStart(2, '0');
    setAssignDate(`${reqDate.getFullYear()}-${fmt(reqDate.getMonth() + 1)}-${fmt(reqDate.getDate())}`);
    setAssignTime(`${fmt(reqDate.getHours())}:${fmt(reqDate.getMinutes())}`);

    // Smart duration based on urgency
    setAssignDuration(urgency === 'asap' ? '2' : '4');

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const garagesRes = await fetch(`${API_BASE}/api/garages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const garagesData = await garagesRes.json();

      const helpersRes = await fetch(`${API_BASE}/api/admin/available-helpers?requestId=${req._id}`, {
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
          helperId: assignHelperId,
          scheduledDate: assignDate,
          scheduledTime: assignTime,
          estimatedDuration: assignDuration
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
    <div className={`dash-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        <div className="sidebar-toggle-container">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar} title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
            {isCollapsed ? <LuChevronRight /> : <LuChevronLeft />}
          </button>
        </div>

        <span className="sidebar-label">{t('overview')}</span>
        <div className="sidebar-section">
          <Link to="/admin" className="sidebar-link active">
            <span className="icon"><LuLayoutDashboard /></span>
            <span className="link-text">{t('dashboard')}</span>
          </Link>
        </div>

        <span className="sidebar-label">{t('operations')}</span>
        <div className="sidebar-section">
          <Link to="/admin/manage-garages" className="sidebar-link">
            <span className="icon"><LuStore /></span>
            <span className="link-text">{t('manage_garages')}</span>
          </Link>
          <Link to="/search" className="sidebar-link">
            <span className="icon"><LuSearch /></span>
            <span className="link-text">{t('find_garages')}</span>
          </Link>
          <Link to="/admin/catalog" className="sidebar-link">
            <span className="icon"><LuSettings /></span>
            <span className="link-text">{t('system_catalog')}</span>
          </Link>
          <Link to="/admin/quote-builder" className="sidebar-link">
            <span className="icon"><LuDollarSign /></span>
            <span className="link-text">{t('quote_builder')}</span>
          </Link>
          <Link to="/admin/customers" className="sidebar-link">
            <span className="icon"><LuUsers /></span>
            <span className="link-text">{t('customer_search')}</span>
          </Link>
          <Link to="/admin/complaints" className="sidebar-link">
            <span className="icon"><LuTriangleAlert /></span>
            <span className="link-text">{t('complaints')}</span>
          </Link>
          <Link to="/admin/settings" className="sidebar-link">
            <span className="icon"><LuSettings /></span>
            <span className="link-text">{t('system_settings')}</span>
          </Link>
          <Link to="/my-bookings" className="sidebar-link">
            <span className="icon"><LuClipboardList /></span>
            <span className="link-text">{t('bookings')}</span>
            {stats.pending_bookings > 0 && <span className="sidebar-badge">{stats.pending_bookings}</span>}
          </Link>
        </div>

        <div className="sidebar-divider"></div>
        <span className="sidebar-label">{t('people')}</span>
        <div className="sidebar-section">
          <Link to="/admin/manage-staff" className="sidebar-link">
            <span className="icon"><LuUser /></span>
            <span className="link-text">{t('all_users')}</span>
          </Link>
          <Link to="/admin/staff" className="sidebar-link">
            <span className="icon"><LuBriefcase /></span>
            <span className="link-text">{t('staff_view')}</span>
          </Link>
          <Link to="/admin/manage-staff" className="sidebar-link">
            <span className="icon"><LuUsers /></span>
            <span className="link-text">{t('manage_staff')}</span>
          </Link>
        </div>

        <div className="sidebar-divider"></div>
        <div className="sidebar-section">
          <Link to="/home" className="sidebar-link">
            <span className="icon"><LuGlobe /></span>
            <span className="link-text">{t('back_to_site')}</span>
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main">
        <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="dash-title">
              {lang === 'ar' ? 'صباح الخير' : (lang === 'ur' ? 'صبح بخیر' : 'Good Morning')}, {user?.firstName || 'Admin'} 👋
            </div>
            <div className="dash-subtitle">
              {lang === 'ar' ? 'إليك ما يحدث في غارو اليوم' : (lang === 'ur' ? 'آج گارو میں کیا ہو رہا ہے' : "Here's what's happening at Garro today")}
            </div>
          </div>
          {/* Language Switcher */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '13.5px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
            >
              <LuGlobe size={14} /> {lang === 'en' ? 'English' : (lang === 'ar' ? 'العربية' : 'اردو')}
            </button>
            {isLangOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                boxShadow: '0 10px 24px rgba(0,0,0,0.2)', zIndex: 1000,
                minWidth: '120px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px'
              }}>
                {[{ code: 'en', label: 'English' }, { code: 'ar', label: 'العربية' }, { code: 'ur', label: 'اردو' }].map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => { changeLanguage(code); setIsLangOpen(false); }}
                    style={{
                      background: lang === code ? 'rgba(255,92,26,0.15)' : 'none', border: 'none',
                      borderRadius: '8px', padding: '8px 12px',
                      color: lang === code ? '#ff8c5a' : 'rgba(255,255,255,0.6)',
                      fontSize: '13px', fontWeight: lang === code ? 700 : 500,
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', width: '100%', transition: 'all 0.15s'
                    }}
                  >
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="stats-grid">
          <div className="stat-card orange">
            <div className="stat-icon"><LuStore /></div>
            <div className="stat-value">{stats.total_garages}</div>
            <div className="stat-label">{t('active_garages')}</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-icon"><LuCalendar /></div>
            <div className="stat-value">{stats.today_bookings}</div>
            <div className="stat-label">{t('todays_bookings')}</div>
            <div className="stat-sub">{stats.completed_today} {t('completed')}</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-icon"><LuHourglass /></div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.pending_bookings}</div>
            <div className="stat-label">{t('pending')}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon"><LuDollarSign /></div>
            <div className="stat-value" style={{ fontSize: '20px' }}>AED {stats.month_revenue}</div>
            <div className="stat-label">{t('month_revenue')}</div>
            <div className="stat-sub">AED {stats.week_revenue} {t('this_week')}</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon"><LuUsers /></div>
            <div className="stat-value">{stats.total_users}</div>
            <div className="stat-label">{t('registered_users')}</div>
            <div className="stat-sub">{stats.total_staff} {t('helper_staff')}</div>
          </div>
          <div className="stat-card pink">
            <div className="stat-icon"><LuStar /></div>
            <div className="stat-value">{stats.avg_rating}</div>
            <div className="stat-label">{t('avg_rating')}</div>
            <div className="stat-sub">{stats.new_reviews} {t('new_reviews')}</div>
          </div>
          <div className="stat-card red">
            <div className="stat-icon"><LuMessageSquare /></div>
            <div className="stat-value" style={{ color: '#ef4444' }}>{stats.unread_messages}</div>
            <div className="stat-label">{t('unread_alerts')}</div>
          </div>
          <div className="stat-card teal">
            <div className="stat-icon"><LuClipboardList /></div>
            <div className="stat-value">{stats.total_bookings}</div>
            <div className="stat-label">{t('bookings')}</div>
          </div>
        </div>

        {/* ── CHARTS ── */}
        <div className="charts-row">
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h4>{t('monthly_bookings_revenue')}</h4>
                <div className="chart-sub">{lang === 'ar' ? 'اتجاه إيرادات الحجوزات المكتملة' : (lang === 'ur' ? 'مکمل بکنگ کی آمدنی کا رجحان' : 'Completed bookings revenue trend')}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => downloadReport('revenue', 'xlsx')} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: '#94a3b8', cursor: 'pointer' }}>Excel 📊</button>
                <button onClick={() => downloadReport('revenue', 'pdf')} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: '#94a3b8', cursor: 'pointer' }}>PDF 📄</button>
              </div>
            </div>
            <div style={{ height: '200px', marginTop: '12px' }}>
              <canvas ref={revenueChartRef}></canvas>
            </div>
          </div>
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h4>{t('booking_status_dist')}</h4>
                <div className="chart-sub">{lang === 'ar' ? 'التوزيع الحالي للحجوزات' : (lang === 'ur' ? 'بکنگ کی موجودہ تقسیم' : 'Current distribution')}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => downloadReport('garages', 'xlsx')} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: '#94a3b8', cursor: 'pointer' }}>Garages Excel 📊</button>
                <button onClick={() => downloadReport('garages', 'pdf')} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: '#94a3b8', cursor: 'pointer' }}>Garages PDF 📄</button>
              </div>
            </div>
            <div style={{ height: '200px', marginTop: '12px' }}>
              <canvas ref={statusChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* ── DATA TABLES ── */}
        <div className="data-row">
          <div className="data-card">
            <div className="data-head">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><LuClock /> Recent Bookings</h4>
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
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: '820px',
            maxHeight: '90vh',
            overflowY: 'auto',
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

            <div className="mb-3 p-3 rounded-3" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
              <div className="small text-muted fw-semibold mb-2" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LuClipboardList /> Request Details
              </div>
              <div className="fw-bold text-dark">{selectedRequest.userId?.name || 'Unknown User'}</div>
              <div className="small text-secondary">{selectedRequest.vehicleId ? `${selectedRequest.vehicleId.make} ${selectedRequest.vehicleId.model} (${selectedRequest.vehicleId.year})` : 'Unknown Vehicle'}</div>
              <div className="small text-secondary mt-1">Issue: {selectedRequest.description}</div>
              <hr className="my-2" style={{ borderColor: '#bae6fd' }} />
              <div className="d-flex gap-3 flex-wrap">
                <div>
                  <div className="small text-muted">Customer Urgency</div>
                  <span className={`badge mt-1 px-2 py-1 ${
                    selectedRequest.urgency === 'asap' ? 'bg-danger' :
                    selectedRequest.urgency === 'today' ? 'bg-warning text-dark' :
                    selectedRequest.urgency === 'this_week' ? 'bg-info text-dark' : 'bg-secondary'
                  }`} style={{ fontSize: '11px' }}>
                    {selectedRequest.urgency === 'asap' ? '🚨 ASAP — Urgent' :
                     selectedRequest.urgency === 'today' ? '📅 Today' :
                     selectedRequest.urgency === 'this_week' ? '📆 This Week' : '⏳ Flexible'}
                  </span>
                </div>
                {selectedRequest.preferredDate && (
                  <div>
                    <div className="small text-muted">Preferred Date/Time</div>
                    <div className="small fw-semibold text-dark mt-1">
                      📅 {new Date(selectedRequest.preferredDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
                      🕐 {new Date(selectedRequest.preferredDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Select Garage *</label>
                <CustomDropdown
                  name="garageId"
                  placeholder="Choose Garage..."
                  options={getMatchingGarages(selectedRequest, garagesList)
                    .map(g => ({
                      value: g._id,
                      label: `${g.name} - AED ${selectedRequest ? (selectedRequest.estimatedCost || 299) : 299}`
                    }))}
                  value={assignGarageId}
                  onChange={(val) => {
                    setAssignGarageId(val);
                    setAssignHelperId('');
                  }}
                  required
                />
                {selectedRequest && getMatchingGarages(selectedRequest, garagesList).length === 0 && (
                  <p className="text-danger small mt-1">
                    ⚠️ No garages found supporting <strong>{(selectedRequest.subCategory || selectedRequest.serviceType)?.replace('_',' ')}</strong> in area <strong>"{selectedRequest.location?.address || 'N/A'}"</strong>.
                  </p>
                )}
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
                      label: `${h.name} (⭐ ${h.rating || 5}/5) ${!h.isAvailable ? '[⚠️ Shift Conflict]' : (h.upcomingSlots && h.upcomingSlots.length > 0 ? `[Job commitments: ${h.upcomingSlots.length}]` : '[Free]')}`
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

              {/* ── Schedule time config ── */}
              <div className="p-3 mb-4 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="small fw-bold text-dark">🕐 Schedule Helper Visit</div>
                  {hasConflict && (
                    <span className="badge bg-danger px-2 py-1" style={{ fontSize: '11px' }}>⚠️ Time Conflict!</span>
                  )}
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark mb-1">Date *</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={assignDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setAssignDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark mb-1">Arrival Time *</label>
                    <input
                      type="time"
                      className="form-control form-control-sm"
                      value={assignTime}
                      onChange={e => setAssignTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-semibold text-dark mb-1">Est. Duration *</label>
                  <select
                    className="form-select form-select-sm"
                    value={assignDuration}
                    onChange={e => setAssignDuration(e.target.value)}
                    required
                  >
                    <option value="1">1 Hour</option>
                    <option value="2">2 Hours</option>
                    <option value="3">3 Hours</option>
                    <option value="4">4 Hours (Standard)</option>
                    <option value="5">5 Hours</option>
                    <option value="6">6 Hours</option>
                    <option value="8">8 Hours</option>
                    <option value="12">12 Hours (Full Day)</option>
                  </select>
                </div>

                {/* Visual Timeline */}
                {assignDate && assignTime && (
                  <div className="mt-3">
                    <div className="small fw-semibold text-dark mb-1">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LuCalendarDays /> Helper Schedule — {assignDate}
                      </span>
                      {scheduleLoading && <span className="text-muted ms-2" style={{ fontWeight: 'normal' }}>Loading...</span>}
                    </div>
                    <div className="d-flex gap-3 mb-2" style={{ fontSize: '11px' }}>
                      <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#ef4444', marginRight:4 }}></span>Busy</span>
                      <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#f97316', marginRight:4 }}></span>Your Selection</span>
                      <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#22c55e', marginRight:4 }}></span>Free</span>
                    </div>
                    {(() => {
                      const HOURS_START = 6, HOURS_END = 22;
                      const [ph, pm] = assignTime.split(':').map(Number);
                      const propStart = ph * 60 + pm;
                      const propEnd   = propStart + Number(assignDuration) * 60;
                      const busyIntervals = helperSchedule.map(slot => {
                        const s = new Date(slot.startTime), e = new Date(slot.endTime);
                        return { start: s.getHours()*60+s.getMinutes(), end: e.getHours()*60+e.getMinutes(), label: slot.serviceType?.replace('_',' ')||'Busy' };
                      });
                      const cells = [];
                      for (let m = HOURS_START*60; m < HOURS_END*60; m += 30) {
                        const mEnd = m + 30;
                        const isBusy = busyIntervals.some(b => m < b.end && mEnd > b.start);
                        const isProp = m < propEnd && mEnd > propStart;
                        const isConfl = isBusy && isProp;
                        const h = Math.floor(m/60), min = m%60;
                        const lbl = min===0 ? `${h>12?h-12:h===0?12:h}${h>=12?'pm':'am'}` : '';
                        const bg = isConfl ? '#7f1d1d' : isBusy ? '#ef4444' : isProp ? '#f97316' : '#22c55e';
                        cells.push(
                          <div key={m} title={isConfl?'⚠️ CONFLICT!':isBusy?`Busy`:isProp?`Your slot: ${assignTime} +${assignDuration}h`:'Free'}
                            style={{ flex:1, height:'28px', background:bg, borderRight:'1px solid rgba(255,255,255,0.25)', position:'relative', cursor:'default', opacity:0.9 }}>
                            {lbl && <span style={{ position:'absolute', top:'100%', left:0, fontSize:'9px', color:'#64748b', whiteSpace:'nowrap', marginTop:'2px' }}>{lbl}</span>}
                          </div>
                        );
                      }
                      return (
                        <div>
                          <div style={{ display:'flex', borderRadius:'8px', overflow:'hidden', border:'1px solid #e2e8f0', height:'28px' }}>{cells}</div>
                          <div style={{ height:'16px' }}></div>
                        </div>
                      );
                    })()}
                    {hasConflict ? (
                      <div className="alert alert-danger py-2 px-3 mb-0" style={{ fontSize:'12.5px', borderRadius:'8px' }}>
                        ⚠️ <strong>Time conflict!</strong> This helper is already booked at this time. Please pick a different time or duration.
                      </div>
                    ) : (
                      <div className="alert alert-success py-2 px-3 mb-0" style={{ fontSize:'12.5px', borderRadius:'8px' }}>
                        ✅ <strong>{assignTime}</strong> for <strong>{assignDuration} hr(s)</strong> — no conflicts detected.
                      </div>
                    )}
                  </div>
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
                  disabled={submittingAssign || !assignGarageId || !assignHelperId || hasConflict}
                  title={hasConflict ? 'Resolve the time conflict first' : ''}
                >
                  {submittingAssign ? 'Assigning...' : hasConflict ? '⚠️ Conflict — Change Time' : 'Confirm Assignment'}
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
