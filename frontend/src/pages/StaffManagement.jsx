import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const StaffManagement = () => {
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/helpers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setHelpers(data.helpers || []);
        }
      } catch (err) {
        console.error('Failed to fetch helpers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHelpers();
  }, []);

  const staffList = helpers.map(h => {
    const [first_name, ...rest] = (h.name || '').split(' ');
    const last_name = rest.join(' ') || '';

    return {
      id: h._id,
      first_name,
      last_name,
      role: 'staff',
      email: '',
      phone: h.phone,
      department: h.garageId ? h.garageId.name : 'Unassigned',
      is_active: h.isAvailable
    };
  });

  const invites = [
    { email: 'newstaff@garro.com', status: 'pending', role: 'staff', created_at: '2026-06-25T10:00:00Z', is_valid: true },
    { email: 'manager@garro.com', status: 'used', role: 'manager', created_at: '2026-06-20T10:00:00Z', is_valid: false }
  ];

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="mt-3">Loading staff list...</h5>
      </div>
    );
  }

  return (
    <div className="pw" style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <div className="ph">
        <div>
          <h1>👔 Staff Management</h1>
          <p>{staffList.length} staff members · Manage accounts and invitations</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/admin/create-staff" className="btn-primary">+ Create Account Directly</Link>
          <Link to="/admin" className="btn-outline">← Dashboard</Link>
        </div>
      </div>

      <div className="two-col">
        {/* Left: Staff list */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.08em', color: '#94a3b8', marginBottom: '12px' }}>
            Current Staff ({staffList.length})
          </div>
          
          <div className="staff-grid">
            {staffList.map(s => (
              <div key={s.id} className={`sc ${!s.is_active ? 'inactive' : ''}`}>
                <div className="sc-top">
                  <div className="sc-av" style={{ background: s.is_active ? '#3b82f6' : '#94a3b8' }}>
                    {s.first_name[0]}{s.last_name[0]}
                    <div className={`sc-status ${s.is_active ? 'active' : 'inactive'}`}></div>
                  </div>
                  <div>
                    <div className="sc-name">{s.first_name} {s.last_name}</div>
                    <span className={`sc-role ${s.role}`}>{s.role.toUpperCase()}</span>
                  </div>
                </div>
                <div className="sc-info">
                  {s.email && <span><span className="material-icons-round" style={{ fontSize: '14px', color: '#94a3b8' }}>email</span>{s.email}</span>}
                  {s.phone && <span><span className="material-icons-round" style={{ fontSize: '14px', color: '#94a3b8' }}>phone</span>{s.phone}</span>}
                  {s.department && <span><span className="material-icons-round" style={{ fontSize: '14px', color: '#94a3b8' }}>business</span>{s.department}</span>}
                </div>
                <div className="sc-actions">
                  <button className="sc-btn edit">✏️ Edit</button>
                  {s.is_active ? (
                    <button className="sc-btn deact" style={{ flex: 1 }}>🚫 Deactivate</button>
                  ) : (
                    <span className="sc-btn" style={{ background: '#f1f5f9', color: '#94a3b8', flex: 1, textAlign: 'center' }}>Inactive</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Invite panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Send Invite */}
          <div className="panel">
            <div className="panel-head">
              <span style={{ fontSize: '20px' }}>📨</span>
              <h3>Send Invite Link</h3>
            </div>
            <div className="panel-body">
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Generate a secure invite link. The staff member sets their own password when they join.</p>
              <form onSubmit={e => e.preventDefault()}>
                <div className="fg">
                  <label>Staff Email *</label>
                  <input type="email" name="email" className="inp" placeholder="staff@example.com" required />
                </div>
                <div className="fg">
                  <label>Role</label>
                  <select name="role" className="inp">
                    <option value="staff">👤 Staff</option>
                    <option value="manager">🌟 Manager</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Department</label>
                  <input type="text" name="department" className="inp" placeholder="e.g. Operations, Service" />
                </div>
                <button type="submit" className="btn-send">📨 Generate &amp; Copy Invite Link</button>
              </form>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px', textAlign: 'center' }}>Link expires in 3 days · Only one active invite per email</p>
            </div>
          </div>

          {/* Invite history */}
          <div className="panel">
            <div className="panel-head">
              <span style={{ fontSize: '20px' }}>📋</span>
              <h3>Recent Invites</h3>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              {invites.map((inv, idx) => (
                <div key={idx} className="invite-item" style={{ padding: '11px 20px' }}>
                  <div className="invite-ico">
                    {inv.status === 'used' ? '✅' : inv.status === 'pending' ? '📨' : '❌'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="invite-email">{inv.email}</div>
                    <div className="invite-meta">
                      <span className={`ibadge ${inv.status}`}>{inv.status}</span>
                      &nbsp;{inv.role}
                    </div>
                  </div>
                  {inv.status === 'pending' && <button className="revoke-btn" style={{ background: 'none', border: 'none' }}>Revoke</button>}
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="panel">
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/admin/create-staff" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px', textDecoration: 'none', color: '#374151', fontWeight: '600', fontSize: '13.5px', transition: 'all .15s' }}>
                <span style={{ fontSize: '20px' }}>✏️</span>
                <div>
                  <div>Create Account Directly</div>
                  <div style={{ fontSize: '11.5px', fontWeight: '400', color: '#94a3b8', marginTop: '2px' }}>Set a temporary password for them</div>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
