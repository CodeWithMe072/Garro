import React from 'react';
import { LuDollarSign, LuClock, LuCircleCheck, LuCircleX, LuDownload, LuWallet } from 'react-icons/lu';

const PayoutStatsCards = ({ stats, range, onRangeChange, onOpenExportModal }) => {
  return (
    <div className="mb-4">
      {/* Header Row: Title & Action Controls */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 className="fw-bold mb-0 text-slate-800" style={{ fontSize: '15px' }}>
          Payout Settlements Overview
        </h5>
        
        <div className="d-flex align-items-center gap-2">
          {/* Download Report Button */}
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

      {/* 5 Stats Cards Grid */}
      <div className="row g-3">
        {/* Card 1: Total Payouts */}
        <div className="col-12 col-sm-6 col-lg">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '14px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted fw-bold" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Payouts
              </span>
              <div style={{ padding: '6px', borderRadius: '8px', background: '#f1f5f9', color: '#475569' }}>
                <LuWallet size={16} />
              </div>
            </div>
            <h3 className="fw-extrabold mb-1" style={{ color: '#0f172a', fontSize: '22px' }}>
              {stats?.total ?? 0}
            </h3>
            <span className="text-muted" style={{ fontSize: '11.5px' }}>All-time settlements</span>
          </div>
        </div>

        {/* Card 2: Pending */}
        <div className="col-12 col-sm-6 col-lg">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '14px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted fw-bold" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Pending
              </span>
              <div style={{ padding: '6px', borderRadius: '8px', background: '#fffbebf0', color: '#d97706' }}>
                <LuClock size={16} />
              </div>
            </div>
            <h3 className="fw-extrabold mb-1" style={{ color: '#d97706', fontSize: '22px' }}>
              {stats?.pending ?? 0}
            </h3>
            <span className="text-muted" style={{ fontSize: '11.5px' }}>Requires processing</span>
          </div>
        </div>

        {/* Card 3: Processed */}
        <div className="col-12 col-sm-6 col-lg">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '14px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted fw-bold" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Processed
              </span>
              <div style={{ padding: '6px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a' }}>
                <LuCircleCheck size={16} />
              </div>
            </div>
            <h3 className="fw-extrabold mb-1" style={{ color: '#16a34a', fontSize: '22px' }}>
              {stats?.processed ?? 0}
            </h3>
            <span className="text-muted" style={{ fontSize: '11.5px' }}>Payout completed</span>
          </div>
        </div>

        {/* Card 4: Failed / On Hold */}
        <div className="col-12 col-sm-6 col-lg">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '14px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted fw-bold" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Failed / On Hold
              </span>
              <div style={{ padding: '6px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626' }}>
                <LuCircleX size={16} />
              </div>
            </div>
            <h3 className="fw-extrabold mb-1" style={{ color: '#dc2626', fontSize: '22px' }}>
              {stats?.failed ?? 0}
            </h3>
            <span className="text-muted" style={{ fontSize: '11.5px' }}>Needs review</span>
          </div>
        </div>

        {/* Card 5: Total Paid Out (AED) */}
        <div className="col-12 col-sm-6 col-lg">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '14px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted fw-bold" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Paid Out
              </span>
              <div style={{ padding: '6px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a' }}>
                <LuDollarSign size={16} />
              </div>
            </div>
            <h3 className="fw-extrabold mb-1" style={{ color: '#16a34a', fontSize: '20px' }}>
              AED {(stats?.totalPaidOut || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-muted" style={{ fontSize: '11.5px' }}>Processed bank payouts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutStatsCards;
