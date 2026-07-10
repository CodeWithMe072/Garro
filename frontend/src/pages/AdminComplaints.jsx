import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  
  // Local state for resolution form
  const [showResolveForm, setShowResolveForm] = useState(null);
  const [resolutionType, setResolutionType] = useState('no_action');
  const [resolutionAmount, setResolutionAmount] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  
  const { toast } = useNotification();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/complaints`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch complaints list.');
      }
      setComplaints(data.complaints || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolveSubmit = async (e, id) => {
    e.preventDefault();
    setResolvingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/complaints/${id}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resolution: {
            type: resolutionType,
            amount: ['refund', 'compensation'].includes(resolutionType) ? parseFloat(resolutionAmount) : 0,
            notes: resolutionNotes
          }
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to resolve complaint.');
      }
      toast.success('Complaint resolved successfully.');
      setShowResolveForm(null);
      // Reset form fields
      setResolutionType('no_action');
      setResolutionAmount('');
      setResolutionNotes('');
      fetchComplaints();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      color: '#f8fafc',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Navigation */}
        <div style={{ marginBottom: '24px' }}>
          <button onClick={() => navigate('/admin')} style={{
            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline'
          }}>
            ← Return to Admin Dashboard
          </button>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.025em' }}>
          ⚠️ Customer Complaints Ledger
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>
          Track and resolve complaints raised by customers regarding jobs or helpers.
        </p>

        {loading ? (
          <p style={{ color: '#64748b' }}>Retrieving complaints...</p>
        ) : complaints.length === 0 ? (
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '50px 20px', textAlign: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🎉</span>
            No customer complaints registered! High-quality operations.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {complaints.map(c => (
              <div key={c._id} style={{
                background: '#1e293b',
                border: '1.5px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1, marginRight: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        background: c.status === 'resolved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: c.status === 'resolved' ? '#10b981' : '#f87171',
                        borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase'
                      }}>
                        {c.status}
                      </span>
                      <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                        Submitted: {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 10px' }}>
                      {c.title || 'Service Complaint'}
                    </h3>
                    
                    <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.5', margin: '0 0 16px' }}>
                      {c.description}
                    </p>

                    <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#94a3b8' }}>
                      <span>Client: <strong>{c.customerId?.name || 'Customer'}</strong> ({c.customerId?.email})</span>
                      {c.jobId && (
                        <span>Job Card: <strong>#{c.jobId.slice(-6).toUpperCase()}</strong></span>
                      )}
                    </div>
                  </div>

                  {c.status !== 'resolved' && showResolveForm !== c._id && (
                    <button
                      onClick={() => {
                        setShowResolveForm(c._id);
                        setResolutionType('no_action');
                        setResolutionAmount('');
                        setResolutionNotes('');
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 18px',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      Resolve Complaint
                    </button>
                  )}
                </div>

                {/* Structured Resolution Display */}
                {c.status === 'resolved' && c.resolution && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '14px'
                  }}>
                    <div style={{ fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
                      Resolved Resolution Details:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                      <div>Type: <strong style={{ textTransform: 'capitalize' }}>{c.resolution.type?.replace(/_/g, ' ')}</strong></div>
                      {['refund', 'compensation'].includes(c.resolution.type) && (
                        <div>Refunded Amount: <strong>AED {c.resolution.amount?.toFixed(2)}</strong></div>
                      )}
                      {c.resolution.resolvedAt && (
                        <div>Resolved On: <strong>{new Date(c.resolution.resolvedAt).toLocaleDateString()}</strong></div>
                      )}
                    </div>
                    {c.resolution.notes && (
                      <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '13px' }}>
                        Notes: "{c.resolution.notes}"
                      </div>
                    )}
                  </div>
                )}

                {/* Form to submit structured resolution */}
                {showResolveForm === c._id && (
                  <form onSubmit={(e) => handleResolveSubmit(e, c._id)} style={{
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    marginTop: '8px'
                  }}>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>Specify Complaint Resolution:</div>
                    
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '12.5px', marginBottom: '6px', color: '#94a3b8' }}>Resolution Type</label>
                        <select
                          value={resolutionType}
                          onChange={(e) => setResolutionType(e.target.value)}
                          style={{
                            width: '100%',
                            background: '#1e293b',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            padding: '8px',
                            color: 'white'
                          }}
                        >
                          <option value="refund">Issue Refund (Stripe Transaction)</option>
                          <option value="compensation">Compensation (Direct Credit)</option>
                          <option value="fix_at_garage">Fix vehicle at Garage</option>
                          <option value="replacement">Replacement vehicle provided</option>
                          <option value="no_action">Dismiss (No action)</option>
                        </select>
                      </div>

                      {['refund', 'compensation'].includes(resolutionType) && (
                        <div style={{ width: '150px' }}>
                          <label style={{ display: 'block', fontSize: '12.5px', marginBottom: '6px', color: '#94a3b8' }}>Amount (AED)</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={resolutionAmount}
                            onChange={(e) => setResolutionAmount(e.target.value)}
                            style={{
                              width: '100%',
                              background: '#1e293b',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '6px',
                              padding: '8px',
                              color: 'white',
                              boxSizing: 'border-box'
                            }}
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', marginBottom: '6px', color: '#94a3b8' }}>Notes / Explanation</label>
                      <textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Resolution summary, terms or instructions..."
                        style={{
                          width: '100%',
                          height: '80px',
                          background: '#1e293b',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          padding: '10px',
                          color: 'white',
                          boxSizing: 'border-box',
                          resize: 'none'
                        }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'end' }}>
                      <button
                        type="button"
                        onClick={() => setShowResolveForm(null)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 16px',
                          color: '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={resolvingId === c._id}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 20px',
                          color: 'white',
                          fontWeight: '700',
                          cursor: 'pointer',
                          opacity: resolvingId === c._id ? 0.7 : 1
                        }}
                      >
                        {resolvingId === c._id ? 'Saving...' : 'Confirm Resolve'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminComplaints;
