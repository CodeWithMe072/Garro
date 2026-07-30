import React from 'react';
import { LuClipboardList, LuClock, LuCircleCheck, LuCircleX, LuDollarSign, LuDownload } from 'react-icons/lu';

const RefundStatsCards = ({ stats, range, onRangeChange, onOpenExportModal }) => {
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 className="fw-bold mb-0 text-slate-800" style={{ fontSize: '15px' }}>
          Refund &amp; Cancellation Overview
        </h5>
        
        <div className="d-flex align-items-center gap-2">
          {/* Single Download Report Button */}
          {onOpenExportModal && (
            <button
              type="button"
              onClick={() => onOpenExportModal('pdf')}
              className="btn btn-sm btn-outline-primary fw-bold d-inline-flex align-items-center gap-1.5 me-2"
              style={{ borderRadius: '8px', fontSize: '12px', padding: '6px 14px' }}
            >
              <LuDownload size={15} /> Download Report
            </button>
          )}

          {/* Time Range Toggle */}
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn ${range === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => onRangeChange('all')}
              style={{ borderRadius: '8px 0 0 8px', fontSize: '12px', fontWeight: 600 }}
            >
              All Time
            </button>
            <button
              type="button"
              className={`btn ${range === 'month' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => onRangeChange('month')}
              style={{ borderRadius: '0 8px 8px 0', fontSize: '12px', fontWeight: 600 }}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* 1. Total Requests */}
        <div className="col-12 col-sm-6 col-md-4 col-lg flex-grow-1">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '14px', background: '#ffffff', border: '1px solid #cbd5e1' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">Total Requests</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LuClipboardList size={18} />
              </div>
            </div>
            <h3 className="fw-extrabold text-slate-900 mb-0" style={{ fontSize: '24px' }}>{stats?.total || 0}</h3>
            <span className="text-muted" style={{ fontSize: '11px' }}>All-time cancellations</span>
          </div>
        </div>

        {/* 2. Pending */}
        <div className="col-12 col-sm-6 col-md-4 col-lg flex-grow-1">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '14px', background: '#fffbebf0', border: '1.5px solid #fde68a' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold small" style={{ color: '#b45309' }}>Pending Review</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LuClock size={18} />
              </div>
            </div>
            <h3 className="fw-extrabold mb-0" style={{ fontSize: '24px', color: '#d97706' }}>{stats?.pending || 0}</h3>
            <span style={{ fontSize: '11px', color: '#b45309' }}>Requires admin action</span>
          </div>
        </div>

        {/* 3. Approved */}
        <div className="col-12 col-sm-6 col-md-4 col-lg flex-grow-1">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '14px', background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold small" style={{ color: '#15803d' }}>Approved &amp; Refunded</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LuCircleCheck size={18} />
              </div>
            </div>
            <h3 className="fw-extrabold mb-0" style={{ fontSize: '24px', color: '#16a34a' }}>{stats?.approved || 0}</h3>
            <span style={{ fontSize: '11px', color: '#15803d' }}>Refund completed</span>
          </div>
        </div>

        {/* 4. Rejected */}
        <div className="col-12 col-sm-6 col-md-4 col-lg flex-grow-1">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '14px', background: '#fef2f2', border: '1.5px solid #fecdd3' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold small" style={{ color: '#b91c1c' }}>Rejected</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LuCircleX size={18} />
              </div>
            </div>
            <h3 className="fw-extrabold mb-0" style={{ fontSize: '24px', color: '#dc2626' }}>{stats?.rejected || 0}</h3>
            <span style={{ fontSize: '11px', color: '#b91c1c' }}>Reverted to booking</span>
          </div>
        </div>

        {/* 5. Total Refunded Amount */}
        <div className="col-12 col-sm-6 col-md-4 col-lg flex-grow-1">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '14px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small fw-semibold" style={{ color: '#94a3b8' }}>Total Refunded</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LuDollarSign size={18} />
              </div>
            </div>
            <h3 className="fw-extrabold text-success mb-0" style={{ fontSize: '22px' }}>
              AED {stats?.totalRefundedAmount ? stats.totalRefundedAmount.toLocaleString() : '0'}
            </h3>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Processed bank payouts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundStatsCards;
