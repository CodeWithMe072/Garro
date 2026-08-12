import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE } from '../config/api';
import { LuShieldCheck, LuUser, LuWrench, LuCar, LuTriangleAlert, LuCheck, LuX } from 'react-icons/lu';

const DelegateJobView = () => {
  const { accessCode } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actingRevisionId, setActingRevisionId] = useState(null);

  // Issue 3 — Confirmation Dialog State
  const [confirmModal, setConfirmModal] = useState(null); // { revisionId, action, amount, justification }

  useEffect(() => {
    fetchDelegateView();
  }, [accessCode]);

  const fetchDelegateView = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs/delegate-view/${accessCode}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Delegate link is invalid or expired.');
      }
      setJob(data.job);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Issue 3 — Executing Response after explicit confirmation
  const handleDelegateRespondConfirmed = async () => {
    if (!confirmModal) return;
    const { revisionId, action } = confirmModal;
    setActingRevisionId(revisionId);
    setConfirmModal(null);
    try {
      const res = await fetch(`${API_BASE}/api/jobs/delegate-view/${accessCode}/scope-revision/${revisionId}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to ${action} scope revision.`);
      }
      alert(`Scope revision ${action} successfully by delegate.`);
      fetchDelegateView();
    } catch (err) {
      alert(err.message);
    } finally {
      setActingRevisionId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#64748b' }}>Loading delegate portal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1.5px solid #fecdd3', maxWidth: '480px', textAlign: 'center' }}>
          <span style={{ fontSize: '40px' }}>⚠️</span>
          <h3 style={{ color: '#be123c', marginTop: '12px' }}>Access Unavailable</h3>
          <p style={{ color: '#475569', fontSize: '14px' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px', fontFamily: 'sans-serif', color: '#0f172a' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Delegate Header Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', padding: '24px 28px', borderRadius: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <LuShieldCheck style={{ color: '#38bdf8', fontSize: '24px' }} />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Delegate Mode Portal</h2>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            Assigned to <strong>{job.delegate?.name || 'Backup Contact'}</strong>. Authorized to review logistics and adjudicate pending scope changes. Valid until {new Date(job.delegate?.expiresAt).toLocaleDateString()}.
          </p>
        </div>

        {/* Job Overview Card */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Job Reference</span>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#ff5c1a' }}>#{job.jobId.slice(-6).toUpperCase()}</h3>
            </div>
            <span style={{
              background: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase'
            }}>
              Status: {job.status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Vehicle Info */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#334155', fontWeight: '700' }}>
              <LuCar /> <span>Vehicle Details</span>
            </div>
            <div style={{ fontSize: '14px', color: '#475569' }}>
              <strong>{job.vehicle?.make} {job.vehicle?.model} ({job.vehicle?.year})</strong>
              {job.vehicle?.registrationNumber && <span> — Plate: {job.vehicle.registrationNumber}</span>}
            </div>
          </div>

          {/* Contacts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                <LuUser /> Customer Contact
              </div>
              <div style={{ fontSize: '15px', fontWeight: '700' }}>{job.customer?.name}</div>
              <div style={{ fontSize: '14px', color: '#0284c7', marginTop: '4px' }}>📞 {job.customer?.phone}</div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                <LuWrench /> Assigned Garage
              </div>
              <div style={{ fontSize: '15px', fontWeight: '700' }}>{job.garage?.name}</div>
              <div style={{ fontSize: '14px', color: '#0284c7', marginTop: '4px' }}>📞 {job.garage?.phone}</div>
            </div>
          </div>
        </div>

        {/* Edge Case Flags Section */}
        {job.edgeCaseFlags && job.edgeCaseFlags.length > 0 && (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1.5px solid #fecdd3', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#be123c', fontWeight: '800', fontSize: '16px', marginBottom: '14px' }}>
              <LuTriangleAlert /> Active Edge-Case Flags
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {job.edgeCaseFlags.map((flag, idx) => (
                <div key={idx} style={{ background: '#fff1f2', padding: '12px 16px', borderRadius: '10px', color: '#9f1239', fontSize: '13px' }}>
                  <strong>{flag.type.replace(/_/g, ' ').toUpperCase()}:</strong> {flag.details || 'Flagged on job workflow'}
                  <div style={{ fontSize: '11px', color: '#e11d48', marginTop: '2px' }}>
                    Flagged on: {new Date(flag.flaggedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Direct Contact Flag */}
        {job.directContactFlag && (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1.5px solid #f59e0b', marginBottom: '20px' }}>
            <div style={{ color: '#92400e', fontWeight: '800', fontSize: '15px', marginBottom: '4px' }}>
              ⚠️ Direct Garage Contact Flagged
            </div>
            <p style={{ margin: 0, color: '#b45309', fontSize: '13px' }}>
              Customer bypassed Garro platform and contacted garage directly. Notes: "{job.directContactNotes || 'No notes provided'}"
            </p>
          </div>
        )}

        {/* Scope Revisions Adjudication Section (Fix 6) */}
        {job.scopeRevisions && job.scopeRevisions.length > 0 && (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800' }}>Scope Revisions Adjudication</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {job.scopeRevisions.map((rev) => (
                <div key={rev._id} style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#0f172a' }}>Scope Addition (+AED {rev.additionalAmount})</strong>
                      {rev.percentageIncrease > 0 && (
                        <span style={{ marginLeft: '10px', fontSize: '12px', background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                          +{rev.percentageIncrease}% increase
                        </span>
                      )}
                    </div>
                    <span style={{
                      fontWeight: '800',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: rev.status === 'approved' ? '#d1fae5' : (rev.status === 'rejected' ? '#ffe4e6' : '#fef3c7'),
                      color: rev.status === 'approved' ? '#065f46' : (rev.status === 'rejected' ? '#9f1239' : '#92400e')
                    }}>
                      {rev.status}
                    </span>
                  </div>

                  <div style={{ color: '#475569', marginBottom: '12px' }}>
                    <strong>Justification:</strong> {rev.justification}
                  </div>

                  {rev.photos && rev.photos.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                      {rev.photos.map((photo, pIdx) => (
                        <a key={pIdx} href={photo} target="_blank" rel="noreferrer">
                          <img src={photo} alt="Inspection" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Fix 6 & Issue 3 — Delegate Action Buttons trigger confirmation modal */}
                  {rev.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
                      <button
                        onClick={() => setConfirmModal({
                          revisionId: rev._id,
                          action: 'approved',
                          amount: rev.additionalAmount,
                          justification: rev.justification
                        })}
                        disabled={actingRevisionId === rev._id}
                        style={{
                          background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                      >
                        <LuCheck /> Approve Scope Addition
                      </button>
                      <button
                        onClick={() => setConfirmModal({
                          revisionId: rev._id,
                          action: 'rejected',
                          amount: rev.additionalAmount,
                          justification: rev.justification
                        })}
                        disabled={actingRevisionId === rev._id}
                        style={{
                          background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                      >
                        <LuX /> Reject Scope Addition
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issue 3 — Confirmation Modal Dialog */}
        {confirmModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px'
          }}>
            <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', maxWidth: '440px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: '800', color: confirmModal.action === 'approved' ? '#065f46' : '#9f1239' }}>
                Confirm {confirmModal.action === 'approved' ? 'Scope Approval' : 'Scope Rejection'}
              </h3>
              
              <p style={{ color: '#334155', fontSize: '14px', lineHeight: '1.5', margin: '0 0 16px' }}>
                Are you sure you want to <strong>{confirmModal.action}</strong> the additional work of <strong>AED {confirmModal.amount}</strong> on behalf of the founder?
              </p>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', fontSize: '12.5px', color: '#64748b', marginBottom: '20px' }}>
                <strong>Justification:</strong> "{confirmModal.justification}"
                <div style={{ marginTop: '6px', color: '#be123c', fontWeight: '600' }}>
                  ⚠️ This action will update job costs, unblock workflow, and notify the founder.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setConfirmModal(null)}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelegateRespondConfirmed}
                  style={{
                    background: confirmModal.action === 'approved' ? '#10b981' : '#ef4444',
                    color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  Confirm {confirmModal.action === 'approved' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DelegateJobView;
