import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, login } = useAuth(); // getting user from auth context, and login to update user
  const [formData, setFormData] = useState({
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone: user?.phone || '+971 50 123 4567',
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock save profile
    const updatedUser = { ...user, ...formData };
    login(updatedUser, localStorage.getItem('token'));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="container py-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <h3 className="fw-bold mb-4">My Profile</h3>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm text-center p-4" style={{ borderRadius: '16px' }}>
            <div 
              style={{ 
                width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff5c1a,#ff8c42)', 
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', 
                fontWeight: '700', margin: '0 auto 16px' 
              }}
            >
              {formData.firstName[0]}{formData.lastName[0]}
            </div>
            <h5 className="fw-bold mb-1 text-dark">{formData.firstName} {formData.lastName}</h5>
            <p className="text-muted small mb-3">{formData.email}</p>
            <span className="badge bg-light text-dark border py-2 px-3">Customer</span>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold mb-4 text-dark">Personal Information</h5>
            
            {success && (
              <div className="alert alert-success d-flex align-items-center gap-2 py-2" style={{ borderRadius: '10px' }}>
                <span className="material-icons-round" style={{ fontSize: '18px' }}>check_circle</span>
                Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-medium">First Name</label>
                  <input type="text" className="form-control" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Last Name</label>
                  <input type="text" className="form-control" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Email Address</label>
                  <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Phone Number</label>
                  <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
              </div>

              <h5 className="fw-bold mb-3 text-dark mt-4 border-top pt-4">Change Password</h5>
              
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Current Password</label>
                  <input type="password" className="form-control" placeholder="Leave blank to keep current" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">New Password</label>
                  <input type="password" className="form-control" placeholder="New password" />
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary-garro px-4">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
