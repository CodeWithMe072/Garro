import { API_BASE } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// --- Inner payment form (must be inside <Elements>) ---
const PaymentForm = ({ quoteId, breakdown, clientSecret }) => {
  const stripe     = useStripe();
  const elements   = useElements();
  const navigate   = useNavigate();
  const { toast }  = useNotification();

  const [selectedMethod, setSelectedMethod] = useState('card'); // card, wallet, bank
  const [processing, setProcessing]   = useState(false);
  const [cardError, setCardError]     = useState('');
  const [succeeded, setSucceeded]     = useState(false);
  const [showWalletSheet, setShowWalletSheet] = useState(false);
  const [walletType, setWalletType]   = useState('Apple Pay');

  const handleSuccessRedirect = () => {
    setSucceeded(true);
    toast.success('🎉 Payment successful! Redirecting to requests...');

    // Poll backend until invoice is created (webhook may take a few seconds)
    const token    = localStorage.getItem('token');
    let attempts = 0;
    const maxAttempts = 12;

    const poll = async () => {
      attempts++;
      try {
        const res  = await fetch(`${API_BASE}/api/payments/quote/${quoteId}/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.paid) {
          navigate('/my-requests', { state: { justPaid: true, invoiceNumber: data.invoice?.invoiceNumber } });
          return;
        }
      } catch (err) {
        // ignore
      }
      if (attempts < maxAttempts) {
        setTimeout(poll, 2000);
      } else {
        navigate('/my-requests', { state: { justPaid: true } });
      }
    };

    setTimeout(poll, 1500);
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setCardError('');

    // If clientSecret is a mock secret, bypass Stripe elements to allow local testing
    if (clientSecret.startsWith('mock_secret_')) {
      if (!import.meta.env.DEV) {
        setCardError('Bypass payment is disabled in production.');
        setProcessing(false);
        return;
      }
      try {
        const token    = localStorage.getItem('token');

        const res = await fetch(`${API_BASE}/api/payments/bypass-pay`, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quoteId })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          handleSuccessRedirect();
        } else {
          setCardError(data.message || 'Payment processing failed.');
        }
      } catch (err) {
        setCardError('Network error. Failed to process bypass payment.');
      } finally {
        setProcessing(false);
      }
      return;
    }

    // Real Stripe payment confirmation flow
    if (!stripe || !elements) {
      setCardError('Stripe has not initialized yet. Please try again.');
      setProcessing(false);
      return;
    }

    try {
      const cardElement = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement
        }
      });

      if (result.error) {
        setCardError(result.error.message || 'Payment processing failed.');
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          handleSuccessRedirect();
        } else {
          setCardError('Stripe payment processing did not complete successfully.');
        }
      }
    } catch (err) {
      setCardError('Failed to process card payment with Stripe.');
    } finally {
      setProcessing(false);
    }
  };

  // Simulate wallet (Apple/Google Pay) auth & confirm
  const handleWalletPay = (type) => {
    setWalletType(type);
    setShowWalletSheet(true);
  };

  const confirmWalletPayment = async () => {
    if (!import.meta.env.DEV) {
      setCardError('Wallet payment simulation is disabled in production.');
      return;
    }
    setProcessing(true);
    setShowWalletSheet(false);
    
    try {
      const token    = localStorage.getItem('token');

      const res = await fetch(`${API_BASE}/api/payments/bypass-pay`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quoteId })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        handleSuccessRedirect();
      } else {
        setCardError(data.message || 'Payment processing failed.');
      }
    } catch (err) {
      setCardError('Network error. Failed to process bypass payment.');
    } finally {
      setProcessing(false);
    }
  };

  // Simulate Bank Transfer confirmation
  const handleBankConfirm = async () => {
    if (!import.meta.env.DEV) {
      setCardError('Bank transfer simulation is disabled in production.');
      return;
    }
    setProcessing(true);
    
    try {
      const token    = localStorage.getItem('token');

      const res = await fetch(`${API_BASE}/api/payments/bypass-pay`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quoteId })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        handleSuccessRedirect();
      } else {
        setCardError(data.message || 'Payment processing failed.');
      }
    } catch (err) {
      setCardError('Network error. Failed to process bypass payment.');
    } finally {
      setProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: '#1a1a2e',
        fontFamily: 'Poppins, Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '15px',
        '::placeholder': { color: '#94a3b8' }
      },
      invalid: { color: '#ef4444', iconColor: '#ef4444' }
    }
  };

  if (succeeded) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: 36, color: 'white'
        }}>✓</div>
        <h3 style={{ color: '#10b981', marginBottom: 8, fontWeight: 700 }}>Payment Confirmed!</h3>
        <p style={{ color: '#64748b', fontSize: 14 }}>Preparing your tax invoice PDF...</p>
        <div className="spinner-border spinner-border-sm text-success mt-3" role="status" />
      </div>
    );
  }

  return (
    <div>
      {/* Payment Options Selection Tabs */}
      <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 10, display: 'block' }}>
        SELECT PAYMENT METHOD
      </label>
      <div style={{
        display: 'grid',
        gridTemplateColumns: import.meta.env.DEV ? '1fr 1fr 1fr' : '1fr',
        gap: 8,
        marginBottom: 24
      }}>
        {[
          { id: 'card', label: '💳 Card', subtitle: 'Credit/Debit' },
          import.meta.env.DEV && { id: 'wallet', label: '📱 Pay', subtitle: 'Apple/Google' },
          import.meta.env.DEV && { id: 'bank', label: '🏦 Bank', subtitle: 'Transfer' }
        ].filter(Boolean).map(opt => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelectedMethod(opt.id)}
            style={{
              padding: '12px 6px',
              borderRadius: 10,
              border: selectedMethod === opt.id ? '2px solid #185FA5' : '1px solid #e2e8f0',
              background: selectedMethod === opt.id ? '#f0f7ff' : 'white',
              color: '#1a1a2e',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13 }}>{opt.label}</span>
            <span style={{ fontSize: 10, color: '#64748b' }}>{opt.subtitle}</span>
          </button>
        ))}
      </div>

      {/* Card Payment Flow */}
      {selectedMethod === 'card' && (
        <form onSubmit={handleCardSubmit}>
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 16,
            background: '#fafcff'
          }}>
            <CardElement options={cardStyle} />
          </div>

          {cardError && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              color: '#dc2626', fontSize: 13
            }}>
              ⚠️ {cardError}
            </div>
          )}

          <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>
            🧪 Test mode: use card <strong>4242 4242 4242 4242</strong>, any future date, any CVC
          </p>

          <button
            type="submit"
            disabled={!stripe || processing}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: processing ? '#94a3b8' : 'linear-gradient(135deg, #185FA5, #1e7bc2)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 700,
              cursor: processing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            {processing ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" />
                Processing...
              </>
            ) : (
              <>
                🔒 Pay AED {breakdown?.totalAmount?.toFixed(2) || '0.00'}
              </>
            )}
          </button>
        </form>
      )}

      {/* Wallet (Apple/Google Pay) Payment Flow */}
      {selectedMethod === 'wallet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            type="button"
            onClick={() => handleWalletPay('Apple Pay')}
            disabled={processing}
            style={{
              width: '100%',
              padding: '14px',
              background: '#000000',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'opacity 0.2s ease'
            }}
          >
             Pay with Apple Pay
          </button>

          <button
            type="button"
            onClick={() => handleWalletPay('Google Pay')}
            disabled={processing}
            style={{
              width: '100%',
              padding: '14px',
              background: '#f1f3f4',
              color: '#3c4043',
              border: '1px solid #dadce0',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background-color 0.2s ease'
            }}
          >
            <span style={{ fontWeight: 800, color: '#4285F4' }}>G</span>
            <span style={{ fontWeight: 800, color: '#EA4335' }}>o</span>
            <span style={{ fontWeight: 800, color: '#FBBC05' }}>o</span>
            <span style={{ fontWeight: 800, color: '#4285F4' }}>g</span>
            <span style={{ fontWeight: 800, color: '#34A853' }}>l</span>
            <span style={{ fontWeight: 800, color: '#EA4335' }}>e</span> Pay
          </button>

          {processing && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
              <span style={{ fontSize: 13, color: '#64748b' }}>Processing wallet payment...</span>
            </div>
          )}
        </div>
      )}

      {/* Bank Transfer Flow */}
      {selectedMethod === 'bank' && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 20
        }}>
          <h6 style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>🏦 UAE Bank Details</h6>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, color: '#475569', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
              <span>Bank Name</span>
              <strong style={{ color: '#1a1a2e' }}>Emirates NBD</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
              <span>Beneficiary</span>
              <strong style={{ color: '#1a1a2e' }}>Garro Car Services LLC</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
              <span>Account Number</span>
              <strong style={{ color: '#1a1a2e' }}>1012345678901</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>IBAN</span>
              <strong style={{ color: '#1a1a2e' }}>AE03 0220 0001 0123 4567 8901</strong>
            </div>
          </div>

          <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16, lineHeight: 1.5 }}>
            💡 For testing purposes, clicking the button below will immediately simulate and approve the transfer.
          </p>

          <button
            type="button"
            onClick={handleBankConfirm}
            disabled={processing}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: '#185FA5',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            {processing ? 'Processing...' : 'Confirm Bank Transfer'}
          </button>
        </div>
      )}

      {/* Simulated Apple/Google Pay Sheet Popup */}
      {showWalletSheet && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white', width: '100%', maxWidth: 500,
            borderRadius: '20px 20px 0 0', padding: 24, boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
            fontFamily: 'system-ui, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <strong style={{ fontSize: 18 }}>{walletType}</strong>
              <button
                type="button"
                onClick={() => setShowWalletSheet(false)}
                style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                <span style={{ color: '#64748b' }}>Merchant</span>
                <strong>Garro UAE</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                <span style={{ color: '#64748b' }}>Card</span>
                <strong>•••• 4242 (Visa)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: 16 }}>Total Amount</span>
                <strong style={{ fontSize: 24, color: '#185FA5' }}>AED {breakdown?.totalAmount?.toFixed(2)}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={confirmWalletPayment}
              style={{
                width: '100%', padding: '16px', background: '#000', color: '#fff',
                border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              🔐 Double-Click to Pay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Outer page wrapper ---
const PaymentPage = () => {
  const [searchParams]   = useSearchParams();
  const navigate          = useNavigate();
  const { user }          = useAuth();
  const { toast }         = useNotification();

  const quoteId = searchParams.get('quoteId');

  const [loading, setLoading]         = useState(true);
  const [clientSecret, setClientSecret] = useState('');
  const [breakdown, setBreakdown]     = useState(null);
  const [fetchError, setFetchError]   = useState('');

  useEffect(() => {
    if (!quoteId) {
      setFetchError('No quote specified.');
      setLoading(false);
      return;
    }

    const createIntent = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const token    = localStorage.getItem('token');

        const res = await fetch(`${API_BASE}/api/payments/create-intent`, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quoteId })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setFetchError(data.message || 'Failed to create payment session.');
          return;
        }

        setClientSecret(data.clientSecret);
        setBreakdown(data.breakdown);
      } catch (err) {
        setFetchError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, [quoteId]);

  const Row = ({ label, value, big, green }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: big ? '12px 0' : '8px 0',
      borderTop: big ? '2px solid #e2e8f0' : '1px solid #f1f5f9',
      marginTop: big ? 4 : 0
    }}>
      <span style={{ color: big ? '#1a1a2e' : '#64748b', fontSize: big ? 15 : 13, fontWeight: big ? 700 : 400 }}>
        {label}
      </span>
      <span style={{
        color: green ? '#27ae60' : (big ? '#185FA5' : '#1a1a2e'),
        fontWeight: big ? 800 : 600,
        fontSize: big ? 20 : 13
      }}>
        {value}
      </span>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: 48, height: 48 }} role="status" />
          <p style={{ marginTop: 16, color: '#64748b' }}>Setting up secure payment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h3 style={{ color: '#dc2626', marginBottom: 8 }}>Payment Error</h3>
          <p style={{ color: '#64748b', marginBottom: 24 }}>{fetchError}</p>
          <button
            onClick={() => navigate('/my-bookings')}
            style={{
              padding: '10px 24px', background: '#185FA5', color: 'white',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600
            }}
          >
            ← Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%)', padding: '40px 16px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'white', padding: '10px 20px', borderRadius: 30,
            boxShadow: '0 2px 12px rgba(24,95,165,0.1)', marginBottom: 16
          }}>
            <span style={{ fontSize: 18 }}>🔒</span>
            <span style={{ color: '#185FA5', fontWeight: 600, fontSize: 13 }}>Secure Payment — SSL Encrypted</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', margin: '0 0 6px' }}>Complete Your Payment</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>UAE Tax Invoice will be generated automatically upon payment</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* LEFT — Breakdown */}
          <div style={{
            background: 'white', borderRadius: 16,
            padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            <h5 style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: 20, fontSize: 16 }}>
              💰 Payment Breakdown
            </h5>

            {breakdown && (
              <>
                <Row label="Parts & Components" value={`AED ${breakdown.partsCost?.toFixed(2)}`} />
                <Row label="Labour Charges"     value={`AED ${breakdown.laborCost?.toFixed(2)}`} />
                <Row label={`VAT (${breakdown.vatPercent}%)`} value={`AED ${breakdown.vatAmount?.toFixed(2)}`} />
                <Row label="Total Amount Due" value={`AED ${breakdown.totalAmount?.toFixed(2)}`} big green />
              </>
            )}

            {/* UAE Invoice Notice */}
            <div style={{
              background: '#f0f7ff', borderRadius: 10, padding: '14px 16px', marginTop: 20,
              borderLeft: '3px solid #185FA5'
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#185FA5', marginBottom: 6 }}>
                📄 UAE Tax Invoice
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 16px', color: '#475569', fontSize: 12, lineHeight: 1.8 }}>
                <li>Invoice number: <strong>GAR-{new Date().getFullYear()}-XXXXX</strong></li>
                <li>5% VAT included per UAE Federal Law</li>
                <li>Sent to your email + WhatsApp</li>
                <li>Available to download anytime</li>
              </ul>
            </div>

            {/* Accepted Payments */}
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Accepted payment methods:</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['💳 Visa', '💳 Mastercard', '📱 Apple Pay', '🔵 Google Pay'].map(m => (
                  <span key={m} style={{
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#475569'
                  }}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Card Form */}
          <div style={{
            background: 'white', borderRadius: 16,
            padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            <h5 style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: 6, fontSize: 16 }}>
              Enter Card Details
            </h5>
            <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 20 }}>
              Your payment is processed securely by Stripe. We never store your card details.
            </p>

            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  quoteId={quoteId}
                  breakdown={breakdown}
                  clientSecret={clientSecret}
                />
              </Elements>
            )}
          </div>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={() => navigate('/my-bookings')}
            style={{
              background: 'none', border: 'none', color: '#64748b',
              cursor: 'pointer', fontSize: 13, textDecoration: 'underline'
            }}
          >
            ← Return to My Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
