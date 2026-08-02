import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LuGlobe, LuChevronDown, LuCheck } from 'react-icons/lu';


const localT = {
  en: {
    verify_account: "Verify Your Account",
    verify_desc: "Enter the 6-digit OTP to activate your Garro account",
    demo_mode: "Demo Mode — Your OTP is:",
    click_autofill: "Click to auto-fill ↓",
    verifying: "Verifying...",
    verify_continue: "Verify & Continue",
    didnt_receive: "Didn't receive it? ",
    resend_otp: "Resend OTP",
    back_to_signup: "Back to Sign Up",
    resend_success: "A new OTP verification code has been sent.",
    resend_failed: "Failed to resend verification email."
  },
  ar: {
    verify_account: "تحقق من حسابك",
    verify_desc: "أدخل رمز التحقق المكون من 6 أرقام لتنشيط حسابك في غارو",
    demo_mode: "وضع التجريب - رمز التحقق الخاص بك هو:",
    click_autofill: "انقر للتعبئة التلقائية ↓",
    verifying: "جاري التحقق...",
    verify_continue: "التحقق والمتابعة",
    didnt_receive: "لم تستلم الرمز؟ ",
    resend_otp: "إعادة إرسال الرمز",
    back_to_signup: "العودة لإنشاء الحساب",
    resend_success: "تم إرسال رمز تحقق جديد.",
    resend_failed: "فشل إعادة إرسال البريد الإلكتروني للتحقق."
  },
  ur: {
    verify_account: "اپنا اکاؤنٹ تصدیق کریں",
    verify_desc: "اپنا گارو اکاؤنٹ فعال کرنے کے لیے 6 ہندسوں کا OTP درج کریں",
    demo_mode: "ڈیمو موڈ - آپ کا OTP ہے:",
    click_autofill: "خودکار فل کرنے کے لیے کلک کریں ↓",
    verifying: "تصدیق ہو رہی ہے...",
    verify_continue: "تصدیق کریں اور جاری رکھیں",
    didnt_receive: "موصول نہیں ہوا؟ ",
    resend_otp: "دوبارہ OTP بھیجیں",
    back_to_signup: "سائن اپ پر واپس جائیں",
    resend_success: "ایک نیا OTP تصدیقی کوڈ بھیجا گیا ہے۔",
    resend_failed: "تصدیقی ای میل دوبارہ بھیجنے میں ناکامی۔"
  }
};

