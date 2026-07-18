import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import CustomDropdown from '../components/CustomDropdown';

const HIDDEN_ROLES   = ['helper', 'garage', 'staff'];
const READONLY_ROLES = ['admin', 'superadmin', 'manager'];

const GetQuote = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useNotification();
  const { t } = useLanguage();

  const userRole   = user?.role || null;
  const isHidden   = HIDDEN_ROLES.includes(userRole);
  const isReadOnly = READONLY_ROLES.includes(userRole);
  const isGuest    = !userRole;
  const canSubmit  = userRole === 'customer';

  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [cityName, setCityName] = useState('Dubai');
  const [area, setArea] = useState('');
  const [urgency, setUrgency] = useState('');

  // Catalog states
  const [catalogBrands, setCatalogBrands] = useState([]);
  const [catalogServices, setCatalogServices] = useState([]);
  const [catalogLocations, setCatalogLocations] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  // Compute dynamic lists based on parent selection
  const categoryOptions = catalogServices.map(c => ({ value: c.slug, label: c.name }));
  
  const activeCat = catalogServices.find(c => c.slug === category);
  const subCategoryOptions = activeCat ? activeCat.subCategories.map(s => ({ value: s.slug, label: s.name })) : [];

  const brandOptions = catalogBrands.map(b => b.name);

  const activeBrand = catalogBrands.find(b => b.name === carBrand);
  const modelOptions = activeBrand ? [...activeBrand.models.map(m => m.name), 'Other'] : ['Other'];

  const cityOptions = catalogLocations.map(c => c.name);

  const activeCity = catalogLocations.find(c => c.name === cityName);
  const areaOptions = activeCity ? activeCity.areas.map(a => a.name) : [];

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();

    // Role guard — only customers may submit
    if (isHidden) return;
    if (isReadOnly) {
      toast.warning('Admin accounts cannot place quote requests.');
      return;
    }
    if (!isAuthenticated) {
      toast.info("Please sign in or register first to submit a quote request.");
      navigate('/login');
      return;
    }

    const form = e.target;
    const formData = new FormData(form);

    const category = formData.get('category');
    const sub_category = formData.get('sub_category');
    const car_brand = formData.get('car_brand');
    const car_model = formData.get('car_model');
    const car_year = formData.get('car_year');
    const city_name = formData.get('city_name');
    const area = formData.get('area');
    const problem_title = formData.get('problem_title');
    const phone = formData.get('phone');
    const urgency = formData.get('urgency');

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      // 1. Register vehicle
      const vehicleRes = await fetch(`${API_BASE}/api/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          make: car_brand || 'Toyota',
          model: car_model || 'Camry',
          year: parseInt(car_year) || 2020,
          registrationNumber: `DXB-${Math.floor(Math.random() * 90000 + 10000)}`
        })
      });
      const vehicleData = await vehicleRes.json();
      if (!vehicleRes.ok || !vehicleData.success) {
        throw new Error(vehicleData.message || 'Failed to register vehicle.');
      }

      const vehicleId = vehicleData.vehicle._id;

      // 2. Map service code
      const serviceTypeMap = {
        // Mechanical Repair
        engine_repair: 'other',
        brake_repair: 'brake_repair',
        suspension_repair: 'other',
        transmission_service: 'other',
        steering_repair: 'other',

        // Electrical & AC
        ac_repair: 'ac_repair',
        battery_replacement: 'battery',
        diagnostics: 'diagnostics',
        electrical_fix: 'electrical',

        // Body & Paint
        scratch_removal: 'other',
        dent_repair: 'other',
        ceramic_coating: 'other',
        window_tinting: 'other',
        full_detailing: 'other',

        // General Maintenance
        minor_service: 'minor_service',
        major_service: 'major_service',
        oil_change: 'minor_service',
        safety_inspection: 'diagnostics',
        annual_inspection: 'diagnostics',

        other: 'other'
      };
      const serviceTypeCode = serviceTypeMap[sub_category] || 'other';

      // 3. Create preferred date
      let preferredDateObj = new Date();
      if (urgency === 'today') {
        preferredDateObj.setHours(preferredDateObj.getHours() + 2);
      } else if (urgency === 'this_week') {
        preferredDateObj.setDate(preferredDateObj.getDate() + 3);
      } else {
        preferredDateObj.setDate(preferredDateObj.getDate() + 1); // tomorrow
      }

      // 4. Submit booking request
      // Find human-readable subcategory name
      let subCategoryLabel = '';
      if (sub_category) {
        const foundSub = catalogServices
          .flatMap(c => c.subCategories || [])
          .find(s => s.slug === sub_category);
        if (foundSub) {
          subCategoryLabel = foundSub.name;
        }
      }

      // 4. Submit booking request
      const requestRes = await fetch(`${API_BASE}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId,
          serviceType: serviceTypeCode,
          subCategory: subCategoryLabel || sub_category,
          description: problem_title || `Requesting quote for ${subCategoryLabel || sub_category || category || 'general service'}`,
          preferredDate: preferredDateObj,
          urgency: urgency || 'flexible',
          location: {
            address: `${area || ''}, ${city_name || ''}`.trim() || 'Dubai',
            lat: 25.2048,
            lng: 55.2708
          },
          garageId: null
        })
      });

      const requestData = await requestRes.json();
      if (!requestRes.ok || !requestData.success) {
        throw new Error(requestData.message || 'Failed to submit quote request.');
      }

      toast.success('Quote request submitted successfully! Redirecting to payment...');
      navigate(`/payment?quoteId=${requestData.quoteId}`);
    } catch (err) {
      toast.error(err.message || 'An error occurred during submission.');
    }
  };

  /* ── helper / garage / staff: hide entirely ── */
  if (isHidden) {
    return (
      <div style={{ background: '#0f172a', minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '48px 24px' }}>
          <span className="material-icons-round" style={{ fontSize: '56px', color: '#334155', display: 'block', marginBottom: '16px' }}>block</span>
          <p style={{ fontWeight: 600, fontSize: '18px', color: '#64748b', margin: '0 0 8px' }}>Not available for your account type</p>
          <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>Quote requests can only be placed by customers.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0f172a', minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', alignItems: 'center', marginBottom: '-80px', paddingBottom: '80px' }}>
      <section className="quote-section" style={{ width: '100%', padding: '60px 0' }}>
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <h2 className="quote-title">{t('get_quotes_title')}</h2>
          <p className="quote-sub">{t('quotes_sub')}</p>

          <form onSubmit={handleQuoteSubmit}>
            <div className="row g-3">
              {/* Row 1: Category + Sub-category */}
              <div className="col-md-6">
                <div className="qform-label"><span className="material-icons-round">category</span> {t('service_category')}</div>
                <CustomDropdown
                  name="category"
                  placeholder={t('select_category')}
                  options={categoryOptions}
                  value={category}
                  onChange={(val) => {
                    setCategory(val);
                    setSubCategory('');
                  }}
                  required
                />
              </div>
              <div className="col-md-6">
                <div className="qform-label"><span className="material-icons-round">list</span> {t('sub_category_label')}</div>
                <CustomDropdown
                  name="sub_category"
                  placeholder={category ? t('select_subcategory') : t('select_category_first')}
                  options={subCategoryOptions}
                  value={subCategory}
                  onChange={setSubCategory}
                  required
                />
              </div>

              {/* Row 2: Brand, Model, Year, City, Area */}
              <div className="col-6 col-md-3">
                <div className="qform-label"><span className="material-icons-round">directions_car</span> {t('brand')}</div>
                <CustomDropdown
                  name="car_brand"
                  placeholder={t('brand')}
                  options={brandOptions}
                  value={carBrand}
                  onChange={(val) => {
                    setCarBrand(val);
                    setCarModel('');
                  }}
                  required
                />
              </div>
              <div className="col-6 col-md-2">
                <div className="qform-label"><span className="material-icons-round">tune</span> {t('model')}</div>
                <CustomDropdown
                  name="car_model"
                  placeholder={carBrand ? t('model') : t('select_brand_first')}
                  options={modelOptions}
                  value={carModel}
                  onChange={setCarModel}
                  required
                />
              </div>
              <div className="col-4 col-md-1">
                <div className="qform-label"><span className="material-icons-round">calendar_today</span> {t('year')}</div>
                <CustomDropdown
                  name="car_year"
                  placeholder={t('year')}
                  options={Array.from({ length: 20 }, (_, i) => String(new Date().getFullYear() - i))}
                  value={carYear}
                  onChange={setCarYear}
                  required
                />
              </div>
              <div className="col-4 col-md-3">
                <div className="qform-label"><span className="material-icons-round">location_city</span> {t('city')}</div>
                <CustomDropdown
                  name="city_name"
                  placeholder={t('city')}
                  options={cityOptions}
                  value={cityName}
                  onChange={(val) => {
                    setCityName(val);
                    setArea('');
                  }}
                  required
                />
              </div>
              <div className="col-4 col-md-3">
                <div className="qform-label"><span className="material-icons-round">location_on</span> {t('area_label')}</div>
                <CustomDropdown
                  name="area"
                  placeholder={cityName ? t('area_label') : t('select_city_first')}
                  options={areaOptions}
                  value={area}
                  onChange={setArea}
                  required
                />
              </div>

              {/* Row 3: Issue, Contact, Time, Submit */}
              <div className="col-md-4">
                <div className="qform-label"><span className="material-icons-round">description</span> {t('describe_issue')}</div>
                <input type="text" name="problem_title" className="qform-input" placeholder={t('desc_placeholder')} required />
              </div>
              <div className="col-md-3">
                <div className="qform-label"><span className="material-icons-round">phone</span> {t('contact_info')}</div>
                <input type="tel" name="phone" className="qform-input" placeholder={t('phone_placeholder')} required />
              </div>
              <div className="col-md-3">
                <div className="qform-label"><span className="material-icons-round">access_time</span> {t('preferred_time')}</div>
                <CustomDropdown
                  name="urgency"
                  placeholder={t('select_time')}
                  options={[
                    { value: 'asap', label: t('time_asap') },
                    { value: 'today', label: t('time_today') },
                    { value: 'this_week', label: t('time_week') },
                    { value: 'flexible', label: t('time_flexible') }
                  ]}
                  value={urgency}
                  onChange={setUrgency}
                  required
                />
              </div>
              <div className="col-md-2 d-flex align-items-end flex-column justify-content-end" style={{ gap: '6px' }}>
                {isGuest && (
                  <p style={{ margin: 0, fontSize: '11px', color: '#93c5fd', fontWeight: 600, textAlign: 'center', lineHeight: '1.3' }}>
                    Log in as a customer to submit
                  </p>
                )}
                {isReadOnly && (
                  <p style={{ margin: 0, fontSize: '11px', color: '#fb923c', fontWeight: 600, textAlign: 'center', lineHeight: '1.3' }}>
                    Admin accounts cannot place requests
                  </p>
                )}
                <button
                  type="submit"
                  className="btn-quote-submit"
                  disabled={!canSubmit}
                  title={isGuest ? 'Log in as a customer to submit' : !canSubmit ? 'Your account type cannot place quote requests' : ''}
                  style={{ width: '100%', height: '44px', ...(!canSubmit ? { opacity: 0.45, cursor: 'not-allowed', filter: 'grayscale(40%)', pointerEvents: 'none' } : {}) }}
                >
                  {t('get_a_quote')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default GetQuote;
