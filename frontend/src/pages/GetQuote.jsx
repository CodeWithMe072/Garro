import { API_BASE } from '../config/api';
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
  const [vinNumber, setVinNumber] = useState('');

  const [catalogBrands, setCatalogBrands] = useState([]);
  const [catalogServices, setCatalogServices] = useState([]);
  const [catalogLocations, setCatalogLocations] = useState([]);

  const [savedFavorites, setSavedFavorites] = useState([]);
  const [saveAsFavorite, setSaveAsFavorite] = useState(false);
  const [favoriteLabel, setFavoriteLabel] = useState('');

  const fetchSavedFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/users/me/favorite-locations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedFavorites(data.favoriteLocations || []);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedFavorites();
    }
  }, [isAuthenticated]);

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

  useEffect(() => {
    document.body.style.backgroundColor = '#fff9f6';
    return () => {
      document.body.style.backgroundColor = '';
    };
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

    const catVal = (formData.get('category') || category || '').trim();
    const subCatVal = (formData.get('sub_category') || subCategory || '').trim();

    if (!catVal) {
      toast.error('Please select a main Service Category before requesting a quote.');
      return;
    }

    if (!subCatVal) {
      toast.error('Please select a Sub-Category before requesting a quote.');
      return;
    }

    const car_brand = formData.get('car_brand') || carBrand;
    const car_model = formData.get('car_model') || carModel;
    const car_year = formData.get('car_year') || carYear;
    const city_name = formData.get('city_name') || cityName;
    const area = formData.get('area');
    const problem_title = formData.get('problem_title');
    const phone = formData.get('phone');
    const urgency = formData.get('urgency');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        category: catVal,
        subCategory: subCatVal,
        carBrand: car_brand,
        carModel: car_model,
        carYear: car_year,
        cityName: city_name,
        area,
        problemTitle: problem_title,
        phone,
        urgency,
        vinNumber: formData.get('vin_number') || vinNumber || ''
      };

      const res = await fetch(`${API_BASE}/api/requests/submit-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.requireAuth) {
          localStorage.setItem('pending_quote_token', data.quoteToken);
          localStorage.setItem('pending_quote_data', JSON.stringify(payload));
          toast.info('Please sign in or create an account to finalize your quote.');
          navigate('/login', { state: { quoteToken: data.quoteToken } });
          return;
        }

        if (data.request) {
          toast.success('Quote request submitted successfully!');
          navigate(data.redirectUrl || `/payment/${data.request._id}`);
          
          // Save favorite location if selected
          if (saveAsFavorite && favoriteLabel) {
            try {
              await fetch(`${API_BASE}/api/users/me/favorite-locations`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  label: favoriteLabel,
                  address: `${area || ''}, ${city_name || ''}`.trim() || 'Dubai',
                  lat: 25.2048,
                  lng: 55.2708
                })
              });
            } catch (fErr) {
              console.error('Failed to save favorite location:', fErr);
            }
          }
          return;
        }
      }

      throw new Error(data.message || 'Failed to submit quote request.');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error submitting request. Please try again.');
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
    <div style={{ background: '#fff9f6', minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <section className="g-light-quote-section">
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <h2 className="quote-title">{t('get_quotes_title')}</h2>
          <p className="quote-sub">{t('quotes_sub')}</p>

          <form onSubmit={handleQuoteSubmit}>
            <div className="row g-4">
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

              {/* Row 2: Brand, Model, Year */}
              <div className="col-md-4 col-sm-6">
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
              <div className="col-md-4 col-sm-6">
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
              <div className="col-md-4 col-sm-12">
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

              {/* Quick Select Saved Location */}
              {savedFavorites.length > 0 && (
                <div className="col-12 mb-3">
                  <div className="qform-label"><span className="material-icons-round">bookmark</span> Quick Select Saved Favorite Location</div>
                  <select
                    className="qform-input"
                    style={{ height: '48px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', width: '100%', background: '#fff' }}
                    onChange={(e) => {
                      const favIndex = e.target.value;
                      if (favIndex !== '') {
                        const selectedFav = savedFavorites[favIndex];
                        const parts = selectedFav.address.split(',');
                        if (parts.length >= 2) {
                          const favArea = parts[0].trim();
                          const favCity = parts[1].trim();
                          setCityName(favCity);
                          setArea(favArea);
                        } else {
                          setArea(selectedFav.address);
                        }
                      }
                    }}
                  >
                    <option value="">-- Choose a Saved Location --</option>
                    {savedFavorites.map((fav, index) => (
                      <option key={index} value={index}>{fav.label} ({fav.address})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Row 3: City, Area */}
              <div className="col-md-6">
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
              <div className="col-md-6">
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

              {/* Save Location checkbox */}
              {isAuthenticated && (
                <div className="col-12 mt-2 mb-3 d-flex flex-column gap-2" style={{ textAlign: 'left' }}>
                  <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: '13.5px', color: '#1e293b' }}>
                    <input
                      type="checkbox"
                      checked={saveAsFavorite}
                      onChange={(e) => setSaveAsFavorite(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    Save this location as a Favorite Pickup Location
                  </label>
                  {saveAsFavorite && (
                    <input
                      type="text"
                      className="qform-input"
                      placeholder="Label e.g. Home, Office, Gym..."
                      value={favoriteLabel}
                      onChange={(e) => setFavoriteLabel(e.target.value)}
                      style={{ height: '44px', borderRadius: '12px', maxWidth: '300px', border: '1.5px solid #cbd5e1', padding: '0 12px', outline: 'none' }}
                      required={saveAsFavorite}
                    />
                  )}
                </div>
              )}

              {/* Row 4: Describe Issue, Preferred Time, Contact Info, VIN */}
              <div className="col-md-4">
                <div className="qform-label"><span className="material-icons-round">description</span> {t('describe_issue')}</div>
                <input
                  type="text"
                  name="problem_title"
                  className="qform-input"
                  placeholder={t('desc_placeholder')}
                  required
                  style={{ height: '48px', borderRadius: '12px' }}
                />
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="qform-label"><span className="material-icons-round">subtitles</span> VIN / Chassis No. (Optional)</div>
                <input
                  type="text"
                  name="vin_number"
                  className="qform-input"
                  placeholder="e.g. 17-digit VIN"
                  value={vinNumber}
                  onChange={(e) => setVinNumber(e.target.value)}
                  style={{ height: '48px', borderRadius: '12px' }}
                />
              </div>
              <div className="col-md-2 col-sm-6">
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
              <div className="col-md-3 col-sm-6">
                <div className="qform-label"><span className="material-icons-round">phone</span> {t('contact_info')}</div>
                <input
                  type="tel"
                  name="phone"
                  className="qform-input"
                  placeholder={t('phone_placeholder')}
                  required
                  style={{ height: '48px', borderRadius: '12px' }}
                />
              </div>

              {/* Row 5: Action Button & Info */}
              <div className="col-12 mt-4 d-flex align-items-center flex-column justify-content-center" style={{ gap: '10px' }}>
                <button
                  type="submit"
                  className="btn-quote-submit"
                  style={{
                    maxWidth: '340px',
                    padding: '14px 48px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    height: 'auto',
                    cursor: 'pointer',
                    opacity: 1,
                    pointerEvents: 'auto'
                  }}
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
