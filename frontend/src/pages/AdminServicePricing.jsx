import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageLoader from '../components/PageLoader';
import { useNotification } from '../context/NotificationContext';
import {
  LuDollarSign, LuSave, LuRefreshCw, LuChevronLeft,
  LuCircleCheck, LuTriangleAlert, LuLoader, LuPlus, LuTrash2, LuX,
  LuPackage, LuPencil, LuStar, LuWrench, LuSettings, LuCrown, LuZap, LuShieldCheck, LuCheck
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

  // Active Tab: 'services' | 'packages'
  const [activeTab, setActiveTab] = useState('services');

  // Service Pricing State
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

  // Package Management State
  const [packages, setPackages] = useState([]);
  const [pkgLoading, setPkgLoading] = useState(false);
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [savingPkg, setSavingPkg] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState(null);
  const [pkgForm, setPkgForm] = useState({
    title: '',
    subtitle: '',
    price: 499,
    currency: 'AED',
    icon: 'wrench',
    isPopular: false,
    includesHeader: 'Includes:',
    includesText: '',
    bestForNote: '',
    buttonText: 'Book Now',
    active: true,
    displayOrder: 1
  });

  // Fetch Base Services
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

  // Fetch Packages
  const fetchPackages = async () => {
    setPkgLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/packages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPackages(data.packages || []);
      }
    } catch (err) {
      console.error('Error fetching admin packages:', err);
    } finally {
      setPkgLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
    fetchPackages();
  }, []);

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

  // Package Modal Handlers
  const handleOpenAddPkgModal = () => {
    setEditingPkgId(null);
    setPkgForm({
      title: '',
      subtitle: '',
      price: 499,
      currency: 'AED',
      icon: 'wrench',
      isPopular: false,
      includesHeader: 'Includes:',
      includesText: 'Engine oil & filter change\nBasic inspection\nTop-up of essential fluids',
      bestForNote: '',
      buttonText: 'Book Now',
      active: true,
      displayOrder: packages.length + 1
    });
    setShowPkgModal(true);
  };

  const handleOpenEditPkgModal = (pkg) => {
    setEditingPkgId(pkg._id);
    setPkgForm({
      title: pkg.title || '',
      subtitle: pkg.subtitle || '',
      price: pkg.price || 0,
      currency: pkg.currency || 'AED',
      icon: pkg.icon || 'wrench',
      isPopular: pkg.isPopular || false,
      includesHeader: pkg.includesHeader || 'Includes:',
      includesText: Array.isArray(pkg.includes) ? pkg.includes.join('\n') : '',
      bestForNote: pkg.bestForNote || '',
      buttonText: pkg.buttonText || 'Book Now',
      active: pkg.active !== undefined ? pkg.active : true,
      displayOrder: pkg.displayOrder || 1
    });
    setShowPkgModal(true);
  };

  const handleSavePkg = async (e) => {
    e.preventDefault();
    if (!pkgForm.title.trim()) return;

    setSavingPkg(true);
    try {
      const token = localStorage.getItem('token');
      const includesArr = pkgForm.includesText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        title: pkgForm.title,
        subtitle: pkgForm.subtitle,
        price: Number(pkgForm.price),
        currency: pkgForm.currency,
        icon: pkgForm.icon,
        isPopular: pkgForm.isPopular,
        includesHeader: pkgForm.includesHeader,
        includes: includesArr,
        bestForNote: pkgForm.bestForNote,
        buttonText: pkgForm.buttonText,
        active: pkgForm.active,
        displayOrder: Number(pkgForm.displayOrder)
      };

      let url = `${API_BASE}/api/admin/packages`;
      let method = 'POST';

      if (editingPkgId) {
        url = `${API_BASE}/api/admin/packages/${editingPkgId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save package');

      toast.success(editingPkgId ? `Package "${pkgForm.title}" updated!` : `Package "${pkgForm.title}" created!`);
      setShowPkgModal(false);
      fetchPackages();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setSavingPkg(false);
    }
  };

  const handleTogglePopular = async (pkg) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/packages/${pkg._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isPopular: !pkg.isPopular })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Update failed');
      toast.success(`Updated popularity for "${pkg.title}"`);
      fetchPackages();
    } catch (err) {
      toast.error(`Failed: ${err.message}`);
    }
  };

  const handleToggleActive = async (pkg) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/packages/${pkg._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ active: !pkg.active })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Update failed');
      toast.success(`Status for "${pkg.title}" changed to ${!pkg.active ? 'Active' : 'Inactive'}`);
      fetchPackages();
    } catch (err) {
      toast.error(`Failed: ${err.message}`);
    }
  };

  const handleDeletePkg = (pkg) => {
    confirm({
      title: 'Delete Service Package?',
      message: `Are you sure you want to delete "${pkg.title}"?`,
      confirmText: 'Delete Package',
      cancelText: 'Cancel',
      isDelete: true,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/api/admin/packages/${pkg._id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.message || 'Delete failed');
          toast.success(`Package "${pkg.title}" deleted.`);
          fetchPackages();
        } catch (err) {
          toast.error(`Delete failed: ${err.message}`);
        }
      }
    });
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - var(--nav-h))', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <Link to="/admin" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
            <LuChevronLeft size={14} /> Back to Dashboard
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                💰 Pricing & Service Packages
              </h1>
              <p style={{ color: '#64748b', fontSize: 14, margin: '6px 0 0' }}>
                Manage base service rates and customer-facing service packages.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={() => { fetchPricing(); fetchPackages(); }} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 16px', background: '#ffffff', border: '1px solid #e2e8f0',
                borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
              }}>
                <LuRefreshCw size={14} /> Refresh
              </button>

              {activeTab === 'services' ? (
                <button onClick={() => setShowAddModal(true)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 20px', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', border: 'none',
                  borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#ffffff', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255,92,26,0.3)'
                }}>
                  <LuPlus size={16} /> Add New Service
                </button>
              ) : (
                <button onClick={handleOpenAddPkgModal} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 20px', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', border: 'none',
                  borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#ffffff', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255,92,26,0.3)'
                }}>
                  <LuPlus size={16} /> Create Service Package
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex', gap: '8px', background: '#e2e8f0', padding: '4px',
          borderRadius: '12px', marginBottom: '28px', maxWidth: '420px'
        }}>
          <button
            onClick={() => setActiveTab('services')}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'services' ? '#ffffff' : 'transparent',
              color: activeTab === 'services' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'services' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <LuDollarSign size={16} /> Base Service Rates
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'packages' ? '#ffffff' : 'transparent',
              color: activeTab === 'packages' ? '#ff5c1a' : '#64748b',
              boxShadow: activeTab === 'packages' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <LuPackage size={16} /> Service Packages ({packages.length})
          </button>
        </div>

        {/* Tab 1: Base Service Rates */}
        {activeTab === 'services' && (
          <div>
            {fetchErr && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', marginBottom: 24, color: '#dc2626', fontSize: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                <LuTriangleAlert size={16} /> {fetchErr}
              </div>
            )}

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

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1.2fr 1.2fr', gap: 14, alignItems: 'center' }}>
                        {/* Service Label Edit */}
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                            Service Title
                          </label>
                          <input
                            type="text"
                            value={vals.label || ''}
                            onChange={e => handleChange(st, 'label', e.target.value)}
                            style={{
                              width: '100%', padding: '8px 12px', border: '1.5px solid #cbd5e1',
                              borderRadius: 8, fontSize: 13, fontWeight: 600, outline: 'none'
                            }}
                          />
                        </div>

                        {/* Parts Cost */}
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                            Parts Cost (AED)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={vals.partsCost ?? 0}
                            onChange={e => handleChange(st, 'partsCost', Number(e.target.value))}
                            style={{
                              width: '100%', padding: '8px 12px', border: '1.5px solid #cbd5e1',
                              borderRadius: 8, fontSize: 13, fontWeight: 600, outline: 'none'
                            }}
                          />
                        </div>

                        {/* Labor Cost */}
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                            Labour (AED)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={vals.laborCost ?? 0}
                            onChange={e => handleChange(st, 'laborCost', Number(e.target.value))}
                            style={{
                              width: '100%', padding: '8px 12px', border: '1.5px solid #cbd5e1',
                              borderRadius: 8, fontSize: 13, fontWeight: 600, outline: 'none'
                            }}
                          />
                        </div>

                        {/* Duration */}
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                            Est. Hours
                          </label>
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={vals.durationHours ?? 1}
                            onChange={e => handleChange(st, 'durationHours', Number(e.target.value))}
                            style={{
                              width: '100%', padding: '8px 12px', border: '1.5px solid #cbd5e1',
                              borderRadius: 8, fontSize: 13, fontWeight: 600, outline: 'none'
                            }}
                          />
                        </div>

                        {/* Total Calculated */}
                        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Total (incl VAT)</span>
                          <span style={{ fontSize: 16, fontWeight: 900, color: '#ff5c1a' }}>
                            AED {totals.total ? totals.total.toFixed(2) : '0.00'}
                          </span>
                        </div>

                        {/* Save Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleSave(st)}
                            disabled={isSaving}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '10px 20px', background: isSaving ? '#94a3b8' : '#0f172a',
                              border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
                              color: '#fff', cursor: isSaving ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {isSaving ? <LuLoader size={14} /> : <LuSave size={14} />}
                            {isSaving ? 'Saving' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Service Packages */}
        {activeTab === 'packages' && (
          <div>
            {pkgLoading ? (
              <PageLoader />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {packages.length === 0 ? (
                  <div style={{ background: '#ffffff', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                    <LuPackage size={42} style={{ color: '#94a3b8', marginBottom: '12px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>No Service Packages Found</h3>
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Create your first service package to show on the customer website.</p>
                    <button
                      onClick={handleOpenAddPkgModal}
                      style={{
                        padding: '10px 24px', background: '#ff5c1a', color: '#fff', border: 'none',
                        borderRadius: '50px', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      + Add First Package
                    </button>
                  </div>
                ) : (
                  packages.map(pkg => (
                    <div
                      key={pkg._id}
                      style={{
                        background: '#ffffff',
                        borderRadius: '20px',
                        border: pkg.isPopular ? '2px solid #ff5c1a' : '1.5px solid #e2e8f0',
                        padding: '28px',
                        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                        position: 'relative'
                      }}
                    >
                      {/* Popularity Badge */}
                      {pkg.isPopular && (
                        <span style={{
                          position: 'absolute', top: '16px', right: '16px',
                          background: '#fff0eb', color: '#ff5c1a', fontSize: '11px',
                          fontWeight: 900, textTransform: 'uppercase', padding: '4px 12px',
                          borderRadius: '50px', border: '1px solid #ffd8cc', display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}>
                          <LuStar size={12} style={{ fill: '#ff5c1a' }} /> Most Popular
                        </span>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                              {pkg.title}
                            </h3>
                            <span style={{
                              fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
                              background: pkg.active ? '#dcfce7' : '#f1f5f9',
                              color: pkg.active ? '#166534' : '#64748b'
                            }}>
                              {pkg.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                            {pkg.subtitle || 'No subtitle provided'}
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleTogglePopular(pkg)}
                            style={{
                              padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1',
                              background: pkg.isPopular ? '#fff0eb' : '#ffffff',
                              color: pkg.isPopular ? '#ff5c1a' : '#64748b', fontSize: '12px', fontWeight: 700,
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            <LuStar size={14} /> {pkg.isPopular ? 'Featured Popular' : 'Make Popular'}
                          </button>

                          <button
                            onClick={() => handleToggleActive(pkg)}
                            style={{
                              padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1',
                              background: pkg.active ? '#f8fafc' : '#fef2f2',
                              color: pkg.active ? '#475569' : '#dc2626', fontSize: '12px', fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {pkg.active ? 'Deactivate' : 'Activate'}
                          </button>

                          <button
                            onClick={() => handleOpenEditPkgModal(pkg)}
                            style={{
                              padding: '6px 14px', borderRadius: '8px', background: '#0f172a',
                              color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: 700,
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            <LuPencil size={14} /> Edit
                          </button>

                          <button
                            onClick={() => handleDeletePkg(pkg)}
                            style={{
                              padding: '6px 10px', borderRadius: '8px', background: '#fef2f2',
                              color: '#ef4444', border: '1px solid #fecaca', cursor: 'pointer'
                            }}
                            title="Delete Package"
                          >
                            <LuTrash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Details row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', background: '#f8fafc', padding: '16px 20px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Display Price</div>
                          <div style={{ fontSize: '22px', fontWeight: 900, color: '#ff5c1a' }}>
                            {pkg.currency || 'AED'} {pkg.price}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                            Icon: <strong>{pkg.icon}</strong> | Order: <strong>{pkg.displayOrder}</strong>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                            {pkg.includesHeader || 'Includes:'} ({pkg.includes ? pkg.includes.length : 0} items)
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {(pkg.includes || []).map((inc, idx) => (
                              <span key={idx} style={{
                                fontSize: '11.5px', background: '#ffffff', border: '1px solid #e2e8f0',
                                padding: '3px 10px', borderRadius: '50px', color: '#334155'
                              }}>
                                ✓ {inc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── MODAL 1: ADD NEW BASE SERVICE ── */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100, padding: '20px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '480px',
            padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Add New Service Type</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <LuX size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateService}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Service Name *</label>
                <input
                  type="text" required placeholder="e.g. Steering Rack Repair" value={newService.label}
                  onChange={e => {
                    const label = e.target.value;
                    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                    setNewService({ ...newService, label, serviceType: key });
                  }}
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Service Key (Auto-generated)</label>
                <input
                  type="text" value={newService.serviceType} onChange={e => setNewService({ ...newService, serviceType: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontFamily: 'monospace', background: '#f8fafc', color: '#64748b', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Parts Cost (AED)</label>
                  <input type="number" min="0" value={newService.partsCost} onChange={e => setNewService({ ...newService, partsCost: Number(e.target.value) })} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Labour Cost (AED) *</label>
                  <input type="number" min="0" required value={newService.laborCost} onChange={e => setNewService({ ...newService, laborCost: Number(e.target.value) })} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Estimated Duration (Hours)</label>
                <input type="number" min="0.5" step="0.5" value={newService.durationHours} onChange={e => setNewService({ ...newService, durationHours: Number(e.target.value) })} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '11px 20px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13.5px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={addingService} style={{ padding: '11px 24px', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700, color: '#ffffff', cursor: 'pointer', opacity: addingService ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {addingService ? <LuLoader size={16} /> : <LuPlus size={16} />}
                  {addingService ? 'Adding...' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: CREATE / EDIT SERVICE PACKAGE ── */}
      {showPkgModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100, padding: '20px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '640px',
            maxHeight: '90vh', overflowY: 'auto', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {editingPkgId ? 'Edit Service Package' : 'Create New Service Package'}
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0' }}>
                  Define package details, price, inclusions, and popularity status.
                </p>
              </div>
              <button onClick={() => setShowPkgModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <LuX size={22} />
              </button>
            </div>

            <form onSubmit={handleSavePkg}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Package Title *</label>
                  <input
                    type="text" required placeholder="e.g. Smart Care" value={pkgForm.title}
                    onChange={e => setPkgForm({ ...pkgForm, title: e.target.value })}
                    style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Price (AED) *</label>
                  <input
                    type="number" required min="0" value={pkgForm.price}
                    onChange={e => setPkgForm({ ...pkgForm, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Subtitle</label>
                <input
                  type="text" placeholder="e.g. More coverage. More peace of mind." value={pkgForm.subtitle}
                  onChange={e => setPkgForm({ ...pkgForm, subtitle: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Icon</label>
                  <select
                    value={pkgForm.icon}
                    onChange={e => setPkgForm({ ...pkgForm, icon: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '13.5px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="wrench">Wrench (Essential)</option>
                    <option value="gear">Gear (Smart Care)</option>
                    <option value="crown">Crown (Signature)</option>
                    <option value="zap">Zap (Performance)</option>
                    <option value="shield">Shield (Protection)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Display Order</label>
                  <input
                    type="number" min="1" value={pkgForm.displayOrder}
                    onChange={e => setPkgForm({ ...pkgForm, displayOrder: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Button Text</label>
                  <input
                    type="text" value={pkgForm.buttonText}
                    onChange={e => setPkgForm({ ...pkgForm, buttonText: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Includes Section Header</label>
                <input
                  type="text" placeholder="e.g. Includes everything in Essential, plus:" value={pkgForm.includesHeader}
                  onChange={e => setPkgForm({ ...pkgForm, includesHeader: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Inclusions (One feature per line)
                </label>
                <textarea
                  rows="5"
                  placeholder="Engine oil & filter change&#10;Full vehicle inspection&#10;Diagnostic scan"
                  value={pkgForm.includesText}
                  onChange={e => setPkgForm({ ...pkgForm, includesText: e.target.value })}
                  style={{
                    width: '100%', padding: '12px 14px', border: '1.5px solid #cbd5e1',
                    borderRadius: '10px', fontSize: '13.5px', outline: 'none', fontFamily: 'inherit',
                    lineHeight: 1.5, boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>"Best For" Note</label>
                <input
                  type="text" placeholder="e.g. Best for drivers who want more preventative care and fewer surprises."
                  value={pkgForm.bestForNote}
                  onChange={e => setPkgForm({ ...pkgForm, bestForNote: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '28px', background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
                  <input
                    type="checkbox" checked={pkgForm.isPopular}
                    onChange={e => setPkgForm({ ...pkgForm, isPopular: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#ff5c1a' }}
                  />
                  Highlight as "Most Popular"
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
                  <input
                    type="checkbox" checked={pkgForm.active}
                    onChange={e => setPkgForm({ ...pkgForm, active: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#ff5c1a' }}
                  />
                  Active (Visible to customers)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button" onClick={() => setShowPkgModal(false)}
                  style={{ padding: '11px 20px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13.5px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={savingPkg}
                  style={{
                    padding: '11px 28px', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)',
                    border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700,
                    color: '#ffffff', cursor: 'pointer', opacity: savingPkg ? 0.7 : 1,
                    display: 'inline-flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  {savingPkg ? <LuLoader size={16} /> : <LuSave size={16} />}
                  {savingPkg ? 'Saving...' : (editingPkgId ? 'Update Package' : 'Create Package')}
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
