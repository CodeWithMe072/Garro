import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { LuCircleCheck, LuX } from 'react-icons/lu';

const BookGarage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useNotification();

  const [garage, setGarage] = useState(null);
  const [loading, setLoading] = useState(true);

  const serviceDetailsMap = {
    minor_service: { id: 'minor_service', service: { name: 'Minor Service', get_category_display: 'Maintenance' }, duration_hours: 2, price: 299 },
    major_service: { id: 'major_service', service: { name: 'Major Service', get_category_display: 'Maintenance' }, duration_hours: 4, price: 599 },
    ac_repair: { id: 'ac_repair', service: { name: 'AC Gas Topup & Repair', get_category_display: 'A/C' }, duration_hours: 1, price: 149 },
    brake_repair: { id: 'brake_repair', service: { name: 'Brake Pad Replacement', get_category_display: 'Repair' }, duration_hours: 2, price: 199 },
    electrical: { id: 'electrical', service: { name: 'Electrical Diagnostics & Repair', get_category_display: 'Electrical' }, duration_hours: 3, price: 249 },
    diagnostics: { id: 'diagnostics', service: { name: 'Engine Diagnostics', get_category_display: 'Diagnostics' }, duration_hours: 1, price: 99 },
    battery: { id: 'battery', service: { name: 'Battery Diagnostics & Change', get_category_display: 'Battery' }, duration_hours: 0.5, price: 349 },
    other: { id: 'other', service: { name: 'General Mechanical Repair', get_category_display: 'Repair' }, duration_hours: 3, price: 399 }
  };

  const carBrands = [
    { id: 1, name: 'Toyota', models: [{ id: 1, name: 'Camry' }, { id: 2, name: 'Corolla' }] },
    { id: 2, name: 'Nissan', models: [{ id: 3, name: 'Altima' }, { id: 4, name: 'Patrol' }] },
    { id: 3, name: 'BMW', models: [{ id: 5, name: '3 Series' }, { id: 6, name: 'X5' }] },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  const [selectedServices, setSelectedServices] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [pickupType, setPickupType] = useState('self_drop');
  const [promoCode, setPromoCode] = useState('');
  const [promoMsg, setPromoMsg] = useState({ text: '', type: '' });

  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [regNo, setRegNo] = useState('');
  const [prefDate, setPrefDate] = useState('');
  const [prefTime, setPrefTime] = useState('09:00');
  const [pickupAddress, setPickupAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [availableModels, setAvailableModels] = useState([]);

  useEffect(() => {
    const fetchGarage = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/garages/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setGarage(data.garage);
        }
      } catch (err) {
        console.error('Failed to fetch garage:', err);
      } finally {
        setLoading(false);
      }
    };
    window.scrollTo(0, 0);
    fetchGarage();
  }, [id]);

  const garageServices = garage && garage.services
    ? garage.services.map(s => serviceDetailsMap[s] || { id: s, service: { name: s, get_category_display: 'Service' }, duration_hours: 2, price: 299 })
    : [];

  const handleServiceChange = (e, gs) => {
    if (e.target.checked) {
      setSelectedServices([...selectedServices, gs]);
      setSubtotal(subtotal + gs.price);
    } else {
      setSelectedServices(selectedServices.filter(s => s.id !== gs.id));
      setSubtotal(subtotal - gs.price);
    }
  };

  const handleBrandChange = (e) => {
    const brandId = e.target.value;
    setSelectedBrand(brandId);
    setSelectedModel('');
    if (brandId) {
      const brand = carBrands.find(b => b.id === parseInt(brandId));
      setAvailableModels(brand ? brand.models : []);
    } else {
      setAvailableModels([]);
    }
  };

  const applyPromo = () => {
    if (!promoCode) return;
    if (promoCode.toUpperCase() === 'GARRO20') {
      const disc = subtotal * 0.2;
      setDiscount(disc);
      setPromoMsg({ text: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LuCircleCheck /> Promo applied! 20% off</span>, type: 'text-success' });
    } else {
      setDiscount(0);
      setPromoMsg({ text: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LuX /> Invalid promo code</span>, type: 'text-danger' });
    }
  };

  const total = Math.max(0, subtotal - discount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service.");
      return;
    }

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      // 1. Get Brand and Model names
      const brandObj = carBrands.find(b => b.id === parseInt(selectedBrand));
      const modelObj = availableModels.find(m => m.id === parseInt(selectedModel));
      const brandName = brandObj ? brandObj.name : 'Unknown';
      const modelName = modelObj ? modelObj.name : 'Unknown';

      // 2. Add vehicle
      const vehicleRes = await fetch(`${API_BASE}/api/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          make: brandName,
          model: modelName,
          year: parseInt(selectedYear),
          registrationNumber: regNo || `DXB-${Math.floor(Math.random() * 90000 + 10000)}`
        })
      });
      const vehicleData = await vehicleRes.json();
      if (!vehicleRes.ok || !vehicleData.success) {
        throw new Error(vehicleData.message || 'Failed to register vehicle.');
      }

      const vehicleId = vehicleData.vehicle._id;

      // 3. Create booking request
      const preferredDateObj = prefDate ? new Date(`${prefDate}T${prefTime}:00`) : new Date();
      const serviceTypeCode = selectedServices[0].id; // e.g. minor_service

      const requestRes = await fetch(`${API_BASE}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId,
          serviceType: serviceTypeCode,
          subCategory: selectedServices[0]?.service?.name || serviceTypeCode,
          description: instructions || `Requesting ${selectedServices.map(s => s.service.name).join(', ')}`,
          preferredDate: preferredDateObj,
          location: {
            address: pickupType === 'pickup_drop' ? pickupAddress : 'Self Drop at Garage',
            lat: 25.2048,
            lng: 55.2708
          },
          garageId: id
        })
      });

      const requestData = await requestRes.json();
      if (!requestRes.ok || !requestData.success) {
        throw new Error(requestData.message || 'Failed to submit booking request.');
      }

      navigate(`/booking/confirm/${requestData.request._id}`);
    } catch (err) {
      toast.error(err.message || 'An error occurred during booking.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="mt-3">Loading booking page...</h5>
      </div>
    );
  }

  if (!garage) {
    return (
      <div className="container py-5 text-center">
        <h4>Garage not found</h4>
        <Link to="/search" className="btn btn-primary-garro mt-3">Back to Search</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          {/* Steps indicator */}
          <div className="booking-steps mb-5">
            <div className="step active"><span>1</span> Car Details</div>
            <div className="step-line"></div>
            <div className="step active"><span>2</span> Services</div>
            <div className="step-line"></div>
            <div className="step active"><span>3</span> Confirm</div>
          </div>

          <div className="row g-4">
            {/* Booking Form */}
            <div className="col-lg-8">
              <form onSubmit={handleSubmit}>
                
                {/* Car Details */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white border-0 py-3 px-4">
                    <h5 className="fw-bold mb-0">🚗 Your Car Details</h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      <div className="col-md-5">
                        <label className="form-label small fw-medium">Car Brand *</label>
                        <select className="form-select" value={selectedBrand} onChange={handleBrandChange} required>
                          <option value="">Select Brand</option>
                          {carBrands.map(brand => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-5">
                        <label className="form-label small fw-medium">Car Model *</label>
                        <select className="form-select" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} required>
                          <option value="">Select Model</option>
                          {availableModels.map(model => (
                            <option key={model.id} value={model.id}>{model.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small fw-medium">Year *</label>
                        <select className="form-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} required>
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-12">
                        <label className="form-label small fw-medium">Registration Plate Number *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. DXB-12345" 
                          value={regNo} 
                          onChange={(e) => setRegNo(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white border-0 py-3 px-4">
                    <h5 className="fw-bold mb-0">🔧 Select Services</h5>
                    <p className="text-muted small mb-0">Choose one or more services</p>
                  </div>
                  <div className="card-body p-0">
                    {garageServices.length > 0 ? garageServices.map(gs => (
                      <label key={gs.id} className="service-select-item" htmlFor={`svc${gs.id}`}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-3">
                            <input 
                              className="form-check-input service-checkbox" 
                              type="checkbox" 
                              id={`svc${gs.id}`} 
                              onChange={(e) => handleServiceChange(e, gs)}
                            />
                            <div>
                              <div className="fw-medium">{gs.service.name}</div>
                              <div className="text-muted small">{gs.service.get_category_display} · {gs.duration_hours}h</div>
                            </div>
                          </div>
                          <span className="fw-bold" style={{ color: '#ff6b35' }}>AED {gs.price}</span>
                        </div>
                      </label>
                    )) : (
                      <div className="p-4 text-muted text-center">No specific services listed. Contact garage for pricing.</div>
                    )}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white border-0 py-3 px-4">
                    <h5 className="fw-bold mb-0">📅 Date &amp; Time</h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-medium">Preferred Date *</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          value={prefDate} 
                          onChange={(e) => setPrefDate(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-medium">Preferred Time *</label>
                        <select className="form-select" value={prefTime} onChange={(e) => setPrefTime(e.target.value)} required>
                          <option value="08:00">8:00 AM</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="16:00">4:00 PM</option>
                          <option value="17:00">5:00 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pickup Option */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white border-0 py-3 px-4">
                    <h5 className="fw-bold mb-0">🚗 Pickup Option</h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="pickup-option-card" htmlFor="selfDrop">
                          <input 
                            type="radio" 
                            name="pickup_type" 
                            id="selfDrop" 
                            checked={pickupType === 'self_drop'} 
                            onChange={() => setPickupType('self_drop')} 
                          />
                          <div className="pickup-icon">🏃</div>
                          <div className="fw-medium">Self Drop</div>
                          <div className="text-muted small">Drop your car at the garage</div>
                        </label>
                      </div>
                      <div className="col-md-6">
                        <label className="pickup-option-card" htmlFor="pickupDrop">
                          <input 
                            type="radio" 
                            name="pickup_type" 
                            id="pickupDrop" 
                            checked={pickupType === 'pickup_drop'} 
                            onChange={() => setPickupType('pickup_drop')} 
                          />
                          <div className="pickup-icon">🚐</div>
                          <div className="fw-medium">Free Pickup &amp; Drop <span className="badge bg-success ms-1 py-1">FREE</span></div>
                          <div className="text-muted small">We come to you</div>
                        </label>
                      </div>
                    </div>
                    {pickupType === 'pickup_drop' && (
                      <div className="mt-3">
                        <label className="form-label small fw-medium">Pickup Address *</label>
                        <textarea 
                          className="form-control" 
                          rows="2" 
                          placeholder="Enter your full address for pickup" 
                          value={pickupAddress} 
                          onChange={(e) => setPickupAddress(e.target.value)} 
                          required
                        ></textarea>
                      </div>
                    )}
                  </div>
                </div>

                {/* Promo & Notes */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white border-0 py-3 px-4">
                    <h5 className="fw-bold mb-0">💬 Notes &amp; Promo</h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-medium">Special Instructions (optional)</label>
                      <textarea 
                        className="form-control" 
                        rows="2" 
                        placeholder="Any specific issues or requests for the mechanic..." 
                        value={instructions} 
                        onChange={(e) => setInstructions(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="d-flex gap-2">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Enter promo code" 
                        value={promoCode} 
                        onChange={(e) => setPromoCode(e.target.value)} 
                      />
                      <button type="button" className="btn btn-outline-success px-4" onClick={applyPromo}>Apply</button>
                    </div>
                    {promoMsg.text && (
                      <div className={`mt-2 small ${promoMsg.type}`}>{promoMsg.text}</div>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary-garro w-100 py-3 fw-semibold fs-5">
                  Confirm Booking →
                </button>
              </form>
            </div>

            {/* Summary Sidebar */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm sticky-top" style={{ top: '80px' }}>
                <div className="card-header border-0 py-3 px-4" style={{ background: '#f8f9fa', borderRadius: '12px 12px 0 0' }}>
                  <h6 className="fw-bold mb-0">Booking Summary</h6>
                </div>
                <div className="card-body p-4">
                  <div className="mb-3">
                    <div className="fw-semibold">{garage.name}</div>
                    <div className="text-muted small">{garage.areas ? garage.areas.join(', ') : 'Dubai'}</div>
                  </div>
                  <hr />
                  <div className="mb-3">
                    {selectedServices.length > 0 ? selectedServices.map(s => (
                      <div key={s.id} className="d-flex justify-content-between small mb-1">
                        <span>{s.service.name}</span>
                        <span>AED {s.price}</span>
                      </div>
                    )) : (
                      <p className="text-muted small mb-0">No services selected</p>
                    )}
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Subtotal</span>
                    <span className="fw-semibold">AED {subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-success small">Discount</span>
                      <span className="text-success fw-semibold">-AED {discount}</span>
                    </div>
                  )}
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">Total</span>
                    <span className="fw-bold fs-5" style={{ color: '#ff6b35' }}>AED {total}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BookGarage;
