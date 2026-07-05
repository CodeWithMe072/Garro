import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import CustomDropdown from '../components/CustomDropdown';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useNotification();

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
        oil_change: 'minor_service',
        brake_repair: 'brake_repair',
        battery: 'battery',
        engine: 'other',
        tyre: 'other',
        ac: 'ac_repair',
        full_detailing: 'other',
        towing: 'other',
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

      // 4. Submit booking request (with garageId: null for general unassigned quote request)
      const requestRes = await fetch(`${API_BASE}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId,
          serviceType: serviceTypeCode,
          description: problem_title || `Requesting quote for ${sub_category || category || 'general service'}`,
          preferredDate: preferredDateObj,
          urgency: urgency || 'flexible',
          location: {
            address: `${area || ''}, ${city_name || ''}`.trim() || 'Dubai',
            lat: 25.2048,
            lng: 55.2708
          },
          garageId: null // None selected yet. Admin must assign manually.
        })
      });

      const requestData = await requestRes.json();
      if (!requestRes.ok || !requestData.success) {
        throw new Error(requestData.message || 'Failed to submit quote request.');
      }

      toast.success('Quote request submitted successfully!');
      navigate('/my-requests');
    } catch (err) {
      toast.error(err.message || 'An error occurred during submission.');
    }
  };

  return (
    <>
      {/* ══ HERO ══ */}
      <section className="hm-hero">
        <div className="container hm-hero-inner">
          <div className="hm-hero-left">
            <div className="hm-tag"><span className="hm-tag-dot"></span> UAE's Trusted Car Service Platform</div>
            <h1 className="hm-h1">
              Get Instant Help<br/>From Verified<br/>
              <span>UAE Garages</span>
            </h1>
            <p className="hm-sub">Emergency or regular service, we connect you with top-rated garages near you.</p>
            <div className="hm-stats">
              <div className="hm-stat">
                <span className="material-icons-round">shield</span>
                <div><div className="hm-stat-num">500+</div><div className="hm-stat-lbl">Verified Garages</div></div>
              </div>
              <div className="hm-stat">
                <span className="material-icons-round">schedule</span>
                <div><div className="hm-stat-num">24/7</div><div className="hm-stat-lbl">Support</div></div>
              </div>
              <div className="hm-stat">
                <span className="material-icons-round">verified</span>
                <div><div className="hm-stat-num">100%</div><div className="hm-stat-lbl">Transparent</div></div>
              </div>
            </div>
          </div>
          <div className="hm-hero-right">
            <div className="hm-hero-img">
              <img src="/assets/images/hero-home.jpg" alt="Garro mechanic" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* ══ QUOTE FORM ══ */}
      <section className="quote-section">
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <h2 className="quote-title">Get Instant Quotes from <span>Top-Rated Garages</span></h2>
          <p className="quote-sub">Transparent pricing · Verified garages · Instant quotes</p>

          <form onSubmit={handleQuoteSubmit}>
            <div className="row g-3">
              {/* Row 1: Category + Sub-category */}
              <div className="col-md-6">
                <div className="qform-label"><span className="material-icons-round">category</span> Service Category</div>
                <CustomDropdown
                  name="category"
                  placeholder="Select main category"
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
                <div className="qform-label"><span className="material-icons-round">list</span> Sub-Category</div>
                <CustomDropdown
                  name="sub_category"
                  placeholder={category ? "Select sub-category" : "Select main category first"}
                  options={subCategoryOptions}
                  value={subCategory}
                  onChange={setSubCategory}
                  required
                />
              </div>

              {/* Row 2: Brand, Model, Year, City, Area */}
              <div className="col-6 col-md-3">
                <div className="qform-label"><span className="material-icons-round">directions_car</span> Brand</div>
                <CustomDropdown
                  name="car_brand"
                  placeholder="Brand"
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
                <div className="qform-label"><span className="material-icons-round">tune</span> Model</div>
                <CustomDropdown
                  name="car_model"
                  placeholder={carBrand ? "Model" : "Select Brand first"}
                  options={modelOptions}
                  value={carModel}
                  onChange={setCarModel}
                  required
                />
              </div>
              <div className="col-4 col-md-1">
                <div className="qform-label"><span className="material-icons-round">calendar_today</span> Year</div>
                <CustomDropdown
                  name="car_year"
                  placeholder="Year"
                  options={Array.from({ length: 20 }, (_, i) => String(new Date().getFullYear() - i))}
                  value={carYear}
                  onChange={setCarYear}
                  required
                />
              </div>
              <div className="col-4 col-md-3">
                <div className="qform-label"><span className="material-icons-round">location_city</span> City</div>
                <CustomDropdown
                  name="city_name"
                  placeholder="City"
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
                <div className="qform-label"><span className="material-icons-round">location_on</span> Area</div>
                <CustomDropdown
                  name="area"
                  placeholder={cityName ? "Area" : "Select City first"}
                  options={areaOptions}
                  value={area}
                  onChange={setArea}
                  required
                />
              </div>

              {/* Row 3: Issue, Contact, Time, Submit */}
              <div className="col-md-4">
                <div className="qform-label"><span className="material-icons-round">description</span> Describe Your Issue</div>
                <input type="text" name="problem_title" className="qform-input" placeholder="Describe the issue" />
              </div>
              <div className="col-md-3">
                <div className="qform-label"><span className="material-icons-round">phone</span> Contact Info</div>
                <input type="tel" name="phone" className="qform-input" placeholder="Enter mobile number" />
              </div>
              <div className="col-md-3">
                <div className="qform-label"><span className="material-icons-round">access_time</span> Preferred Time</div>
                <CustomDropdown
                  name="urgency"
                  placeholder="Select time"
                  options={[
                    { value: 'asap', label: 'ASAP — Urgent' },
                    { value: 'today', label: 'Today' },
                    { value: 'this_week', label: 'This Week' },
                    { value: 'flexible', label: 'Flexible' }
                  ]}
                  value={urgency}
                  onChange={setUrgency}
                  required
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button type="submit" className="btn-quote-submit">Get a Quote</button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ══ HOW GARRO WORKS ══ */}
      <section className="py-5 bg-white">
        <div className="container">
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: '900', color: '#0f172a', fontSize: '1.8rem', marginBottom: '6px' }}>How Garro Works</h2>
            <p style={{ color: '#64748b', fontSize: '14px', fontFamily: "'Poppins',sans-serif" }}>Simple steps to get your car back on track with trusted service.</p>
          </div>
          <div className="row g-0 align-items-start">
            <div className="col">
              <div className="hiw-card">
                <div className="hiw-num">01</div>
                <div className="hiw-icon-wrap" style={{ background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)' }}>
                  <span className="material-icons-round">assignment</span>
                </div>
                <div className="hiw-name">Select Issue</div>
                <div className="hiw-desc">Tell us what your car needs.</div>
              </div>
            </div>
            <div className="col-auto hiw-connector"><span className="material-icons-round">arrow_forward</span></div>
            <div className="col">
              <div className="hiw-card">
                <div className="hiw-num">02</div>
                <div className="hiw-icon-wrap" style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
                  <span className="material-icons-round">search</span>
                </div>
                <div className="hiw-name">We Search</div>
                <div className="hiw-desc">We find the best local garages.</div>
              </div>
            </div>
            <div className="col-auto hiw-connector"><span className="material-icons-round">arrow_forward</span></div>
            <div className="col">
              <div className="hiw-card">
                <div className="hiw-num">03</div>
                <div className="hiw-icon-wrap" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                  <span className="material-icons-round">verified_user</span>
                </div>
                <div className="hiw-name">Compare &amp; Choose</div>
                <div className="hiw-desc">Compare prices &amp; services.</div>
              </div>
            </div>
            <div className="col-auto hiw-connector"><span className="material-icons-round">arrow_forward</span></div>
            <div className="col">
              <div className="hiw-card">
                <div className="hiw-num">04</div>
                <div className="hiw-icon-wrap" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' }}>
                  <span className="material-icons-round">local_shipping</span>
                </div>
                <div className="hiw-name">Pick Up / Drop</div>
                <div className="hiw-desc">Book a slot &amp; get your car serviced.</div>
              </div>
            </div>
            <div className="col-auto hiw-connector"><span className="material-icons-round">arrow_forward</span></div>
            <div className="col">
              <div className="hiw-card">
                <div className="hiw-num">05</div>
                <div className="hiw-icon-wrap" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                  <span className="material-icons-round">location_on</span>
                </div>
                <div className="hiw-name">Track &amp; Relax</div>
                <div className="hiw-desc">Live updates till your car is done.</div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', color: '#fff', borderRadius: '50px', padding: '14px 36px', fontWeight: '800', fontSize: '15px', textDecoration: 'none', fontFamily: "'Poppins',sans-serif", boxShadow: '0 6px 22px rgba(255,92,26,.38)' }}>
              Get a Quote Now <span className="material-icons-round">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ DARK STATS ══ */}
      <section className="dark-stats">
        <div className="container">
          <div className="row g-0 text-center align-items-center">
            <div className="col">
              <div className="dstat-num">500+</div>
              <div className="dstat-lbl">Verified Garages<br/>Across UAE</div>
            </div>
            <div className="col-auto dstat-divider d-none d-md-block">&nbsp;</div>
            <div className="col">
              <div className="dstat-num">50K+</div>
              <div className="dstat-lbl">Happy Customers<br/>Served</div>
            </div>
            <div className="col-auto dstat-divider d-none d-md-block">&nbsp;</div>
            <div className="col">
              <div className="dstat-num">12 Min</div>
              <div className="dstat-lbl">Average Response<br/>Time</div>
            </div>
            <div className="col-auto dstat-divider d-none d-md-block">&nbsp;</div>
            <div className="col">
              <div className="dstat-num">98%</div>
              <div className="dstat-lbl">Customer Satisfaction<br/>Rate</div>
            </div>
            <div className="col-auto dstat-divider d-none d-md-block">&nbsp;</div>
            <div className="col">
              <div className="dstat-num">24/7</div>
              <div className="dstat-lbl">Emergency<br/>Support</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
