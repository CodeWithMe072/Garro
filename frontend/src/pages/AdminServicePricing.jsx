import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LuDollarSign, LuSave, LuRefreshCw, LuChevronLeft,
  LuCircleCheck, LuTriangleAlert, LuLoader
} from 'react-icons/lu';

const SERVICE_LABELS = {
  minor_service: 'Minor Service',
  major_service: 'Major Service',
  brake_repair:  'Brake Pad Replacement',
  battery:       'Battery Diagnostics & Change',
  ac_repair:     'AC Gas Topup & Repair',
  electrical:    'Electrical Diagnostics & Repair',
  diagnostics:   'Engine Diagnostics',
  other:         'General Mechanical Repair'
};

const VAT_RATE = 0.05;

const AdminServicePricing = () => {
  const [pricing, setPricing]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState({});  // { serviceType: true/false }
  const [edited, setEdited]     = useState({});  // { serviceType: { partsCost, laborCost, durationHours } }
  const [saved, setSaved]       = useState({});  // { serviceType: true } — flash green
  const [fetchErr, setFetchErr] = useState('');

  const fetchPricing = async () => {
    setLoading(true);
    setFetchErr('');
    try {
      const token = localStorage.getItem('token');
      const res  = await fetch(`${API_BASE}/api/admin/service-pricing`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load pricing');
      setPricing(data.pricing);
      // Initialise edited state from fetched values
      const init = {};
      data.pricing.forEach(p => {
        init[p.serviceType] = { partsCost: p.partsCost, laborCost: p.laborCost, durationHours: p.durationHours };
      });
      setEdited(init);
    } catch (err) {
      setFetchErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPricing(); }, []);

  const handleChange = (serviceType, field, value) => {
    setEdited(prev => ({
      ...prev,
      [serviceType]: { ...prev[serviceType], [field]: value }
    }));
  };

  const handleSave = async (serviceType) => {
    setSaving(prev => ({ ...prev, [serviceType]: true }));
    try {
      const token = localStorage.getItem('token');
      const body  = edited[serviceType];
      const res   = await fetch(`${API_BASE}/api/admin/service-pricing/${serviceType}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...body, label: SERVICE_LABELS[serviceType] || serviceType })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Save failed');
      // Flash saved indicator
      setSaved(prev => ({ ...prev, [serviceType]: true }));
      setTimeout(() => setSaved(prev => ({ ...prev, [serviceType]: false })), 2500);
    } catch (err) {
      alert(`Failed to save ${serviceType}: ${err.message}`);
    } finally {
      setSaving(prev => ({ ...prev, [serviceType]: false }));
    }
  };

  const getTotal = (serviceType) => {
    const e = edited[serviceType];
    if (!e) return '—';
    const subtotal = (Number(e.partsCost) || 0) + (Number(e.laborCost) || 0);
    const vat      = subtotal * VAT_RATE;
    return { subtotal, vat, total: subtotal + vat };
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - var(--nav-h))', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <Link to="/admin" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
            <LuChevronLeft size={14} /> Back to Dashboard
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                💰 Service Pricing
              </h1>
              <p style={{ color: '#64748b', fontSize: 14, margin: '6px 0 0' }}>
                Set the base parts and labour costs for each service type. All prices include 5% UAE VAT.
              </p>
            </div>
            <button onClick={fetchPricing} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', background: '#f1f5f9', border: '1px solid #e2e8f0',
              borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer'
            }}>
              <LuRefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Error */}
        {fetchErr && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', marginBottom: 24, color: '#dc2626', fontSize: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
            <LuTriangleAlert size={16} /> {fetchErr}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b' }}>
            <LuLoader size={32} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 12 }}>Loading pricing table...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pricing.map(p => {
              const st     = p.serviceType;
              const vals   = edited[st] || {};
              const totals = getTotal(st);
              const isSaving = saving[st];
              const wasSaved = saved[st];

              return (
                <div key={st} style={{
                  background: '#fff', border: wasSaved ? '1.5px solid #10b981' : '1.5px solid #e2e8f0',
                  borderRadius: 16, padding: '24px 28px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.3s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                        {SERVICE_LABELS[st] || st}
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3, fontFamily: 'monospace' }}>
                        {st}
                      </div>
                    </div>
                    {wasSaved && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#10b981', fontSize: 13, fontWeight: 700 }}>
                        <LuCircleCheck size={15} /> Saved
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 14, alignItems: 'flex-end' }}>
                    {/* Parts Cost */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>
                        Parts Cost (AED)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={vals.partsCost ?? ''}
                        onChange={e => handleChange(st, 'partsCost', e.target.value)}
                        style={{
                          width: '100%', padding: '10px 12px',
                          border: '1.5px solid #e2e8f0', borderRadius: 8,
                          fontSize: 14, fontWeight: 600, color: '#0f172a',
                          outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Labor Cost */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>
                        Labour Cost (AED)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={vals.laborCost ?? ''}
                        onChange={e => handleChange(st, 'laborCost', e.target.value)}
                        style={{
                          width: '100%', padding: '10px 12px',
                          border: '1.5px solid #e2e8f0', borderRadius: 8,
                          fontSize: 14, fontWeight: 600, color: '#0f172a',
                          outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>
                        Duration (hrs)
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={vals.durationHours ?? ''}
                        onChange={e => handleChange(st, 'durationHours', e.target.value)}
                        style={{
                          width: '100%', padding: '10px 12px',
                          border: '1.5px solid #e2e8f0', borderRadius: 8,
                          fontSize: 14, fontWeight: 600, color: '#0f172a',
                          outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => handleSave(st)}
                      disabled={isSaving}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '10px 18px',
                        background: wasSaved ? '#10b981' : 'linear-gradient(135deg,#ff5c1a,#ff8c42)',
                        color: '#fff', border: 'none', borderRadius: 8,
                        fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        opacity: isSaving ? 0.7 : 1,
                        transition: 'background 0.3s'
                      }}
                    >
                      {isSaving ? <LuLoader size={14} /> : <LuSave size={14} />}
                      {isSaving ? 'Saving…' : 'Save'}
                    </button>
                  </div>

                  {/* Live total preview */}
                  {typeof totals === 'object' && (
                    <div style={{ marginTop: 14, display: 'flex', gap: 20, fontSize: 13, color: '#64748b' }}>
                      <span>Subtotal: <strong style={{ color: '#0f172a' }}>AED {totals.subtotal.toFixed(2)}</strong></span>
                      <span>VAT (5%): <strong>AED {totals.vat.toFixed(2)}</strong></span>
                      <span style={{ color: '#ff5c1a', fontWeight: 800 }}>Total: AED {totals.total.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Note */}
        <div style={{ marginTop: 28, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 18px', fontSize: 13, color: '#92400e' }}>
          <strong>ℹ️ Note:</strong> Prices updated here take effect on the <strong>next new customer request</strong>.
          Existing quotes are not retroactively changed.
        </div>
      </div>
    </div>
  );
};

export default AdminServicePricing;
