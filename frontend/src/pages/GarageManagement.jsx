import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import CustomMultiSelect from '../components/CustomMultiSelect';
import AdminSidebar from '../components/AdminSidebar';

const GarageManagement = () => {
  const { user } = useAuth();
  const { toast, confirm } = useNotification();
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [serviceOptions, setServiceOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);

  // Modal control
  const [isOpen, setIsOpen] = useState(false);
  const [editGarageId, setEditGarageId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    commissionPercent: 10,
    services: [],
    areas: [],
    status: 'active',
    lat: 25.2048,
    lng: 55.2708
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCatalogData = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const [servicesRes, locationsRes] = await Promise.all([
        fetch(`${API_BASE}/api/vehicles/catalog/services`),
        fetch(`${API_BASE}/api/vehicles/catalog/locations`)
      ]);
      
      const servicesData = await servicesRes.json();
      const locationsData = await locationsRes.json();

      if (servicesRes.ok && servicesData.success) {
        const categories = (servicesData.categories || []).map(cat => ({
          value: cat.name,
          label: cat.name
        }));
        setServiceOptions(categories);
      }
      
      if (locationsRes.ok && locationsData.success) {
        const areas = (locationsData.cities || []).flatMap(city =>
          (city.areas || []).map(area => ({
            value: area.name,
            label: area.name
          }))
        );
        setAreaOptions(areas);
      }
    } catch (err) {
      console.error('Failed to fetch catalog services/locations:', err);
    }
  };

  const fetchGarages = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/garages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGarages(data.garages || []);
      }
    } catch (err) {
      console.error('Failed to fetch garages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
    fetchGarages();
  }, []);

  const handleOpenAddModal = () => {
    setEditGarageId(null);
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      commissionPercent: 10,
      services: [],
      areas: [],
      status: 'active',
      lat: 25.2048,
      lng: 55.2708
    });
    setIsOpen(true);
  };

  const handleOpenEditModal = (garage) => {
    setEditGarageId(garage._id);
    setFormData({
      name: garage.name || '',
      contactPerson: garage.contactPerson || '',
      phone: garage.phone || '',
      email: garage.email || '',
      commissionPercent: garage.commissionPercent ?? 10,
      services: garage.services || [],
      areas: garage.areas || [],
      status: garage.status || 'active',
      lat: garage.location?.lat ?? 25.2048,
      lng: garage.location?.lng ?? 55.2708
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone number are required.');
      return;
    }

    setSubmitting(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      const payload = {
        name: formData.name,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        commissionPercent: Number(formData.commissionPercent),
        services: formData.services,
        areas: formData.areas,
        status: formData.status,
        location: {
          lat: Number(formData.lat),
          lng: Number(formData.lng)
        }
      };

      const url = editGarageId 
        ? `${API_BASE}/api/garages/${editGarageId}` 
        : `${API_BASE}/api/garages`;

      const method = editGarageId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(editGarageId ? 'Garage updated successfully!' : 'Garage created successfully!');
        setIsOpen(false);
        fetchGarages();
      } else {
        toast.error(data.message || 'Failed to save garage.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (garageId) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/garages/${garageId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Garage status toggled successfully!`);
        fetchGarages();
      } else {
        toast.error(data.message || 'Failed to toggle status.');
      }
    } catch (err) {
      toast.error('An error occurred.');
    }
  };

  const handleDelete = (garageId, garageName) => {
    confirm({
      title: 'Remove Garage',
      message: `Are you sure you want to permanently delete "${garageName}"? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      isDelete: true,
      onConfirm: async () => {
        try {
          const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/api/garages/${garageId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            toast.success('Garage removed successfully.');
            fetchGarages();
          } else {
            toast.error(data.message || 'Failed to remove garage.');
          }
        } catch (err) {
          toast.error('An error occurred.');
        }
      }
    });
  };

  const stats = {
    total: garages.length,
    active: garages.filter(g => g.status === 'active').length,
    inactive: garages.filter(g => g.status !== 'active').length,
    avgComm: garages.length ? Math.round(garages.reduce((sum, g) => sum + (g.commissionPercent || 10), 0) / garages.length) : 10
  };

  return (
    <div className="dash-wrapper">
      <AdminSidebar />
      <main className="dash-main w-100" style={{ padding: '2rem' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.8rem', letterSpacing: '-0.02em' }}>Partner Garages</h2>
            <p className="text-muted mb-0">Manage registered service centers, ratings, and commissions.</p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2"
            style={{ borderRadius: '12px', fontWeight: 600, background: 'linear-gradient(135deg,#ff5c1a,#f97316)', border: 'none', boxShadow: '0 4px 12px rgba(255,92,26,0.3)' }}
          >
            <span style={{ fontSize: '1.2rem' }}>+</span> Register Garage
          </button>
        </div>

        {/* Stats */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: 'white', maxWidth: 'none' }}>
              <div className="text-muted small fw-bold uppercase">Total Garages</div>
              <div className="fs-2 fw-bold text-dark mt-1">{stats.total}</div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: 'white', maxWidth: 'none' }}>
              <div className="text-muted small fw-bold uppercase" style={{ color: '#10b981' }}>Active Partners</div>
              <div className="fs-2 fw-bold text-success mt-1">{stats.active}</div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: 'white', maxWidth: 'none' }}>
              <div className="text-muted small fw-bold uppercase" style={{ color: '#f59e0b' }}>Suspended/Inactive</div>
              <div className="fs-2 fw-bold text-warning mt-1">{stats.inactive}</div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: 'white', maxWidth: 'none' }}>
              <div className="text-muted small fw-bold uppercase">Average Commission</div>
              <div className="fs-2 fw-bold text-dark mt-1">{stats.avgComm}%</div>
            </div>
          </div>
        </div>

        {/* Garages List Table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', maxWidth: 'none' }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ minWidth: '800px' }}>
                <thead className="table-light">
                  <tr>
                    <th className="ps-4 py-3">Workshop Name</th>
                    <th className="py-3">Contact</th>
                    <th className="py-3">Areas Covered</th>
                    <th className="py-3">Rating</th>
                    <th className="py-3">Commission</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <div className="mt-2 text-muted">Fetching workshops...</div>
                      </td>
                    </tr>
                  ) : garages.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div style={{ fontSize: '3rem' }}>🏬</div>
                        <div className="fw-bold text-dark fs-5 mt-2">No garages registered yet</div>
                        <p className="text-muted small mt-1">Get started by adding your first service garage workshop.</p>
                      </td>
                    </tr>
                  ) : (
                    garages.map(g => (
                      <tr key={g._id}>
                        <td className="ps-4">
                          <div className="fw-bold text-dark">{g.name}</div>
                          <div className="text-muted small">ID: {g._id}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{g.contactPerson || 'N/A'}</div>
                          <div className="text-muted small">📞 {g.phone}</div>
                          <div className="text-muted small">✉️ {g.email || 'N/A'}</div>
                        </td>
                        <td style={{ maxWidth: '200px' }}>
                          <span className="small text-muted d-block text-truncate" title={g.areas?.join(', ')}>
                            {g.areas?.join(', ') || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center text-warning fw-bold">
                            ⭐ {g.rating?.toFixed(1) || '0.0'}
                          </div>
                        </td>
                        <td className="fw-bold text-dark">{g.commissionPercent ?? 10}%</td>
                        <td>
                          <span className={`badge py-2 px-3 fs-8 ${g.status === 'active' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                            {g.status?.toUpperCase() || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-2">
                            <button onClick={() => handleOpenEditModal(g)} className="btn btn-sm btn-outline-secondary py-1 px-2" style={{ borderRadius: '6px' }}>
                              ✏️ Edit
                            </button>
                            <button onClick={() => handleToggleStatus(g._id)} className="btn btn-sm btn-outline-warning py-1 px-2" style={{ borderRadius: '6px' }}>
                              🔄 Toggle Active
                            </button>
                            <button onClick={() => handleDelete(g._id, g.name)} className="btn btn-sm btn-outline-danger py-1 px-2" style={{ borderRadius: '6px' }}>
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ── Add / Edit Garage Modal ── */}
      {isOpen && (
        <div className="custom-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', textAlign: 'left' }}>
            <h3 className="modal-title mb-4">{editGarageId ? '✏️ Edit Garage Workshop' : '🏬 Add Garage Workshop'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-light">Workshop Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-light">Contact Person</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-light">Contact Phone</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-light">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-light">Commission Percent (%)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    value={formData.commissionPercent}
                    onChange={(e) => setFormData({ ...formData, commissionPercent: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-light">Status</label>
                  <select 
                    className="form-select" 
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-light">Services Supported</label>
                  <CustomMultiSelect 
                    options={serviceOptions}
                    value={formData.services}
                    onChange={(val) => setFormData({ ...formData, services: val })}
                    placeholder="Select services..."
                    theme="dark"
                    loading={serviceOptions.length === 0}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-light">Areas Covered</label>
                  <CustomMultiSelect 
                    options={areaOptions}
                    value={formData.areas}
                    onChange={(val) => setFormData({ ...formData, areas: val })}
                    placeholder="Select areas..."
                    theme="dark"
                    loading={areaOptions.length === 0}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-light">Latitude (coordinates)</label>
                  <input 
                    type="number" 
                    step="0.0001" 
                    className="form-control" 
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-light">Longitude (coordinates)</label>
                  <input 
                    type="number" 
                    step="0.0001" 
                    className="form-control" 
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions mt-4 d-flex justify-content-end gap-2">
                <button type="button" className="modal-btn btn-cancel" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="modal-btn btn-confirm btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Workshop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GarageManagement;
