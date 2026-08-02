import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { LuGlobe, LuChevronDown, LuCheck, LuUser, LuLock, LuEye, LuEyeOff, LuArrowLeft, LuLogIn, LuUserPlus, LuShield, LuChevronRight, LuCircleAlert, LuClock, LuTag, LuHeadphones, LuMail, LuPhone } from 'react-icons/lu';

const localT = {
  en: {
    join_garro: "Join Garro.",
    drive_smarter: "Drive Smarter.",
    signup_sub: "Create your free account and unlock access to UAE's best-priced certified garages — with Insurance, Roadside Assistance and more.",
    what_you_unlock: "What you unlock",
    unlock_quotes_title: "Instant Quotes from 500+ Garages",
    unlock_quotes_desc: "Compare prices before you commit",
    unlock_insurance_title: "Insurance & Protection Plans",
    unlock_insurance_desc: "Comprehensive cover at the best rates",
    unlock_roadside_title: "24/7 Roadside Assistance",
    unlock_roadside_desc: "Towing, jump starts, flat tyre & more",
    discount_title: "20% OFF your first booking",
    discount_desc: "Automatically applied at checkout",
    back_to_home: "Back to Home",
    create_account: "Create Account",
    signup_desc: "Sign up with your email or phone number",
    first_name: "First Name *",
    last_name: "Last Name *",
    email_address: "Email Address *",
    phone_number: "Phone Number *",
    password: "Password *",
    confirm_password: "Confirm Password *",
    agree_to: "I agree to the ",
    terms: "Terms & Conditions",
    and: " and ",
    privacy: "Privacy Policy",
    creating: "Creating...",
    create_account_btn: "Create Account",
    or: "or",
    already_have_acc: "Already have an account? ",
    sign_in: "Sign In"
  },
  ar: {
    join_garro: "انضم إلى غارو.",
    drive_smarter: "قد بذكاء أكثر.",
    signup_sub: "أنشئ حسابك المجاني واستفد من الوصول إلى الكراجات المعتمدة بأفضل الأسعار في الإمارات - مع التأمين والمساعدة على الطريق والمزيد.",
    what_you_unlock: "ما ستحصل عليه عند التسجيل",
    unlock_quotes_title: "عروض أسعار فورية من أكثر من 500 كراج",
    unlock_quotes_desc: "قارن الأسعار قبل أن تلتزم بالدفع",
    unlock_insurance_title: "خطط التأمين والحماية",
    unlock_insurance_desc: "تغطية شاملة بأفضل الأسعار في السوق",
    unlock_roadside_title: "مساعدة على الطريق على مدار الساعة",
    unlock_roadside_desc: "سحب السيارات، شحن البطارية، تبديل الإطارات والمزيد",
    discount_title: "خصم 20% على حجزك الأول",
    discount_desc: "يتم تطبيقه تلقائيًا عند الدفع",
    back_to_home: "العودة للرئيسية",
    create_account: "إنشاء حساب",
    signup_desc: "سجل باستخدام البريد الإلكتروني أو رقم الهاتف",
    first_name: "الاسم الأول *",
    last_name: "الاسم الأخير *",
    email_address: "البريد الإلكتروني *",
    phone_number: "رقم الهاتف *",
    password: "كلمة المرور *",
    confirm_password: "تأكيد كلمة المرور *",
    agree_to: "أوافق على ",
    terms: "الشروط والأحكام",
    and: " و ",
    privacy: "سياسة الخصوصية",
    creating: "جاري الإنشاء...",
    create_account_btn: "إنشاء حساب",
    or: "أو",
    already_have_acc: "هل لديك حساب بالفعل؟ ",
    sign_in: "تسجيل الدخول"
  },
  ur: {
    join_garro: "گارو میں شامل ہوں۔",
    drive_smarter: "ہوشیاری سے گاڑی چلائیں۔",
    signup_sub: "اپنا مفت اکاؤنٹ بنائیں اور متحدہ عرب امارات کے بہترین قیمت والے تصدیق شدہ گیراجوں تک رسائی حاصل کریں - انشورنس، سڑک کنارے مدد اور مزید کے ساتھ۔",
    what_you_unlock: "جو چیزیں آپ کو حاصل ہوں گی",
    unlock_quotes_title: "500+ گیراجوں سے فوری قیمتیں",
    unlock_quotes_desc: "بکنگ سے پہلے قیمتوں کا موازنہ کریں",
    unlock_insurance_title: "انشورنس اور پروٹیکشن پلانز",
    unlock_insurance_desc: "بہترین نرخوں پر جامع کوریج",
    unlock_roadside_title: "24/7 سڑک کنارے مدد",
    unlock_roadside_desc: "ٹونگ، جمپ اسٹارٹ، فلیٹ ٹائر اور بہت کچھ",
    discount_title: "آپ کی پہلی بکنگ پر 20% رعایت",
    discount_desc: "چیک آؤٹ پر خود بخود لاگو ہوتا ہے",
    back_to_home: "ہوم پر واپس جائیں",
    create_account: "اکاؤنٹ بنائیں",
    signup_desc: "اپنے ای میل یا فون نمبر کے ساتھ سائن اپ کریں",
    first_name: "پہلا نام *",
    last_name: "آخری نام *",
    email_address: "ای میل ایڈریس *",
    phone_number: "فون نمبر *",
    password: "پاس ورڈ *",
    confirm_password: "پاس ورڈ کی تصدیق کریں *",
    agree_to: "میں متفق ہوں ",
    terms: "شرائط و ضوابط",
    and: " اور ",
    privacy: "رازداری کی پالیسی",
    creating: "تخلیق ہو رہا ہے...",
    create_account_btn: "اکاؤنٹ بنائیں",
    or: "یا",
    already_have_acc: "پہلے سے ہی ایک اکاؤنٹ ہے؟ ",
    sign_in: "سائن ان کریں"
  }
};

