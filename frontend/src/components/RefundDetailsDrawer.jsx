import React, { useState } from 'react';
import { LuX, LuUser, LuPhone, LuMail, LuCar, LuStore, LuClipboardList, LuCalendar, LuDollarSign, LuHistory, LuCircleCheck, LuCircleX } from 'react-icons/lu';

const formatServiceName = (serviceType, subCategory) => {
  const val = subCategory || serviceType || '';
  if (!val) return 'General Service';
  const map = {
    'ac_repair': 'AC Repair',
    'emergency_pickup': 'Emergency Pickup',
    'minor_service': 'Minor Service',
    'major_service': 'Major Service',
    'brake_repair': 'Brake Repair',
    'roadside_assistance': 'Roadside Assistance',
    'electrical': 'Electrical Repair',
    'diagnostics': 'Computer Diagnostics',
    'battery': 'Battery Replacement',
    'tyre_change': 'Tyre Change'
  };
  if (map[val.toLowerCase()]) return map[val.toLowerCase()];
  return val
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

const RefundDetailsDrawer = ({ request, onClose, onApprove, onReject }) => {
  if (!request) return null;

  const isPending = request.status === 'cancellation_requested' || request.refundStatus === 'requested';
  const isApproved = request.status === 'cancelled' && ['approved', 'processed'].includes(request.refundStatus);
  const isRejected = request.refundStatus === 'rejected';

  const origAmount = request.invoice?.totalAmount || request.refundAmount || request.estimatedCost || 299;
  const cleanReason = (request.cancellationReason || 'No reason provided by customer.').replace(/^["']|["']$/g, '').trim();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-in-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          height: '100%',
          background: '#ffffff',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div>
            <span className="badge bg-secondary mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
              REFUND REQUEST DETAILS
            </span>
            <h4 className="fw-extrabold mb-0" style={{ color: '#0f172a', fontSize: '18px' }}>
              Booking #{request._id ? request._id.toString().slice(-8).toUpperCase() : 'N/A'}
            </h4>
          </div>
          <button
            onClick={onClose}
            className="btn btn-light btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
            style={{ width: '36px', height: '36px' }}
          >
            <LuX size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* 1. Status Banner */}
          <div style={{
            borderRadius: '12px',
            padding: '14px 18px',
            background: isPending ? '#fffbebf0' : isApproved ? '#f0fdf4' : '#fef2f2',
            border: isPending ? '1.5px solid #fde68a' : isApproved ? '1.5px solid #bbf7d0' : '1.5px solid #fecdd3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: isPending ? '#b45309' : isApproved ? '#15803d' : '#b91c1c' }}>
                CURRENT REFUND STATUS
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: isPending ? '#d97706' : isApproved ? '#16a34a' : '#dc2626' }}>
                {isPending ? '⏳ Pending Admin Approval' : isApproved ? '✓ Approved &amp; Refund Processed' : '✕ Refund Request Rejected'}
              </div>
            </div>
            <span className={`badge ${isPending ? 'bg-warning text-dark' : isApproved ? 'bg-success' : 'bg-danger'}`} style={{ padding: '8px 12px', fontSize: '12px' }}>
              {(request.refundStatus || request.status).toUpperCase()}
            </span>
          </div>

          {/* 2. Customer Info Card */}
          <div className="card border-0 shadow-none p-3" style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div className="fw-bold mb-2 text-slate-800" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LuUser size={15} className="text-primary" /> Customer Profile
            </div>
            <div className="fw-extrabold text-dark" style={{ fontSize: '15px' }}>{request.userId?.name || 'Customer'}</div>
            <div className="small text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <LuMail size={13} /> {request.userId?.email || 'N/A'}
            </div>
            <div className="small text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <LuPhone size={13} /> {request.userId?.phone || 'N/A'}
            </div>
          </div>

          {/* 3. Booking & Vehicle Summary */}
          <div className="card border-0 shadow-none p-3" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div className="fw-bold mb-2 text-slate-800" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LuClipboardList size={15} className="text-secondary" /> Service &amp; Assignment Summary
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Service Type:</span>
              <span className="fw-bold text-dark small">{formatServiceName(request.serviceType, request.subCategory)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Vehicle:</span>
              <span className="fw-bold text-dark small" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LuCar size={13} /> {request.vehicleId ? `${request.vehicleId.make} ${request.vehicleId.model} (${request.vehicleId.year})` : 'N/A'}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Assigned Garage:</span>
              <span className="fw-bold text-dark small" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LuStore size={13} /> {request.garageId?.name || 'Pending Assignment'}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted small">Request Created Date:</span>
              <span className="fw-semibold text-slate-700 small">
                {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* 4. Full Cancellation Reason (Non-truncated) */}
          <div className="card border-0 shadow-none p-3" style={{ background: '#fef2f2', borderRadius: '12px', border: '1.5px solid #fecdd3' }}>
            <div className="fw-bold mb-1 text-danger" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Customer Cancellation Reason:
            </div>
            <p className="mb-0 fw-semibold" style={{ color: '#991b1b', fontSize: '13.5px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {cleanReason}
            </p>
            {request.cancellationReason && request.cancellationReason.length < 5 && (
              <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700, marginTop: '6px' }}>
                ⚠️ Note: Short/minimal cancellation reason entered by customer.
              </div>
            )}
          </div>

          {/* 5. Financial Refund Breakdown */}
          <div className="card border-0 shadow-none p-3" style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
            <div className="fw-bold mb-2 text-slate-800" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LuDollarSign size={15} className="text-success" /> Refund Financial Breakdown
            </div>
            <div className="d-flex justify-content-between mb-2" style={{ fontSize: '13px' }}>
              <span className="text-muted">Original Customer Payment:</span>
              <span className="fw-bold text-dark">AED {origAmount.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2" style={{ fontSize: '13px' }}>
              <span className="text-muted">Net Refund Amount:</span>
              <span className="fw-extrabold text-success" style={{ fontSize: '16px' }}>
                AED {(request.refundAmount || origAmount).toFixed(2)}
              </span>
            </div>
            <div className="small text-muted" style={{ fontSize: '11px', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
              Payment Method: Stripe Card / Online Escrow | Platform Fee Deducted: Included
            </div>
          </div>

          {/* 6. Status History / Audit Trail */}
          <div className="card border-0 shadow-none p-3" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div className="fw-bold mb-3 text-slate-800" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LuHistory size={15} className="text-primary" /> Status Audit Trail Log
            </div>
            {request.statusHistory && request.statusHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {request.statusHistory.map((item, idx) => (
                  <div key={idx} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #ff5c1a' }}>
                    <div className="d-flex justify-content-between" style={{ fontSize: '12px' }}>
                      <strong className="text-slate-800" style={{ textTransform: 'uppercase' }}>{item.status}</strong>
                      <span className="text-muted" style={{ fontSize: '11px' }}>{new Date(item.changedAt).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      By: {item.changedBy} {item.note && `— "${item.note}"`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #cbd5e1', fontSize: '12px', color: '#64748b' }}>
                Requested by customer on {request.cancellationRequestedAt ? new Date(request.cancellationRequestedAt).toLocaleString() : new Date(request.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        {isPending && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', gap: '12px' }}>
            <button
              onClick={() => { onClose(); onApprove(request); }}
              className="btn btn-success fw-bold flex-grow-1 py-2.5"
              style={{ borderRadius: '10px', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}
            >
              ✓ Approve &amp; Refund Customer
            </button>
            <button
              onClick={() => { onClose(); onReject(request); }}
              className="btn btn-outline-danger fw-bold flex-grow-1 py-2.5"
              style={{ borderRadius: '10px' }}
            >
              ✕ Reject Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundDetailsDrawer;
