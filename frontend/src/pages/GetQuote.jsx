import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import CustomDropdown from '../components/CustomDropdown';

const GetQuote = () => {
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
          description: problem_title || `Requesting quote for ${sub_category || category || 'general service'}`,
          preferredDate: preferredDateObj,
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

      toast.success('Quote request submitted successfully!');
      navigate('/my-requests');
    } catch (err) {
      toast.error(err.message || 'An error occurred during submission.');
    }
  };

  return (
    <div style={{ background: '#0f172a', minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', alignItems: 'center', marginBottom: '-80px', paddingBottom: '80px' }}>
      <section className="quote-section" style={{ width: '100%', padding: '60px 0' }}>
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
                  options={[
                    { value: 'major_minor', label: 'Major & Minor Fixes' },
                    { value: 'diagnostics', label: 'Diagnostics & Inspections' },
                    { value: 'aesthetics', label: 'Aesthetics & Detailing' },
                    { value: 'insurance', label: 'Insurance & Protection' },
                    { value: 'roadside', label: 'Roadside Assistance' },
                    { value: 'eol', label: 'End-of-Life & Scrap' }
                  ]}
                  value={category}
                  onChange={setCategory}
                  required
                />
              </div>
              <div className="col-md-6">
                <div className="qform-label"><span className="material-icons-round">list</span> Sub-Category</div>
                <CustomDropdown
                  name="sub_category"
                  placeholder="Select sub-category"
                  options={[
                    { value: 'oil_change', label: 'Oil Change' },
                    { value: 'brake_repair', label: 'Brake Repair' },
                    { value: 'battery', label: 'Battery Replacement' },
                    { value: 'engine', label: 'Engine Repair' },
                    { value: 'tyre', label: 'Tyre Replacement' },
                    { value: 'ac', label: 'AC Service' },
                    { value: 'full_detailing', label: 'Full Detailing' },
                    { value: 'towing', label: 'Towing Service' },
                    { value: 'other', label: 'Other' }
                  ]}
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
                  options={['Toyota', 'Nissan', 'Honda', 'BMW', 'Mercedes-Benz', 'Ford', 'Hyundai', 'Audi']}
                  value={carBrand}
                  onChange={setCarBrand}
                  required
                />
              </div>
              <div className="col-6 col-md-2">
                <div className="qform-label"><span className="material-icons-round">tune</span> Model</div>
                <CustomDropdown
                  name="car_model"
                  placeholder="Model"
                  options={['Camry', 'Corolla', 'Land Cruiser', 'Patrol', 'Altima', 'Civic', 'Accord', '3 Series', '5 Series', 'X5', 'Mustang', 'Elantra', 'A4', 'Other']}
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
                  options={['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman']}
                  value={cityName}
                  onChange={setCityName}
                  required
                />
              </div>
              <div className="col-4 col-md-3">
                <div className="qform-label"><span className="material-icons-round">location_on</span> Area</div>
                <CustomDropdown
                  name="area"
                  placeholder="Area"
                  options={['Al Quoz', 'Deira', 'Bur Dubai', 'Dubai Marina', 'Downtown Dubai', 'Al Barsha', 'Jumeirah', 'Silicon Oasis', 'Business Bay', 'Mirdif']}
                  value={area}
                  onChange={setArea}
                  required
                />
              </div>

              {/* Row 3: Issue, Contact, Time, Submit */}
              <div className="col-md-4">
                <div className="qform-label"><span className="material-icons-round">description</span> Describe Your Issue</div>
                <input type="text" name="problem_title" className="qform-input" placeholder="Describe the issue" required />
              </div>
              <div className="col-md-3">
                <div className="qform-label"><span className="material-icons-round">phone</span> Contact Info</div>
                <input type="tel" name="phone" className="qform-input" placeholder="Enter mobile number" required />
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
                <button type="submit" className="btn-quote-submit" style={{ width: '100%', height: '44px' }}>Get a Quote</button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default GetQuote;
