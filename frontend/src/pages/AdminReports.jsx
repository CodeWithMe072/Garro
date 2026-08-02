import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import AdminSidebar from '../components/AdminSidebar';
import {
  LuLayoutDashboard,
  LuStore,
  LuSearch,
  LuSettings,
  LuDollarSign,
  LuUsers,
  LuTriangleAlert,
  LuMessageCircle,
  LuClipboardList,
  LuUser,
  LuBriefcase,
  LuGlobe,
  LuChevronRight,
  LuChevronLeft,
  LuDownload,
  LuMail,
  LuTrendingUp,
  LuStar
} from 'react-icons/lu';

const AdminReports = () => {
  const { user } = useAuth();
  const { toast } = useNotification();
  const { t, lang, changeLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);  // State for report generation
  const [reportType, setReportType] = useState('revenue');
  const [format, setFormat] = useState('pdf');
  const [months, setMonths] = useState('6');
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailing, setEmailing] = useState(false);

  
  useEffect(() => {
    fetchPreview();
  }, [reportType, months]);

  const fetchPreview = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const endpoint = reportType === 'revenue'
        ? `${API_BASE}/api/admin/reports/revenue?months=${months}`
        : `${API_BASE}/api/admin/reports/garages`;

      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPreviewData(reportType === 'revenue' ? data.revenue : data.report);
      } else {
        toast.error(data.message || 'Failed to fetch report preview.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching report preview data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const token = localStorage.getItem('token');
    const endpoint = reportType === 'revenue'
      ? `${API_BASE}/api/admin/reports/revenue/export?format=${format}&months=${months}&token=${encodeURIComponent(token)}`
      : `${API_BASE}/api/admin/reports/garages/export?format=${format}&token=${encodeURIComponent(token)}`;

    window.open(endpoint, '_blank');
    toast.success(`Downloading ${reportType} report as ${format.toUpperCase()}...`);
  };

  const handleEmailReport = async (e) => {
    e.preventDefault();
    if (!recipientEmail) {
      toast.error('Please enter a recipient email.');
      return;
    }

    setEmailing(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/api/admin/reports/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: reportType,
          format,
          months,
          recipientEmail
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Report emailed successfully!');
        setRecipientEmail('');
      } else {
        toast.error(data.message || 'Failed to email report.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error emailing report.');
    } finally {
      setEmailing(false);
    }
  };

  const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="dash-wrapper">
      {/* ── SIDEBAR ── */}
      <AdminSidebar />

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main">
          <div className="dash-header mb-4" style={{ display: 'block' }}>
            <div className="dash-title d-flex align-items-center gap-2">
              <LuTrendingUp className="text-primary-garro" />
              <span>{lang === 'ar' ? 'التقارير والتحليلات' : (lang === 'ur' ? 'رپورٹس اور تجزیات' : 'Reports & Analytics')}</span>
            </div>
            <div className="dash-subtitle">{lang === 'ar' ? 'إنشاء وتنزيل وإرسال تقارير الأداء المالي والتشغيلي بالبريد الإلكتروني' : (lang === 'ur' ? 'مالیاتی اور آپریشنل رپورٹس تیار کریں، ڈاؤن لوڈ کریں اور ای میل کریں' : 'Generate, download, and email financial and operational reports')}</div>
          </div>

        <div className="row g-4">
          {/* Controls Column */}
          <div className="col-lg-6">
            <div className="card border-0 rounded-4 shadow-sm p-4 h-100" style={{ background: '#ffffff' }}>
              <h5 className="fw-bold mb-4 text-slate-800">Configure Report</h5>
              
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary">Report Type</label>
                <select
                  className="form-select rounded-3 shadow-none border-slate-200"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="revenue">Revenue Performance</option>
                  <option value="garage">Garage Performance</option>
                </select>
              </div>

              {reportType === 'revenue' && (
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary">Period Scope</label>
                  <select
                    className="form-select rounded-3 shadow-none border-slate-200"
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                  >
                    <option value="3">Last 3 Months</option>
                    <option value="6">Last 6 Months</option>
                    <option value="12">Last 12 Months</option>
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="form-label fw-semibold text-secondary">File Format</label>
                <div className="d-flex flex-column gap-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="reportFormat"
                      id="formatPdf"
                      value="pdf"
                      checked={format === 'pdf'}
                      onChange={() => setFormat('pdf')}
                    />
                    <label className="form-check-label" htmlFor="formatPdf">PDF Document</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="reportFormat"
                      id="formatXlsx"
                      value="xlsx"
                      checked={format === 'xlsx'}
                      onChange={() => setFormat('xlsx')}
                    />
                    <label className="form-check-label" htmlFor="formatXlsx">Excel Worksheet</label>
                  </div>
                </div>
              </div>

              <button
                className="btn-garro btn-primary-garro w-100 d-flex align-items-center justify-content-center gap-2 mb-4"
                onClick={handleDownload}
                style={{ height: '42px', fontSize: '13.5px' }}
              >
                <LuDownload size={16} /> Download Report
              </button>

              <hr className="my-4 text-slate-200" />

              {/* Email Report Section */}
              <h5 className="fw-bold mb-3 text-slate-800" style={{ fontSize: '14.5px' }}>Email Report to Team</h5>
              <form onSubmit={handleEmailReport}>
                <div className="mb-3">
                  <input
                    type="email"
                    className="chat-search-input px-3 w-100"
                    placeholder="manager@garro.ae"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={emailing}
                  className="btn-garro btn-outline-garro w-100 d-flex align-items-center justify-content-center gap-2"
                  style={{ height: '40px', fontSize: '13px' }}
                >
                  <LuMail size={16} /> {emailing ? 'Sending...' : 'Email Report'}
                </button>
              </form>
            </div>
          </div>

          {/* Preview Column */}
          <div className="col-lg-6">
            <div className="card border-0 rounded-4 shadow-sm p-4 h-100" style={{ background: '#ffffff' }}>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h5 className="fw-bold mb-0 text-slate-800">Data Preview</h5>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Auto-refreshes on filter change</span>
              </div>

              {loading ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : previewData.length === 0 ? (
                <div className="text-center py-5 text-secondary">No report data matches current parameters.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped align-middle">
                    {reportType === 'revenue' ? (
                      <>
                        <thead>
                          <tr className="text-secondary" style={{ fontSize: '0.85rem' }}>
                            <th>Period</th>
                            <th className="text-end">Invoice Count</th>
                            <th className="text-end">Total Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, i) => (
                            <tr key={i}>
                              <td className="fw-semibold text-slate-700">{monthNames[row._id.month]} {row._id.year}</td>
                              <td className="text-end">{row.count}</td>
                              <td className="text-end text-success fw-bold">AED {row.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </>
                    ) : (
                      <>
                        <thead>
                          <tr className="text-secondary" style={{ fontSize: '0.85rem' }}>
                            <th>Garage Name</th>
                            <th className="text-end">Total Jobs</th>
                            <th className="text-end">Completed Jobs</th>
                            <th className="text-end">Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, i) => (
                            <tr key={i}>
                              <td className="fw-semibold text-slate-700">{row.garageName}</td>
                              <td className="text-end">{row.totalJobs}</td>
                              <td className="text-end">{row.completedJobs}</td>
                              <td className="text-end text-warning fw-bold d-flex align-items-center justify-content-end gap-1">
                                <LuStar size={13} style={{ fill: 'currentColor' }} />
                                <span>{row.rating ? row.rating.toFixed(1) : '0.0'}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </>
                    )}
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;
