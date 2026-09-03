import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import CustomDropdown from '../components/CustomDropdown';

const HIDDEN_ROLES   = ['helper', 'garage', 'staff'];
const READONLY_ROLES = ['admin', 'superadmin', 'manager'];

const Home = () => {
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
  const [submitting, setSubmitting] = useState(false);

  // Catalog states
  const [catalogBrands, setCatalogBrands] = useState([]);
  const [catalogServices, setCatalogServices] = useState([]);
  const [catalogLocations, setCatalogLocations] = useState([]);

  
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

    if (submitting) return;

    // Role guard — only customers may submit
    if (isHidden) return;
    if (isReadOnly) {
      toast.warning('Admin accounts cannot place quote requests.');
      return;
    }

    const form = e.target;
    const formData = new FormData(form);

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
    const areaVal = formData.get('area') || area;
    const problem_title = formData.get('problem_title');
    const phoneVal = formData.get('phone');
    const urgencyVal = formData.get('urgency') || urgency;
    const vin_number = formData.get('vin_number') || vinNumber;

    if (phoneVal && phoneVal.trim() && !/^\+?\d{8,15}$/.test(phoneVal.replace(/\s+/g, ''))) {
      toast.error('Please enter a valid phone number (e.g. 0501234567 or +971501234567).');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        category: catVal,
        subCategory: subCatVal,
        carBrand: car_brand,
        carModel: car_model,
        carYear: car_year,
        cityName: city_name,
        area: areaVal,
        problemTitle: problem_title,
        phone: phoneVal,
        urgency: urgencyVal,
        vinNumber: vin_number
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
          return;
        }
      }

      throw new Error(data.message || 'Failed to submit quote.');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error submitting request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ══ HERO ══ */}
      <section className="hm-hero">
        <div className="container hm-hero-inner">
          <div className="hm-hero-left">
            <div className="hm-tag"><span className="hm-tag-dot"></span> {t('trusted_platform')}</div>
            <h1 className="hm-h1">
              {t('get_help')}
            </h1>
            <p className="hm-sub">{t('hero_sub')}</p>
          </div>
          <div className="hm-hero-right">
            <div className="hm-hero-img">
              <img src="/assets/images/hero.png" alt="Garro diagnostic car" loading="eager" />
            </div>
          </div>
        </div>
      </section>

      {/* ══ QUOTE FORM ══ */}
      <section className="quote-section">
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

              {/* Row 3: Issue, Contact, VIN, Time, Submit */}
              <div className="col-md-3">
                <div className="qform-label"><span className="material-icons-round">description</span> {t('describe_issue')}</div>
                <input type="text" name="problem_title" className="qform-input" placeholder={t('desc_placeholder')} />
              </div>
              <div className="col-md-2">
                <div className="qform-label"><span className="material-icons-round">phone</span> {t('contact_info')}</div>
                <input type="tel" name="phone" className="qform-input" placeholder={t('phone_placeholder')} />
              </div>
              <div className="col-md-3">
                <div className="qform-label"><span className="material-icons-round">subtitles</span> VIN / Chassis No. (Optional)</div>
                <input type="text" name="vin_number" className="qform-input" placeholder="e.g. 17-digit VIN" value={vinNumber} onChange={(e) => setVinNumber(e.target.value)} />
              </div>
              <div className="col-md-2">
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
                <button
                  type="submit"
                  className="btn-quote-submit"
                  disabled={submitting || isReadOnly}
                  style={{
                    cursor: submitting || isReadOnly ? 'not-allowed' : 'pointer',
                    opacity: submitting || isReadOnly ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Submitting...' : t('get_a_quote')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ══ HOW GARRO WORKS ══ */}
      <section className="py-5 bg-white">
        <div className="container">
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: '900', color: '#0f172a', fontSize: '1.8rem', marginBottom: '6px' }}>{t('how_it_works')}</h2>
            <p style={{ color: '#64748b', fontSize: '14px', fontFamily: "'Poppins',sans-serif" }}>{t('how_sub')}</p>
          </div>
          <div className="row g-0 align-items-start">
            <div className="col">
              <div className="hiw-card">
                <div className="hiw-num">01</div>
                <div className="hiw-icon-wrap" style={{ background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)' }}>
                  <span className="material-icons-round">assignment</span>
                </div>
                <div className="hiw-name">{t('step1_title')}</div>
                <div className="hiw-desc">{t('step1_desc')}</div>
              </div>
            </div>
            <div className="col-auto hiw-connector"><span className="material-icons-round">arrow_forward</span></div>
            <div className="col">
              <div className="hiw-card">
                <div className="hiw-num">02</div>
                <div className="hiw-icon-wrap" style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
                  <span className="material-icons-round">request_quote</span>
                </div>
                <div className="hiw-name">{t('step2_title')}</div>
                <div className="hiw-desc">{t('step2_desc')}</div>
              </div>
            </div>
            <div className="col-auto hiw-connector"><span className="material-icons-round">arrow_forward</span></div>
            <div className="col">
              <div className="hiw-card">
                <div className="hiw-num">03</div>
                <div className="hiw-icon-wrap" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                  <span className="material-icons-round">local_shipping</span>
                </div>
                <div className="hiw-name">{t('step3_title')}</div>
                <div className="hiw-desc">{t('step3_desc')}</div>
              </div>
            </div>
            <div className="col-auto hiw-connector"><span className="material-icons-round">arrow_forward</span></div>
            <div className="col">
              <div className="hiw-card">
                <div className="hiw-num">04</div>
                <div className="hiw-icon-wrap" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' }}>
                  <span className="material-icons-round">build_circle</span>
                </div>
                <div className="hiw-name">{t('step4_title')}</div>
                <div className="hiw-desc">{t('step4_desc')}</div>
              </div>
            </div>
            <div className="col-auto hiw-connector"><span className="material-icons-round">arrow_forward</span></div>
            <div className="col">
              <div className="hiw-card">
                <div className="hiw-num">05</div>
                <div className="hiw-icon-wrap" style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)' }}>
                  <span className="material-icons-round">task_alt</span>
                </div>
                <div className="hiw-name">{t('step5_title')}</div>
                <div className="hiw-desc">{t('step5_desc')}</div>
              </div>
            </div>
          </div>


        </div>
      </section>

    </>
  );
};

export default Home;
