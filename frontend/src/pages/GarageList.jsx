import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomDropdown from '../components/CustomDropdown';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import {
  LuStore,
  LuStar,
  LuMapPin,
  LuWrench,
  LuPhone,
  LuSearch,
  LuChevronRight
} from 'react-icons/lu';

const cityOptions = [
  { label: 'All Cities', value: '' },
  { label: 'Dubai', value: 'Dubai' },
  { label: 'Sharjah', value: 'Sharjah' },
  { label: 'Abu Dhabi', value: 'Abu Dhabi' }
];

const serviceOptions = [
  { label: 'All Services', value: '' },
  { label: 'Car Wash', value: 'wash' },
  { label: 'Car Service', value: 'service' },
  { label: 'Car Repair', value: 'repair' },
  { label: 'Painting & Denting', value: 'painting' },
  { label: 'A/C Service', value: 'ac' },
  { label: 'Tyre Replacement', value: 'tyre' },
  { label: 'Battery Change', value: 'battery' },
  { label: 'Detailing', value: 'detailing' }
];

const pickupOptions = [
  { label: 'Any', value: '' },
  { label: 'Free Pickup & Drop', value: 'pickup_drop' },
  { label: 'Self Drop', value: 'self_drop' }
];

const sortOptions = [
  { label: 'Top Rated', value: 'rating' }
];

