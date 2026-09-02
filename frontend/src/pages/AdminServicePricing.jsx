import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageLoader from '../components/PageLoader';
import { useNotification } from '../context/NotificationContext';
import {
  LuDollarSign, LuSave, LuRefreshCw, LuChevronLeft,
  LuCircleCheck, LuTriangleAlert, LuLoader, LuPlus, LuTrash2, LuX
} from 'react-icons/lu';

const SERVICE_LABELS = {
  minor_service: 'Minor Service',
  major_service: 'Major Service',
  brake_repair:  'Brake Pad Replacement',
  battery:       'Battery Diagnostics & Change',
  ac_repair:     'AC Gas Topup & Repair',
  electrical:    'Electrical Diagnostics & Repair',
  diagnostics:   'Engine Diagnostics',
  roadside_assistance: 'Roadside Assistance',
  emergency_pickup:    'Emergency Recovery Pickup',
  other:         'General Mechanical Repair'
};

const VAT_RATE = 0.05;

const AdminServicePricing = () => {
  const { toast, confirm } = useNotification();
  const [pricing, setPricing]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState({});  // { serviceType: true/false }
  const [edited, setEdited]     = useState({});  // { serviceType: { partsCost, laborCost, durationHours, label } }
  const [saved, setSaved]       = useState({});  // { serviceType: true } — flash green
  const [fetchErr, setFetchErr] = useState('');

  // Add Service Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingService, setAddingService] = useState(false);
  const [newService, setNewService] = useState({
    label: '',
    serviceType: '',
    partsCost: 0,
    laborCost: 199,
    durationHours: 2
  });

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
        init[p.serviceType] = { partsCost: p.partsCost, laborCost: p.laborCost, durationHours: p.durationHours, label: p.label };
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
        body: JSON.stringify({ ...body, label: body.label || SERVICE_LABELS[serviceType] || serviceType })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Save failed');
      // Flash saved indicator
      setSaved(prev => ({ ...prev, [serviceType]: true }));
      setTimeout(() => setSaved(prev => ({ ...prev, [serviceType]: false })), 2500);
      if (toast) toast.success(`Pricing for ${body.label || serviceType} updated!`);
    } catch (err) {
      alert(`Failed to save ${serviceType}: ${err.message}`);
    } finally {
      setSaving(prev => ({ ...prev, [serviceType]: false }));
    }
  };

  const handleDelete = (serviceType, label) => {
    confirm({
      title: 'Delete Service?',
      message: `Are you sure you want to delete the service "${label}"?`,
      confirmText: 'Delete Service',
      cancelText: 'Cancel',
      isDelete: true,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/api/admin/service-pricing/${serviceType}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.message || 'Delete failed');
          if (toast) toast.success(`Service "${label}" deleted successfully`);
          fetchPricing();
        } catch (err) {
          toast.error(`Failed to delete: ${err.message}`);
        }
      }
    });
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!newService.label.trim()) return;

    setAddingService(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/service-pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newService)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create service');

      if (toast) toast.success(`New service "${newService.label}" added successfully!`);
      setShowAddModal(false);
      setNewService({ label: '', serviceType: '', partsCost: 0, laborCost: 199, durationHours: 2 });
      fetchPricing();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setAddingService(false);
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                💰 Service Pricing
              </h1>
              <p style={{ color: '#64748b', fontSize: 14, margin: '6px 0 0' }}>
                Set the base parts and labour costs for each service type. All prices include 5% UAE VAT.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={fetchPricing} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 16px', background: '#ffffff', border: '1px solid #e2e8f0',
                borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
              }}>
                <LuRefreshCw size={14} /> Refresh
              </button>
              <button onClick={() => setShowAddModal(true)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', border: 'none',
                borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#ffffff', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255,92,26,0.3)'
              }}>
                <LuPlus size={16} /> Add New Service
              </button>
            </div>
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
          <PageLoader />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pricing.map(p => {
              const st     = p.serviceType;
              const vals   = edited[st] || {};
              const totals = getTotal(st);
              const isSaving = saving[st];
              const wasSaved = saved[st];
              const displayTitle = vals.label || SERVICE_LABELS[st] || p.label || st;

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
                        {displayTitle}
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3, fontFamily: 'monospace' }}>
                        {st}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {wasSaved && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#10b981', fontSize: 13, fontWeight: 700 }}>
                          <LuCircleCheck size={15} /> Saved
                        </span>
                      )}
                      <button 
                        onClick={() => handleDelete(st, displayTitle)}
                        title="Delete Service"
                        style={{
                          background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
                          padding: '6px', borderRadius: '6px', transition: 'all .2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                      >
                        <LuTrash2 size={16} />
                      </button>
                    </div>
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

      {/* Add New Service Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1050, padding: '20px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '20px', padding: '32px',
            maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                ➕ Add New Service
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <LuX size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateService}>
              {/* Service Label / Name */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Service Name / Title *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Full Body Car Detailing"
                  value={newService.label}
                  onChange={e => {
                    const val = e.target.value;
                    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                    setNewService({ ...newService, label: val, serviceType: autoSlug });
                  }}
                  style={{
                    width: '100%', padding: '11px 14px', border: '1.5px solid #cbd5e1',
                    borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Service Key / Slug */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Service Code / Key (Auto-generated)
                </label>
                <input 
                  type="text" 
                  value={newService.serviceType}
                  onChange={e => setNewService({ ...newService, serviceType: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
                    borderRadius: '10px', fontSize: '13px', fontFamily: 'monospace',
                    background: '#f8fafc', color: '#64748b', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                {/* Parts Cost */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Parts Cost (AED)
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    value={newService.partsCost}
                    onChange={e => setNewService({ ...newService, partsCost: Number(e.target.value) })}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1',
                      borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Labour Cost */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Labour Cost (AED) *
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    required
                    value={newService.laborCost}
                    onChange={e => setNewService({ ...newService, laborCost: Number(e.target.value) })}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1',
                      borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Duration */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Estimated Duration (Hours)
                </label>
                <input 
                  type="number" 
                  min="0.5"
                  step="0.5"
                  value={newService.durationHours}
                  onChange={e => setNewService({ ...newService, durationHours: Number(e.target.value) })}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1',
                    borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '11px 20px', background: '#f1f5f9', border: '1px solid #e2e8f0',
                    borderRadius: '10px', fontSize: '13.5px', fontWeight: 600, color: '#475569', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={addingService}
                  style={{
                    padding: '11px 24px', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)',
                    border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700,
                    color: '#ffffff', cursor: 'pointer', opacity: addingService ? 0.7 : 1,
                    display: 'inline-flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  {addingService ? <LuLoader size={16} /> : <LuPlus size={16} />}
                  {addingService ? 'Adding...' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServicePricing;
