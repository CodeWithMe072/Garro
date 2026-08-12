import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LuLayoutDashboard,
  LuStore,
  LuSearch,
  LuSettings,
  LuClipboardList,
  LuUser,
  LuBriefcase,
  LuUsers,
  LuGlobe,
  LuPencil,
  LuRefreshCw,
  LuTrash2,
  LuChevronLeft,
  LuChevronRight,
  LuPhone,
  LuMail,
  LuStar,
  LuFileText,
  LuPlus,
  LuUpload,
  LuExternalLink
} from 'react-icons/lu';
import CustomMultiSelect from '../components/CustomMultiSelect';
import CustomDropdown from '../components/CustomDropdown';
import DocumentDropzone from '../components/DocumentDropzone';
import AdminSidebar from '../components/AdminSidebar';

const GarageManagement = () => {
  const { user } = useAuth();
  const { toast, confirm } = useNotification();
  const { t, lang, changeLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [serviceOptions, setServiceOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);

  const documentTypesList = [
    'Trade License',
    'Commercial Registration (CR)',
    'VAT / Tax Registration Certificate',
    'Civil Defense Safety Permit',
    'Garage Insurance Policy',
    'Owner / Manager Emirates ID',
    'Bank Account / IBAN Letter',
    'Environmental & Municipality Clearance',
    'Workplace Health & Safety Certificate',
    'Other Compliance Document'
  ];

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
    documents: [],
    status: 'active',
    lat: 25.2048,
    lng: 55.2708
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCatalogData = async () => {
    try {
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
      documents: [],
      status: 'active',
      lat: 25.2048,
      lng: 55.2708
    });
    setIsOpen(true);
  };

  const handleOpenEditModal = (garage) => {
    setEditGarageId(garage._id);
    const formattedDocs = (garage.documents || []).map(doc => {
      if (typeof doc === 'string') {
        return { docType: doc, fileUrl: '', fileName: '' };
      }
      return doc;
    });

    setFormData({
      name: garage.name || '',
      contactPerson: garage.contactPerson || '',
      phone: garage.phone || '',
      email: garage.email || '',
      commissionPercent: garage.commissionPercent ?? 10,
      services: garage.services || [],
      areas: garage.areas || [],
      documents: formattedDocs,
      status: garage.status || 'active',
      lat: garage.location?.lat ?? 25.2048,
      lng: garage.location?.lng ?? 55.2708
    });
    setIsOpen(true);
  };

  // Document row actions inside nested table
  const handleAddDocumentRow = () => {
    setFormData(prev => ({
      ...prev,
      documents: [
        ...prev.documents,
        { docType: 'Trade License', fileUrl: '', fileName: '', uploading: false }
      ]
    }));
  };

  const handleRemoveDocumentRow = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleDocumentTypeChange = (index, value) => {
    setFormData(prev => {
      const updated = [...prev.documents];
      updated[index] = { ...updated[index], docType: value };
      return { ...prev, documents: updated };
    });
  };

  const handleClearDocumentFile = (index) => {
    setFormData(prev => {
      const updated = [...prev.documents];
      updated[index] = { ...updated[index], fileUrl: '', fileName: '' };
      return { ...prev, documents: updated };
    });
  };

  const handleDocumentFileChange = async (index, file) => {
    if (!file) return;

    // Set row uploading state
    setFormData(prev => {
      const updated = [...prev.documents];
      updated[index] = { ...updated[index], uploading: true };
      return { ...prev, documents: updated };
    });

    try {
      const token = localStorage.getItem('token');
      const body = new FormData();
      body.append('file', file);

      const res = await fetch(`${API_BASE}/api/garages/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'File upload failed');
      }

      toast.success('Document file uploaded!');

      setFormData(prev => {
        const updated = [...prev.documents];
        updated[index] = {
          ...updated[index],
          fileUrl: data.fileUrl,
          fileName: data.fileName || file.name,
          uploading: false
        };
        return { ...prev, documents: updated };
      });
    } catch (err) {
      toast.error(err.message);
      setFormData(prev => {
        const updated = [...prev.documents];
        updated[index] = { ...updated[index], uploading: false };
        return { ...prev, documents: updated };
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone number are required.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');

      const payload = {
        name: formData.name,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        commissionPercent: Number(formData.commissionPercent),
        services: formData.services,
        areas: formData.areas,
        documents: formData.documents.map(({ docType, fileUrl, fileName }) => ({ docType, fileUrl, fileName })),
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
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save garage');
      }

      toast.success(editGarageId ? 'Garage updated successfully!' : 'Garage added successfully!');
      setIsOpen(false);
      fetchGarages();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/garages/${id}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Status updated');
        fetchGarages();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await confirm(`Are you sure you want to delete ${name}?`);
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/garages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Garage deleted successfully');
        fetchGarages();
      } else {
        toast.error(data.message || 'Failed to delete garage');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Quick Stats
  const stats = {
    total: garages.length,
    active: garages.filter(g => g.status === 'active').length,
    avgComm: garages.length ? (garages.reduce((acc, g) => acc + (g.commissionPercent || 0), 0) / garages.length).toFixed(1) : 0
  };

  return (
    <div className="admin-page-container d-flex">
      <style>{`
        .custom-modal-no-scrollbar {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .custom-modal-no-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>

      <AdminSidebar activeTab="garages" />

      {/* Main Content Area */}
      <main className="admin-main-content flex-grow-1 p-4" style={{ background: '#f8fafc', minHeight: '100vh' }}>
        <div className="container-fluid max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold text-dark mb-1">{t('garages')}</h2>
              <p className="text-muted small mb-0">{t('manage_garages_sub')}</p>
            </div>
            <button onClick={handleOpenAddModal} className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 fw-semibold" style={{ borderRadius: '10px' }}>
              <LuStore size={18} /> {t('add_garage')}
            </button>
          </div>

          {/* Quick Stats Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: 'white', maxWidth: 'none' }}>
                <div className="text-muted small fw-bold uppercase">{t('total_garages')}</div>
                <div className="fs-2 fw-bold text-dark mt-1">{stats.total}</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: 'white', maxWidth: 'none' }}>
                <div className="text-muted small fw-bold uppercase">{t('active_garages')}</div>
                <div className="fs-2 fw-bold text-success mt-1">{stats.active}</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: 'white', maxWidth: 'none' }}>
                <div className="text-muted small fw-bold uppercase">{t('avg_commission')}</div>
                <div className="fs-2 fw-bold text-dark mt-1">{stats.avgComm}%</div>
              </div>
            </div>
          </div>

          {/* Garages List Table */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', maxWidth: 'none' }}>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0" style={{ minWidth: '950px' }}>
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4 py-3">{t('workshop_name')}</th>
                      <th className="py-3">{t('contact')}</th>
                      <th className="py-3">Attached Documents</th>
                      <th className="py-3">{t('rating')}</th>
                      <th className="py-3">{t('commission')}</th>
                      <th className="py-3">{t('status')}</th>
                      <th className="py-3 text-end pe-4">{t('actions')}</th>
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
                          <div style={{ fontSize: '3rem', color: '#ff5c1a' }}><LuStore /></div>
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
                            <div className="text-muted small d-flex align-items-center gap-1"><LuPhone size={12} /> {g.phone}</div>
                          </td>
                          <td style={{ maxWidth: '220px' }}>
                            {g.documents && g.documents.length > 0 ? (
                              <div className="d-flex flex-wrap gap-1">
                                {g.documents.map((doc, dIdx) => {
                                  const label = typeof doc === 'string' ? doc : doc.docType;
                                  const url = typeof doc === 'object' ? doc.fileUrl : null;
                                  return (
                                    <span key={dIdx} className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 small">
                                      {url ? (
                                        <a href={url} target="_blank" rel="noreferrer" className="text-primary text-decoration-none d-inline-flex align-items-center gap-1">
                                          <LuFileText size={11} /> {label} <LuExternalLink size={10} />
                                        </a>
                                      ) : (
                                        <><LuFileText size={11} className="me-1" /> {label}</>
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-muted small">None</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex align-items-center text-warning fw-bold gap-1">
                              <LuStar size={14} /> {g.rating?.toFixed(1) || '0.0'}
                            </div>
                          </td>
                          <td>{g.commissionPercent ?? 10}%</td>
                          <td>
                            <span className={`badge py-2 px-3 fs-8 ${g.status === 'active' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                              {g.status === 'active' ? t('active').toUpperCase() : t('inactive').toUpperCase()}
                            </span>
                          </td>
                          <td className="text-end pe-4">
                            <div className="d-flex justify-content-end gap-2">
                              <button onClick={() => handleOpenEditModal(g)} className="btn btn-sm btn-outline-secondary py-1 px-2 d-inline-flex align-items-center" style={{ borderRadius: '6px' }}>
                                <LuPencil className="me-1" /> {t('edit')}
                              </button>
                              <button onClick={() => handleToggleStatus(g._id)} className="btn btn-sm btn-outline-warning py-1 px-2 d-inline-flex align-items-center" style={{ borderRadius: '6px' }}>
                                <LuRefreshCw className="me-1" /> {t('toggle_active')}
                              </button>
                              <button onClick={() => handleDelete(g._id, g.name)} className="btn btn-sm btn-outline-danger py-1 px-2 d-inline-flex align-items-center" style={{ borderRadius: '6px' }}>
                                <LuTrash2 className="me-1" /> {t('delete')}
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
        </div>
      </main>

      {/* ── Add / Edit Garage Modal ── */}
      {isOpen && (
        <div className="custom-modal-overlay" onClick={() => setIsOpen(false)}>
          <div 
            className="custom-modal custom-modal-no-scrollbar" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '880px', 
              width: '92%', 
              maxHeight: '88vh', 
              overflowY: 'auto', 
              textAlign: 'left' 
            }}
          >
            <h3 className="modal-title mb-4 d-flex align-items-center gap-2">
              {editGarageId ? <><LuPencil /> Edit Garage Workshop</> : <><LuStore /> Add Garage Workshop</>}
            </h3>
            
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

                {/* ── Nested Garage Documents Upload Table ── */}
                <div className="col-12 mt-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="form-label small fw-bold text-light mb-0">Garage Compliance Documents</label>
                    <button
                      type="button"
                      onClick={handleAddDocumentRow}
                      className="btn btn-sm btn-outline-warning d-inline-flex align-items-center gap-1 py-1 px-2.5"
                      style={{ fontSize: '12px', borderRadius: '8px' }}
                    >
                      <LuPlus size={14} /> Add Document
                    </button>
                  </div>

                  {formData.documents.length === 0 ? (
                    <div className="p-3 text-center rounded-3 mb-2" style={{ background: '#0f172a', border: '1px dashed rgba(255,255,255,0.15)', color: '#94a3b8', fontSize: '13px' }}>
                      No garage documents added yet. Click <strong className="text-warning">+ Add Document</strong> to select document types and upload document files.
                    </div>
                  ) : (
                    <div className="mb-2" style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', overflow: 'visible' }}>
                      <table className="table table-dark table-borderless align-middle mb-0" style={{ fontSize: '13px', overflow: 'visible' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '12px' }}>
                            <th style={{ width: '42%' }}>Document Type</th>
                            <th style={{ width: '46%' }}>Uploaded Document File</th>
                            <th style={{ width: '12%', textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody style={{ overflow: 'visible' }}>
                          {formData.documents.map((doc, idx) => (
                            <tr key={idx} style={{ overflow: 'visible' }}>
                              <td style={{ minWidth: '220px', overflow: 'visible', position: 'relative' }}>
                                <CustomDropdown
                                  options={documentTypesList}
                                  value={doc.docType || 'Trade License'}
                                  onChange={(val) => handleDocumentTypeChange(idx, val)}
                                  placeholder="Select document type..."
                                />
                              </td>
                              <td style={{ minWidth: '320px' }}>
                                <DocumentDropzone
                                  doc={doc}
                                  docType={doc.docType}
                                  onFileUpload={(file) => handleDocumentFileChange(idx, file)}
                                  onClearFile={() => handleClearDocumentFile(idx)}
                                />
                              </td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDocumentRow(idx)}
                                  className="btn btn-sm btn-outline-danger p-1"
                                  title="Remove Document Row"
                                  style={{ borderRadius: '6px' }}
                                >
                                  <LuTrash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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
