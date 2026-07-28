import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import AdminSidebar from '../components/AdminSidebar';
import { LuClipboardList, LuCalendar, LuSearch, LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const AdminActivityLogs = () => {
  const { t, lang } = useLanguage();
  const { toast } = useNotification();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${API_BASE}/api/admin/activity-logs?page=${page}&limit=20`;
      if (actionFilter) url += `&action=${actionFilter}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch activity logs.');
      }
      setLogs(data.logs || []);
      setTotalLogs(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchLogs();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [actionFilter, startDate, endDate, page]);

  return (
    <div className="dash-wrapper">
      <AdminSidebar />

      <main className="dash-main">
        {/* Title Block */}
        <div className="dash-header mb-4" style={{ display: 'block' }}>
          <div className="dash-title d-flex align-items-center gap-2">
            <LuClipboardList className="text-primary-garro" />
            <span>{lang === 'ar' ? 'سجل أنشطة النظام' : (lang === 'ur' ? 'سسٹم سرگرمی لاگ' : 'System Activity Logs')}</span>
          </div>
          <div className="dash-subtitle">
            {lang === 'ar' ? 'مراقبة ومراجعة الإجراءات الإدارية وتفاعلات المستخدمين عبر النظام.' : (lang === 'ur' ? 'پورے سسٹم میں تمام انتظامی اور صارف کے کاموں کو مانیٹر کریں۔' : 'Monitor and audit all administrative, customer, and partner action logs across the platform.')}
          </div>
        </div>

        {/* Filters Card */}
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px', background: '#fff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 200px', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                Search Action
              </label>
              <div style={{ position: 'relative' }}>
                <LuSearch style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} size={16} />
                <input
                  type="text"
                  placeholder="e.g. login, create_quote, update_request..."
                  value={actionFilter}
                  onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                  style={{
                    width: '100%', padding: '10px 12px 10px 36px', background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '10px', color: '#0f172a', fontSize: '13.5px', outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                style={{
                  width: '100%', padding: '10px 12px', background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '10px', color: '#0f172a', fontSize: '13.5px', outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                style={{
                  width: '100%', padding: '10px 12px', background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '10px', color: '#0f172a', fontSize: '13.5px', outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: '#fff', color: '#1e293b' }}>
          <div className="table-responsive">
            <table className="table align-middle" style={{ margin: 0 }}>
              <thead>
                <tr style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '14px 16px' }}>Timestamp</th>
                  <th style={{ padding: '14px 16px' }}>Actor</th>
                  <th style={{ padding: '14px 16px' }}>Role</th>
                  <th style={{ padding: '14px 16px' }}>Action</th>
                  <th style={{ padding: '14px 16px' }}>Entity</th>
                  <th style={{ padding: '14px 16px' }}>Metadata / Details</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '13.5px' }}>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      {t('loading')}
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No activity logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', color: '#64748b' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        {log.userId?.email || 'System'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {log.userId?.role ? (
                          <span className={`badge ${
                            log.userId.role === 'admin' ? 'bg-danger-subtle text-danger' : 
                            log.userId.role === 'garage' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'
                          } px-2 py-1`} style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                            {log.userId.role}
                          </span>
                        ) : (
                          <span className="badge bg-light text-muted px-2 py-1" style={{ fontSize: '11px' }}>SYSTEM</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#ff5c1a' }}>
                        {log.action}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        {log.entity ? `${log.entity} (${log.entityId?.slice(-6).toUpperCase()})` : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b' }} title={JSON.stringify(log.meta)}>
                        {log.meta ? JSON.stringify(log.meta) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4 border-top pt-3">
              <span className="text-muted small">
                Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalLogs} total logs)
              </span>
              <div className="d-flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="btn btn-outline-secondary btn-sm px-3 d-flex align-items-center gap-1"
                  style={{ borderRadius: '8px' }}
                >
                  <LuChevronLeft /> Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="btn btn-outline-secondary btn-sm px-3 d-flex align-items-center gap-1"
                  style={{ borderRadius: '8px' }}
                >
                  Next <LuChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminActivityLogs;
