import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const services = [
  { name: 'Car Wash & Cleaning', category: 'wash', description: 'Premium exterior and interior cleaning.', base_price: 49, icon: 'local_car_wash' },
  { name: 'Regular Maintenance', category: 'service', description: 'Oil changes, filters, and full health checks.', base_price: 299, icon: 'settings' },
  { name: 'Mechanical Repairs', category: 'repair', description: 'Engine, suspension, and brake repairs.', base_price: 150, icon: 'build' },
  { name: 'Painting & Denting', category: 'painting', description: 'Scratch removal and full body painting.', base_price: 399, icon: 'format_paint' },
  { name: 'A/C Service', category: 'ac', description: 'Gas top-up and cooling system repairs.', base_price: 149, icon: 'ac_unit' },
  { name: 'Tyre Services', category: 'tyre', description: 'Wheel alignment, balancing, and new tyres.', base_price: 99, icon: 'trip_origin' },
  { name: 'Battery Change', category: 'battery', description: 'Battery testing and replacement on-site.', base_price: 250, icon: 'battery_charging_full' },
  { name: 'Car Detailing', category: 'detailing', description: 'Ceramic coating and interior detailing.', base_price: 499, icon: 'auto_awesome' },
];

const Services = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="py-5 bg-light">
      <div className="container">
        <div className="text-center mb-5">
          <span className="section-tag">What We Offer</span>
          <h2 className="fw-bold mt-2">All Car Services</h2>
          <p className="text-muted">Professional services for every need</p>
        </div>
        <div className="row g-4">
          {services.map((service, index) => (
            <div key={index} className="col-md-4 col-lg-3">
              <div className="service-card-full h-100" style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'center', transition: 'all 0.2s ease' }}>
                <div className="service-icon-big" style={{ fontSize: '3rem', marginBottom: '16px', color: '#ff5c1a' }}>
                  <span className="material-icons-round" style={{ fontSize: '3rem' }}>{service.icon}</span>
                </div>
                <h6 className="fw-bold mt-3">{service.name}</h6>
                <p className="text-muted small">{service.description}</p>
                <div className="fw-semibold mt-2" style={{ color: '#ff6b35' }}>From AED {service.base_price}</div>
                <Link to={`/service/${service.category}`} className="btn btn-outline-primary btn-sm mt-3 w-100">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