const GarageList = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState({ city: '', service: '', pickup: '' });
  const [sort, setSort] = useState('rating');
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGarages = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/garages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setGarages(data.garages || []);
        }
      } catch (err) {
        console.error('Failed to fetch garages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGarages();
  }, []);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const serviceLabels = {
    minor_service: 'Minor Service',
    major_service: 'Major Service',
    ac_repair: 'AC Repair',
    brake_repair: 'Brake Repair',
    electrical: 'Electrical',
    diagnostics: 'Diagnostics',
    battery: 'Battery Replacement',
    other: 'General Repair'
  };

  const getServiceDisplay = (svcList) => {
    return (svcList || []).map(s => serviceLabels[s] || s).join(', ');
  };

  const filteredGarages = garages.filter(g => {
    if (filter.city) {
      // In the database seed, we assume Dubai for the seeded garages
      const isDubaiArea = g.areas && g.areas.some(a => ['Al Quoz', 'Deira', 'Downtown', 'Bur Dubai'].includes(a));
      if (filter.city === 'Dubai' && !isDubaiArea) return false;
      if (filter.city !== 'Dubai' && isDubaiArea) return false;
    }
    if (filter.service) {
      const match = g.services && g.services.some(s => {
        if (filter.service === 'service') return ['minor_service', 'major_service'].includes(s);
        if (filter.service === 'repair') return ['brake_repair', 'diagnostics', 'electrical'].includes(s);
        if (filter.service === 'ac') return s === 'ac_repair';
        if (filter.service === 'battery') return s === 'battery';
        return s.toLowerCase().includes(filter.service.toLowerCase());
      });
      if (!match) return false;
    }
    return true;
  });

  const sortedGarages = [...filteredGarages].sort((a, b) => {
    if (sort === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  const isAdmin = ['manager', 'superadmin', 'admin'].includes(user?.role);

  const renderContent = () => (
    <div className="container-fluid py-4 px-3" style={{ background: '#f8fafc', minHeight: 'calc(100vh - 68px)' }}>
      {/* Page Header & Title */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Available Garages
          </h4>
          <p className="text-muted small mb-0">
            {sortedGarages.length} verified partner garage{sortedGarages.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white rounded-4 border p-4 mb-4 shadow-sm" style={{ borderColor: '#e2e8f0' }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="row g-3 align-items-end">
            {/* City */}
            <div className="col-12 col-md-3">
              <label className="form-label small fw-semibold text-secondary mb-2 d-flex align-items-center gap-1">
                <LuMapPin size={14} className="text-primary-garro" /> City
              </label>
              <CustomDropdown
                options={cityOptions}
                value={filter.city}
                onChange={(val) => setFilter(prev => ({ ...prev, city: val }))}
                placeholder="All Cities"
                name="city"
              />
            </div>

            {/* Service Type */}
            <div className="col-12 col-md-3">
              <label className="form-label small fw-semibold text-secondary mb-2 d-flex align-items-center gap-1">
                <LuWrench size={14} className="text-primary-garro" /> Service Type
              </label>
              <CustomDropdown
                options={serviceOptions}
                value={filter.service}
                onChange={(val) => setFilter(prev => ({ ...prev, service: val }))}
                placeholder="All Services"
                name="service"
              />
            </div>

            {/* Pickup */}
            <div className="col-12 col-md-2">
              <label className="form-label small fw-semibold text-secondary mb-2 d-flex align-items-center gap-1">
                <LuStore size={14} className="text-primary-garro" /> Pickup Option
              </label>
              <CustomDropdown
                options={pickupOptions}
                value={filter.pickup}
                onChange={(val) => setFilter(prev => ({ ...prev, pickup: val }))}
                placeholder="Any"
                name="pickup"
              />
            </div>

            {/* Sort by */}
            <div className="col-12 col-md-2">
              <label className="form-label small fw-semibold text-secondary mb-2 d-flex align-items-center gap-1">
                <LuStar size={14} className="text-primary-garro" /> Sort by
              </label>
              <CustomDropdown
                options={sortOptions}
                value={sort}
                onChange={(val) => setSort(val)}
                placeholder="Sort by"
                name="sort"
              />
            </div>

            {/* Reset Actions */}
            <div className="col-12 col-md-2">
              <button 
                type="button" 
                className="btn-garro btn-outline-garro w-100 py-2 d-flex align-items-center justify-content-center gap-1"
                style={{ height: '42px', fontSize: '13px', fontWeight: '600' }}
                onClick={() => setFilter({ city: '', service: '', pickup: '' })}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Garages List */}
      {loading ? (
        <div className="text-center py-5 bg-white rounded-4 border shadow-sm" style={{ borderColor: '#e2e8f0' }}>
          <div className="spinner-border text-primary-garro" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h6 className="mt-3 text-secondary">Loading verified garages...</h6>
        </div>
      ) : sortedGarages.length > 0 ? (
        <div className="row g-4">
          {sortedGarages.map(garage => (
            <div key={garage._id} className="col-12 col-md-6 col-xl-4">
              <div className="garage-list-card" style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', height: '100%', transition: 'all 0.2s' }}>
                <div className="row g-0 h-100">
                  <div className="col-4">
                    <div className="garage-list-img d-flex align-items-center justify-content-center h-100" style={{ background: 'rgba(255, 92, 26, 0.04)', color: 'var(--brand)', minHeight: '130px', borderRight: '1px solid #e2e8f0' }}>
                      <LuStore size={38} />
                    </div>
                  </div>
                  <div className="col-8 p-3 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '13.5px', lineHeight: '1.3' }}>
                          {garage.name}
                        </h6>
                        <span className="rating-badge flex-shrink-0 d-inline-flex align-items-center gap-1" style={{ background: 'var(--brand-light)', color: 'var(--brand)', padding: '2px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                          <LuStar size={11} style={{ fill: 'currentColor' }} /> {garage.rating || 0}
                        </span>
                      </div>
                      
                      <div className="d-flex align-items-center gap-1 text-muted mb-1" style={{ fontSize: '11.5px' }}>
                        <LuMapPin size={13} className="text-secondary flex-shrink-0" />
                        <span className="text-truncate">{garage.areas ? garage.areas.join(', ') : 'Dubai'}</span>
                      </div>
                      
                      <div className="d-flex align-items-center gap-1 text-muted mb-1" style={{ fontSize: '11.5px' }}>
                        <LuWrench size={13} className="text-secondary flex-shrink-0" />
                        <span className="text-truncate" title={getServiceDisplay(garage.services)}>{getServiceDisplay(garage.services)}</span>
                      </div>
                      
                      {garage.phone && (
                        <div className="d-flex align-items-center gap-1 text-muted mb-3" style={{ fontSize: '11.5px' }}>
                          <LuPhone size={13} className="text-secondary flex-shrink-0" />
                          <span>{garage.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="d-flex gap-2">
                      <Link to={`/garage/${garage._id}`} className="btn-garro btn-outline-garro btn-sm py-2 flex-fill text-center" style={{ fontSize: '12px' }}>
                        Details
                      </Link>
                      <Link to={`/garage/${garage._id}/book`} className="btn-garro btn-primary-garro btn-sm py-2 flex-fill text-center" style={{ fontSize: '12px' }}>
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 bg-white rounded-4 border shadow-sm" style={{ borderColor: '#e2e8f0' }}>
          <LuSearch size={44} className="text-muted mb-3" />
          <h5 className="fw-bold text-dark">No garages found</h5>
          <p className="text-muted small">Try adjusting your filters or selecting a different location.</p>
          <button className="btn-garro btn-primary-garro btn-sm px-4 py-2 mt-2" onClick={() => setFilter({ city: '', service: '', pickup: '' })}>
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );

  if (isAdmin) {
    return (
      <div className="dash-wrapper">
        <AdminSidebar />
        <main className="dash-main w-100" style={{ padding: '0 2rem' }}>
          {renderContent()}
        </main>
      </div>
    );
  }

  return renderContent();
};

export default GarageList;
