import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import AdminSidebar from '../components/AdminSidebar';

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
    <div className="dash-wrapper">
      <AdminSidebar />
      <main className="dash-main w-100" style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.025em', color: '#0f172a' }}>
          ⚠️ Customer Complaints Ledger
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
          Track and resolve complaints raised by customers regarding jobs or helpers.
        </p>

        {loading ? (
          <p style={{ color: '#64748b' }}>Retrieving complaints...</p>
        ) : complaints.length === 0 ? (
          <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '50px 20px', textAlign: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🎉</span>
            No customer complaints registered! High-quality operations.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {complaints.map(c => (
              <div key={c._id} style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}>
                <div style={{ flex: 1, marginRight: '24px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      background: c.status === 'resolved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: c.status === 'resolved' ? '#10b981' : '#ef4444',
                      borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase'
                    }}>
                      {c.status}
                    </span>
                    <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                      Submitted: {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 10px', color: '#0f172a' }}>
                    {c.title}
                  </h3>
                  
                  <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: '0 0 16px' }}>
                    {c.description}
                  </p>

                  <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#64748b' }}>
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
      </main>
    </div>
  );
};

export default AdminComplaints;
