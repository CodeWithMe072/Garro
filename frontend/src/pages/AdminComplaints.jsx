import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  
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

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/complaints/${id}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'resolved' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to resolve complaint.');
      }
      toast.success('Complaint marked as Resolved.');
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
                justifyContent: 'space-between',
                alignItems: 'start'
              }}>
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
                    {c.title}
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

                {c.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolve(c._id)}
                    disabled={resolvingId === c._id}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 18px',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                      opacity: resolvingId === c._id ? 0.7 : 1
                    }}
                  >
                    {resolvingId === c._id ? 'Resolving...' : 'Mark Resolved'}
                  </button>
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