const Signup = () => {
  const { lang, changeLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const lt = (key) => localT[lang]?.[key] || localT['en']?.[key] || key;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.phone) {
      setError('Phone number is required');
      return;
    }

    const cleanPhone = formData.phone.trim();
    if (!/^\+\d{8,15}$/.test(cleanPhone)) {
      setError('Phone number must start with country code (e.g. +971501234567)');
      return;
    }

    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: cleanPhone,
          password: formData.password
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      localStorage.setItem('lastRegisteredEmail', formData.email);
      toast.success('Account created! Please verify with the OTP code sent to your email.');
      navigate('/verify-otp', { state: { email: formData.email, demoCode: data.demoCode } });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          width: 100% !important;
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
        
        /* Premium Create Account Button */
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
        
        /* Google sign up alternative links */
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
          gap: 10px !important;
          cursor: pointer !important;
          text-decoration: none !important;
        }
        
        .auth-alt-btn:hover {
          background: #f8fafc !important;
          border-color: #cbd5e1 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 15px rgba(0,0,0,0.04) !important;
        }
        
        /* Back to site Link */
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
          transform: translateX(3px) !important;
        }
        
        /* RTL overrides for input elements padding */
        html[lang="ar"] .auth-iw input, html[lang="ur"] .auth-iw input {
          padding: 12px 42px 12px 14px !important;
        }
        html[lang="ar"] .auth-input-icon, html[lang="ur"] .auth-input-icon {
          right: 13px !important;
          left: auto !important;
        }
        html[lang="ar"] .auth-eye, html[lang="ur"] .auth-eye {
          left: 12px !important;
          right: auto !important;
        }
      `}</style>

      {/* Floating Language Switcher */}
      <div style={{ position: 'absolute', top: '24px', insetInlineEnd: '24px', zIndex: 1000 }}>
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

      {/* LEFT PANEL */}
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
              {lang === 'ar' ? 'دعم 24/7' : lang === 'ur' ? '24/7 سپورٹ' : '24/7 Support'}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 32px' }}>
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
          <Link to="/" className="auth-back" style={{ marginBottom: '24px' }}>
            <LuArrowLeft size={16} style={{ transform: lang === 'ar' || lang === 'ur' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            <span>{lt('back_to_site')}</span>
          </Link>

          <div className="auth-header left-align" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
              {lt('create_account')}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>
              {lang === 'ar' ? 'يرجى ملء التفاصيل لإنشاء حسابك' : lang === 'ur' ? 'براہ کرم اپنا اکاؤنٹ بنانے کے لیے تفصیلات درج کریں' : 'Please fill in the details to create your account'}
            </p>
          </div>

          {error && (
            <div className="auth-err">
              <LuCircleAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3" style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label className="auth-label" style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px', display: 'block' }}>First Name</label>
                <div className="auth-iw" style={{ marginBottom: 0, position: 'relative' }}>
                  <LuUser className="auth-input-icon" size={18} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', transition: 'color 0.2s' }} />
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" required />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label className="auth-label" style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px', display: 'block' }}>Last Name</label>
                <div className="auth-iw" style={{ marginBottom: 0, position: 'relative' }}>
                  <LuUser className="auth-input-icon" size={18} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', transition: 'color 0.2s' }} />
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" required />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="auth-label" style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px', display: 'block' }}>{lt('email_address')}</label>
              <div className="auth-iw" style={{ marginBottom: 0, position: 'relative' }}>
                <LuMail className="auth-input-icon" size={18} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', transition: 'color 0.2s' }} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email address" required />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="auth-label" style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px', display: 'block' }}>{lt('phone_number')}</label>
              <div className="auth-iw" style={{ marginBottom: 0, position: 'relative' }}>
                <LuPhone className="auth-input-icon" size={18} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', transition: 'color 0.2s' }} />
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. +971501234567" 
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="auth-label" style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px', display: 'block' }}>{lt('password')}</label>
              <div className="auth-iw" style={{ marginBottom: 0, position: 'relative' }}>
                <LuLock className="auth-input-icon" size={18} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', transition: 'color 0.2s' }} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Create a strong password" required />
                <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="auth-label" style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px', display: 'block' }}>{lt('confirm_password')}</label>
              <div className="auth-iw" style={{ marginBottom: 0, position: 'relative' }}>
                <LuLock className="auth-input-icon" size={18} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', transition: 'color 0.2s' }} />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <input type="checkbox" id="terms" required style={{ width: '18px', height: '18px', accentColor: '#ff5c1a', cursor: 'pointer' }} />
              <label htmlFor="terms" style={{ fontSize: '13px', color: '#475569', cursor: 'pointer', userSelect: 'none', fontWeight: '700' }}>
                {lt('agree_to')}
                <a href="#" style={{ color: '#ff5c1a', textDecoration: 'none', fontWeight: '700' }}>{lt('terms')}</a>
                {lt('and')}
                <a href="#" style={{ color: '#ff5c1a', textDecoration: 'none', fontWeight: '700' }}>{lt('privacy')}</a>
              </label>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? lt('creating') : lt('create_account_btn')}
            </button>
          </form>

          <div className="auth-divider" style={{ margin: '20px 0' }}>{lt('or')}</div>

          <button type="button" className="auth-alt-btn">
            {/* Google colored icon using inline SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Sign up with Google</span>
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13.5px', color: '#64748b', fontWeight: '500' }}>
            {lt('already_have_acc')}{' '}
            <Link to="/login" style={{ color: '#ff5c1a', fontWeight: '700', textDecoration: 'none' }}>{lt('sign_in')}</Link>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: '#94a3b8' }}>
            By signing up, you agree to our{' '}
            <a href="#" style={{ color: '#ff5c1a', textDecoration: 'none', fontWeight: '600' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" style={{ color: '#ff5c1a', textDecoration: 'none', fontWeight: '600' }}>Privacy Policy</a>.
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;
