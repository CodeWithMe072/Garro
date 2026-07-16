import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import CustomDropdown from '../components/CustomDropdown';
import { LuTrash2, LuPencil, LuPlus } from 'react-icons/lu';

const MyVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  
  // Catalog states
  const [catalogBrands, setCatalogBrands] = useState([]);
  
  // Modal & Edit states
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 6;
  
  // Form states
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vinNumber, setVinNumber] = useState('');
  const [adding, setAdding] = useState(false);

  const { toast } = useNotification();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/vehicles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch vehicles.');
      }
      setVehicles(data.vehicles || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/vehicles/catalog/brands`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCatalogBrands(data.brands || []);
      }
    } catch (err) {
      console.error('Failed to fetch brand catalog:', err);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchCatalog();
  }, []);

  const handleOpenAdd = () => {
    setEditVehicleId(null);
    setCarBrand(catalogBrands[0]?.name || '');
    setCarModel('');
    setCarYear(new Date().getFullYear().toString());
    setPlateNumber('');
    setVinNumber('');
    setVehicleModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditVehicleId(v._id);
    setCarBrand(v.make);
    setCarModel(v.model);
    setCarYear(v.year.toString());
    setPlateNumber(v.registrationNumber);
    setVinNumber(v.VIN || '');
    setVehicleModalOpen(true);
  };

  const handleToggleActive = async (v) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/vehicles/${v._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !v.isActive })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update vehicle status.');
      }
      toast.success(v.isActive ? 'Vehicle deactivated.' : 'Vehicle activated.');
      fetchVehicles();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);

    const url = editVehicleId ? `${API_BASE}/api/vehicles/${editVehicleId}` : `${API_BASE}/api/vehicles`;
    const method = editVehicleId ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          make: carBrand,
          model: carModel,
          year: parseInt(carYear),
          registrationNumber: plateNumber,
          VIN: vinNumber
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save vehicle.');
      }

      toast.success(editVehicleId ? 'Vehicle updated successfully!' : 'Vehicle registered successfully!');
      setVehicleModalOpen(false);
      fetchVehicles();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete vehicle.');
      }
      toast.success('Vehicle deleted successfully.');
      fetchVehicles();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const brandOptions = catalogBrands.map(b => b.name);
  const activeBrand = catalogBrands.find(b => b.name === carBrand);
  const modelOptions = activeBrand ? [...activeBrand.models.map(m => m.name), 'Other'] : ['Other'];

  // Pagination logic
  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = vehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
  const totalPages = Math.ceil(vehicles.length / vehiclesPerPage);

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      color: '#f8fafc',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Navigation */}
        <div style={{ marginBottom: '24px' }}>
          <button onClick={() => navigate('/home')} style={{
            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline'
          }}>
            ← Return Home
          </button>
        </div>

        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 6px', letterSpacing: '-0.025em' }}>
              My Registered Vehicles 🚙
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
              Add, edit, or deactivate your vehicles for service bookings
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            style={{
              background: 'linear-gradient(135deg, #ff5c1a 0%, #ff8c42 100%)',
              border: 'none',
              borderRadius: '24px',
              padding: '10px 24px',
              color: 'white',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 92, 26, 0.2)',
              fontSize: '14px'
            }}
          >
            Add Vehicle +
          </button>
        </div>

        {/* Loading / Grid layout */}
        {loading ? (
          <p style={{ color: '#64748b' }}>{t('loading')}</p>
        ) : vehicles.length === 0 ? (
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '60px 40px', textAlign: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🚘</span>
            {t('no_vehicles')}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
              {currentVehicles.map(v => (
                <div key={v._id} style={{
                  background: '#1e293b',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  position: 'relative'
                }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'white' }}>
                      {v.make} {v.model}
                    </h3>
                    <span style={{
                      background: v.isActive !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                      color: v.isActive !== false ? '#10b981' : '#94a3b8',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {v.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>
                      Year: {v.year}
                    </p>
                    <div style={{ display: 'flex' }}>
                      <span style={{
                        background: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#f8fafc',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        Plate: {v.registrationNumber}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'end', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                    <button
                      onClick={() => handleToggleActive(v)}
                      style={{
                        background: 'none',
                        border: v.isActive !== false ? '1px solid #fbbf24' : '1px solid #10b981',
                        color: v.isActive !== false ? '#fbbf24' : '#10b981',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {v.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(v)}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#f8fafc',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Edit 📝
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(v._id)}
                      style={{
                        background: 'none',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Delete <LuTrash2 size={13} style={{ marginLeft: '4px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      background: currentPage === pageNum ? '#ff5c1a' : '#1e293b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      width: '36px',
                      height: '36px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

      </div>

      {/* ── Add/Edit Vehicle Modal Overlay ── */}
      {vehicleModalOpen && (
        <div 
          onClick={() => setVehicleModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="g-dark-form-card"
            style={{
              background: '#1e293b',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', color: 'white' }}>
              {editVehicleId ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><LuPencil /> Edit Registered Vehicle</span> : <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><LuPlus /> Add New Vehicle</span>}
            </h3>
            
            <form onSubmit={handleVehicleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{t('brand_make')}</label>
                <CustomDropdown
                  name="car_brand"
                  placeholder={t('select_make')}
                  options={brandOptions}
                  value={carBrand}
                  onChange={(val) => {
                    setCarBrand(val);
                    setCarModel('');
                  }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{t('model')}</label>
                <CustomDropdown
                  name="car_model"
                  placeholder={carBrand ? t('model_placeholder') : t('select_brand_first')}
                  options={modelOptions}
                  value={carModel}
                  onChange={setCarModel}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{t('year')}</label>
                <CustomDropdown
                  name="car_year"
                  placeholder={t('year_placeholder')}
                  options={Array.from({ length: 20 }, (_, i) => String(new Date().getFullYear() - i))}
                  value={carYear}
                  onChange={setCarYear}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{t('registration_plate')}</label>
                <input
                  type="text"
                  placeholder={t('plate_placeholder')}
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1.5px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: 'white',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{t('vin_optional')}</label>
                <input
                  type="text"
                  value={vinNumber}
                  onChange={(e) => setVinNumber(e.target.value)}
                  placeholder={t('vin_placeholder')}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#0f172a',
                    border: '1.5px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setVehicleModalOpen(false)}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    padding: '12px 20px',
                    color: '#94a3b8',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  style={{
                    background: 'linear-gradient(135deg, #ff5c1a 0%, #ff8c42 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    color: 'white',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 92, 26, 0.2)',
                    opacity: adding ? 0.7 : 1
                  }}
                >
                  {adding ? t('loading') : t('submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVehicles;
