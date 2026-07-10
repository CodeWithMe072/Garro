import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const AdminSettings = () => {
  const [vat, setVat] = useState(5);
  const [serviceFee, setServiceFee] = useState(10);
  const [assignMode, setAssignMode] = useState('manual');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { toast } = useNotification();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch settings.');
      }
      const s = data.settings;
      setVat(s.vatPercentage);
      setServiceFee(s.serviceFeePercentage);
      setAssignMode(s.assignMode || 'manual');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vatPercentage: vat,
          serviceFeePercentage: serviceFee,
          assignMode
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save settings.');
      }
      toast.success('System settings updated successfully.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
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
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Navigation */}
        <div style={{ marginBottom: '24px' }}>
          <button onClick={() => navigate('/admin')} style={{
            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline'
          }}>
            ← Return to Admin Dashboard
          </button>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.025em' }}>
          ⚙️ System Configuration
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>
          Manage global marketplace fees, tax parameters, and helper assignment configurations.
        </p>

        {loading ? (
          <p style={{ color: '#64748b' }}>Retrieving global configurations...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background: '#1e293b',
            border: '1.5px solid rgba(255, 255, 255, 0.04)',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#cbd5e1' }}>
                Value Added Tax (VAT %)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={vat}
                onChange={(e) => setVat(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: 'white',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
                required
              />
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '6px' }}>
                Applied globally to the subtotal and service fee on invoices. Default is 5%.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#cbd5e1' }}>
                Marketplace Service Fee (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={serviceFee}
                onChange={(e) => setServiceFee(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: 'white',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
                required
              />
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '6px' }}>
                Garro marketplace platform fee deducted from the total parts and labor subtotal. Default is 10%.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#cbd5e1' }}>
                Helper Assignment Mode
              </label>
              <select
                value={assignMode}
                onChange={(e) => setAssignMode(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: 'white',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
                required
              >
                <option value="manual">Manual Assignment (Admin selected)</option>
              </select>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '6px' }}>
                Control how helpers are assigned to booking cards. Currently only Manual mode is supported.
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                background: 'linear-gradient(135deg, #ff5c1a 0%, #e04a0e 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '14px',
                color: 'white',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                opacity: saving ? 0.7 : 1,
                marginTop: '12px'
              }}
            >
              {saving ? 'Saving Config...' : 'Save Configuration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
