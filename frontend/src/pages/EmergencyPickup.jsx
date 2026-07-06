import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  MapPin, 
  AlertTriangle, 
  Zap, 
  Navigation, 
  CheckCircle2, 
  Phone, 
  ShieldAlert, 
  Wrench,
  Clock,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import CustomDropdown from '../components/CustomDropdown';

const EmergencyPickup = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useNotification();

  const [formData, setFormData] = useState({
    carBrand: '',
    carModel: '',
    carYear: '',
    regNumber: '',
    address: '',
    lat: 25.2048,
    lng: 55.2708,
    issue: 'Towing Required',
    phone: '',
    notes: ''
  });

  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catalogBrands, setCatalogBrands] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch catalog brands for dropdowns
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/vehicles/catalog/brands`);
        const data = await res.json();
        if (res.ok && data.success) {
          setCatalogBrands(data.brands || []);
        }
      } catch (err) {
        console.error('Failed to fetch brands:', err);
      }
    };
    fetchBrands();
  }, []);

  const brandOptions = catalogBrands.map(b => b.name);
  const activeBrand = catalogBrands.find(b => b.name === formData.carBrand);
  const modelOptions = activeBrand ? [...activeBrand.models.map(m => m.name), 'Other'] : ['Other'];

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          address: `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        }));
        setIsLocating(false);
        toast.success('Successfully retrieved your current coordinates.');
      },
      (error) => {
        setIsLocating(false);
        toast.error('Unable to retrieve location. Please type your address manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please sign in to book an emergency pickup.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      // 1. Create/Register Vehicle
      const vehicleRes = await fetch(`${API_BASE}/api/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          make: formData.carBrand || 'Toyota',
          model: formData.carModel || 'Camry',
          year: parseInt(formData.carYear) || 2020,
          registrationNumber: formData.regNumber || `DXB-EM-${Math.floor(Math.random() * 90000 + 10000)}`
        })
      });

      const vehicleData = await vehicleRes.json();
      if (!vehicleRes.ok || !vehicleData.success) {
        throw new Error(vehicleData.message || 'Failed to register vehicle details.');
      }

      const vehicleId = vehicleData.vehicle._id;

      // 2. Submit Request
      const requestRes = await fetch(`${API_BASE}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId,
          serviceType: 'other',
          description: `EMERGENCY PICKUP: ${formData.issue}. ${formData.notes || ''}`.trim(),
          urgency: 'asap',
          location: {
            address: formData.address || 'Stranded UAE Roadway',
            lat: formData.lat,
            lng: formData.lng
          },
          garageId: null
        })
      });

      const requestData = await requestRes.json();
      if (!requestRes.ok || !requestData.success) {
        throw new Error(requestData.message || 'Failed to dispatch emergency request.');
      }

      toast.success('Emergency dispatch request accepted! Redirecting to payment...');
      navigate(`/payment?quoteId=${requestData.quoteId}`);
    } catch (err) {
      toast.error(err.message || 'An error occurred during emergency booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* ══ HERO BANNER ══ */}
      <section style={{ 
        position: 'relative', 
        padding: '60px 0', 
        background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)',
        overflow: 'hidden',
        borderBottom: '1px solid #fed7aa'
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)',
          zIndex: 1
        }}></div>

        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#ef4444', padding: '5px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '20px' }}>
            <ShieldAlert size={14} /> Immediate Emergency Dispatch
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#0f172a', marginBottom: '12px', letterSpacing: '-.02em' }}>
            Stranded? Request a <span style={{ color: '#ef4444' }}>Tow Truck Now.</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '600px', lineHeight: 1.6, margin: 0 }}>
            Submit your location and vehicle specs. The nearest authorized recovery partner will be dispatched to your exact GPS coordinates instantly.
          </p>
        </div>
      </section>

      {/* ══ BOOKING SECTION ══ */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="row g-5">
            {/* Left — Form */}
            <div className="col-lg-7">
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '24px',
                padding: '36px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.02)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>
                  Dispatch Details
                </h3>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Location input with GPS button */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                        Your Current Location
                      </label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                            <MapPin size={16} />
                          </span>
                          <input
                            type="text"
                            required
                            placeholder="Type landmark, highway name or street address"
                            value={formData.address}
                            onChange={(e) => handleFieldChange('address', e.target.value)}
                            style={{
                              width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px',
                              border: '1.5px solid #e2e8f0', fontSize: '13.5px', outline: 'none',
                              color: '#0f172a', fontFamily: "'Poppins', sans-serif"
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleGetCurrentLocation}
                          disabled={isLocating}
                          style={{
                            background: '#f8fafc',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '0 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#334155',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                        >
                          <Navigation size={15} color="#ef4444" className={isLocating ? 'spin-anim' : ''} />
                          {isLocating ? 'Locating...' : 'Get GPS'}
                        </button>
                      </div>
                    </div>

                    {/* Issue Type */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                        Type of Emergency
                      </label>
                      <CustomDropdown
                        placeholder="Select issue type"
                        options={[
                          { value: 'Towing Required', label: 'Towing Service (Breakdown / Accident)' },
                          { value: 'Flat Battery Jump-Start', label: 'Battery Jump Start' },
                          { value: 'Flat Tyre Replacement', label: 'Flat Tyre Help' },
                          { value: 'Out of Fuel Delivery', label: 'Fuel Delivery' },
                          { value: 'Lockout Assistance', label: 'Key / Lockout Support' }
                        ]}
                        value={formData.issue}
                        onChange={(val) => handleFieldChange('issue', val)}
                        required
                      />
                    </div>

                    {/* Vehicle Details */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                        Vehicle Specifications
                      </label>
                      <div className="row g-2">
                        <div className="col-4">
                          <CustomDropdown
                            placeholder="Brand"
                            options={brandOptions}
                            value={formData.carBrand}
                            onChange={(val) => {
                              handleFieldChange('carBrand', val);
                              handleFieldChange('carModel', '');
                            }}
                            required
                          />
                        </div>
                        <div className="col-4">
                          <CustomDropdown
                            placeholder={formData.carBrand ? "Model" : "Select Brand"}
                            options={modelOptions}
                            value={formData.carModel}
                            onChange={(val) => handleFieldChange('carModel', val)}
                            required
                          />
                        </div>
                        <div className="col-4">
                          <CustomDropdown
                            placeholder="Year"
                            options={Array.from({ length: 20 }, (_, i) => String(new Date().getFullYear() - i))}
                            value={formData.carYear}
                            onChange={(val) => handleFieldChange('carYear', val)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Registration Number & Contact */}
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                          Plate Number (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. DXB-A-12345"
                          value={formData.regNumber}
                          onChange={(e) => handleFieldChange('regNumber', e.target.value)}
                          style={{
                            width: '100%', padding: '12px 16px', borderRadius: '12px',
                            border: '1.5px solid #e2e8f0', fontSize: '13.5px', outline: 'none',
                            color: '#0f172a', fontFamily: "'Poppins', sans-serif"
                          }}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+971 50 123 4567"
                          value={formData.phone}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          style={{
                            width: '100%', padding: '12px 16px', borderRadius: '12px',
                            border: '1.5px solid #e2e8f0', fontSize: '13.5px', outline: 'none',
                            color: '#0f172a', fontFamily: "'Poppins', sans-serif"
                          }}
                        />
                      </div>
                    </div>

                    {/* Description Notes */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                        Situation Description (Optional)
                      </label>
                      <textarea
                        rows="3"
                        placeholder="Share any details: engine overheating, stuck in sand, tyre shredded, etc."
                        value={formData.notes}
                        onChange={(e) => handleFieldChange('notes', e.target.value)}
                        style={{
                          width: '100%', padding: '12px 16px', borderRadius: '12px',
                          border: '1.5px solid #e2e8f0', fontSize: '13.5px', outline: 'none',
                          color: '#0f172a', fontFamily: "'Poppins', sans-serif", resize: 'none'
                        }}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        background: 'linear-gradient(135deg, #ef4444, #f87171)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '14px',
                        fontWeight: 700,
                        fontSize: '14.5px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 6px 20px rgba(239, 68, 68, 0.25)',
                        opacity: isSubmitting ? 0.8 : 1,
                        transition: 'all 0.2s',
                        fontFamily: "'Poppins', sans-serif",
                        marginTop: '10px'
                      }}
                    >
                      <Truck size={18} />
                      {isSubmitting ? 'Dispatching Recovery Operator...' : 'Confirm Emergency Dispatch'}
                    </button>

                  </div>
                </form>
              </div>
            </div>

            {/* Right — Info panel */}
            <div className="col-lg-5">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Emergency details card */}
                <div style={{
                  background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                  borderRadius: '24px',
                  padding: '36px',
                  color: '#ffffff',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute', right: '-40px', bottom: '-40px',
                    color: 'rgba(255,255,255,0.03)', pointerEvents: 'none'
                  }}>
                    <Compass size={200} />
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>What Happens Next?</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {[
                      { icon: Clock, title: '1. Instant Verification', desc: 'Our operator reviews details and coordinates are sent to our tow dispatch network.' },
                      { icon: Compass, title: '2. Auto-Routing Driver', desc: 'The closest available flatbed recovery truck accepts the task and navigates to you.' },
                      { icon: MapPin, title: '3. Track Live on App', desc: 'Track your operator live on map till they arrive at your location.' }
                    ].map(({ icon: Icon, title, desc }) => (
                      <div key={title} style={{ display: 'flex', gap: '14px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '10px',
                          background: 'rgba(255,255,255,0.08)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          color: '#f87171', flexShrink: 0
                        }}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#fff' }}>{title}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px', lineHeight: 1.5 }}>{desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hotlines */}
                <div style={{
                  background: '#fff8f8',
                  border: '1.5px solid #fee2e2',
                  borderRadius: '24px',
                  padding: '28px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: '#fee2e2', color: '#ef4444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <Phone size={22} />
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Prefer to call?</h4>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                    Our dispatcher agents are ready to assist you by phone.
                  </p>
                  <a
                    href="tel:8004277"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      background: '#ef4444', color: '#ffffff',
                      borderRadius: '12px', padding: '12px 28px',
                      fontWeight: 700, fontSize: '14px', textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(239,68,68,0.2)',
                      fontFamily: "'Poppins', sans-serif"
                    }}
                  >
                    Call 800 GARRO (800 4277)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default EmergencyPickup;
