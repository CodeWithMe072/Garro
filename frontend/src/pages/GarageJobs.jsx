import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getSocket } from '../utils/socket';

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
  const navigate = useNavigate();

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
      setJobs(data.jobs);
      // Keep selected job reference updated
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

  // Live update — when admin assigns a request to this garage, refresh the job list in real-time
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

  // Determine next status option
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
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      color: '#f8fafc',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Navigation */}
        <div style={{ marginBottom: '24px' }}>
          <button onClick={() => navigate('/garage-portal')} style={{
            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline'
          }}>
            ← Return to Dashboard
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, letterSpacing: '-0.025em' }}>
            📋 Active Repair Cards
          </h1>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {['', 'pickup_scheduled', 'in_garage', 'repair_in_progress', 'work_complete', 'ready_for_delivery'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '8px 16px',
                  background: filterStatus === st ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {st === '' ? 'All Repairs' : st.replace(/_/g, ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '30px' }}>

          {/* Left Column: Job Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              <p style={{ color: '#64748b', textAlign: 'center' }}>Loading Jobs...</p>
            ) : jobs.length === 0 ? (
              <div style={{ background: '#1e293b', borderRadius: '16px', padding: '32px', textAlign: 'center', color: '#64748b' }}>
                No repairs match this filter.
              </div>
            ) : (
              jobs.map(job => (
                <div
                  key={job._id}
                  onClick={() => setSelectedJob(job)}
                  style={{
                    background: selectedJob?._id === job._id ? 'rgba(249, 115, 22, 0.08)' : '#1e293b',
                    border: selectedJob?._id === job._id ? '1.5px solid #f97316' : '1.5px solid rgba(255,255,255,0.04)',
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px' }}>
                      #{job._id.slice(-6).toUpperCase()}
                    </span>
                    <span style={{
                      background: 'rgba(249, 115, 22, 0.1)',
                      color: '#f97316',
                      borderRadius: '6px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase'
                    }}>
                      {job.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>
                    {job.requestId?.vehicleId ? (
                      `${job.requestId.vehicleId.make} ${job.requestId.vehicleId.model}`
                    ) : 'Unknown Vehicle'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                    <span>Client: {job.requestId?.userId?.name || 'Customer'}</span>
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Detailed Job View */}
          <div style={{
            background: '#1e293b',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.04)',
            alignSelf: 'start'
          }}>
            {selectedJob ? (
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px' }}>
                      Repair Order #{selectedJob._id.slice(-6).toUpperCase()}
                    </h2>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                      Assigned on {new Date(selectedJob.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                      padding: '6px 14px',
                      borderRadius: '30px',
                      fontSize: '13px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      display: 'inline-block'
                    }}>
                      {selectedJob.status.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>

                {/* Grid Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '32px' }}>
                  {/* Vehicle */}
                  <div>
                    <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '10px' }}>
                      🚗 Vehicle Info
                    </h4>
                    {selectedJob.requestId?.vehicleId ? (
                      <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                        <strong>{selectedJob.requestId.vehicleId.make} {selectedJob.requestId.vehicleId.model}</strong><br />
                        Year: {selectedJob.requestId.vehicleId.year}<br />
                        Plate: <span style={{ background: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>{selectedJob.requestId.vehicleId.registrationNumber}</span>
                      </p>
                    ) : <p>Unknown</p>}
                  </div>

                  {/* Customer */}
                  <div>
                    <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '10px' }}>
                      👤 Customer Info
                    </h4>
                    {selectedJob.requestId?.userId ? (
                      <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                        <strong>{selectedJob.requestId.userId.name}</strong><br />
                        Phone: {selectedJob.requestId.userId.phone}<br />
                        Email: {selectedJob.requestId.userId.email}
                      </p>
                    ) : <p>Unknown</p>}
                  </div>
                </div>

                {/* Description */}
                <div style={{ background: '#0f172a', borderRadius: '12px', padding: '16px 20px', marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 6px' }}>
                    📋 Reported Issue / Service Type
                  </h4>
                  <span style={{ fontSize: '12px', color: '#f97316', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    {selectedJob.requestId?.subCategory || selectedJob.requestId?.serviceType?.replace(/_/g, ' ')}
                  </span>
                  <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {selectedJob.requestId?.description}
                  </p>
                </div>

                {/* Repair Status Timeline Actions */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>
                    🛠️ Progress Repair State
                  </h4>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {getNextStatusOptions(selectedJob.status).map(nxt => (
                      <button
                        key={nxt}
                        onClick={() => handleStatusUpdate(selectedJob._id, nxt)}
                        style={{
                          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 18px',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(249, 115, 22, 0.15)'
                        }}
                      >
                        Advance to "{nxt.replace(/_/g, ' ').toUpperCase()}"
                      </button>
                    ))}
                    {getNextStatusOptions(selectedJob.status).length === 0 && (
                      <span style={{ color: '#64748b', fontSize: '13px' }}>
                        Repair card is completed or managed by system/helpers.
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit Quote Section */}
                {selectedJob.status === 'quote_pending' && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', marginBottom: '32px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', color: '#fbbf24' }}>
                      💰 Submit Pricing Breakdown (Quote Required)
                    </h4>
                    <form onSubmit={handleQuoteSubmit} style={{ display: 'flex', gap: '16px', alignItems: 'end' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>Parts Cost (AED)</label>
                        <input
                          type="number"
                          value={partsCost}
                          onChange={(e) => setPartsCost(e.target.value)}
                          required
                          placeholder="0.00"
                          style={{
                            width: '100%', padding: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>Labor Cost (AED)</label>
                        <input
                          type="number"
                          value={laborCost}
                          onChange={(e) => setLaborCost(e.target.value)}
                          required
                          placeholder="0.00"
                          style={{
                            width: '100%', padding: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white'
                          }}
                        />
                      </div>
                      <button type="submit" style={{
                        padding: '10px 20px', background: '#fbbf24', border: 'none', borderRadius: '8px', color: '#0f172a', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                      }}>
                        Submit Quote
                      </button>
                    </form>
                  </div>
                )}

                {/* Upload Invoice PDF Section */}
                {['in_garage', 'repair_in_progress', 'work_complete'].includes(selectedJob.status) && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', color: '#10b981' }}>
                      📄 Upload Final Garage Invoice (PDF)
                    </h4>
                    <form onSubmit={handleInvoiceUpload} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setInvoiceFile(e.target.files[0])}
                        required
                        style={{
                          flex: 1, padding: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px'
                        }}
                      />
                      <button type="submit" disabled={uploading} style={{
                        padding: '10px 20px', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer', opacity: uploading ? 0.7 : 1
                      }}>
                        {uploading ? 'Uploading...' : 'Upload PDF'}
                      </button>
                    </form>
                  </div>
                )}

              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>👈</span>
                Select a repair card from the left panel to manage it.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default GarageJobs;
