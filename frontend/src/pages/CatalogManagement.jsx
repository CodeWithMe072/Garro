import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const CatalogManagement = () => {
  const { user } = useAuth();
  const { toast, confirm } = useNotification();
  const [activeTab, setActiveTab] = useState('vehicles');

  // Loading states
  const [loading, setLoading] = useState(true);

  // Data states
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  // Selected sub-items
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'vehicle', 'brand', 'model', 'category', 'subcategory', 'city', 'area'
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({});

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  // Fetch functions
  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/catalog/vehicles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVehicles(data.vehicles || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/catalog/brands`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const fetchedBrands = data.brands || [];
        setBrands(fetchedBrands);
        if (fetchedBrands.length > 0) {
          // Keep active brand selection if it exists in the new list, otherwise pick first
          const currentBrand = selectedBrand 
            ? fetchedBrands.find(b => b._id === selectedBrand._id) 
            : null;
          setSelectedBrand(currentBrand || fetchedBrands[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/catalog/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const fetchedCats = data.categories || [];
        setCategories(fetchedCats);
        if (fetchedCats.length > 0) {
          const currentCat = selectedCategory 
            ? fetchedCats.find(c => c._id === selectedCategory._id) 
            : null;
          setSelectedCategory(currentCat || fetchedCats[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/catalog/cities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const fetchedCities = data.cities || [];
        setCities(fetchedCities);
        if (fetchedCities.length > 0) {
          const currentCity = selectedCity 
            ? fetchedCities.find(c => c._id === selectedCity._id) 
            : null;
          setSelectedCity(currentCity || fetchedCities[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadTabData = async (tab) => {
    setLoading(true);
    if (tab === 'vehicles') await fetchVehicles();
    else if (tab === 'brands') await fetchBrands();
    else if (tab === 'services') await fetchCategories();
    else if (tab === 'locations') await fetchCities();
    setLoading(false);
  };

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  // Handle active status toggles
  const handleToggleStatus = async (type, item) => {
    let url = '';
    let method = 'PUT';
    let body = {};

    if (type === 'vehicle') {
      url = `${API_BASE}/api/admin/catalog/vehicles/${item._id}/status`;
      method = 'PATCH';
    } else if (type === 'brand') {
      url = `${API_BASE}/api/admin/catalog/brands/${item._id}`;
      body = { isActive: !item.isActive };
    } else if (type === 'model') {
      url = `${API_BASE}/api/admin/catalog/models/${item._id}`;
      body = { isActive: !item.isActive };
    } else if (type === 'category') {
      url = `${API_BASE}/api/admin/catalog/categories/${item._id}`;
      body = { isActive: !item.isActive };
    } else if (type === 'subcategory') {
      url = `${API_BASE}/api/admin/catalog/subcategories/${item._id}`;
      body = { isActive: !item.isActive };
    } else if (type === 'city') {
      url = `${API_BASE}/api/admin/catalog/cities/${item._id}`;
      body = { isActive: !item.isActive };
    } else if (type === 'area') {
      url = `${API_BASE}/api/admin/catalog/areas/${item._id}`;
      body = { isActive: !item.isActive };
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: method === 'PUT' ? JSON.stringify(body) : undefined
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Status updated successfully.');
        loadTabData(activeTab);
      } else {
        toast.error(data.message || 'Failed to update status.');
      }
    } catch (err) {
      toast.error('An error occurred.');
    }
  };

  // Handle delete operations
  const handleDelete = (type, id, displayName) => {
    confirm({
      title: `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      message: `Are you sure you want to delete "${displayName}"? This might remove linked child options.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      isDelete: true,
      onConfirm: async () => {
        let url = '';
        if (type === 'vehicle') url = `${API_BASE}/api/admin/catalog/vehicles/${id}`;
        else if (type === 'brand') url = `${API_BASE}/api/admin/catalog/brands/${id}`;
        else if (type === 'model') url = `${API_BASE}/api/admin/catalog/models/${id}`;
        else if (type === 'category') url = `${API_BASE}/api/admin/catalog/categories/${id}`;
        else if (type === 'subcategory') url = `${API_BASE}/api/admin/catalog/subcategories/${id}`;
        else if (type === 'city') url = `${API_BASE}/api/admin/catalog/cities/${id}`;
        else if (type === 'area') url = `${API_BASE}/api/admin/catalog/areas/${id}`;

        try {
          const res = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            toast.success('Item deleted successfully.');
            loadTabData(activeTab);
          } else {
            toast.error(data.message || 'Failed to delete item.');
          }
        } catch (err) {
          toast.error('An error occurred.');
        }
      }
    });
  };

  // Open modals
  const handleOpenAddModal = (type) => {
    setModalType(type);
    setEditId(null);
    if (type === 'vehicle') {
      setFormData({ make: '', model: '', year: 2024, registrationNumber: '', VIN: '' });
    } else if (type === 'brand') {
      setFormData({ name: '', isActive: true });
    } else if (type === 'model') {
      setFormData({ name: '', isActive: true });
    } else if (type === 'category') {
      setFormData({ name: '', slug: '', isActive: true });
    } else if (type === 'subcategory') {
      setFormData({ name: '', slug: '', isActive: true });
    } else if (type === 'city') {
      setFormData({ name: '', isActive: true });
    } else if (type === 'area') {
      setFormData({ name: '', isActive: true });
    }
    setModalOpen(true);
  };

  const handleOpenEditModal = (type, item) => {
    setModalType(type);
    setEditId(item._id);
    if (type === 'vehicle') {
      setFormData({
        make: item.make || '',
        model: item.model || '',
        year: item.year || 2024,
        registrationNumber: item.registrationNumber || '',
        VIN: item.VIN || ''
      });
    } else if (type === 'brand' || type === 'city') {
      setFormData({ name: item.name, isActive: item.isActive });
    } else if (type === 'model' || type === 'area') {
      setFormData({ name: item.name, isActive: item.isActive });
    } else if (type === 'category' || type === 'subcategory') {
      setFormData({ name: item.name, slug: item.slug, isActive: item.isActive });
    }
    setModalOpen(true);
  };

  // Form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let url = '';
    let method = editId ? 'PUT' : 'POST';
    let body = { ...formData };

    if (modalType === 'vehicle') {
      url = `${API_BASE}/api/admin/catalog/vehicles/${editId}`;
    } else if (modalType === 'brand') {
      url = editId ? `${API_BASE}/api/admin/catalog/brands/${editId}` : `${API_BASE}/api/admin/catalog/brands`;
    } else if (modalType === 'model') {
      url = editId ? `${API_BASE}/api/admin/catalog/models/${editId}` : `${API_BASE}/api/admin/catalog/brands/${selectedBrand._id}/models`;
    } else if (modalType === 'category') {
      url = editId ? `${API_BASE}/api/admin/catalog/categories/${editId}` : `${API_BASE}/api/admin/catalog/categories`;
    } else if (modalType === 'subcategory') {
      url = editId ? `${API_BASE}/api/admin/catalog/subcategories/${editId}` : `${API_BASE}/api/admin/catalog/categories/${selectedCategory._id}/subcategories`;
    } else if (modalType === 'city') {
      url = editId ? `${API_BASE}/api/admin/catalog/cities/${editId}` : `${API_BASE}/api/admin/catalog/cities`;
    } else if (modalType === 'area') {
      url = editId ? `${API_BASE}/api/admin/catalog/areas/${editId}` : `${API_BASE}/api/admin/catalog/cities/${selectedCity._id}/areas`;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Successfully saved changes.');
        setModalOpen(false);
        loadTabData(activeTab);
      } else {
        toast.error(data.message || 'Failed to save changes.');
      }
    } catch (err) {
      toast.error('An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="dash-wrapper">
      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        <span className="sidebar-label">Overview</span>
        <div className="sidebar-section">
          <Link to="/admin" className="sidebar-link">
            <span className="icon">📊</span>Dashboard
          </Link>
        </div>

        <span className="sidebar-label">Operations</span>
        <div className="sidebar-section">
          <Link to="/admin/manage-garages" className="sidebar-link">
            <span className="icon">🏪</span>Manage Garages
          </Link>
          <Link to="/search" className="sidebar-link">
            <span className="icon">🔍</span>Find Garages
          </Link>
          <Link to="/admin/catalog" className="sidebar-link active">
            <span className="icon">⚙️</span>System Catalog
          </Link>
          <Link to="/my-bookings" className="sidebar-link">
            <span className="icon">📋</span>Bookings
          </Link>
        </div>

        <div className="sidebar-divider"></div>
        <span className="sidebar-label">People</span>
        <div className="sidebar-section">
          <Link to="/admin/manage-staff" className="sidebar-link">
            <span className="icon">👤</span>All Users
          </Link>
          <Link to="/admin/staff" className="sidebar-link">
            <span className="icon">👔</span>Staff View
          </Link>
          <Link to="/admin/manage-staff" className="sidebar-link">
            <span className="icon">👥</span>Manage Staff
          </Link>
        </div>

        <div className="sidebar-divider"></div>
        <div className="sidebar-section">
          <Link to="/home" className="sidebar-link">
            <span className="icon">🌐</span>Back to Site
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main">
        <div className="dash-header mb-4">
          <div>
            <div className="dash-title">⚙️ System Catalog Settings</div>
            <div className="dash-subtitle">Manage metadata catalogs for vehicles, services, and coverage zones</div>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="d-flex border-bottom mb-4 gap-2" style={{ overflowX: 'auto' }}>
          <button 
            className={`btn py-2 px-4 fw-bold ${activeTab === 'vehicles' ? 'btn-primary-garro text-white' : 'btn-light text-dark'}`}
            style={{ borderRadius: '10px 10px 0 0', minWidth: '150px' }}
            onClick={() => setActiveTab('vehicles')}
          >
            🚗 Customer Vehicles
          </button>
          <button 
            className={`btn py-2 px-4 fw-bold ${activeTab === 'brands' ? 'btn-primary-garro text-white' : 'btn-light text-dark'}`}
            style={{ borderRadius: '10px 10px 0 0', minWidth: '150px' }}
            onClick={() => setActiveTab('brands')}
          >
            🏷️ Brands & Models
          </button>
          <button 
            className={`btn py-2 px-4 fw-bold ${activeTab === 'services' ? 'btn-primary-garro text-white' : 'btn-light text-dark'}`}
            style={{ borderRadius: '10px 10px 0 0', minWidth: '150px' }}
            onClick={() => setActiveTab('services')}
          >
            🔧 Service Catalog
          </button>
          <button 
            className={`btn py-2 px-4 fw-bold ${activeTab === 'locations' ? 'btn-primary-garro text-white' : 'btn-light text-dark'}`}
            style={{ borderRadius: '10px 10px 0 0', minWidth: '150px' }}
            onClick={() => setActiveTab('locations')}
          >
            📍 Cities & Areas
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="mt-2 text-muted">Loading tab contents...</div>
          </div>
        ) : (
          <div>
            {/* ── TAB 1: CUSTOMER VEHICLES ── */}
            {activeTab === 'vehicles' && (
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', maxWidth: 'none' }}>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="ps-4 py-3">Owner Info</th>
                          <th className="py-3">Vehicle Details</th>
                          <th className="py-3">Registration & VIN</th>
                          <th className="py-3">Created</th>
                          <th className="py-3">Status</th>
                          <th className="py-3 text-end pe-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-5 text-muted">No customer vehicles registered.</td>
                          </tr>
                        ) : (
                          vehicles.map(v => (
                            <tr key={v._id}>
                              <td className="ps-4">
                                <div className="fw-bold text-dark">{v.userId?.name || 'Unknown Client'}</div>
                                <div className="text-muted small">📞 {v.userId?.phone || 'N/A'}</div>
                              </td>
                              <td>
                                <div className="fw-bold text-dark">{v.make} {v.model}</div>
                                <div className="text-muted small">Year: {v.year}</div>
                              </td>
                              <td>
                                <div className="fw-semibold text-dark">Plate: {v.registrationNumber || 'N/A'}</div>
                                <div className="text-muted small" style={{ fontFamily: 'monospace' }}>VIN: {v.VIN || 'N/A'}</div>
                              </td>
                              <td className="small text-muted">
                                {new Date(v.createdAt).toLocaleDateString()}
                              </td>
                              <td>
                                <span className={`badge py-2 px-3 ${v.isActive ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                                  {v.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                              </td>
                              <td className="text-end pe-4">
                                <div className="d-flex justify-content-end gap-2">
                                  <button onClick={() => handleOpenEditModal('vehicle', v)} className="btn btn-sm btn-outline-secondary">
                                    ✏️ Edit
                                  </button>
                                  <button onClick={() => handleToggleStatus('vehicle', v)} className="btn btn-sm btn-outline-warning">
                                    🔄 Toggle Active
                                  </button>
                                  <button onClick={() => handleDelete('vehicle', v._id, `${v.make} ${v.model}`)} className="btn btn-sm btn-outline-danger">
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
            )}

            {/* ── TAB 2: BRANDS & MODELS ── */}
            {activeTab === 'brands' && (
              <div className="row g-4">
                {/* Left: Brands List */}
                <div className="col-12 col-md-5">
                  <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', maxWidth: 'none' }}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold text-dark mb-0">🏷️ Brands / Makes</h5>
                        <button onClick={() => handleOpenAddModal('brand')} className="btn btn-sm btn-primary-garro px-3 py-1">
                          + Add Brand
                        </button>
                      </div>
                      
                      <div className="list-group" style={{ maxHeight: '550px', overflowY: 'auto' }}>
                        {brands.length === 0 ? (
                          <div className="text-center py-4 text-muted">No brands found.</div>
                        ) : (
                          brands.map(b => (
                            <button 
                              key={b._id} 
                              className={`list-group-item list-group-item-action border-0 d-flex justify-content-between align-items-center mb-2 p-3 ${selectedBrand?._id === b._id ? 'bg-primary-garro text-white active' : 'bg-light text-dark'}`}
                              style={{ borderRadius: '8px' }}
                              onClick={() => setSelectedBrand(b)}
                            >
                              <div>
                                <div className="fw-bold">{b.name}</div>
                                <div className={`small ${selectedBrand?._id === b._id ? 'text-white-50' : 'text-muted'}`}>
                                  {b.models?.length || 0} sub-models
                                </div>
                              </div>
                              
                              <div className="d-flex align-items-center gap-2" onClick={e => e.stopPropagation()}>
                                <span className={`badge py-1 px-2 ${b.isActive ? 'bg-success text-white' : 'bg-warning text-dark'}`} style={{ fontSize: '10px' }}>
                                  {b.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <button onClick={() => handleOpenEditModal('brand', b)} className="btn btn-xs p-1 text-white border-0 bg-transparent">
                                  ✏️
                                </button>
                                <button onClick={() => handleToggleStatus('brand', b)} className="btn btn-xs p-1 text-white border-0 bg-transparent">
                                  🔄
                                </button>
                                <button onClick={() => handleDelete('brand', b._id, b.name)} className="btn btn-xs p-1 text-white border-0 bg-transparent">
                                  🗑️
                                </button>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Models List for Selected Brand */}
                <div className="col-12 col-md-7">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px', maxWidth: 'none' }}>
                    <div className="card-body p-4">
                      {selectedBrand ? (
                        <>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold text-dark mb-0">🚗 Models in: <span className="text-primary-garro">{selectedBrand.name}</span></h5>
                            <button onClick={() => handleOpenAddModal('model')} className="btn btn-sm btn-primary-garro px-3 py-1">
                              + Add Model
                            </button>
                          </div>

                          <div className="table-responsive">
                            <table className="table align-middle">
                              <thead className="table-light">
                                <tr>
                                  <th className="py-2">Model Name</th>
                                  <th className="py-2">Status</th>
                                  <th className="py-2 text-end">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {!selectedBrand.models || selectedBrand.models.length === 0 ? (
                                  <tr>
                                    <td colSpan="3" className="text-center py-4 text-muted">No models configured for this brand.</td>
                                  </tr>
                                ) : (
                                  selectedBrand.models.map(m => (
                                    <tr key={m._id}>
                                      <td className="fw-semibold text-dark">{m.name}</td>
                                      <td>
                                        <span className={`badge py-1 px-2 ${m.isActive ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                                          {m.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                      </td>
                                      <td className="text-end">
                                        <div className="d-flex justify-content-end gap-1">
                                          <button onClick={() => handleOpenEditModal('model', m)} className="btn btn-xs btn-outline-secondary py-1 px-2">
                                            ✏️
                                          </button>
                                          <button onClick={() => handleToggleStatus('model', m)} className="btn btn-xs btn-outline-warning py-1 px-2">
                                            🔄
                                          </button>
                                          <button onClick={() => handleDelete('model', m._id, m.name)} className="btn btn-xs btn-outline-danger py-1 px-2">
                                            🗑️
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-5 text-muted h-100 d-flex align-items-center justify-content-center">
                          Select a Brand on the left to manage its models.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: SERVICES CATALOG ── */}
            {activeTab === 'services' && (
              <div className="row g-4">
                {/* Left: Categories */}
                <div className="col-12 col-md-5">
                  <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', maxWidth: 'none' }}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold text-dark mb-0">🛠️ Service Categories</h5>
                        <button onClick={() => handleOpenAddModal('category')} className="btn btn-sm btn-primary-garro px-3 py-1">
                          + Add Category
                        </button>
                      </div>

                      <div className="list-group" style={{ maxHeight: '550px', overflowY: 'auto' }}>
                        {categories.length === 0 ? (
                          <div className="text-center py-4 text-muted">No categories configured.</div>
                        ) : (
                          categories.map(c => (
                            <button 
                              key={c._id} 
                              className={`list-group-item list-group-item-action border-0 d-flex justify-content-between align-items-center mb-2 p-3 ${selectedCategory?._id === c._id ? 'bg-primary-garro text-white active' : 'bg-light text-dark'}`}
                              style={{ borderRadius: '8px' }}
                              onClick={() => setSelectedCategory(c)}
                            >
                              <div>
                                <div className="fw-bold">{c.name}</div>
                                <div className={`small ${selectedCategory?._id === c._id ? 'text-white-50' : 'text-muted'}`} style={{ fontFamily: 'monospace' }}>
                                  slug: {c.slug}
                                </div>
                              </div>

                              <div className="d-flex align-items-center gap-2" onClick={e => e.stopPropagation()}>
                                <span className={`badge py-1 px-2 ${c.isActive ? 'bg-success text-white' : 'bg-warning text-dark'}`} style={{ fontSize: '10px' }}>
                                  {c.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <button onClick={() => handleOpenEditModal('category', c)} className="btn btn-xs p-1 text-white border-0 bg-transparent">
                                  ✏️
                                </button>
                                <button onClick={() => handleToggleStatus('category', c)} className="btn btn-xs p-1 text-white border-0 bg-transparent">
                                  🔄
                                </button>
                                <button onClick={() => handleDelete('category', c._id, c.name)} className="btn btn-xs p-1 text-white border-0 bg-transparent">
                                  🗑️
                                </button>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Subcategories */}
                <div className="col-12 col-md-7">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px', maxWidth: 'none' }}>
                    <div className="card-body p-4">
                      {selectedCategory ? (
                        <>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold text-dark mb-0">🔧 Subcategories in: <span className="text-primary-garro">{selectedCategory.name}</span></h5>
                            <button onClick={() => handleOpenAddModal('subcategory')} className="btn btn-sm btn-primary-garro px-3 py-1">
                              + Add Subcategory
                            </button>
                          </div>

                          <div className="table-responsive">
                            <table className="table align-middle">
                              <thead className="table-light">
                                <tr>
                                  <th className="py-2">Name</th>
                                  <th className="py-2">Slug</th>
                                  <th className="py-2">Status</th>
                                  <th className="py-2 text-end">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {!selectedCategory.subCategories || selectedCategory.subCategories.length === 0 ? (
                                  <tr>
                                    <td colSpan="4" className="text-center py-4 text-muted">No subcategories in this category.</td>
                                  </tr>
                                ) : (
                                  selectedCategory.subCategories.map(sub => (
                                    <tr key={sub._id}>
                                      <td className="fw-semibold text-dark">{sub.name}</td>
                                      <td className="text-muted small" style={{ fontFamily: 'monospace' }}>{sub.slug}</td>
                                      <td>
                                        <span className={`badge py-1 px-2 ${sub.isActive ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                                          {sub.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                      </td>
                                      <td className="text-end">
                                        <div className="d-flex justify-content-end gap-1">
                                          <button onClick={() => handleOpenEditModal('subcategory', sub)} className="btn btn-xs btn-outline-secondary py-1 px-2">
                                            ✏️
                                          </button>
                                          <button onClick={() => handleToggleStatus('subcategory', sub)} className="btn btn-xs btn-outline-warning py-1 px-2">
                                            🔄
                                          </button>
                                          <button onClick={() => handleDelete('subcategory', sub._id, sub.name)} className="btn btn-xs btn-outline-danger py-1 px-2">
                                            🗑️
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-5 text-muted h-100 d-flex align-items-center justify-content-center">
                          Select a Category on the left to manage subcategories.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 4: CITIES & AREAS ── */}
            {activeTab === 'locations' && (
              <div className="row g-4">
                {/* Left: Cities List */}
                <div className="col-12 col-md-5">
                  <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', maxWidth: 'none' }}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold text-dark mb-0">🌍 Cities</h5>
                        <button onClick={() => handleOpenAddModal('city')} className="btn btn-sm btn-primary-garro px-3 py-1">
                          + Add City
                        </button>
                      </div>

                      <div className="list-group" style={{ maxHeight: '550px', overflowY: 'auto' }}>
                        {cities.length === 0 ? (
                          <div className="text-center py-4 text-muted">No cities configured.</div>
                        ) : (
                          cities.map(c => (
                            <button 
                              key={c._id} 
                              className={`list-group-item list-group-item-action border-0 d-flex justify-content-between align-items-center mb-2 p-3 ${selectedCity?._id === c._id ? 'bg-primary-garro text-white active' : 'bg-light text-dark'}`}
                              style={{ borderRadius: '8px' }}
                              onClick={() => setSelectedCity(c)}
                            >
                              <div className="fw-bold">{c.name}</div>

                              <div className="d-flex align-items-center gap-2" onClick={e => e.stopPropagation()}>
                                <span className={`badge py-1 px-2 ${c.isActive ? 'bg-success text-white' : 'bg-warning text-dark'}`} style={{ fontSize: '10px' }}>
                                  {c.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <button onClick={() => handleOpenEditModal('city', c)} className="btn btn-xs p-1 text-white border-0 bg-transparent">
                                  ✏️
                                </button>
                                <button onClick={() => handleToggleStatus('city', c)} className="btn btn-xs p-1 text-white border-0 bg-transparent">
                                  🔄
                                </button>
                                <button onClick={() => handleDelete('city', c._id, c.name)} className="btn btn-xs p-1 text-white border-0 bg-transparent">
                                  🗑️
                                </button>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Areas List */}
                <div className="col-12 col-md-7">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px', maxWidth: 'none' }}>
                    <div className="card-body p-4">
                      {selectedCity ? (
                        <>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold text-dark mb-0">📍 Neighborhood Areas in: <span className="text-primary-garro">{selectedCity.name}</span></h5>
                            <button onClick={() => handleOpenAddModal('area')} className="btn btn-sm btn-primary-garro px-3 py-1">
                              + Add Area
                            </button>
                          </div>

                          <div className="table-responsive">
                            <table className="table align-middle">
                              <thead className="table-light">
                                <tr>
                                  <th className="py-2">Area / Neighborhood</th>
                                  <th className="py-2">Status</th>
                                  <th className="py-2 text-end">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {!selectedCity.areas || selectedCity.areas.length === 0 ? (
                                  <tr>
                                    <td colSpan="3" className="text-center py-4 text-muted">No areas added in this city.</td>
                                  </tr>
                                ) : (
                                  selectedCity.areas.map(a => (
                                    <tr key={a._id}>
                                      <td className="fw-semibold text-dark">{a.name}</td>
                                      <td>
                                        <span className={`badge py-1 px-2 ${a.isActive ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                                          {a.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                      </td>
                                      <td className="text-end">
                                        <div className="d-flex justify-content-end gap-1">
                                          <button onClick={() => handleOpenEditModal('area', a)} className="btn btn-xs btn-outline-secondary py-1 px-2">
                                            ✏️
                                          </button>
                                          <button onClick={() => handleToggleStatus('area', a)} className="btn btn-xs btn-outline-warning py-1 px-2">
                                            🔄
                                          </button>
                                          <button onClick={() => handleDelete('area', a._id, a.name)} className="btn btn-xs btn-outline-danger py-1 px-2">
                                            🗑️
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-5 text-muted h-100 d-flex align-items-center justify-content-center">
                          Select a City on the left to manage neighborhood areas.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Dynamic Add/Edit Modal Overlay ── */}
      {modalOpen && (
        <div className="custom-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="custom-modal confirm" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', textAlign: 'left' }}>
            <h3 className="modal-title mb-4">
              {editId ? '✏️ Edit Catalog Item' : '➕ Add Catalog Item'}
              <span className="text-primary-garro small d-block mt-1" style={{ fontSize: '12px' }}>Category: {modalType}</span>
            </h3>

            <form onSubmit={handleFormSubmit}>
              {/* Form Input: Name */}
              {['brand', 'model', 'category', 'subcategory', 'city', 'area'].includes(modalType) && (
                <div className="mb-3">
                  <label className="form-label small fw-bold text-light">Name / Title</label>
                  <input 
                    type="text" 
                    className="form-control"
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              )}

              {/* Form Input: Slug (for Service Categories & Subcategories) */}
              {['category', 'subcategory'].includes(modalType) && (
                <div className="mb-3">
                  <label className="form-label small fw-bold text-light">Slug (SEO slug identifier)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'monospace' }}
                    value={formData.slug || ''}
                    placeholder="e.g. engine_repair"
                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '_') })}
                    required
                  />
                </div>
              )}

              {/* Form Fields: Vehicle properties */}
              {modalType === 'vehicle' && (
                <>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-light">Make</label>
                    <input 
                      type="text" 
                      className="form-control text-white-50"
                      style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)' }}
                      value={formData.make || ''}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-light">Model</label>
                    <input 
                      type="text" 
                      className="form-control text-white-50"
                      style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)' }}
                      value={formData.model || ''}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-light">Year</label>
                    <input 
                      type="number" 
                      className="form-control"
                      style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      value={formData.year || ''}
                      onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-light">Registration Number / License Plate</label>
                    <input 
                      type="text" 
                      className="form-control"
                      style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      value={formData.registrationNumber || ''}
                      onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-light">VIN (Chassis Number)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      value={formData.VIN || ''}
                      onChange={e => setFormData({ ...formData, VIN: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Form Input: Active state */}
              {modalType !== 'vehicle' && (
                <div className="form-check form-switch mt-3 mb-2">
                  <input 
                    className="form-check-input" 
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    id="isActiveSwitch"
                  />
                  <label className="form-check-label text-light small fw-bold" htmlFor="isActiveSwitch">
                    Active (visible to customers)
                  </label>
                </div>
              )}

              <div className="modal-actions mt-4 d-flex justify-content-end gap-2">
                <button type="button" className="modal-btn btn-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="modal-btn btn-confirm btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Catalog Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogManagement;
