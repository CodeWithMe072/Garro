import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const CreateStaff = () => {
  const navigate = useNavigate();
  const { toast } = useNotification();
  const [role, setRole] = useState('staff');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    password: '',
    confirmPassword: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone || '+971501111111',
          password: formData.password,
          role: role === 'staff' ? 'helper' : 'manager'
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create staff account.');
      }

      toast.success('Staff account created successfully!');
      navigate('/admin/manage-staff');
    } catch (err) {
      toast.error(err.message || 'Error creating staff account.');
    }
  };

  return (
    <div className="page-wrap">
      <div className="card">
        <div className="card-head">
          <Link to="/admin/manage-staff" className="back">
            <span className="material-icons-round" style={{ fontSize: '16px' }}>arrow_back</span> 
            Back to Staff Management
          </Link>
          <h1>👔 Create Staff Account</h1>
          <p>Create a new staff member account with immediate access.</p>
        </div>

        <div className="card-body">
          <div className="info-box">
            <span className="material-icons-round">info</span>
            <div>The staff member will be able to log in immediately with the password you set. You can also <Link to="/admin/manage-staff" style={{ color: '#1d4ed8', fontWeight: '600' }}>send an invite link</Link> instead so they set their own password.</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="section-title">Personal Information</div>
            <div className="form-row">
              <div className="fg">
                <label>First Name *</label>
                <input type="text" className="inp" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="fg">
                <label>Last Name *</label>
                <input type="text" className="inp" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="fg">
              <label>Email Address *</label>
              <div className="inp-wrap">
                <span className="material-icons-round">email</span>
                <input type="email" className="inp" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="hint">This will be their login username.</div>
            </div>

            <div className="form-row">
              <div className="fg">
                <label>Phone</label>
                <div className="inp-wrap">
                  <span className="material-icons-round">phone</span>
                  <input type="text" className="inp" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
              </div>
              <div className="fg">
                <label>Employee ID</label>
                <div className="inp-wrap">
                  <span className="material-icons-round">badge</span>
                  <input type="text" className="inp" name="employeeId" value={formData.employeeId} onChange={handleChange} />
                </div>
                <div className="hint">Optional, e.g. EMP-001</div>
              </div>
            </div>

            <div className="fg">
              <label>Department</label>
              <div className="inp-wrap">
                <span className="material-icons-round">business</span>
                <input type="text" className="inp" name="department" value={formData.department} onChange={handleChange} />
              </div>
            </div>

            <div className="section-title">Role</div>
            <div className="role-cards">
              <label className={`role-card ${role === 'staff' ? 'selected' : ''}`}>
                <input type="radio" name="role" value="staff" checked={role === 'staff'} onChange={() => setRole('staff')} />
                <div className="rc-check"><span className="material-icons-round" style={{ color: 'white', fontSize: '14px' }}>check</span></div>
                <div className="rc-icon">👤</div>
                <div className="rc-name">Staff</div>
                <div className="rc-desc">Can manage assigned bookings, update statuses, view their schedule.</div>
              </label>
              <label className={`role-card ${role === 'manager' ? 'selected' : ''}`}>
                <input type="radio" name="role" value="manager" checked={role === 'manager'} onChange={() => setRole('manager')} />
                <div className="rc-check"><span className="material-icons-round" style={{ color: 'white', fontSize: '14px' }}>check</span></div>
                <div className="rc-icon">🌟</div>
                <div className="rc-name">Manager</div>
                <div className="rc-desc">Full access — can view all bookings, create staff, and access analytics.</div>
              </label>
            </div>

            <div className="section-title">Set Password</div>
            <div className="form-row">
              <div className="fg">
                <label>Temporary Password *</label>
                <div className="inp-wrap">
                  <span className="material-icons-round">lock</span>
                  <input type="password" className="inp" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
                </div>
              </div>
              <div className="fg">
                <label>Confirm Password *</label>
                <div className="inp-wrap">
                  <span className="material-icons-round">lock</span>
                  <input type="password" className="inp" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength="6" />
                </div>
              </div>
            </div>

            <div className="fg">
              <label>Internal Notes</label>
              <textarea className="inp" name="notes" rows="3" value={formData.notes} onChange={handleChange}></textarea>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <Link to="/admin/manage-staff" className="btn-secondary">Cancel</Link>
              <button type="submit" className="btn-submit">✅ Create Staff Account</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStaff;
