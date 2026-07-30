import React, { useState } from 'react';
import { LuX, LuFileSpreadsheet, LuFileText, LuDownload, LuLoader } from 'react-icons/lu';

const RefundExportModal = ({ isOpen, onClose, initialFormat = 'pdf' }) => {
  const [format, setFormat] = useState(initialFormat); // 'pdf' | 'excel'
  const [range, setRange] = useState('month'); // 'today' | 'month' | 'custom' | 'all'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      if (range === 'custom' && !dateFrom && !dateTo) {
        alert('Please select at least a From Date or To Date for custom range.');
        return;
      }

      setIsExporting(true);
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const fmtParam = format === 'excel' ? 'xlsx' : 'pdf';
      let endpoint = `${API_BASE}/api/admin/cancellations/export?format=${fmtParam}&range=${range}`;

      if (range === 'custom') {
        if (dateFrom) endpoint += `&dateFrom=${dateFrom}`;
        if (dateTo) endpoint += `&dateTo=${dateTo}`;
      }

      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to generate export file');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `refund_requests_${range}_${new Date().toISOString().split('T')[0]}.${fmtParam}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setIsExporting(false);
      onClose();
    } catch (err) {
      console.error('Export download error:', err);
      setIsExporting(false);
      alert('Failed to generate export file. Please try again.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-in-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {format === 'pdf' ? (
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LuFileText size={20} />
              </div>
            ) : (
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LuFileSpreadsheet size={20} />
              </div>
            )}
            <div>
              <h5 className="fw-bold mb-0 text-slate-900" style={{ fontSize: '16px' }}>
                Export Refund Report
              </h5>
              <span className="text-muted" style={{ fontSize: '12px' }}>
                Select format and date range scope
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-light btn-sm rounded-circle p-1.5" style={{ width: '32px', height: '32px', border: 'none' }}>
            <LuX size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          
          {/* Format Selector Tabs */}
          <label className="form-label fw-bold text-slate-700 mb-2" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            1. Select Export Format
          </label>
          <div className="d-flex gap-2 mb-4">
            <button
              type="button"
              className={`btn flex-fill fw-bold py-2.5 d-flex align-items-center justify-content-center gap-2 ${format === 'pdf' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setFormat('pdf')}
              style={{ borderRadius: '12px', fontSize: '13px' }}
            >
              <LuFileText size={16} /> PDF Document
            </button>
            <button
              type="button"
              className={`btn flex-fill fw-bold py-2.5 d-flex align-items-center justify-content-center gap-2 ${format === 'excel' ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => setFormat('excel')}
              style={{ borderRadius: '12px', fontSize: '13px' }}
            >
              <LuFileSpreadsheet size={16} /> Excel (.xlsx)
            </button>
          </div>

          {/* Date Range Selection */}
          <label className="form-label fw-bold text-slate-700 mb-2" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            2. Select Date Range
          </label>
          <div className="d-flex flex-column gap-2 mb-4">
            
            {/* Option 1: Today */}
            <div
              onClick={() => setRange('today')}
              style={{
                border: range === 'today' ? '2px solid #ff5c1a' : '1px solid #cbd5e1',
                background: range === 'today' ? '#fff8f5' : '#ffffff',
                borderRadius: '12px',
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>⚡</span>
                <div>
                  <div className="fw-bold text-slate-900" style={{ fontSize: '13.5px' }}>Today</div>
                  <div className="text-muted" style={{ fontSize: '11.5px' }}>Cancellations &amp; refunds submitted today</div>
                </div>
              </div>
              <input type="radio" name="range" checked={range === 'today'} onChange={() => setRange('today')} style={{ accentColor: '#ff5c1a' }} />
            </div>

            {/* Option 2: This Month */}
            <div
              onClick={() => setRange('month')}
              style={{
                border: range === 'month' ? '2px solid #ff5c1a' : '1px solid #cbd5e1',
                background: range === 'month' ? '#fff8f5' : '#ffffff',
                borderRadius: '12px',
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>📅</span>
                <div>
                  <div className="fw-bold text-slate-900" style={{ fontSize: '13.5px' }}>This Month</div>
                  <div className="text-muted" style={{ fontSize: '11.5px' }}>All requests from the current calendar month</div>
                </div>
              </div>
              <input type="radio" name="range" checked={range === 'month'} onChange={() => setRange('month')} style={{ accentColor: '#ff5c1a' }} />
            </div>

            {/* Option 3: Custom Date Range (Past Months/Years) */}
            <div
              onClick={() => setRange('custom')}
              style={{
                border: range === 'custom' ? '2px solid #ff5c1a' : '1px solid #cbd5e1',
                background: range === 'custom' ? '#fff8f5' : '#ffffff',
                borderRadius: '12px',
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>🛠️</span>
                  <div>
                    <div className="fw-bold text-slate-900" style={{ fontSize: '13.5px' }}>Custom Range (Past Months &amp; Years)</div>
                    <div className="text-muted" style={{ fontSize: '11.5px' }}>Select any past month, year, or custom dates</div>
                  </div>
                </div>
                <input type="radio" name="range" checked={range === 'custom'} onChange={() => setRange('custom')} style={{ accentColor: '#ff5c1a' }} />
              </div>

              {range === 'custom' && (
                <div className="row g-2 mt-1" onClick={(e) => e.stopPropagation()}>
                  <div className="col-6">
                    <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>From Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      style={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>To Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      style={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Option 4: All Time */}
            <div
              onClick={() => setRange('all')}
              style={{
                border: range === 'all' ? '2px solid #ff5c1a' : '1px solid #cbd5e1',
                background: range === 'all' ? '#fff8f5' : '#ffffff',
                borderRadius: '12px',
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>🌐</span>
                <div>
                  <div className="fw-bold text-slate-900" style={{ fontSize: '13.5px' }}>All Time</div>
                  <div className="text-muted" style={{ fontSize: '11.5px' }}>Complete historical refund records</div>
                </div>
              </div>
              <input type="radio" name="range" checked={range === 'all'} onChange={() => setRange('all')} style={{ accentColor: '#ff5c1a' }} />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-light flex-fill fw-bold py-2.5"
              onClick={onClose}
              disabled={isExporting}
              style={{ borderRadius: '12px', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary flex-fill fw-bold py-2.5 d-flex align-items-center justify-content-center gap-2"
              onClick={handleDownload}
              disabled={isExporting}
              style={{ borderRadius: '12px', fontSize: '13.5px', background: 'linear-gradient(135deg, #ff5c1a 0%, #e04806 100%)', border: 'none' }}
            >
              {isExporting ? (
                <>
                  <LuLoader className="spinner-border spinner-border-sm" /> Generating...
                </>
              ) : (
                <>
                  <LuDownload size={16} /> Download {format === 'pdf' ? 'PDF' : 'Excel'}
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RefundExportModal;
