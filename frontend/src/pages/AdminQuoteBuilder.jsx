import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const AdminQuoteBuilder = () => {
  const [requests, setRequests] = useState([]);
  const [garages, setGarages] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Quote inputs
  const [selectedGarageId, setSelectedGarageId] = useState('');
  const [partsCost, setPartsCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useNotification();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [reqRes, garRes] = await Promise.all([
        fetch(`${API_BASE}/api/requests`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/garages`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const reqData = await reqRes.json();
      const garData = await garRes.json();

      if (reqData.success) {
        // Filter requests needing quotes
        const filtered = (reqData.requests || []).filter(r => ['quote_pending', 'assigned', 'new'].includes(r.status));
        setRequests(filtered);
      }
      if (garData.success) {
        setGarages(garData.garages || []);
      }
    } catch (err) {
      toast.error('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBuildQuote = async (e) => {
    e.preventDefault();
    if (!selectedReq || !selectedGarageId) {
      toast.error('Please select a request and a partner garage.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: selectedReq._id,
          garageId: selectedGarageId,
          partsCost: parseFloat(partsCost),
          laborCost: parseFloat(laborCost)
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create quote.');
      }

      toast.success('Quote generated and sent to customer successfully!');
      setSelectedReq(null);
      setSelectedGarageId('');
      setPartsCost('');
      setLaborCost('');
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const parts = parseFloat(partsCost) || 0;
  const labor = parseFloat(laborCost) || 0;
  const subtotal = parts + labor;
  const serviceFee = parseFloat((subtotal * 0.10).toFixed(2));
  const vat = parseFloat(((subtotal + serviceFee) * 0.05).toFixed(2));
  const total = parseFloat((subtotal + serviceFee + vat).toFixed(2));

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      color: '#f8fafc',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Navigation */}
        <div style={{ marginBottom: '24px' }}>
          <button onClick={() => navigate('/admin')} style={{
            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline'
          }}>
            ← Return to Admin Dashboard
          </button>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '32px', letterSpacing: '-0.025em' }}>
          🛠️ Admin Quote Builder
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '30px' }}>
          
          {/* Left: Pending Requests */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
              Pending Quote Actions
            </h3>

            {loading ? (
              <p style={{ color: '#64748b' }}>Loading requests...</p>
            ) : requests.length === 0 ? (
              <div style={{ background: '#1e293b', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
                No requests currently require quotes.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {requests.map(r => (
                  <div
                    key={r._id}
                    onClick={() => {
                      setSelectedReq(r);
                      setSelectedGarageId(r.garageId?._id || r.garageId || '');
                    }}
                    style={{
                      background: selectedReq?._id === r._id ? 'rgba(249, 115, 22, 0.08)' : '#1e293b',
                      border: selectedReq?._id === r._id ? '1.5px solid #f97316' : '1.5px solid rgba(255,255,255,0.04)',
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px' }}>
                        #{r._id.slice(-6).toUpperCase()}
                      </span>
                      <span style={{
                        background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', borderRadius: '6px', padding: '2px 6px', fontSize: '10px', fontWeight: '700'
                      }}>
                        {r.status.toUpperCase()}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>
                      {r.vehicleId ? `${r.vehicleId.make} ${r.vehicleId.model}` : 'Unknown Vehicle'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                      <span>Client: {r.userId?.name || 'Customer'}</span>
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Builder Console */}
          <div style={{
            background: '#1e293b',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.04)',
            alignSelf: 'start'
          }}>
            {selectedReq ? (
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px' }}>
                  Generate Quote for Request #{selectedReq._id.slice(-6).toUpperCase()}
                </h3>

                {/* Details grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px' }}>
                  <div>
                    <h5 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px' }}>Vehicle</h5>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                      {selectedReq.vehicleId ? `${selectedReq.vehicleId.make} ${selectedReq.vehicleId.model} (${selectedReq.vehicleId.year})` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h5 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px' }}>Customer</h5>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                      {selectedReq.userId?.name || 'N/A'} ({selectedReq.userId?.phone || 'N/A'})
                    </p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleBuildQuote}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                      Assign Partner Garage
                    </label>
                    <select
                      value={selectedGarageId}
                      onChange={(e) => setSelectedGarageId(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white'
                      }}
                    >
                      <option value="">-- Choose Partner Garage --</option>
                      {garages.map(g => (
                        <option key={g._id} value={g._id}>{g.name} ({g.location?.city || 'UAE'})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                        Estimated Parts Cost (AED)
                      </label>
                      <input
                        type="number"
                        value={partsCost}
                        onChange={(e) => setPartsCost(e.target.value)}
                        required
                        placeholder="0.00"
                        style={{
                          width: '100%', padding: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                        Estimated Labor Cost (AED)
                      </label>
                      <input
                        type="number"
                        value={laborCost}
                        onChange={(e) => setLaborCost(e.target.value)}
                        required
                        placeholder="0.00"
                        style={{
                          width: '100%', padding: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white'
                        }}
                      />
                    </div>
                  </div>

                  {/* Pricing Sheet Preview */}
                  <div style={{ background: '#0f172a', borderRadius: '16px', padding: '24px', marginBottom: '30px' }}>
                    <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '14px' }}>
                      Tax Invoice breakdown preview
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', color: '#cbd5e1' }}>
                      <span>Subtotal Parts + Labor</span>
                      <span>AED {subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', color: '#cbd5e1' }}>
                      <span>Platform Service Fee (10%)</span>
                      <span>AED {serviceFee.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', color: '#cbd5e1', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                      <span>VAT (5%)</span>
                      <span>AED {vat.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontSize: '18px', fontWeight: '800' }}>
                      <span>Total Customer Due</span>
                      <span style={{ color: '#10b981' }}>AED {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.7 : 1
                    }}
                  >
                    {submitting ? 'Generating...' : 'Approve & Send Quote to Customer'}
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '100px 20px', color: '#64748b' }}>
                <span style={{ fontSize: '56px', display: 'block', marginBottom: '16px' }}>👈</span>
                Select a pending quote request from the left panel to configure its billing quote sheet.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminQuoteBuilder;
