import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomDropdown from '../components/CustomDropdown';

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


  return (
    <div className="container-fluid px-0">
      <div className="row g-0">
        {/* Sidebar Filters */}
        <div className="col-lg-3 bg-white border-end" style={{ minHeight: 'calc(100vh - 60px)' }}>
          <div className="p-4 sticky-top" style={{ top: '70px' }}>
            <h6 className="fw-bold mb-4">🔍 Refine Search</h6>

            <form onSubmit={(e) => e.preventDefault()}>
              {/* City */}
              <div className="mb-3">
                <label className="form-label small fw-medium">City</label>
                <CustomDropdown
                  options={cityOptions}
                  value={filter.city}
                  onChange={(val) => setFilter(prev => ({ ...prev, city: val }))}
                  placeholder="All Cities"
                  name="city"
                />
              </div>

              {/* Service Type */}
              <div className="mb-3">
                <label className="form-label small fw-medium">Service Type</label>
                <CustomDropdown
                  options={serviceOptions}
                  value={filter.service}
                  onChange={(val) => setFilter(prev => ({ ...prev, service: val }))}
                  placeholder="All Services"
                  name="service"
                />
              </div>

              {/* Pickup */}
              <div className="mb-3">
                <label className="form-label small fw-medium">Pickup Option</label>
                <CustomDropdown
                  options={pickupOptions}
                  value={filter.pickup}
                  onChange={(val) => setFilter(prev => ({ ...prev, pickup: val }))}
                  placeholder="Any"
                  name="pickup"
                />
              </div>

              <button type="submit" className="btn-garro btn-primary-garro w-100 mt-3">Apply Filters</button>
              <button 
                type="button" 
                className="btn-garro btn-clear-garro w-100 mt-2"
                onClick={() => setFilter({ city: '', service: '', pickup: '' })}
              >
                Clear All
              </button>
            </form>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9 bg-light">
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-0">Available Garages</h5>
                <span className="text-muted small">{sortedGarages.length} garage{sortedGarages.length !== 1 ? 's' : ''} found</span>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <label className="small text-muted">Sort by:</label>
                <div style={{ width: '150px' }}>
                  <CustomDropdown
                    options={sortOptions}
                    value={sort}
                    onChange={(val) => setSort(val)}
                    placeholder="Sort by"
                    name="sort"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h6 className="mt-3">Loading verified garages...</h6>
              </div>
            ) : sortedGarages.length > 0 ? (
              <div className="row g-3">
                {sortedGarages.map(garage => (
                  <div key={garage._id} className="col-12 col-xl-6">
                    <div className="garage-list-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', height: '100%', transition: 'all 0.2s' }}>
                      <div className="row g-0 h-100">
                        <div className="col-4">
                          <div className="garage-list-img d-flex align-items-center justify-content-center h-100" style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '3rem' }}>🏪</span>
                          </div>
                        </div>
                        <div className="col-8 p-3">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <h6 className="fw-bold mb-0 me-2" style={{ fontSize: '0.9rem' }}>{garage.name}</h6>
                            <span className="rating-badge flex-shrink-0" style={{ background: 'var(--brand-light)', color: 'var(--brand)', padding: '2px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                              ★ {garage.rating || 0}
                            </span>
                          </div>
                          <p className="text-muted mb-1" style={{ fontSize: '0.78rem' }}>
                            <span className="material-icons-round" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>location_on</span>
                            {garage.areas ? garage.areas.join(', ') : 'Dubai'}
                          </p>
                          <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                            <span className="material-icons-round" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>build</span>
                            {getServiceDisplay(garage.services)}
                          </p>
                          {garage.phone && (
                            <p className="text-muted mb-3" style={{ fontSize: '0.75rem' }}>
                                <span className="material-icons-round" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>phone</span>
                                {garage.phone}
                            </p>
                          )}
                          <div className="d-flex gap-2">
                            <Link to={`/garage/${garage._id}`} className="btn-garro btn-primary-garro btn-sm py-2 px-3 flex-fill text-center">View Details</Link>
                            <Link to={`/garage/${garage._id}/book`} className="btn-garro btn-outline-garro btn-sm py-2 px-3 flex-fill text-center">Book Now</Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <div style={{ fontSize: '4rem' }}>🔍</div>
                <h5 className="fw-bold mt-3">No garages found</h5>
                <p className="text-muted">Try adjusting your filters or selecting a different location.</p>
                <button className="btn btn-primary-garro" onClick={() => setFilter({ city: '', service: '', pickup: '' })}>Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GarageList;
