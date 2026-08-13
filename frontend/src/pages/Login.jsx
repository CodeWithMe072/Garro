import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { processPendingQuoteIfAny } from '../utils/pendingQuote';
import {
  LuGlobe,
  LuChevronDown,
  LuCheck,
  LuShield,
  LuClock,
  LuTag,
  LuHeadphones,
  LuArrowLeft,
  LuCircleAlert,
  LuUser,
  LuLock,
  LuEyeOff,
  LuEye,
  LuChevronRight,
  LuUserPlus
} from 'react-icons/lu';

const localT = {
  en: {
    welcome_back: "Welcome Back.",
    sign_in_sub: "Sign in to access your garage bookings, service quotes, and roadside requests.",
    why_garro: "Why Garro?",
    trusted_garages: "500+ Certified Garages",
    trusted_garages_desc: "All vetted for quality, transparent pricing, and fast delivery",
    instant_tracking: "Live Status Tracking",
    instant_tracking_desc: "Track your vehicle repair status from quote to completion",
    transparent_pricing: "Transparent Pricing",
    transparent_pricing_desc: "No hidden charges — compare quotes before approving",
    support: "24/7 Dedicated Support",
    support_desc: "Our auto specialists are ready to help you anytime",
    back_to_home: "Back to Home",
    sign_in: "Sign In",
    sign_in_desc: "Enter your email address or phone number",
    email_or_phone: "Email or Phone Number *",
    email_or_phone_placeholder: "e.g. name@domain.com or +971501234567",
    password: "Password *",
    password_placeholder: "Enter your password",
    remember_me: "Remember me",
    forgot_password: "Forgot Password?",
    signing_in: "Signing In...",
    sign_in_btn: "Sign In",
    or: "or",
    dont_have_acc: "Don't have an account? ",
    create_account: "Create Account",
    instant_login_notice: "Need fast service without an account?",
    guest_checkout_notice: "Book directly through our instant quote & roadside features."
  },
  ar: {
    welcome_back: "مرحباً بعودتك.",
    sign_in_sub: "سجل الدخول للوصول إلى حجوزات الكراج، وعروض الأسعار، وطلبات المساعدة على الطريق.",
    why_garro: "لماذا غارو؟",
    trusted_garages: "أكثر من 500 كراج معتمد",
    trusted_garages_desc: "جميعها مفحوصة للجودة والأسعار الشفافة والخدمة السريعة",
    instant_tracking: "متابعة مباشرة للحالة",
    instant_tracking_desc: "تابع حالة إصلاح سيارتك من عرض السعر حتى الإنجاز",
    transparent_pricing: "أسعار شفافة",
    transparent_pricing_desc: "لا توجد رسوم خفية - قارن عروض الأسعار قبل الموافقة",
    support: "دعم فني 24/7",
    support_desc: "متخصصو السيارات لدينا جاهزون لمساعدتك في أي وقت",
    back_to_home: "العودة للرئيسية",
    sign_in: "تسجيل الدخول",
    sign_in_desc: "أدخل بريدك الإلكتروني أو رقم الهاتف",
    email_or_phone: "البريد الإلكتروني أو رقم الهاتف *",
    email_or_phone_placeholder: "مثال: name@domain.com أو +971501234567",
    password: "كلمة المرور *",
    password_placeholder: "أدخل كلمة المرور",
    remember_me: "تذكرني",
    forgot_password: "نسيت كلمة المرور؟",
    signing_in: "جاري تسجيل الدخول...",
    sign_in_btn: "تسجيل الدخول",
    or: "أو",
    dont_have_acc: "ليس لديك حساب؟ ",
    create_account: "إنشاء حساب",
    instant_login_notice: "هل تحتاج خدمة سريعة بدون حساب؟",
    guest_checkout_notice: "احجز مباشرة من خلال ميزات طلب العروض والمساعدة الفورية."
  },
  ur: {
    welcome_back: "خوش آمدید۔",
    sign_in_sub: "اپنی گیراج بکنگ، سروس والٹس، اور روڈ سائیڈ درخواستوں تک رسائی کے لیے سائن ان کریں۔",
    why_garro: "گارو کیوں؟",
    trusted_garages: "500+ تصدیق شدہ گیراج",
    trusted_garages_desc: "تمام معیار، شفاف قیمتوں اور تیز سروس کے لیے جانچے گئے ہیں",
    instant_tracking: "لائیو اسٹیٹس ٹریکنگ",
    instant_tracking_desc: "قیمت کے تخمینے سے مکمل ہونے تک گاڑی کی مرمت کا جائزہ لیں",
    transparent_pricing: "شفاف قیمتیں",
    transparent_pricing_desc: "کوئی چھپی ہوئی قیمت نہیں - منظور کرنے سے پہلے قیمتوں کا موازنہ کریں",
    support: "24/7 سپورٹ",
    support_desc: "ہمارے آٹو ماہرین کسی بھی وقت آپ کی مدد کے لیے تیار ہیں",
    back_to_home: "ہوم پر واپس جائیں",
    sign_in: "سائن ان کریں",
    sign_in_desc: "اپنا ای میل یا فون نمبر درج کریں",
    email_or_phone: "ای میل یا فون نمبر *",
    email_or_phone_placeholder: "مثال: name@domain.com یا +971501234567",
    password: "پاس ورڈ *",
    password_placeholder: "اپنا پاس ورڈ درج کریں",
    remember_me: "مجھے یاد رکھیں",
    forgot_password: "پاس ورڈ بھول گئے؟",
    signing_in: "سائن ان ہو رہا ہے...",
    sign_in_btn: "سائن ان کریں",
    or: "یا",
    dont_have_acc: "اکاؤنٹ نہیں ہے؟ ",
    create_account: "اکاؤنٹ بنائیں",
    instant_login_notice: "اکاؤنٹ کے بغیر تیز رفتار سروس چاہیے؟",
    guest_checkout_notice: "فوری قیمت اور روڈ سائیڈ فیچرز کے ذریعے براہ راست بک کریں۔"
  }
};

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const { toast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, changeLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const lt = (key) => localT[lang]?.[key] || localT['en']?.[key] || key;

  React.useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setIdentifier(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const quoteToken = location.state?.quoteToken || localStorage.getItem('pending_quote_token');
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: identifier, password, quoteToken })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        if (data.isUnverified && data.email) {
          localStorage.setItem('lastRegisteredEmail', data.email);
          toast.info('Account unverified. A new OTP verification code has been sent to your email.');
          navigate('/verify-otp', {
            state: {
              email: data.email,
              demoCode: data.demoCode,
              message: data.message
            }
          });
          return;
        }
        throw new Error(data.message || 'Invalid email or password.');
      }

      if (rememberMe) {
        localStorage.setItem('remembered_email', identifier);
      } else {
        localStorage.removeItem('remembered_email');
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
      toast.success(`Welcome back, ${userData.firstName}!`);

      if (data.redirectUrl) {
        localStorage.removeItem('pending_quote_token');
        localStorage.removeItem('pending_quote_data');
        navigate(data.redirectUrl);
        return;
      }

      if (role === 'superadmin' || role === 'manager') {
        navigate('/admin');
      } else if (role === 'staff') {
        navigate('/admin/staff');
      } else if (role === 'garage') {
        navigate('/garage-portal');
      } else {
        const processed = await processPendingQuoteIfAny(data.token, navigate, toast);
        if (!processed) {
          const from = location.state?.from?.pathname || '/home';
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <style>{`
        /* Floating Language Switcher animation */
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
        
        /* Modern Premium Auth styling overrides */
        .auth-body {
          background: #f8fafc !important; /* Premium clean background */
        }
        
        .auth-left {
          background: #f8fafc url('/assets/images/login-hero.jpg') no-repeat center center / cover !important;
          padding: 32px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          min-height: 100vh !important;
          position: relative !important;
        }
        
        /* Input fields styling */
        .auth-iw input {
          border: 1.5px solid #cbd5e1 !important;
          border-radius: 12px !important;
          padding: 12px 14px 12px 42px !important;
          font-size: 14px !important;
          background: #ffffff !important; 
          transition: all 0.2s ease-in-out !important;
          color: #0f172a !important;
          height: 48px !important;
        }
        
        .auth-iw input::placeholder {
          color: #94a3b8 !important;
        }
        
        .auth-iw input:hover {
          border-color: #cbd5e1 !important;
        }
        
        .auth-iw input:focus {
          border-color: #ff5c1a !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(255, 92, 26, 0.15) !important;
        }
        
        /* Focus within changes icon color */
        .auth-iw:focus-within .auth-input-icon {
          color: #ff5c1a !important;
        }
        
        /* Eye Button */
        .auth-eye {
          color: #94a3b8 !important;
          transition: color 0.2s !important;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3px;
        }
        
        .auth-eye:hover {
          color: #ff5c1a !important;
        }
        
        /* Premium Sign In Button */
        .auth-btn {
          background: linear-gradient(135deg, #ff5c1a 0%, #ff7c40 100%) !important;
          border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 4px 15px rgba(255, 92, 26, 0.25) !important;
          border-radius: 12px !important;
          padding: 13px !important;
          font-size: 14.5px !important;
          font-weight: 700 !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          height: 48px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          width: 100% !important;
          color: white !important;
          border: none !important;
          cursor: pointer !important;
        }
        
        .auth-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(255, 92, 26, 0.4) !important;
          background: linear-gradient(135deg, #ff6b2c 0%, #ff8953 100%) !important;
        }
        
        .auth-btn:active {
          transform: translateY(0) !important;
          box-shadow: 0 4px 12px rgba(255, 92, 26, 0.2) !important;
        }
        
        /* Alternative links */
        .auth-alt-btn {
          border: 1.5px solid #cbd5e1 !important;
          background: #ffffff !important;
          border-radius: 12px !important;
          padding: 12px 16px !important;
          font-weight: 700 !important;
          color: #334155 !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02) !important;
          width: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          cursor: pointer !important;
          text-decoration: none !important;
        }
        
        .auth-alt-btn:hover {
          background: #fff4ef !important;
          border-color: rgba(255, 92, 26, 0.25) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 15px rgba(255, 92, 26, 0.05) !important;
          color: #ff5c1a !important;
        }
        
        /* Back to Garro Link */
        .auth-back {
          color: #64748b !important;
          transition: all 0.2s !important;
          font-weight: 700 !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          text-transform: uppercase !important;
          font-size: 12px !important;
          letter-spacing: 0.05em !important;
        }
        .auth-back:hover {
          color: #ff5c1a !important;
          transform: translateX(-3px) !important;
        }
        html[lang="ar"] .auth-back:hover, html[lang="ur"] .auth-back:hover {
          transform: translateX(-3px) !important;
        }
      `}</style>

      {/* Floating Language Switcher */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 1000 }}>
        <button
          type="button"
          onClick={() => setIsLangOpen(!isLangOpen)}
          style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '24px',
            padding: '8px 16px',
            color: '#334155',
            fontSize: '12.5px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#ff5c1a';
            e.currentTarget.style.color = '#ff5c1a';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 92, 26, 0.08)';
          }}
          onMouseLeave={(e) => {
            if (!isLangOpen) {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#334155';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.05)';
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
            minWidth: '135px',
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

      {/* LEFT */}
      <div className="auth-left">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '40px', zIndex: 2 }}>
          <Link to="/" className="auth-brand" style={{ marginBottom: 0 }}>
            <div className="auth-brand-ico">
              <svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
            </div>
            <span className="auth-brand-nm" style={{ color: '#0f172a' }}>Ga<span style={{ color: '#ff5c1a' }}>rro</span></span>
          </Link>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid #e2e8f0',
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '12px',
            color: '#1e293b',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)'
          }}>
            <span>🇦🇪</span> {lang === 'ar' ? 'نطلق الآن في دبي' : lang === 'ur' ? 'اب دبئی میں لانچ ہو رہا ہے' : 'Now Launching in Dubai'}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', margin: '24px 0', zIndex: 2 }}>
          <div style={{ color: '#ff5c1a', fontSize: '12px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
            {lang === 'ar' ? 'منصة خدمات السيارات الحديثة في الإمارات' : lang === 'ur' ? 'یو اے ای کا جدید کار سروس پلیٹ فارم' : "UAE'S MODERN CAR SERVICE PLATFORM"}
          </div>
          <h1 className="auth-headline" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: '900', lineHeight: '1.15', color: '#0f172a', marginBottom: '16px' }}>
            {lang === 'en' ? (
              <>Smart car care.<br/>Simplified <span style={{ color: '#ff5c1a' }}>for you.</span></>
            ) : lang === 'ar' ? (
              <>رعاية ذكية للسيارات.<br/><span style={{ color: '#ff5c1a' }}>مبسطة لأجلك.</span></>
            ) : (
              <>سمارٹ کار کیئر۔<br/><span style={{ color: '#ff5c1a' }}>آپ کے لیے آسان۔</span></>
            )}
          </h1>
          <p className="auth-sub" style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', maxWidth: '460px', marginBottom: '32px', fontWeight: '500' }}>
            {lang === 'en' ? 'Book services, track your car, and get instant quotes from verified garages — all in one place.' : 
             lang === 'ar' ? 'احجز الخدمات، وتتبع سيارتك، واحصل على عروض أسعار فورية من كراجات معتمدة - كل ذلك في مكان واحد.' :
             'سروسز بک کریں، اپنی کار کو ٹریک کریں، اور تصدیق شدہ گیراجز سے فوری کوٹیشنز حاصل کریں — سب ایک ہی جگہ پر۔'}
          </p>

          {/* Features Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '20px', maxWidth: '500px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ffffff', border: '1.5px solid #ffe8df', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255, 92, 26, 0.08)' }}>
                <LuShield size={20} color="#ff5c1a" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', textShadow: '0 1px 3px #ffffff, 0 1px 6px #ffffff' }}>
                {lang === 'ar' ? 'كراجات معتمدة' : lang === 'ur' ? 'تصدیق شدہ گیراجز' : 'Verified Garages'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ffffff', border: '1.5px solid #ffe8df', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255, 92, 26, 0.08)' }}>
                <LuClock size={20} color="#ff5c1a" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', textShadow: '0 1px 3px #ffffff, 0 1px 6px #ffffff' }}>
                {lang === 'ar' ? 'استجابة سريعة' : lang === 'ur' ? 'فوری جواب' : 'Quick Response'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ffffff', border: '1.5px solid #ffe8df', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255, 92, 26, 0.08)' }}>
                <LuTag size={20} color="#ff5c1a" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', textShadow: '0 1px 3px #ffffff, 0 1px 6px #ffffff' }}>
                {lang === 'ar' ? 'تسعير شفاف' : lang === 'ur' ? 'شفاف قیمتیں' : 'Transparent Pricing'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ffffff', border: '1.5px solid #ffe8df', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255, 92, 26, 0.08)' }}>
                <LuHeadphones size={20} color="#ff5c1a" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', textShadow: '0 1px 3px #ffffff, 0 1px 6px #ffffff' }}>
                {lang === 'ar' ? 'دعم مخصص' : lang === 'ur' ? 'مخصوص سپورٹ' : 'Dedicated Support'}
              </span>
            </div>
          </div>
        </div>

        {/* Help card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1.5px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 'auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          zIndex: 2
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fff4ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LuHeadphones size={18} color="#ff5c1a" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                {lang === 'ar' ? 'تحتاج إلى مساعدة؟' : lang === 'ur' ? 'مدد چاہیے؟' : 'Need help?'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {lang === 'ar' ? 'نحن هنا لمساعدتك.' : lang === 'ur' ? 'ہم آپ کی مدد کے لیے حاضر ہیں۔' : "We're here to assist you."}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <a href="tel:0552830456" style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', textDecoration: 'none', display: 'block' }}>
              055 283 0456
            </a>
            <span style={{ fontSize: '10px', color: '#64748b' }}>
              {lang === 'ar' ? 'دعم نفس اليوم' : 'Same Day Support'}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-right" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
          <Link to="/" className="auth-back" style={{ marginBottom: '24px' }}>
            <LuArrowLeft size={16} style={{ transform: lang === 'ar' || lang === 'ur' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            <span>{lt('back_to_site')}</span>
          </Link>
          <div className="auth-header left-align" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {lt('welcome_back')}<span className="waving-emoji">👋</span>
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>{lt('sign_in_sub')}</p>
          </div>

          {error && (
            <div className="auth-err">
              <LuCircleAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label className="auth-label" style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>{lt('email_or_phone')}</label>
              <div className="auth-iw">
                <LuUser className="auth-input-icon" size={18} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', transition: 'color 0.2s' }} />
                <input 
                  type="text" 
                  value={identifier} 
                  onChange={(e) => setIdentifier(e.target.value)} 
                  placeholder={lt('enter_details')}
                  required 
                />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="auth-label" style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: 0 }}>{lt('password')}</label>
                <a href="#" style={{ fontSize: '13px', color: '#ff5c1a', fontWeight: '700', textDecoration: 'none' }}>{lt('forgot_password')}</a>
              </div>
              <div className="auth-iw" style={{ position: 'relative' }}>
                <LuLock className="auth-input-icon" size={18} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', transition: 'color 0.2s' }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder={lang === 'ar' ? 'أدخل كلمة المرور' : lang === 'ur' ? 'اپنا پاس ورڈ درج کریں' : 'Enter your password'}
                  required 
                />
                <button 
                  type="button" 
                  className="auth-eye" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <input 
                type="checkbox" 
                id="remember_me"
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#ff5c1a',
                  cursor: 'pointer'
                }}
              />
              <label htmlFor="remember_me" style={{ fontSize: '13px', color: '#475569', cursor: 'pointer', userSelect: 'none', fontWeight: '700' }}>
                {lt('remember_me')}
              </label>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? lt('signing_in') : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{lt('sign_in_btn')}</span>
                  <LuChevronRight size={16} />
                </span>
              )}
            </button>
          </form>

          <div className="auth-divider" style={{ margin: '24px 0' }}>{lt('or')}</div>
          
          <Link to="/signup" className="auth-alt-btn">
            <LuUserPlus size={18} />
            <span>{lt('create_account')}</span>
          </Link>

          {/* Trust features row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '32px', borderTop: '1.5px solid #f1f5f9', paddingTop: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LuShield size={14} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#0f172a', lineHeight: '1.1' }}>Secure & Safe</div>
                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>Data protected</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LuLock className="auth-input-icon" size={14} color="#3b82f6" />
              </div>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#0f172a', lineHeight: '1.1' }}>Easy & Fast</div>
                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>Login in seconds</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LuHeadphones size={14} color="#ea580c" />
              </div>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#0f172a', lineHeight: '1.1' }}>Need help?</div>
                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>We're here to help</div>
              </div>
            </div>
          </div>

          {/* Footer terms */}
          <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '11.5px', color: '#94a3b8' }}>
            {lang === 'ar' ? 'من خلال الاستمرار، فإنك توافق على ' : lang === 'ur' ? 'جاری رکھ کر، آپ متفق ہیں ' : 'By continuing, you agree to our '}
            <a href="#" style={{ color: '#ff5c1a', textDecoration: 'none', fontWeight: '600' }}>
              {lang === 'ar' ? 'شروط الخدمة' : lang === 'ur' ? 'سروس کی شرائط' : 'Terms of Service'}
            </a>
            {lang === 'ar' ? ' و ' : lang === 'ur' ? ' اور ' : ' and '}
            <a href="#" style={{ color: '#ff5c1a', textDecoration: 'none', fontWeight: '600' }}>
              {lang === 'ar' ? 'سياسة الخصوصية' : lang === 'ur' ? 'رازداری کی پالیسی' : 'Privacy Policy'}
            </a>
          </div>

        </div>
      </div>
    </div>
  );

};

export default Login;
