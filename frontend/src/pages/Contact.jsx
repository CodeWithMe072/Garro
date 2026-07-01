import React, { useState } from 'react';

const Contact = () => {
  const [messages, setMessages] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessages(['Thank you for your message. We will get back to you soon.']);
    e.target.reset();
  };

  return (
    <section className="py-5 bg-light">
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-5">
            <span className="section-tag">Get In Touch</span>
            <h2 className="fw-bold mt-2 mb-3">Contact Us</h2>
            <p className="text-muted">Have a question or need help? We're here for you 6 days a week.</p>
            <div className="mt-4">
              <div className="d-flex gap-3 mb-4">
                <div className="contact-icon">📞</div>
                <div>
                  <div className="fw-semibold">Phone</div>
                  <div className="text-muted">+971-800-GARRO</div>
                  <div className="text-muted small">Mon–Sat, 9AM–6PM</div>
                </div>
              </div>
              <div className="d-flex gap-3 mb-4">
                <div className="contact-icon">✉️</div>
                <div>
                  <div className="fw-semibold">Email</div>
                  <div className="text-muted">hello@garro.com</div>
                </div>
              </div>
              <div className="d-flex gap-3">
                <div className="contact-icon">📍</div>
                <div>
                  <div className="fw-semibold">Location</div>
                  <div className="text-muted">Dubai, United Arab Emirates</div>
                  <div className="text-muted small">Also serving Kerala, India</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                <h5 className="fw-bold mb-4">Send us a Message</h5>
                
                {messages.map((message, index) => (
                  <div key={index} className="alert alert-success py-2">{message}</div>
                ))}
                
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small fw-medium">First Name *</label>
                      <input type="text" className="form-control" required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-medium">Last Name *</label>
                      <input type="text" className="form-control" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Email *</label>
                      <input type="email" className="form-control" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Phone</label>
                      <input type="tel" className="form-control" />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-medium">Message *</label>
                      <textarea className="form-control" rows="4" required></textarea>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary-garro w-100 py-2 mt-4 fw-semibold">Send Message</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
