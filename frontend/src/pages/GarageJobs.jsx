import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import GarageSidebar from '../components/GarageSidebar';
import { getSocket } from '../utils/socket';
import {
  LuWrench,
  LuCar,
  LuUser,
  LuFileText,
  LuUpload,
  LuCheck,
  LuClock,
  LuDollarSign
} from 'react-icons/lu';

const GarageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState(null);

  // Quote building states
  const [partsCost, setPartsCost] = useState('');
  const [laborCost, setLaborCost] = useState('');

  const { toast } = useNotification();
  const { lang } = useLanguage();

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/garages/portal/jobs${filterStatus ? `?status=${filterStatus}` : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch job list.');
      }
      setJobs(data.jobs || []);
      if (selectedJob) {
        const updated = data.jobs.find(j => j._id === selectedJob._id);
        setSelectedJob(updated || null);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filterStatus]);

  useEffect(() => {
    const socket = getSocket();
    const handleNewAssignment = () => {
      toast.info('📋 New job assigned to your garage!');
      fetchJobs();
    };
    socket.on('request:assigned', handleNewAssignment);
    return () => {
      socket.off('request:assigned', handleNewAssignment);
    };
  }, []);

  const handleStatusUpdate = async (jobId, nextStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update job status.');
      }
      toast.success(`Job status advanced to: ${nextStatus.replace(/_/g, ' ')}`);
      fetchJobs();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/garages/portal/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: selectedJob.requestId._id,
          partsCost: parseFloat(partsCost),
          laborCost: parseFloat(laborCost)
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit quote.');
      }
      toast.success('Quote submitted successfully for review!');
      setPartsCost('');
      setLaborCost('');
      fetchJobs();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleInvoiceUpload = async (e) => {
    e.preventDefault();
    if (!selectedJob || !invoiceFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('invoice', invoiceFile);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/garages/portal/jobs/${selectedJob._id}/invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invoice upload failed.');
      }
      toast.success('Invoice uploaded successfully!');
      setInvoiceFile(null);
      fetchJobs();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const getNextStatusOptions = (current) => {
    const STATUS_FLOW = {
      pickup_scheduled:   ['picked_up'],
      picked_up:          ['in_garage'],
      in_garage:          ['inspection_done'],
      inspection_done:    ['repair_in_progress'],
      repair_in_progress: ['work_complete'],
      work_complete:      ['ready_for_delivery'],
      ready_for_delivery: ['delivered'],
      delivered:          ['closed']
    };
    return STATUS_FLOW[current] || [];
  };

  return (
    <div className="staff-wrapper">
      {/* ── SIDEBAR ── */}
      <GarageSidebar activeJobsCount={jobs.filter(j => !['delivered', 'closed'].includes(j.status)).length} />

      {/* ── MAIN CONTENT ── */}
      <main className="staff-main">
        {/* Header */}
        <div className="dash-header mb-4">
          <div>
            <div className="dash-title">
              {lang === 'ar' ? 'بطاقات الأعمال والطلبات' : 'Active Repair Cards'}
            </div>
            <div className="dash-subtitle">
              {lang === 'ar' ? 'إدارة أوامر الإصلاح ورفع الفواتير' : 'View, advance status, and submit invoices for assigned vehicle repairs.'}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="d-flex flex-wrap gap-2">
            {[
              { id: '', label: 'All Repairs' },
              { id: 'pickup_scheduled', label: 'Scheduled' },
              { id: 'in_garage', label: 'In Garage' },
              { id: 'repair_in_progress', label: 'In Progress' },
              { id: 'work_complete', label: 'Completed' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`btn btn-sm fw-bold ${filterStatus === st.id ? 'btn-garro btn-primary-garro' : 'btn-light border'}`}
                style={{ borderRadius: '8px', fontSize: '12.5px' }}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout */}
        <div className="row g-4">
          {/* Left Column: Job Cards List */}
          <div className="col-lg-5">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }}></div>
                <p className="mt-2 text-muted small">Loading Jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="schedule-card text-center py-5">
                <LuWrench size={40} className="text-muted mb-2" style={{ opacity: 0.4 }} />
                <div className="fw-bold text-dark fs-6 mb-1">No repairs found</div>
                <div className="text-muted small">No jobs match the selected filter.</div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {jobs.map(job => {
                  const isSelected = selectedJob?._id === job._id;
                  return (
                    <div
                      key={job._id}
                      onClick={() => setSelectedJob(job)}
                      style={{
                        background: '#ffffff',
                        border: isSelected ? '2px solid #ff5c1a' : '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '18px 20px',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 4px 15px rgba(255,92,26,0.1)' : '0 1px 3px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-dark" style={{ fontSize: '15px' }}>
                          #{job._id.slice(-6).toUpperCase()}
                        </span>
                        <span style={{
                          background: '#fff4ef',
                          color: '#ff5c1a',
                          border: '1px solid #ffe2d5',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: '800',
                          textTransform: 'uppercase'
                        }}>
                          {job.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="fw-bold text-secondary mb-2" style={{ fontSize: '13.5px' }}>
                        <LuCar className="me-1 text-primary-garro" size={14} />
                        {job.requestId?.vehicleId ? (
                          `${job.requestId.vehicleId.make} ${job.requestId.vehicleId.model}`
                        ) : 'Unknown Vehicle'}
                      </div>

                      <div className="d-flex justify-content-between align-items-center text-muted small">
                        <span><LuUser className="me-1" size={12} />{job.requestId?.userId?.name || 'Customer'}</span>
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Job Detail View */}
          <div className="col-lg-7">
            <div className="schedule-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px' }}>
              {selectedJob ? (
                <div>
                  <div className="d-flex justify-content-between align-items-start pb-3 mb-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <div>
                      <h3 className="fw-bold text-dark m-0" style={{ fontSize: '20px' }}>
                        Order #{selectedJob._id.slice(-6).toUpperCase()}
                      </h3>
                      <span className="text-muted small">
                        Assigned on {new Date(selectedJob.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span className="badge bg-success px-3 py-2 fw-bold text-uppercase" style={{ borderRadius: '8px', fontSize: '12px' }}>
                      {selectedJob.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Grid Info */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div className="text-muted small fw-bold text-uppercase mb-1">🚗 Vehicle Details</div>
                        {selectedJob.requestId?.vehicleId ? (
                          <div className="small text-dark" style={{ lineHeight: 1.6 }}>
                            <strong>{selectedJob.requestId.vehicleId.make} {selectedJob.requestId.vehicleId.model} ({selectedJob.requestId.vehicleId.year})</strong><br />
                            Plate: <span className="bg-white px-2 py-0.5 rounded border font-monospace fw-bold">{selectedJob.requestId.vehicleId.registrationNumber || 'N/A'}</span>
                          </div>
                        ) : <div className="small text-muted">Unknown</div>}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div className="text-muted small fw-bold text-uppercase mb-1">👤 Customer Contact</div>
                        {selectedJob.requestId?.userId ? (
                          <div className="small text-dark" style={{ lineHeight: 1.6 }}>
                            <strong>{selectedJob.requestId.userId.name}</strong><br />
                            Phone: {selectedJob.requestId.userId.phone || 'N/A'}<br />
                            Email: {selectedJob.requestId.userId.email || 'N/A'}
                          </div>
                        ) : <div className="small text-muted">Unknown</div>}
                      </div>
                    </div>
                  </div>

                  {/* Issue Description */}
                  <div style={{ background: '#fff4ef', border: '1px solid #ffe8dd', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                    <div className="text-muted small fw-bold text-uppercase mb-1">📋 Service Request &amp; Notes</div>
                    <div className="fw-bold text-primary-garro small text-uppercase mb-1">
                      {selectedJob.requestId?.subCategory || selectedJob.requestId?.serviceType?.replace(/_/g, ' ')}
                    </div>
                    <p className="m-0 small text-secondary" style={{ lineHeight: 1.5 }}>
                      "{selectedJob.requestId?.description || 'No specific notes provided.'}"
                    </p>
                  </div>

                  {/* Progress Status Actions */}
                  <div className="pt-3 mb-4" style={{ borderTop: '1px solid #e2e8f0' }}>
                    <div className="fw-bold text-dark small text-uppercase mb-3 d-flex align-items-center gap-1">
                      <LuClock className="text-primary-garro" size={16} /> Progress Repair Status
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {getNextStatusOptions(selectedJob.status).map(nxt => (
                        <button
                          key={nxt}
                          onClick={() => handleStatusUpdate(selectedJob._id, nxt)}
                          className="btn btn-sm btn-primary-garro fw-bold px-3 py-2"
                          style={{ borderRadius: '8px', fontSize: '13px' }}
                        >
                          Advance to "{nxt.replace(/_/g, ' ').toUpperCase()}"
                        </button>
                      ))}
                      {getNextStatusOptions(selectedJob.status).length === 0 && (
                        <div className="text-success small fw-bold d-flex align-items-center gap-1">
                          <LuCheck size={16} /> Job is completed or managed by system handlers.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Quote Section */}
                  {selectedJob.status === 'quote_pending' && (
                    <div className="pt-3 mb-4" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <div className="fw-bold text-warning small text-uppercase mb-3 d-flex align-items-center gap-1">
                        <LuDollarSign size={16} /> Submit Pricing Breakdown
                      </div>
                      <form onSubmit={handleQuoteSubmit} className="row g-3 align-items-end">
                        <div className="col-md-5">
                          <label className="form-label small fw-bold text-secondary">Parts Cost (AED)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={partsCost}
                            onChange={(e) => setPartsCost(e.target.value)}
                            required
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-md-5">
                          <label className="form-label small fw-bold text-secondary">Labor Cost (AED)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={laborCost}
                            onChange={(e) => setLaborCost(e.target.value)}
                            required
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-md-2">
                          <button type="submit" className="btn btn-sm btn-warning fw-bold w-100 py-1.5" style={{ borderRadius: '8px' }}>
                            Submit
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Invoice PDF Upload */}
                  {['in_garage', 'repair_in_progress', 'work_complete'].includes(selectedJob.status) && (
                    <div className="pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <div className="fw-bold text-success small text-uppercase mb-3 d-flex align-items-center gap-1">
                        <LuFileText size={16} /> Upload Final Garage Invoice (PDF)
                      </div>
                      <form onSubmit={handleInvoiceUpload} className="d-flex gap-2">
                        <input
                          type="file"
                          accept="application/pdf"
                          className="form-control form-control-sm"
                          onChange={(e) => setInvoiceFile(e.target.files[0])}
                          required
                        />
                        <button
                          type="submit"
                          disabled={uploading}
                          className="btn btn-sm btn-success fw-bold d-inline-flex align-items-center gap-1 px-3"
                          style={{ borderRadius: '8px', flexShrink: 0 }}
                        >
                          <LuUpload size={14} /> {uploading ? 'Uploading...' : 'Upload PDF'}
                        </button>
                      </form>
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center py-5">
                  <LuWrench size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                  <div className="fw-bold text-dark fs-6 mb-1">Select a Repair Order</div>
                  <div className="text-muted small">Click any repair card on the left panel to inspect details and update status.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GarageJobs;