const VerifyOtp = () => {
  const { lang, changeLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const lt = (key) => localT[lang]?.[key] || localT['en']?.[key] || key;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const { toast } = useNotification();
  const { login } = useAuth();
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || localStorage.getItem('lastRegisteredEmail') || 'customer@test.com';
  const [demoCode, setDemoCode] = useState(location.state?.demoCode || '');

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index, e) => {
    const value = e.target.value.replace(/\D/g, ''); // only digits
    if (!value && e.nativeEvent.inputType !== 'deleteContentBackward') return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError('');

    // Focus next
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste) {
      const newOtp = [...otp];
      paste.split('').forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      if (paste.length === 6) {
        inputRefs.current[5].focus();
      } else {
        inputRefs.current[paste.length].focus();
      }
    }
  };

  const handleAutoFill = () => {
    if (demoCode) {
      const newOtp = demoCode.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResend = async () => {
    setCountdown(60);
    setError('');
    setOtp(['', '', '', '', '', '']);
    if (!email) return;

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success && data.demoCode) {
        setDemoCode(data.demoCode);
      }
      toast.info(lt('resend_success'));
    } catch (err) {
      setError(lt('resend_failed'));
      toast.error(lt('resend_failed'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) return;

    setLoading(true);
    setError('');

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code: otpValue })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'OTP verification failed.');
      }

      // Parse name into firstName and lastName
      const [firstName, ...rest] = (data.user.name || '').split(' ');
      const lastName = rest.join(' ') || '';

      // Map backend role to frontend routing role permissions
      let role = data.user.role;
      if (role === 'admin') role = 'superadmin';
      if (role === 'helper') role = 'staff';

      const userData = {
        id: data.user.id,
        email: data.user.email,
        firstName,
        lastName,
        role
      };

      login(userData, data.token);
      toast.success(`Account verified! Welcome to Garro, ${userData.firstName}!`);

      if (role === 'superadmin' || role === 'manager') {
        navigate('/admin');
      } else if (role === 'staff') {
        navigate('/admin/staff');
      } else {
        navigate('/home', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP code. Please try again.');
      setLoading(false);
    }
  };

  const isComplete = otp.join('').length === 6;

  return (
    <div className="verify-body">
      {/* Floating Language Switcher */}
      <div style={{ position: 'absolute', top: '24px', insetInlineEnd: '24px', zIndex: 1000 }}>
        <style>{`
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-5px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>
        <button
          type="button"
          onClick={() => setIsLangOpen(!isLangOpen)}
          style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '24px',
            padding: '7px 14px',
            color: '#334155',
            fontSize: '12.5px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#ff5c1a';
            e.currentTarget.style.color = '#ff5c1a';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 92, 26, 0.08)';
          }}
          onMouseLeave={(e) => {
            if (!isLangOpen) {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#334155';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.04)';
            }
          }}
        >
          <LuGlobe size={14} />
          <span style={{ letterSpacing: '0.05em' }}>{lang.toUpperCase()}</span>
          <LuChevronDown size={12} style={{ transform: isLangOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
        </button>
        {isLangOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            insetInlineEnd: 0,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.1)',
            zIndex: 1000,
            minWidth: '130px',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            transformOrigin: 'top right',
            animation: 'fadeInScale 0.15s ease-out'
          }}>
            {[{ code: 'en', label: 'English' }, { code: 'ar', label: 'العربية' }, { code: 'ur', label: 'اردو' }].map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => { changeLanguage(code); setIsLangOpen(false); }}
                style={{
                  background: lang === code ? '#fff4ef' : 'none',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  color: lang === code ? '#ff5c1a' : '#334155',
                  fontSize: '13px',
                  fontWeight: lang === code ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  transition: 'all 0.15s ease',
                  textAlign: 'start'
                }}
                onMouseEnter={(e) => {
                  if (lang !== code) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = '#0f172a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (lang !== code) {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = '#334155';
                  }
                }}
              >
                <span>{label}</span>
                {lang === code && <LuCheck size={14} color="#ff5c1a" style={{ strokeWidth: '3px' }} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="verify-card" style={{ padding: '32px 36px' }}>
        {/* Logo */}
        <Link to="/" className="auth-brand" style={{ justifyContent: 'center', marginBottom: '16px' }}>
          <div className="auth-brand-ico" style={{ width: '36px', height: '36px' }}>
            <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
          </div>
          <span className="auth-brand-nm" style={{ color: 'var(--dark)' }}>Ga<em style={{ color: 'var(--brand)' }}>rro</em></span>
        </Link>

        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.8rem' }}>📱</div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--dark)', marginBottom: '4px', letterSpacing: '-.03em' }}>{lt('verify_account')}</h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5', marginBottom: '16px' }}>{lt('verify_desc')}</p>

        {/* Demo Box */}
        {demoCode && (
          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '10px 14px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
            <span className="material-icons-round" style={{ fontSize: '20px', color: '#10b981', flexShrink: 0 }}>verified</span>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{lt('demo_mode')}</div>
              <div onClick={handleAutoFill} style={{ fontSize: '18px', fontWeight: '800', color: 'var(--dark)', letterSpacing: '.15em', cursor: 'pointer' }}>
                {demoCode}
              </div>
              <div style={{ fontSize: '10px', color: '#10b981', marginTop: '1px' }}>{lt('click_autofill')}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="auth-err" style={{ marginBottom: '14px' }}>
            <span className="material-icons-round">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="otp-row" style={{ marginBottom: '20px' }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`otp-box ${digit ? 'filled' : ''} ${error ? 'error' : ''}`}
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                ref={(el) => (inputRefs.current[index] = el)}
              />
            ))}
          </div>

          <button 
            type="submit" 
            className="auth-btn" 
            style={{ marginBottom: '12px' }}
            disabled={!isComplete || loading}
          >
            <span className="material-icons-round">verified_user</span>
            {loading ? lt('verifying') : lt('verify_continue')}
          </button>
        </form>

        <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
          {lt('didnt_receive')}{' '}
          <button 
            disabled={countdown > 0} 
            onClick={handleResend}
            style={{ color: 'var(--brand)', fontWeight: '700', background: 'none', border: 'none', cursor: countdown > 0 ? 'not-allowed' : 'pointer', padding: 0, opacity: countdown > 0 ? 0.4 : 1 }}
          >
            {lt('resend_otp')}
          </button>
          {' '}
          <span style={{ color: 'var(--muted)' }}>
            {countdown > 0 ? `(${countdown}s)` : ''}
          </span>
        </div>

        <Link to="/signup" className="auth-back" style={{ marginTop: '14px' }}>
          <span className="material-icons-round" style={{ fontSize: '15px' }}>arrow_back</span> {lt('back_to_signup')}
        </Link>
      </div>
    </div>
  );
};

export default VerifyOtp;
