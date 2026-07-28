import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import Chart from 'chart.js/auto';
import { io } from 'socket.io-client';
import AdminSidebar from '../components/AdminSidebar';
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
  LuMessageCircle,
  LuClock,
  LuCalendarDays,
  LuChevronLeft,
  LuChevronRight,
  LuTrendingUp,
  LuFileSpreadsheet,
  LuFileText,
  LuArrowRight,
  LuUserCheck,
  LuX,
  LuCircleX,
  LuCircleCheck
} from 'react-icons/lu';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useNotification();
  const { t, lang, changeLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const revenueChartRef = useRef(null);
  const statusChartRef = useRef(null);



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

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarRequests, setCalendarRequests] = useState([]);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

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

  const [cancellationRequests, setCancellationRequests] = useState([]);
  const [payoutsList, setPayoutsList] = useState([]);

  const handleProcessPayout = async (payoutId) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/payouts/${payoutId}/process`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: 'Payout settled via bank transfer' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Payout marked as processed!');
        refreshData();
      } else {
        toast.error(data.message || 'Failed to process payout');
      }
    } catch (err) {
      toast.error('Error processing payout');
    }
  };

  const [selectedRefundReq, setSelectedRefundReq] = useState(null);
  const [refundInputAmount, setRefundInputAmount] = useState('');
  const [refundAdminNotes, setRefundAdminNotes] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  const [selectedRejectReq, setSelectedRejectReq] = useState(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const openApproveModal = (reqItem) => {
    const defaultAmount = reqItem.refundAmount || reqItem.invoice?.totalAmount || 299;
    setSelectedRefundReq(reqItem);
    setRefundInputAmount(defaultAmount);
    const isArrived = ['arrived_at_customer', 'picked_up', 'in_garage', 'repair_in_progress', 'work_complete', 'ready_for_delivery'].includes(reqItem.previousStatus || reqItem.status);
    setRefundAdminNotes(isArrived ? 'Travel & cancellation fee deducted as technician arrived at location.' : '');
  };

  const submitApproveRefund = async (e) => {
    e.preventDefault();
    if (!selectedRefundReq) return;
    setIsSubmittingRefund(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/cancellations/${selectedRefundReq._id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customRefundAmount: Number(refundInputAmount),
          adminNotes: refundAdminNotes
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Refund approval failed.');
      toast.success(data.message || 'Cancellation approved & refund processed!');
      setSelectedRefundReq(null);
      refreshData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  const openRejectModal = (reqItem) => {
    setSelectedRejectReq(reqItem);
    setRejectReasonInput('Service is already underway.');
  };

  const submitRejectCancellation = async (e) => {
    e.preventDefault();
    if (!selectedRejectReq) return;
    setIsSubmittingReject(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/cancellations/${selectedRejectReq._id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rejectionReason: rejectReasonInput })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Rejection failed.');
      toast.info('Cancellation request rejected.');
      setSelectedRejectReq(null);
      refreshData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmittingReject(false);
    }
  };

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

      const calRes = await fetch(`${API_BASE}/api/requests?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const calData = await calRes.json();

      const cancelRes = await fetch(`${API_BASE}/api/admin/cancellations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const cancelData = await cancelRes.json();

      const payoutsRes = await fetch(`${API_BASE}/api/admin/payouts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const payoutsData = await payoutsRes.json();
      if (payoutsRes.ok && payoutsData.success) {
        setPayoutsList(payoutsData.payouts || []);
      }

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
      if (calRes.ok && calData.success) {
        setCalendarRequests(calData.requests || []);
      }
      if (cancelRes.ok && cancelData.success) {
        setCancellationRequests(cancelData.requests || []);
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
      if (selectedRequest && (data._id === selectedRequest._id || data.id === selectedRequest._id)) {
        setSelectedRequest(null);
        toast.error('Customer requested cancellation for this booking. Assignment modal revoked.');
      }
      refreshData();
    });

    socket.on('request:updated', (data) => {
      console.log('Real-time request updated received:', data);
      if (data && ['cancellation_requested', 'cancelled'].includes(data.status)) {
        if (selectedRequest && (data._id === selectedRequest._id || data.id === selectedRequest._id)) {
          setSelectedRequest(null);
          toast.error('Customer requested cancellation & refund for this booking. Assignment revoked.');
        }
      }
      refreshData();
    });

    socket.on('request:assigned', (data) => {
      console.log('Real-time request assigned received:', data);
      refreshData();
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedRequest]);

  const handleOpenAssignModal = async (req) => {
    if (['cancellation_requested', 'cancelled'].includes(req.status)) {
      toast.error('Cannot assign garage or staff to a booking with a pending cancellation or refund request.');
      return;
    }
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

  // Calendar helper calculations
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, dateStr: null });
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateStr });
    }
    return days;
  };

  const getDayRequests = (dateStr) => {
    if (!dateStr) return [];
    return calendarRequests.filter(req => {
      if (!req.preferredDate) return false;
      const reqDateStr = new Date(req.preferredDate).toISOString().split('T')[0];
      return reqDateStr === dateStr;
    });
  };

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
      <AdminSidebar pendingBookings={dashboardStats?.stats?.pending_bookings} />

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main">
        <div className="dash-header mb-4" style={{ display: 'block' }}>
          <div>
            <div className="dash-title">
              {(() => {
                const hour = new Date().getHours();
                if (hour < 12) {
                  return lang === 'ar' ? 'صباح الخير' : (lang === 'ur' ? 'صبح بخیر' : 'Good Morning');
                } else if (hour < 17) {
                  return lang === 'ar' ? 'مساء الخير' : (lang === 'ur' ? 'سہ پہر بخیر' : 'Good Afternoon');
                } else {
                  return lang === 'ar' ? 'مساء الخير' : (lang === 'ur' ? 'شام بخیر' : 'Good Evening');
                }
              })()}, {user?.firstName || 'Admin'} 👋
            </div>
            <div className="dash-subtitle">
              {lang === 'ar' ? 'إليك ما يحدث في غارو اليوم' : (lang === 'ur' ? 'آج گارو میں کیا ہو رہا ہے' : "Here's what's happening at Garro today")}
            </div>
          </div>
        </div>

        {/* 🚨 ACTIVE EMERGENCY PICKUP REQUESTS DISPATCH PANEL */}
        {(() => {
          const activeEmg = recentBookings.filter(r => (
            r.serviceType === 'emergency_pickup' ||
            r.serviceType === 'roadside_assistance' ||
            r.urgency === 'asap'
          ) && !['completed', 'closed', 'delivered', 'cancelled'].includes(r.status));

          if (activeEmg.length === 0) return null;

          return (
            <div style={{
              background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
              color: 'white', borderRadius: '16px', padding: '20px', marginBottom: '24px',
              border: '2px solid #ef4444', boxShadow: '0 10px 30px rgba(220, 38, 38, 0.4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span className="badge bg-danger px-3 py-1.5 fs-7 fw-bold" style={{ letterSpacing: '1px' }}>
                    🚨 EMERGENCY DISPATCH REQUIRED ({activeEmg.length})
                  </span>
                  <h4 style={{ margin: '8px 0 4px', fontWeight: 800, color: 'white' }}>
                    Active Roadside Emergency Pickups
                  </h4>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>
                    Customers waiting for immediate tow truck / helper dispatch.
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                {activeEmg.map(r => (
                  <div key={r._id} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#fef08a' }}>#{r._id.slice(-8).toUpperCase()}</strong>
                      <span className="badge bg-warning text-dark fw-bold">{r.status.toUpperCase()}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{r.userId?.name || 'Customer'}</div>
                    <div style={{ fontSize: '12.5px', color: '#ffffff', fontWeight: 600, marginBottom: '8px' }}>
                      📍 {r.location?.area ? `${r.location.area}, ` : ''}{r.location?.city || 'Dubai'} &nbsp;
                      {r.location?.isGpsUsed ? (
                        <span style={{ background: '#22c55e', color: 'white', fontSize: '10px', padding: '2px 7px', borderRadius: '10px', fontWeight: 800 }}>
                          ✓ GPS DETECTED
                        </span>
                      ) : (
                        <span style={{ background: '#3b82f6', color: 'white', fontSize: '10px', padding: '2px 7px', borderRadius: '10px', fontWeight: 800 }}>
                          📋 DROPDOWN SELECTED
                        </span>
                      )}
                      <div style={{ fontSize: '11.5px', opacity: 0.85, marginTop: '2px' }}>
                        {r.location?.address}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedRequest(r)}
                        className="btn btn-sm btn-warning fw-bold px-3 py-1.5"
                        style={{ borderRadius: '8px', fontSize: '12px' }}
                      >
                        ⚡ Fast-Assign Helper
                      </button>
                      {r.location?.lat && (
                        <a
                          href={`https://www.google.com/maps?q=${r.location.lat},${r.location.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-light fw-bold px-3 py-1.5"
                          style={{ borderRadius: '8px', fontSize: '12px' }}
                        >
                          📍 Open Maps
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

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
                <button onClick={() => downloadReport('revenue', 'xlsx')} className="btn-export-dash">
                  <LuFileSpreadsheet size={13} /> <span>Excel</span>
                </button>
                <button onClick={() => downloadReport('revenue', 'pdf')} className="btn-export-dash">
                  <LuFileText size={13} /> <span>PDF</span>
                </button>
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
                <button onClick={() => downloadReport('garages', 'xlsx')} className="btn-export-dash">
                  <LuFileSpreadsheet size={13} /> <span>Garages Excel</span>
                </button>
                <button onClick={() => downloadReport('garages', 'pdf')} className="btn-export-dash">
                  <LuFileText size={13} /> <span>Garages PDF</span>
                </button>
              </div>
            </div>
            <div style={{ height: '200px', marginTop: '12px' }}>
              <canvas ref={statusChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* ── CANCELLATION & REFUND APPROVAL QUEUE ── */}
        {cancellationRequests.length > 0 && (
          <div className="data-card mb-4" style={{ border: '1px solid #fee2e2', background: '#fff5f5', borderRadius: '16px', padding: '20px' }}>
            <div className="data-head" style={{ borderBottom: '1px solid #fecdd3', paddingBottom: '12px', marginBottom: '16px' }}>
              <h4 style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontWeight: 800 }}>
                <LuCircleX size={20} /> Cancellation &amp; Refund Approval Queue ({cancellationRequests.length})
              </h4>
            </div>
            <div className="table-responsive">
              <table className="g-table align-middle">
                <thead>
                  <tr style={{ background: '#fef2f2' }}>
                    <th style={{ padding: '10px 12px', fontSize: '11px' }}>BOOKING ID</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px' }}>CUSTOMER</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px' }}>SERVICE</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px' }}>REFUND AMOUNT</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px' }}>REASON</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px' }}>STATUS</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {cancellationRequests.map(r => (
                    <tr key={r._id} style={{ borderBottom: '1px solid #fee2e2' }}>
                      <td style={{ padding: '12px' }}><strong>#{r._id.toString().slice(-8).toUpperCase()}</strong></td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.userId?.name || 'Customer'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{r.userId?.email || r.userId?.phone}</div>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#1e293b' }}>
                        {r.subCategory || r.serviceType?.replace(/_/g, ' ')}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <strong style={{ color: '#16a34a', fontSize: '14px' }}>AED {r.refundAmount || r.invoice?.totalAmount || 299}</strong>
                      </td>
                      <td style={{ padding: '12px', maxWidth: '220px' }}>
                        <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#991b1b', display: 'block', lineHeight: 1.3 }}>
                          "{r.cancellationReason || 'Customer requested refund'}"
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${r.status === 'cancelled' ? 'bg-secondary' : 'bg-danger'}`} style={{ padding: '5px 10px', fontSize: '11px' }}>
                          {r.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        {['arrived_at_customer', 'picked_up', 'in_garage', 'repair_in_progress'].includes(r.previousStatus) && (
                          <div style={{ fontSize: '10.5px', color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', fontWeight: 700 }}>
                            📍 Staff Arrived (Fine May Apply)
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {r.status === 'cancellation_requested' ? (
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => openApproveModal(r)}
                              className="btn btn-sm btn-success fw-bold px-3 py-1.5"
                              style={{ borderRadius: '8px', fontSize: '12px', boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}
                            >
                              ✓ Approve &amp; Refund
                            </button>
                            <button
                              onClick={() => openRejectModal(r)}
                              className="btn btn-sm btn-outline-danger fw-bold px-3 py-1.5"
                              style={{ borderRadius: '8px', fontSize: '12px' }}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small fw-semibold">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── GARAGE & STAFF PAYOUT SETTLEMENTS QUEUE ── */}
        {payoutsList.length > 0 && (
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', border: '1.5px solid #cbd5e1', background: '#ffffff', overflow: 'hidden' }}>
            <div className="card-header bg-white py-3 px-4" style={{ borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h5 className="fw-extrabold mb-1" style={{ color: '#0f172a', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LuDollarSign className="text-success" /> Garage &amp; Staff Payout Settlements
                </h5>
                <p className="text-muted small mb-0">Platform Commission Fee (10%) &amp; VAT (5%) deducted — Net Payout Settlements for Garages/Staff.</p>
              </div>
              <span className="badge bg-success px-3 py-2 fs-7 fw-bold">
                {payoutsList.filter(p => p.status === 'pending').length} Pending Payouts
              </span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
                <thead style={{ background: '#f8fafc', color: '#64748b' }}>
                  <tr>
                    <th style={{ padding: '10px 12px', fontSize: '11px' }}>PAYOUT ID</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px' }}>RECIPIENT (GARAGE / STAFF)</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px' }}>INVOICE REF</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px' }}>NET PAYOUT AMOUNT</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px' }}>STATUS</th>
                    <th style={{ padding: '10px 12px', fontSize: '11px', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutsList.map(p => (
                    <tr key={p._id}>
                      <td style={{ padding: '12px' }}><strong>#{p._id.slice(-8).toUpperCase()}</strong></td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.garageId?.name || 'Authorized Service Partner'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{p.garageId?.phone || p.garageId?.email || 'Garro Network'}</div>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>
                        {p.invoiceId?.invoiceNumber || `#INV-${p._id.slice(-6)}`}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <strong style={{ color: '#16a34a', fontSize: '15px' }}>AED {p.amount}</strong>
                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>(Subtotal - 10% Platform Fee)</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${p.status === 'processed' ? 'bg-success' : 'bg-warning text-dark'}`} style={{ padding: '5px 10px', fontSize: '11px' }}>
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {p.status === 'pending' ? (
                          <button
                            onClick={() => handleProcessPayout(p._id)}
                            className="btn btn-sm btn-success fw-bold px-3 py-1.5"
                            style={{ borderRadius: '8px', fontSize: '12px' }}
                          >
                            ⚡ Process Bank Payout
                          </button>
                        ) : (
                          <span className="text-muted small fw-semibold">✓ Paid on {new Date(p.processedAt || p.updatedAt).toLocaleDateString()}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DATA TABLES ── */}
        <div className="data-row">
          <div className="data-card">
            <div className="data-head">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><LuClock /> Recent Bookings</h4>
              <Link to="/my-bookings" className="btn-view-all">
                <span>View all</span> <LuArrowRight size={13} />
              </Link>
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
                            className="btn-assign-action ms-2"
                          >
                            <LuUserCheck size={11} /> <span>Assign</span>
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

          {/* Calendar Widget Card */}
          <div className="data-card" style={{ background: '#ffffff', color: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f8fafc' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><LuCalendarDays /> Schedule Calendar</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><LuChevronLeft size={18} /></button>
                <span className="fw-bold" style={{ fontSize: '13px', minWidth: '95px', textAlign: 'center', color: '#1e293b' }}>
                  {calendarDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><LuChevronRight size={18} /></button>
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '8px' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((h, i) => <div key={i}>{h}</div>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {getDaysInMonth(calendarDate).map((d, index) => {
                  const reqs = getDayRequests(d.dateStr);
                  const hasBooking = reqs.length > 0;
                  const isSelected = selectedCalendarDay === d.dateStr;
                  const isToday = d.dateStr === new Date().toISOString().split('T')[0];

                  return (
                    <div
                      key={index}
                      onClick={() => d.day && setSelectedCalendarDay(d.dateStr)}
                      style={{
                        height: '34px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        cursor: d.day ? 'pointer' : 'default',
                        position: 'relative',
                        fontSize: '12px',
                        fontWeight: isToday || isSelected ? 'bold' : 'normal',
                        background: isSelected ? '#ff5c1a' : isToday ? '#eff6ff' : 'none',
                        color: isSelected ? 'white' : isToday ? '#ff5c1a' : '#475569',
                        border: isToday && !isSelected ? '1px solid #ff5c1a' : 'none',
                        opacity: d.day ? 1 : 0
                      }}
                    >
                      {d.day}
                      {hasBooking && !isSelected && (
                        <span style={{
                          position: 'absolute',
                          bottom: '3px',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: reqs.some(r => r.urgency === 'asap') ? '#ef4444' : '#10b981'
                        }}></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedCalendarDay && (
              <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f8fafc', paddingTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="fw-bold text-slate-700" style={{ fontSize: '12px' }}>
                    Schedule: {new Date(selectedCalendarDay).toLocaleDateString('en-AE', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button onClick={() => setSelectedCalendarDay(null)} className="btn p-0 text-secondary" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '11px' }}>Clear</button>
                </div>
                {getDayRequests(selectedCalendarDay).length === 0 ? (
                  <p className="text-muted small mb-0">No pickups or deliveries scheduled.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {getDayRequests(selectedCalendarDay).map(req => {
                      const time = new Date(req.preferredDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                          <div>
                            <div className="fw-semibold text-slate-800" style={{ fontSize: '12px' }}>
                              {req.vehicleId ? `${req.vehicleId.make} ${req.vehicleId.model}` : 'Vehicle'}
                            </div>
                            <div className="text-secondary" style={{ fontSize: '11px' }}>
                              User: {req.userId?.name || 'User'} | Time: {time}
                            </div>
                          </div>
                          <span className={`sbadge ${req.status}`} style={{ fontSize: '10px' }}>
                            {req.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
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
                className="modal-close-btn"
              >
                <LuX size={18} />
              </button>
            </div>

            <div className="mb-3 p-3 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="small text-muted fw-semibold mb-2" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LuClipboardList size={14} className="text-slate-500" /> Request Details
              </div>
              <div className="fw-bold text-dark">{selectedRequest.userId?.name || 'Unknown User'}</div>
              <div className="small text-secondary">{selectedRequest.vehicleId ? `${selectedRequest.vehicleId.make} ${selectedRequest.vehicleId.model} (${selectedRequest.vehicleId.year})` : 'Unknown Vehicle'}</div>
              <div className="small text-secondary mt-1">Issue: {selectedRequest.description}</div>
              <hr className="my-2" style={{ borderColor: '#e2e8f0' }} />
              <div className="d-flex gap-3 flex-wrap">
                <div>
                  <div className="small text-muted">Customer Urgency</div>
                  <span className={`urgency-badge ${selectedRequest.urgency}`}>
                    {selectedRequest.urgency === 'asap' ? (
                      <><LuTriangleAlert size={12} /> <span>ASAP — Urgent</span></>
                    ) : selectedRequest.urgency === 'today' ? (
                      <><LuCalendar size={12} /> <span>Today</span></>
                    ) : selectedRequest.urgency === 'this_week' ? (
                      <><LuCalendarDays size={12} /> <span>This Week</span></>
                    ) : (
                      <><LuHourglass size={12} /> <span>Flexible</span></>
                    )}
                  </span>
                </div>
                {selectedRequest.preferredDate && (
                  <div>
                    <div className="small text-muted">Preferred Date/Time</div>
                    <div className="small fw-semibold text-dark mt-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <LuCalendar size={12} className="text-slate-500" />
                      <span>
                        {new Date(selectedRequest.preferredDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
                        ({new Date(selectedRequest.preferredDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
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
                  <p className="text-danger small mt-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <LuTriangleAlert size={12} /> <span>No garages found supporting <strong>{(selectedRequest.subCategory || selectedRequest.serviceType)?.replace('_',' ')}</strong> in area <strong>"{selectedRequest.location?.address || 'N/A'}"</strong>.</span>
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
                      label: `${h.name} (Rating: ${h.rating || 5}/5) ${!h.isAvailable ? '[Shift Conflict]' : (h.upcomingSlots && h.upcomingSlots.length > 0 ? `[Job commitments: ${h.upcomingSlots.length}]` : '[Free]')}`
                    }))
                  }
                  value={assignHelperId}
                  onChange={setAssignHelperId}
                  required
                />
                {!assignGarageId && <p className="text-muted small mt-1">Please select a garage first to view available helpers.</p>}
                {assignGarageId && availableHelpersList.filter(h => h.garageId?._id === assignGarageId).length === 0 && (
                  <p className="text-danger small mt-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <LuTriangleAlert size={12} /> <span>No available helpers found for this garage.</span>
                  </p>
                )}
              </div>

              {/* ── Schedule time config ── */}
              <div className="p-3 mb-4 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="small fw-bold text-dark" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LuClock size={14} className="text-slate-500" /> <span>Schedule Helper Visit</span>
                  </div>
                  {hasConflict && (
                    <span className="conflict-badge">
                      <LuTriangleAlert size={11} /> <span>Time Conflict!</span>
                    </span>
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
                          <div key={m} title={isConfl?'CONFLICT!':isBusy?`Busy`:isProp?`Your slot: ${assignTime} +${assignDuration}h`:'Free'}
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
                      <div className="modal-alert alert-danger">
                        <LuTriangleAlert size={16} style={{ flexShrink: 0 }} />
                        <div>
                          <strong>Time conflict!</strong> This helper is already booked at this time. Please pick a different time or duration.
                        </div>
                      </div>
                    ) : (
                      <div className="modal-alert alert-success">
                        <LuCircleCheck size={16} style={{ flexShrink: 0 }} />
                        <div>
                          <strong>{assignTime}</strong> for <strong>{assignDuration} hr(s)</strong> — no conflicts detected.
                        </div>
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
                  {submittingAssign ? 'Assigning...' : hasConflict ? 'Conflict — Change Time' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Custom Approve Refund Modal */}
      {selectedRefundReq && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', width: '100%', maxWidth: '520px',
            padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#16a34a' }}>💳</span> Approve Refund &amp; Cancellation
              </h4>
              <button onClick={() => setSelectedRefundReq(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <LuX size={22} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Booking ID:</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>#{selectedRefundReq._id.slice(-8).toUpperCase()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Customer:</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{selectedRefundReq.userId?.name} ({selectedRefundReq.userId?.phone || selectedRefundReq.userId?.email})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Customer Paid:</span>
                <strong style={{ fontSize: '14px', color: '#16a34a' }}>AED {selectedRefundReq.refundAmount || selectedRefundReq.invoice?.totalAmount || 299}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Customer Reason:</span>
                <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#991b1b' }}>"{selectedRefundReq.cancellationReason || 'No reason provided'}"</span>
              </div>
            </div>

            {['arrived_at_customer', 'picked_up', 'in_garage', 'repair_in_progress'].includes(selectedRefundReq.previousStatus || selectedRefundReq.status) && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#b45309', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📍 TECHNICIAN HAD ALREADY ARRIVED
                </div>
                <div style={{ fontSize: '12px', color: '#92400e' }}>
                  Staff traveled to customer location. You can enter a lower refund amount below to deduct a travel/cancellation fee.
                </div>
              </div>
            )}

            <form onSubmit={submitApproveRefund}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  Approved Refund Amount (AED):
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={refundInputAmount}
                  onChange={(e) => setRefundInputAmount(e.target.value)}
                  style={{
                    width: '100%', borderRadius: '10px', border: '1px solid #cbd5e1',
                    padding: '10px 14px', fontSize: '15px', fontWeight: 700, color: '#0f172a', background: '#f8fafc'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  Admin Note / Deduction Reason (Sent to Customer):
                </label>
                <textarea
                  rows={2}
                  value={refundAdminNotes}
                  onChange={(e) => setRefundAdminNotes(e.target.value)}
                  placeholder="Optional note regarding fine deduction or refund timeline..."
                  style={{
                    width: '100%', borderRadius: '10px', border: '1px solid #cbd5e1',
                    padding: '10px 12px', fontSize: '13px', color: '#0f172a'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedRefundReq(null)}
                  style={{
                    padding: '10px 18px', background: '#f1f5f9', color: '#475569',
                    border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRefund}
                  style={{
                    padding: '10px 22px', background: '#16a34a', color: 'white',
                    border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)'
                  }}
                >
                  {isSubmittingRefund ? 'Processing...' : `Confirm Refund (AED ${Number(refundInputAmount || 0).toFixed(2)})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Reject Cancellation Modal */}
      {selectedRejectReq && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', width: '100%', maxWidth: '480px',
            padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>✕</span> Reject Cancellation Request
              </h4>
              <button onClick={() => setSelectedRejectReq(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <LuX size={22} />
              </button>
            </div>

            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '16px' }}>
              Rejecting cancellation for Booking <strong>#{selectedRejectReq._id.slice(-8).toUpperCase()}</strong> will restore its active status.
            </p>

            <form onSubmit={submitRejectCancellation}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  Rejection Reason (Sent to Customer):
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="Explain why cancellation cannot be approved at this stage..."
                  style={{
                    width: '100%', borderRadius: '10px', border: '1px solid #cbd5e1',
                    padding: '10px 12px', fontSize: '13px', color: '#0f172a'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedRejectReq(null)}
                  style={{
                    padding: '10px 18px', background: '#f1f5f9', color: '#475569',
                    border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReject}
                  style={{
                    padding: '10px 20px', background: '#dc2626', color: 'white',
                    border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {isSubmittingReject ? 'Rejecting...' : 'Reject Request'}
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
