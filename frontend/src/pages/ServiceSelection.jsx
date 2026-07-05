import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ServiceSelection = () => {
  const navigate = useNavigate();

  const [catalogBrands, setCatalogBrands] = useState([]);
  const [catalogServices, setCatalogServices] = useState([]);
  const [catalogLocations, setCatalogLocations] = useState([]);
  
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/garages');
  };

  return (
    <section className="gq-page">
      <div className="container">
        <h1 className="gq-title">Get Instant Quotes from <span>Top-Rated Garages</span></h1>
        <p className="gq-sub">Transparent pricing <span>·</span> Verified garages <span>·</span> Instant quotes</p>

        <div className="gq-form-wrap">
          <form onSubmit={handleSubmit}>
            {/* Row 1: Service Category + Sub-Category */}
            <div className="gq-row gq-row-2">
              <div>
                <div className="gq-label"><span className="material-icons-round">search</span> Service Category</div>
                <select 
                  name="category" 
                  className="gq-select" 
                  required 
                  value={selectedCat} 
                  onChange={e => setSelectedCat(e.target.value)}
                >
                  <option value="">Select main category</option>
                  {catalogServices.map(c => (
                    <option key={c._id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="gq-label"><span className="material-icons-round">list</span> Sub-Category</div>
                <select name="sub_category" className="gq-select" defaultValue="">
                  <option value="">Select sub-category</option>
                  {catalogServices.find(c => c.slug === selectedCat)?.subCategories.map(s => (
                    <option key={s._id} value={s.slug}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Brand, Model, Year, City, Area */}
            <div className="gq-row gq-row-5">
              <div>
                <div className="gq-label"><span className="material-icons-round">directions_car</span> Brand</div>
                <select 
                  name="car_brand" 
                  className="gq-select" 
                  value={selectedBrand} 
                  onChange={e => setSelectedBrand(e.target.value)}
                >
                  <option value="">Select Brand</option>
                  {catalogBrands.map(b => (
                    <option key={b._id} value={b.name}>{b.name}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <div className="gq-label"><span className="material-icons-round">tune</span> Model</div>
                <input type="text" name="car_model_name" className="gq-input" placeholder="Any Model" />
              </div>
              <div>
                <div className="gq-label"><span className="material-icons-round">calendar_today</span> Year</div>
                <select name="car_year" className="gq-select" defaultValue="">
                  <option value="">Year</option>
                  {[...Array(20)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
              <div>
                <div className="gq-label"><span className="material-icons-round">location_city</span> City</div>
                <select 
                  name="city" 
                  className="gq-select" 
                  value={selectedCity} 
                  onChange={e => setSelectedCity(e.target.value)}
                >
                  <option value="">City</option>
                  {catalogLocations.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
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
                <div className="gq-label"><span className="material-icons-round">access_time</span> Preferred Time</div>
                <select name="urgency" className="gq-select" defaultValue="flexible">
                  <option value="asap">ASAP — Urgent</option>
                  <option value="today">Today</option>
                  <option value="this_week">This Week</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn-gq-submit">Get a Quote</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ServiceSelection;
