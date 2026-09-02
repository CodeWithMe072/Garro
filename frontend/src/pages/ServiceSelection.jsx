import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomDropdown from '../components/CustomDropdown';

// Roles that cannot see the form at all
const HIDDEN_ROLES = ['helper', 'garage', 'staff'];
// Roles that can see the form but cannot submit
const READONLY_ROLES = ['admin', 'superadmin', 'manager'];

const ServiceSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userRole  = user?.role || null;
  const isHidden  = HIDDEN_ROLES.includes(userRole);          // helper, garage, staff
  const isReadOnly = READONLY_ROLES.includes(userRole);       // admin roles
  const isGuest   = !userRole;                                 // not logged in
  // Only logged-in customers can submit
  const canSubmit = userRole === 'customer';

  const [catalogBrands, setCatalogBrands] = useState([]);
  const [catalogServices, setCatalogServices] = useState([]);
  const [catalogLocations, setCatalogLocations] = useState([]);
  
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('flexible');

  
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [brandsRes, servicesRes, locationsRes] = await Promise.all([
          fetch(`${API_BASE}/api/vehicles/catalog/brands`),
          fetch(`${API_BASE}/api/vehicles/catalog/services`),
          fetch(`${API_BASE}/api/vehicles/catalog/locations`)
        ]);

        const [brandsData, servicesData, locationsData] = await Promise.all([
          brandsRes.json(),
          servicesRes.json(),
          locationsRes.json()
        ]);

        if (brandsRes.ok && brandsData.success) {
          setCatalogBrands(brandsData.brands || []);
        }
        if (servicesRes.ok && servicesData.success) {
          setCatalogServices(servicesData.categories || []);
        }
        if (locationsRes.ok && locationsData.success) {
          setCatalogLocations(locationsData.cities || []);
        }
      } catch (err) {
        console.error('Failed to fetch public catalog data:', err);
      }
    };
    fetchCatalog();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const form = e.target;
    const formData = new FormData(form);

    const catVal = (formData.get('category') || selectedCat || '').trim();
    const subCatVal = (formData.get('sub_category') || '').trim();

    if (!catVal) {
      alert('Please select a main Service Category before submitting.');
      return;
    }

    if (!subCatVal) {
      alert('Please select a Sub-Category before submitting.');
      return;
    }

    navigate('/garages');
  };

  /* ── helper / garage / staff: hide the form entirely ── */
  if (isHidden) {
    return (
      <section className="gq-page">
        <div className="container">
          <h1 className="gq-title">Request a Quote for Your Car Service</h1>
          <p className="gq-sub">Tell us what your vehicle needs and Garro will arrange the right service and quotation for you.</p>
          <div className="gq-form-wrap" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
              gap: '12px', color: '#64748b'
            }}>
              <span className="material-icons-round" style={{ fontSize: '48px', color: '#cbd5e1' }}>block</span>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '16px', color: '#475569' }}>
                Not available for your account type
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                Quote requests can only be placed by customers.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="gq-page">
      <div className="container">
        <h1 className="gq-title">Request a Quote for Your Car Service</h1>
        <p className="gq-sub">Tell us what your vehicle needs and Garro will arrange the right service and quotation for you.</p>

        <div className="gq-form-wrap">
          <form onSubmit={handleSubmit}>
            {/* Row 1: Service Category + Sub-Category */}
            <div className="gq-row gq-row-2">
              <div>
                <div className="gq-label mb-2" style={{ display: 'block' }}><span className="material-icons-round">search</span> Service Category</div>
                <CustomDropdown
                  options={catalogServices.map(c => ({ value: c.slug, label: c.name }))}
                  value={selectedCat}
                  onChange={(val) => setSelectedCat(val)}
                  placeholder="Select main category"
                  theme="light"
                />
              </div>
              <div>
                <div className="gq-label mb-2" style={{ display: 'block' }}><span className="material-icons-round">list</span> Sub-Category</div>
                <CustomDropdown
                  options={(catalogServices.find(c => c.slug === selectedCat)?.subCategories || []).map(s => ({ value: s.slug, label: s.name }))}
                  value={selectedSubCat}
                  onChange={(val) => setSelectedSubCat(val)}
                  placeholder="Select sub-category"
                  theme="light"
                />
              </div>
            </div>

            {/* Row 2: Brand, Model, Year, City, Area */}
            <div className="gq-row gq-row-5">
              <div>
                <div className="gq-label mb-2" style={{ display: 'block' }}><span className="material-icons-round">directions_car</span> Brand</div>
                <CustomDropdown
                  options={[
                    ...catalogBrands.map(b => ({ value: b.name, label: b.name })),
                    { value: 'Other', label: 'Other' }
                  ]}
                  value={selectedBrand}
                  onChange={(val) => setSelectedBrand(val)}
                  placeholder="Select Brand"
                  theme="light"
                />
              </div>
              <div>
                <div className="gq-label"><span className="material-icons-round">tune</span> Model</div>
                <input type="text" name="car_model_name" className="gq-input" placeholder="Any Model" />
              </div>
              <div>
                <div className="gq-label mb-2" style={{ display: 'block' }}><span className="material-icons-round">calendar_today</span> Year</div>
                <CustomDropdown
                  options={[...Array(20)].map((_, i) => {
                    const y = String(new Date().getFullYear() - i);
                    return { value: y, label: y };
                  })}
                  value={selectedYear}
                  onChange={(val) => setSelectedYear(val)}
                  placeholder="Year"
                  theme="light"
                />
              </div>
              <div>
                <div className="gq-label mb-2" style={{ display: 'block' }}><span className="material-icons-round">location_city</span> City</div>
                <CustomDropdown
                  options={catalogLocations.map(c => ({ value: c.name, label: c.name }))}
                  value={selectedCity}
                  onChange={(val) => setSelectedCity(val)}
                  placeholder="City"
                  theme="light"
                />
              </div>
              <div>
                <div className="gq-label"><span className="material-icons-round">location_on</span> Area</div>
                <input type="text" name="user_location" className="gq-input" placeholder="Area" />
              </div>
            </div>

            {/* Row 3: Issue, Contact, Preferred Time, Submit */}
            <div className="gq-row gq-row-4">
              <div>
                <div className="gq-label"><span className="material-icons-round">description</span> Describe Your Issue</div>
                <input type="text" name="problem_title" className="gq-input" placeholder="Describe the issue" required />
              </div>
              <div>
                <div className="gq-label"><span className="material-icons-round">phone</span> Contact Info</div>
                <input type="tel" name="phone" className="gq-input" placeholder="Enter mobile number" />
              </div>
              <div>
                <div className="gq-label mb-2" style={{ display: 'block' }}><span className="material-icons-round">access_time</span> Preferred Time</div>
                <CustomDropdown
                  options={[
                    { value: 'asap', label: 'ASAP — Urgent' },
                    { value: 'today', label: 'Today' },
                    { value: 'this_week', label: 'This Week' },
                    { value: 'flexible', label: 'Flexible' }
                  ]}
                  value={selectedUrgency}
                  onChange={(val) => setSelectedUrgency(val)}
                  theme="light"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'column', gap: '6px' }}>
                {isGuest && (
                  <p style={{ margin: 0, fontSize: '11px', color: '#3b82f6', fontWeight: 600, textAlign: 'center', lineHeight: '1.3' }}>
                    Please log in as a customer to submit
                  </p>
                )}
                {isReadOnly && (
                  <p style={{ margin: 0, fontSize: '11px', color: '#f97316', fontWeight: 600, textAlign: 'center', lineHeight: '1.3' }}>
                    Admin accounts cannot place quote requests
                  </p>
                )}
                <button
                  type="submit"
                  className="btn-gq-submit"
                  disabled={!canSubmit}
                  title={isGuest ? 'Log in as a customer to submit' : !canSubmit ? 'Your account type cannot place quote requests' : ''}
                  style={!canSubmit ? { opacity: 0.45, cursor: 'not-allowed', filter: 'grayscale(40%)', pointerEvents: 'none' } : {}}
                >
                  Get a Quote
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ServiceSelection;
