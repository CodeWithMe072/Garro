import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userVehicles, setUserVehicles] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const { toast } = useNotification();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/users?role=customer${search ? `&search=${search}` : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch customer list.');
      }
      setUsers(data.users || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleSelectUser = async (userObj) => {
    setSelectedUser(userObj);
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // 1. Fetch user's vehicles (admin view fetches all vehicles, so we filter by userId)
      const vehRes = await fetch(`${API_BASE}/api/vehicles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const vehData = await vehRes.json();
      if (vehRes.ok && vehData.success) {
        const filteredVeh = (vehData.vehicles || []).filter(v => v.userId?._id === userObj._id || v.userId === userObj._id);
        setUserVehicles(filteredVeh);
      }

      // 2. Fetch user's requests (admin view fetches all requests, so we filter by userId)
      const reqRes = await fetch(`${API_BASE}/api/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reqData = await reqRes.json();
      if (reqRes.ok && reqData.success) {
        const filteredReq = (reqData.requests || []).filter(r => r.userId?._id === userObj._id || r.userId === userObj._id);
        setUserRequests(filteredReq);
      }
    } catch (err) {
      console.error('Failed to load user profile details:', err);
    } finally {
      setDetailsLoading(false);
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
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Navigation */}
        <div style={{ marginBottom: '24px' }}>
          <button onClick={() => navigate('/admin')} style={{
            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline'
          }}>
            ← Return to Admin Dashboard
          </button>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '32px', letterSpacing: '-0.025em' }}>
          👥 Customer Directory &amp; History
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '30px' }}>
          
          {/* Left Column: Search & Customers list */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="🔍 Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none'
                }}
              />
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#94a3b8' }}>
              Registered Customers ({users.length})
            </h3>

            {loading ? (
              <p style={{ color: '#64748b' }}>Searching users...</p>
            ) : users.length === 0 ? (
              <div style={{ background: '#1e293b', borderRadius: '16px', padding: '32px', textAlign: 'center', color: '#64748b' }}>
                No customer records found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
                {users.map(u => (
                  <div
                    key={u._id}
                    onClick={() => handleSelectUser(u)}
                    style={{
                      background: selectedUser?._id === u._id ? 'rgba(249, 115, 22, 0.08)' : '#1e293b',
                      border: selectedUser?._id === u._id ? '1.5px solid #f97316' : '1.5px solid rgba(255,255,255,0.04)',
                      borderRadius: '14px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px' }}>{u.name}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: '0 0 4px' }}>📧 {u.email}</p>
                    <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>📞 {u.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Customer Dossier */}
          <div style={{
            background: '#1e293b',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.04)',
            alignSelf: 'start'
          }}>
            {selectedUser ? (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
                  {selectedUser.name}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                  Customer ID: #{selectedUser._id} &nbsp;|&nbsp; Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>

                {detailsLoading ? (
                  <p style={{ color: '#64748b' }}>Retrieving vehicles &amp; request logs...</p>
                ) : (
                  <div>
                    {/* Vehicles */}
                    <div style={{ marginBottom: '32px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#f97316', letterSpacing: '0.05em', marginBottom: '16px' }}>
                        🚗 Registered Vehicles ({userVehicles.length})
                      </h4>
                      {userVehicles.length === 0 ? (
                        <p style={{ color: '#64748b', fontSize: '13px' }}>No vehicles registered under this profile.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                          {userVehicles.map(v => (
                            <div key={v._id} style={{ background: '#0f172a', padding: '16px', borderRadius: '12px' }}>
                              <strong style={{ fontSize: '14px' }}>{v.make} {v.model}</strong>
                              <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px' }}>
                                Year: {v.year} <br />
                                Plate: {v.registrationNumber}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Request History */}
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#f97316', letterSpacing: '0.05em', marginBottom: '16px' }}>
                        📜 Service Request &amp; Job Logs ({userRequests.length})
                      </h4>
                      {userRequests.length === 0 ? (
                        <p style={{ color: '#64748b', fontSize: '13px' }}>No requests submitted by this customer.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {userRequests.map(r => (
                            <div key={r._id} style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>#{r._id.slice(-6).toUpperCase()} — {new Date(r.createdAt).toLocaleDateString()}</span>
                                <strong style={{ display: 'block', fontSize: '14px', marginTop: '2px' }}>{(r.subCategory || r.serviceType)?.replace(/_/g, ' ').toUpperCase()}</strong>
                                <span style={{ fontSize: '13px', color: '#cbd5e1' }}>{r.description}</span>
                              </div>
                              <span style={{
                                background: r.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249,115,22,0.1)',
                                color: r.status === 'completed' ? '#10b981' : '#f97316',
                                borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: '700'
                              }}>
                                {r.status.toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '120px 20px', color: '#64748b' }}>
                <span style={{ fontSize: '56px', display: 'block', marginBottom: '16px' }}>👈</span>
                Select a customer profile from the left panel to inspect their dossier, vehicles, and logs.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminCustomers;
