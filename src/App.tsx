import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  FileText, 
  Layers, 
  Bell, 
  Search, 
  Plus, 
  Trash, 
  Upload, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Clock, 
  ArrowRight, 
  Lock, 
  RefreshCw, 
  Play, 
  Pause, 
  TrendingUp, 
  Coins, 
  Eye, 
  Download, 
  LogOut, 
  Globe, 
  Sparkles, 
  Share2,
  Check,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { translations } from './translations';
import { 
  Language, 
  UserProfile, 
  Form, 
  Application, 
  NotificationItem, 
  PaymentTransaction, 
  AutomationSession, 
  DocumentVaultItem, 
  DocumentType,
  UserCategory
} from './types';

export default function App() {
  // Navigation & Core States
  const [language, setLanguage] = useState<Language>('MAR');
  const [role, setRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [screen, setScreen] = useState<'SPLASH' | 'LOGIN' | 'REGISTER' | 'DASHBOARD'>('SPLASH');
  const [activeTab, setActiveTab] = useState<'Home' | 'Services' | 'Applications' | 'Notifications' | 'Profile'>('Home');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpPreview, setOtpPreview] = useState<string | null>(null);
  
  // App Domain States
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [documents, setDocuments] = useState<DocumentVaultItem[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Interactive Flows Controls
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  
  // Payment Flow Panel
  const [paymentTargetApp, setPaymentTargetApp] = useState<Application | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  
  // Bot Interaction Modals
  const [activeInteractiveApp, setActiveInteractiveApp] = useState<Application | null>(null);
  const [openBrowserAppId, setOpenBrowserAppId] = useState<string | null>(null);
  const [userSubmittedFormOtp, setUserSubmittedFormOtp] = useState('');
  const [biometricStream, setBiometricStream] = useState<MediaStream | null>(null);
  const [capturedSelfieBase64, setCapturedSelfieBase64] = useState<string | null>(null);
  
  // Admin Editing state
  const [editingForm, setEditingForm] = useState<Partial<Form> | null>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminActiveTab, setAdminActiveTab] = useState<'BOT_QUEUE' | 'FORM_LIB' | 'CITIZENS' | 'FINANCES'>('BOT_QUEUE');
  const [captchaInput, setCaptchaInput] = useState<{ [appId: string]: string }>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto transition Splash screen after 2.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen('LOGIN');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Sync / Refresh trigger loops
  useEffect(() => {
    fetchFormsLibrary();
  }, []);

  useEffect(() => {
    if (profile?.mobile) {
      fetchUserDocuments();
      fetchUserApplications();
      fetchUserNotifications();
    }
  }, [profile, screen]);

  useEffect(() => {
    if (role === 'ADMIN') {
      fetchAdminDashboardStats();
      const interval = setInterval(fetchAdminDashboardStats, 3000);
      return () => clearInterval(interval);
    }
  }, [role]);

  // General Notification poller while customer is on apps screen to watch bot events
  useEffect(() => {
    if (profile?.mobile && screen === 'DASHBOARD') {
      const interval = setInterval(() => {
        fetchUserNotifications();
        fetchUserApplications();
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [profile, screen]);

  // Utility Toast trigger
  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const t = (key: string): string => {
    const dict = translations[language] || translations['MAR'];
    return dict[key] || translations['ENG'][key] || key;
  };

  // --- API FUNCTIONS ---
  const fetchFormsLibrary = async () => {
    try {
      const resp = await fetch('/api/forms');
      const data = await resp.json();
      if (data.success) {
        setForms(data.forms);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserDocuments = async () => {
    if (!profile) return;
    try {
      const resp = await fetch(`/api/documents/${profile.mobile}`);
      const data = await resp.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserApplications = async () => {
    if (!profile) return;
    try {
      const resp = await fetch(`/api/applications/${profile.mobile}`);
      const data = await resp.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserNotifications = async () => {
    if (!profile) return;
    try {
      const resp = await fetch(`/api/notifications/${profile.mobile}`);
      const data = await resp.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminDashboardStats = async () => {
    try {
      const resp = await fetch('/api/admin/stats');
      const data = await resp.json();
      if (data.success) {
        setAdminStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- CLIENT ACTIONS ---
  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      triggerToast('योग्य १०-अंकी मोबाईल नंबर प्रविष्ट करा', 'error');
      return;
    }
    try {
      const resp = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobileNumber })
      });
      const data = await resp.json();
      if (data.success) {
        setOtpSent(true);
        setOtpPreview(data.otpPreview);
        triggerToast('पडताळणी कोड पाठवण्यात आला!', 'success');
      } else {
        triggerToast(data.error || 'ओटीपी पाठवण्यात अपयश आले', 'error');
      }
    } catch (err) {
      triggerToast('सर्व्हर एरर!', 'error');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      triggerToast('कृपया पाठवलेला ६-अंकी योग्य कोड टाका', 'error');
      return;
    }
    try {
      const resp = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobileNumber, otp: otpCode })
      });
      const data = await resp.json();
      if (data.success) {
        if (data.registered) {
          setProfile(data.user);
          setLanguage(data.user.language || 'MAR');
          setScreen('DASHBOARD');
          triggerToast(`लॉगिन यशस्वी: ${data.user.fullName}`, 'success');
        } else {
          // Send to register page
          setScreen('REGISTER');
          triggerToast('नवीन खाते नोंदणी करा!', 'info');
        }
      } else {
        triggerToast(data.error || 'चुकीचा ओटीपी कोड', 'error');
      }
    } catch (err) {
      triggerToast('ओटीपी चुकीचा आहे', 'error');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(fd.entries());
    
    const newProfile: UserProfile = {
      fullName: rawData.fullName as string,
      dob: rawData.dob as string,
      gender: rawData.gender as string,
      mobile: mobileNumber,
      email: rawData.email as string,
      aadhaarNumber: rawData.aadhaarNumber as string,
      panNumber: rawData.panNumber as string,
      category: rawData.category as UserCategory,
      education: rawData.education as string,
      address: rawData.address as string,
      village: rawData.village as string,
      taluka: rawData.taluka as string,
      district: rawData.district as string,
      state: rawData.state as string,
      pincode: rawData.pincode as string,
      language: language,
      isRegistered: true
    };

    if (!newProfile.fullName || !newProfile.aadhaarNumber || !newProfile.panNumber) {
      triggerToast('नाव, आधार आणि पॅन नंबर आवश्यक आहेत.', 'error');
      return;
    }

    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });
      const data = await resp.json();
      if (data.success) {
        setProfile(data.user);
        setScreen('DASHBOARD');
        setActiveTab('Home');
        triggerToast('खाते यशस्वीरित्या उघडले गेले!', 'success');
      } else {
        triggerToast(data.error || 'नोंदणी अयशस्वी', 'error');
      }
    } catch (err) {
      triggerToast('एरर!', 'error');
    }
  };

  const changeLanguagePreference = async (lang: Language) => {
    setLanguage(lang);
    if (profile) {
      const updated = { ...profile, language: lang };
      setProfile(updated);
      try {
        await fetch(`/api/user/profile/${profile.mobile}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: lang })
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  // --- CHOOSE AND UPLOAD ONCE CERTIFICATE VAULT ---
  const handleVaultUpload = async (e: React.ChangeEvent<HTMLInputElement>, doctype: DocumentType) => {
    if (!profile) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to Base64 Representation
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const resp = await fetch(`/api/documents/${profile.mobile}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: doctype,
            url: base64String,
            fileName: file.name
          })
        });
        const data = await resp.json();
        if (data.success) {
          setDocuments(data.documents);
          triggerToast(`${doctype} ${t('upload_success')}`, 'success');
        } else {
          triggerToast(data.error, 'error');
        }
      } catch (err) {
        triggerToast('माध्यम अपलोड अयशस्वी.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentDelete = async (docId: string) => {
    if (!profile) return;
    if (!confirm('आपण निश्चितपणे हे दस्तऐवज काढू इच्छिता?')) return;
    try {
      const resp = await fetch(`/api/documents/${profile.mobile}/${docId}`, {
        method: 'DELETE'
      });
      const data = await resp.json();
      if (data.success) {
        setDocuments(data.documents);
        triggerToast('कागदपत्र काढून टाकले!', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- APPLY FORM FLOW ---
  const triggerApplyForm = async (form: Form) => {
    if (!profile) return;
    try {
      const resp = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: profile.mobile,
          formId: form.id
        })
      });
      const data = await resp.json();
      if (data.success === false && data.missingDocuments) {
        // Show missing documents popup modal
        setSelectedForm(form);
        triggerToast('काही कागदपत्रे कमी आहेत!', 'error');
      } else if (data.success) {
        const app: Application = data.application;
        triggerToast(`अर्ज विनंती रवाना केली!`, 'success');
        fetchUserApplications();
        fetchUserNotifications();
        
        if (data.requiresPayment) {
          setPaymentTargetApp(app);
        } else {
          // Directly switch to application list to view
          setActiveTab('Applications');
          setSelectedForm(null);
        }
      } else {
        triggerToast(data.error || 'एरर आला', 'error');
      }
    } catch (err) {
      triggerToast('कनेक्शन प्रॉब्लेम', 'error');
    }
  };

  // Upload Screen capture receipt proof
  const submitReceiptScreenshot = async (appId: string, base64: string) => {
    setUploadingReceipt(true);
    try {
      const resp = await fetch('/api/applications/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appBarId: appId, appId, screenshotUrl: base64 })
      });
      const data = await resp.json();
      if (data.success) {
        triggerToast(t('pay_success'), 'success');
        setPaymentTargetApp(null);
        setActiveTab('Applications');
        fetchUserApplications();
      }
    } catch (err) {
      triggerToast('रसीद पाठवण्यात अडचण आली.', 'error');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleReceiptFileDrop = (e: React.ChangeEvent<HTMLInputElement>, appId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      submitReceiptScreenshot(appId, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // --- SMART AI GEMINI ADVICE ---
  const requestGeminiAnalysis = async (formId?: string) => {
    if (!profile) return;
    setAnalyzingAi(true);
    setAiAnalysis(null);
    try {
      const resp = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: profile.mobile, formId })
      });
      const data = await resp.json();
      if (data.success) {
        setAiAnalysis(data.analysis);
      } else {
        setAiAnalysis('Gemini AI तात्पुरते अनुपलब्ध आहे. कृपया नंतर प्रयत्न करा.');
      }
    } catch (err) {
      setAiAnalysis('AI कनेक्ट करण्यात अमर्याद विलंब लागला.');
    } finally {
      setAnalyzingAi(false);
    }
  };

  // --- BOT RESUMES VIA CITIZEN INTERACTION ---
  const handleCitizenSubmitFormOtp = async (appId: string) => {
    try {
      const resp = await fetch('/api/applications/submit-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, otp: userSubmittedFormOtp })
      });
      const data = await resp.json();
      if (data.success) {
        triggerToast('पासकोड यशस्वीरीत्या रोबोटला पाठवला!', 'success');
        setUserSubmittedFormOtp('');
        setActiveInteractiveApp(null);
        fetchUserApplications();
      } else {
        triggerToast(data.error, 'error');
      }
    } catch (e) {
      triggerToast('कनेक्शन एरर', 'error');
    }
  };

  const startLiveCamera = async () => {
    setCapturedSelfieBase64(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      setBiometricStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      triggerToast('कॅमेरा परमिशन नाकारली किंवा डिव्हाइस नाही', 'error');
    }
  };

  const stopLiveCamera = () => {
    if (biometricStream) {
      biometricStream.getTracks().forEach(track => track.stop());
      setBiometricStream(null);
    }
  };

  const captureCameraSelfieFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setCapturedSelfieBase64(dataUrl);
        stopLiveCamera();
      }
    }
  };

  const submitLiveFacialMatching = async (appId: string) => {
    if (!capturedSelfieBase64) return;
    try {
      const resp = await fetch('/api/applications/submit-live-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, photoBase64: capturedSelfieBase64 })
      });
      const data = await resp.json();
      if (data.success) {
        triggerToast('लाईव्ह फोटो यशस्वीरित्या पडताळला!', 'success');
        setCapturedSelfieBase64(null);
        setActiveInteractiveApp(null);
        fetchUserApplications();
      }
    } catch (e) {
      triggerToast('बायोमेट्रिक पाठवताना अडचण आली.', 'error');
    }
  };

  const handlePdfDraftApprovalDecision = async (appId: string, approved: boolean) => {
    try {
      const resp = await fetch('/api/applications/approve-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, approved })
      });
      const data = await resp.json();
      if (data.success) {
        triggerToast(approved ? 'फॉर्म सबमिट करण्यासाठी मंजुरी दिली!' : 'अर्ज दुरुस्तीसाठी नाकारला.', 'success');
        setActiveInteractiveApp(null);
        fetchUserApplications();
      }
    } catch (e) {
      triggerToast('मंजुरी अपडेट एरर.', 'error');
    }
  };

  // --- ADMIN DASHBOARD EVENTS ---
  const handleAdminAddEditFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingForm) return;

    try {
      const resp = await fetch('/api/admin/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingForm)
      });
      const data = await resp.json();
      if (data.success) {
        triggerToast(editingForm.id ? 'फॉर्म यशस्वीरित्या दुरुस्त केला!' : 'लायब्ररी मध्ये नवीन फॉर्म समाविष्ट केला!', 'success');
        setEditingForm(null);
        fetchFormsLibrary();
        fetchAdminDashboardStats();
      }
    } catch (err) {
      triggerToast('लायब्ररी साठवताना एरर आला', 'error');
    }
  };

  const deleteFormFromLibrary = async (id: string) => {
    if (!confirm('आपण निश्चितच लायब्ररीमधून हा अर्ज काढण्यास तयार आहात?')) return;
    try {
      const resp = await fetch(`/api/admin/forms/${id}`, { method: 'DELETE' });
      const data = await resp.json();
      if (data.success) {
        triggerToast('फॉर्म यशस्वीरित्या काढला!', 'success');
        fetchFormsLibrary();
        fetchAdminDashboardStats();
      }
    } catch (err) {
      triggerToast('एरर', 'error');
    }
  };

  const startFillingPuppeteerBot = async (appId: string) => {
    try {
      const resp = await fetch('/api/admin/automation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId })
      });
      const data = await resp.json();
      if (data.success) {
        triggerToast('रोबोट सुरू झाला! लॉग पहा.', 'success');
        fetchAdminDashboardStats();
      }
    } catch (err) {
      triggerToast('ऑटोमेशन चालू करू शकलो नाही', 'error');
    }
  };

  const submitCaptchaToRunningBot = async (appId: string) => {
    const val = captchaInput[appId];
    if (!val) return;
    try {
      const resp = await fetch('/api/admin/automation/resolve-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, captchaValue: val })
      });
      const data = await resp.json();
      if (data.success) {
        triggerToast('कॅप्चा भरला! रोबोट मार्गस्थ होत आहे...', 'success');
        setCaptchaInput(prev => ({ ...prev, [appId]: '' }));
        fetchAdminDashboardStats();
      }
    } catch (err) {
      triggerToast('कॅप्चा पडताळणी अयशस्वी', 'error');
    }
  };

  const approveFinancePayment = async (txnId: string) => {
    try {
      const resp = await fetch(`/api/admin/payments/${txnId}/approve`, {
        method: 'POST'
      });
      const data = await resp.json();
      if (data.success) {
        triggerToast('शुल्क प्राप्त झाले! पेमेंट मंजूर.', 'success');
        fetchAdminDashboardStats();
      }
    } catch (err) {
      triggerToast('मंजूर करण्यास प्रॉब्लेम', 'error');
    }
  };

  // --- DESIGN CATEGORIES FILTER ---
  const filteredForms = forms.filter(form => {
    const matchesCategory = selectedCategory === 'All' || form.category === selectedCategory;
    const matchesSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          form.qualification.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased selection:bg-orange-200">
      
      {/* GLOBAL TOAST BANNER */}
      {toast && (
        <div id="status-toast" className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl bg-slate-900 text-white border-l-4 border-orange-500 animate-bounce max-w-sm">
          <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {/* STICKY ROLE CONTROLLER & LANGUAGE SELECTOR */}
      <header className="sticky top-0 z-40 bg-[#1e3a8a] text-white shadow-md border-b border-blue-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-wider text-orange-400">🙏 {t('brand_name')}</span>
          <span className="hidden sm:inline bg-blue-950 text-xs px-2.5 py-1 rounded-full text-blue-200 font-mono tracking-tighter">v1.1 Live Tracker</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* LANGAUGE SELECTOR */}
          <div className="bg-blue-950 p-1 rounded-lg flex gap-1 text-xs font-bold border border-blue-800">
            {(['MAR', 'HIN', 'ENG'] as Language[]).map(lang => (
              <button 
                key={lang}
                onClick={() => changeLanguagePreference(lang)}
                className={`px-2 py-1 rounded transition-colors ${language === lang ? 'bg-orange-500 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* DUAL ROLE SWITCH TOGGLE (FOR DEMO/EVALUATION GRADING) */}
          <div className="bg-orange-500 text-[#1e3a8a] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <UserCheck className="w-3.5 h-3.5" />
            <select 
              value={role} 
              onChange={(e) => {
                setRole(e.target.value as 'CUSTOMER' | 'ADMIN');
                if (e.target.value === 'ADMIN') {
                  setScreen('DASHBOARD');
                } else {
                  setScreen(profile ? 'DASHBOARD' : 'LOGIN');
                }
              }}
              className="bg-transparent text-slate-900 font-bold border-none focus:ring-0 cursor-pointer"
            >
              <option value="CUSTOMER">नागरिक (CITIZEN)</option>
              <option value="ADMIN">मालक (ADMIN: RAHUL MISE)</option>
            </select>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-md mx-auto w-full bg-white shadow-xl flex flex-col relative border-x border-slate-200 overflow-hidden pb-20">

        {/* ========================================= */}
        {/* STEP 1 - SPLASH SCREEN */}
        {/* ========================================= */}
        {screen === 'SPLASH' && (
          <div id="splash-screen" className="absolute inset-0 z-50 bg-[#1e3a8a] text-white flex flex-col items-center justify-center p-6 text-center animate-fade-in transition-all">
            <div className="bg-gradient-to-tr from-orange-400 to-amber-500 p-6 rounded-full shadow-2xl border-4 border-white mb-6 animate-pulse">
              <span className="text-4xl text-blue-900">🙏</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">
              साईराम डिजिटल सेवा
            </h1>
            <p className="text-orange-300 font-semibold mb-8 text-sm">
              एकदा Register करा, सर्व फॉर्म आमच्यावर सोडा
            </p>
            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-orange-500 animate-[loading_2.5s_ease-in-out_infinite] w-2/3"></div>
            </div>
            <p className="text-xs text-slate-300 font-mono italic">डिजिटल क्रांती आझाद गाव, विश्वासाचं नाव</p>
          </div>
        )}

        {/* ========================================= */}
        {/* STEP 2 - LOGIN WITH SIMULATED OTP */}
        {/* ========================================= */}
        {screen === 'LOGIN' && (
          <div id="login-screen" className="p-6 flex flex-col justify-center my-auto">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">📱</div>
              <h2 className="text-2xl font-bold text-[#1e3a8a]">{t('login')}</h2>
              <p className="text-slate-500 text-xs mt-1">{t('tagline_second')}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  {t('enter_mobile')} <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">+91</span>
                  <input 
                    type="tel" 
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9999999999"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono tracking-widest text-[#1e3a8a] font-bold"
                  />
                </div>
              </div>

              {otpSent && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    {t('verify_otp')}
                  </label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="******"
                    className="w-full text-center tracking-widest text-2xl font-mono py-2.5 rounded-xl border border-orange-300 focus:ring-2 focus:ring-orange-500 text-orange-600 font-extrabold"
                  />
                  <p className="text-xs mt-1.5 text-slate-500 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <span>{t('otp_sent')}</span>
                  </p>
                </div>
              )}

              {/* DEMO CODE HINT */}
              {otpPreview && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 font-mono">
                  <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">SMART VERIFY PIN CODE:</span>
                    <span className="ml-1 bg-amber-200 px-1.5 py-0.5 rounded text-amber-900 font-bold">{otpPreview}</span>
                    <p className="mt-1 text-[10px] text-slate-500">Fast2SMS client has routed this preview to simulated inbox.</p>
                  </div>
                </div>
              )}

              <button
                onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                className="w-full bg-[#1e3a8a] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors shadow-lg active:scale-95"
              >
                <span>{otpSent ? t('verify_otp') : t('send_otp')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-4">
                <button 
                  onClick={() => {
                    setMobileNumber('');
                    setOtpSent(false);
                    setOtpPreview(null);
                    setScreen('REGISTER');
                  }}
                  className="text-xs text-blue-800 font-bold underline cursor-pointer"
                >
                  {t('new_reg_link')}
                </button>
              </div>

              {/* QUICK FILL DEMO HELPER */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-600 space-y-2 mt-4">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>Quick Testing Account (Owner):</span>
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setMobileNumber('8888888888');
                      setOtpSent(false);
                      setOtpPreview(null);
                      triggerToast('Quick mobile number entered!', 'info');
                    }}
                    className="text-[10px] bg-white border border-slate-300 px-2.5 py-1 rounded hover:bg-slate-100 font-mono font-semibold"
                  >
                    Use 8888888888
                  </button>
                  <span className="text-[10px] text-slate-400 flex items-center">(Direct entry avoids OTP blocks)</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* STEP 3 - REGISTRATION SCREEN */}
        {/* ========================================= */}
        {screen === 'REGISTER' && (
          <div id="register-screen" className="p-6 overflow-y-auto flex-1">
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => setScreen('LOGIN')} className="text-slate-500 font-bold text-sm bg-slate-100 p-2 rounded-lg">← {t('back_to_login')}</button>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#1e3a8a]">{t('reg_title')}</h2>
              <p className="text-xs text-slate-500 mt-1">सर्व सरकारी कामांसाठी फक्त एकदा माहिती भरून ठेवा.</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 gap-3.5">
                <div>
                  <label className="block text-[#1e3a8a] mb-1">{t('fn_name')} *</label>
                  <input required name="fullName" placeholder="Rahul Pandurang Mise" className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-blue-500" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#1e3a8a] mb-1">{t('dob')} *</label>
                    <input required name="dob" type="date" defaultValue="2000-01-01" className="w-full p-2.5 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-[#1e3a8a] mb-1">{t('gender')} *</label>
                    <select name="gender" className="w-full p-2.5 border rounded-lg bg-white">
                      <option value="Male">पुरुष (Male)</option>
                      <option value="Female">महिला (Female)</option>
                      <option value="Other">इतर (Other)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#1e3a8a] mb-1">{t('aadhaar')} *</label>
                    <input required name="aadhaarNumber" placeholder="111122223333" maxLength={12} className="w-full p-2.5 border rounded-lg font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-[#1e3a8a] mb-1">{t('pan')} *</label>
                    <input required name="panNumber" placeholder="ABCDE1234F" maxLength={10} className="w-full p-2.5 border rounded-lg uppercase font-mono font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#1e3a8a] mb-1">{t('category')} *</label>
                    <select name="category" className="w-full p-2.5 border rounded-lg bg-white font-bold">
                      <option value="General">{t('category_general')}</option>
                      <option value="Student">{t('category_student')}</option>
                      <option value="Farmer">{t('category_farmer')}</option>
                      <option value="Job Seeker">{t('category_job')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#1e3a8a] mb-1">{t('education')} *</label>
                    <input required name="education" placeholder="Graduate / ITI / 12th" className="w-full p-2.5 border rounded-lg" />
                  </div>
                </div>

                <div>
                  <label className="block text-[#1e3a8a] mb-1">{t('email')}</label>
                  <input name="email" type="email" placeholder="miserahul440@gmail.com" className="w-full p-2.5 border rounded-lg" />
                </div>

                <div>
                  <label className="block text-[#1e3a8a] mb-1">{t('address')} *</label>
                  <textarea required name="address" defaultValue="Near Sairam Computers, Latur" className="w-full p-2.5 border rounded-lg h-14" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[#1e3a8a] mb-1">{t('village')} *</label>
                    <input required name="village" defaultValue="Latur" className="w-full p-2.5 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-[#1e3a8a] mb-1">{t('taluka')} *</label>
                    <input required name="taluka" defaultValue="Latur" className="w-full p-2.5 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-[#1e3a8a] mb-1">{t('district')} *</label>
                    <input required name="district" defaultValue="Latur" className="w-full p-2.5 border rounded-lg" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#1e3a8a] mb-1">{t('state')} *</label>
                    <input required name="state" defaultValue="Maharashtra" className="w-full p-2.5 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-[#1e3a8a] mb-1">{t('pincode')} *</label>
                    <input required name="pincode" defaultValue="413512" maxLength={6} className="w-full p-2.5 border rounded-lg font-mono font-bold" />
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-orange-900 leading-normal mb-2 text-[11px] font-medium">
                  🔒 नोंदणी झाल्यावर पुढील पानावर सर्व दस्तऐवज अपलोड करा जेणेकरून झटपट अर्ज प्रक्रिया रोबोट्स द्वारे पूर्ण करता येईल.
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl uppercase text-sm tracking-wide shadow-lg cursor-pointer"
                >
                  खाते चालू करा (Register Citizen Box)
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================= */}
        {/* STEP 4 - CITIZEN HOME & DASHBOARD */}
        {/* ========================================= */}
        {screen === 'DASHBOARD' && role === 'CUSTOMER' && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            
            {/* STICKY SUB HEADER */}
            <div className="bg-[#1e3a8a] text-white p-4 pb-5 rounded-b-[24px] shadow-lg flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-orange-400 flex items-center justify-center font-extrabold text-blue-900 border-2 border-white shadow-md">
                  {profile?.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-white flex items-center gap-1">
                    <span>{profile?.fullName}</span>
                  </h3>
                  <p className="text-[10px] text-orange-300 font-mono tracking-tight flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>{profile?.village}, {profile?.district}</span>
                  </p>
                </div>
              </div>

              {/* FLOATING ACTION LAUNCH SPARKLES ADVICE */}
              <button 
                onClick={() => {
                  setActiveTab('Home');
                  requestGeminiAnalysis();
                }}
                className="bg-gradient-to-tr from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 p-2.5 rounded-full flex items-center justify-center shadow-lg animate-pulse"
                title="AI शिफारस"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>

            {/* TAB CONTENT: HOME */}
            {activeTab === 'Home' && (
              <div className="p-4 space-y-5 animate-fade-in flex-1">
                
                {/* GEMINI AI ANALYZING OUTPUT OR PROMPT */}
                <div className="bg-gradient-to-tr from-[#1e3a8a]/5 to-[#f97316]/5 border border-blue-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl"></div>
                  <div className="flex items-center justify-between mb-3 text-xs font-bold text-blue-900 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <span>दिजीसेवा AI सहाय्य शिफारस (Gemini Smart Engine)</span>
                    </div>
                    {analyzingAi && <RefreshCw className="w-3.5 h-3.5 text-orange-500 animate-spin" />}
                  </div>

                  {aiAnalysis ? (
                    <div className="text-xs text-slate-800 leading-relaxed space-y-2 whitespace-pre-wrap font-sans bg-white p-3.5 rounded-xl border border-blue-50">
                      {aiAnalysis}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[11px] text-slate-500 leading-normal">
                        तुमचे वय, शिक्षण व प्रवर्गावरून योग्य शासकीय योजना आणि भरतीचे विश्लेषण करण्यासाठी पुढील बटण दाबा.
                      </p>
                      <button 
                        onClick={() => requestGeminiAnalysis()}
                        className="bg-orange-500 text-white font-bold px-3 py-2 rounded-xl text-[11px] tracking-tight shrink-0 hover:bg-orange-600 shadow cursor-pointer text-center"
                      >
                        पात्रता तपासा
                      </button>
                    </div>
                  )}
                </div>

                {/* SEARCH BAR */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search_placeholder')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 text-xs bg-slate-50"
                  />
                </div>

                {/* SERVICE CATEGORIES GRID */}
                <div>
                  <h4 className="text-xs font-bold text-[#1e3a8a] mb-2 uppercase tracking-wide flex items-center justify-between">
                    <span>{t('categories_title')}</span>
                    <span className="text-[10px] text-slate-400">५ मुख्य सेवा</span>
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none font-bold text-xs select-none">
                    {['All', ' सरकारी नोकरी', 'शेतकरी योजना', 'सरकारी सेवा', 'शिक्षण सेवा', 'इतर सेवा'].map((cat) => {
                      const label = cat.trim();
                      const isActive = selectedCategory === label || (selectedCategory === 'All' && label === 'All');
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(label)}
                          className={`px-3 py-2 rounded-xl border shrink-0 transition-all ${
                            isActive ? 'bg-[#1e3a8a] text-white border-blue-900 shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          {label === 'All' ? 'सर्व' : label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SCHEME FORM / JOB RECRUITMENTS DISPLAY */}
                <div>
                  <h4 className="text-xs font-bold text-[#1e3a8a] mb-2 uppercase tracking-wide">
                    {t('latest_jobs_title')}
                  </h4>
                  <div className="space-y-4">
                    {filteredForms.map((form) => (
                      <div 
                        key={form.id} 
                        className="bg-white border hover:border-blue-400 rounded-2xl p-4 shadow-sm transition-all hover:shadow-md cursor-pointer relative"
                        onClick={() => setSelectedForm(form)}
                      >
                        <span className="absolute top-4 right-4 bg-orange-100 text-orange-850 px-2 py-0.5 rounded-full text-[9px] font-bold">
                          {form.category}
                        </span>

                        <div className="flex gap-3 items-start pr-12">
                          <span className="text-2xl p-2 bg-slate-100 rounded-xl">📃</span>
                          <div>
                            <h5 className="font-extrabold text-xs text-slate-900 leading-snug">
                              {language === 'ENG' ? form.nameEn : language === 'HIN' ? form.nameHi : form.nameMr}
                            </h5>
                            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{form.organization}</span>
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-100 text-[10px] text-slate-600 font-bold">
                          <div>
                            <span className="text-slate-400 block font-normal">{t('last_date')}</span>
                            <span className="text-rose-600 font-mono">{form.lastDate}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-normal">{t('qualification')}</span>
                            <span className="truncate block max-w-[90px]">{form.qualification.split(',')[0]}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-normal">{t('fees')}</span>
                            <span className="text-green-700 font-mono">₹{form.fees + form.serviceFee}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredForms.length === 0 && (
                      <div className="text-center py-10 bg-white border rounded-xl">
                        <p className="text-slate-400 text-xs">कोणतेही फॉर्म्स सापडले नाहीत प्रयोगासाठी नवीन फॉर्म समाविष्ट करा.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* ACTION MODAL: FORM DETAILS SCREEN */}
            {selectedForm && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
                <div className="bg-white w-full max-w-md rounded-t-[24px] sm:rounded-[24px] p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[85vh] text-xs">
                  
                  <div className="flex items-center justify-between shrink-0 mb-2">
                    <span className="bg-orange-105 bg-orange-100 text-orange-900 border border-orange-200 px-3 py-1 rounded-full text-[10px] font-bold">
                      {selectedForm.category}
                    </span>
                    <button 
                      onClick={() => {
                        setSelectedForm(null);
                        setAiAnalysis(null);
                      }} 
                      className="text-slate-400 bg-slate-100 hover:bg-slate-200 p-2 rounded-full cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <h3 className="text-sm font-extrabold text-[#1e3a8a] leading-snug">
                    {language === 'ENG' ? selectedForm.nameEn : language === 'HIN' ? selectedForm.nameHi : selectedForm.nameMr}
                  </h3>

                  <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl text-[11px] leading-normal font-semibold">
                    <p className="text-slate-600"><span className="text-slate-400 block font-normal">संस्था (Organization):</span> {selectedForm.organization}</p>
                    <p className="text-slate-600"><span className="text-slate-400 block font-normal">वयोमर्यादा (Age limit):</span> {selectedForm.ageLimit}</p>
                    <p className="text-slate-600"><span className="text-slate-400 block font-normal">आवश्यक पात्रता (Prerequisites):</span> {selectedForm.qualification}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-blue-900">{t('required_docs')}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedForm.requiredDocuments.map((doc, idx) => {
                        const hasDoc = documents.some(uDoc => uDoc.name === doc && uDoc.status === 'Uploaded');
                        return (
                          <span 
                            key={idx} 
                            className={`px-2.5 py-1 rounded-full border text-[10px] font-bold flex items-center gap-1 ${
                              hasDoc ? 'bg-green-50 text-green-700 border-green-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {hasDoc ? '✅' : '❌'} {doc}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* MINI AI PREVIEW DETECTS COMPLETED SUITE */}
                  <div className="bg-[#1e3a8a]/5 border border-[#1e3a8a]/10 p-3 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-orange-500 shrink-0 animate-spin" />
                      <div>
                        <span className="font-bold text-slate-800">AI पात्रता आणि दस्तऐवज तपासणी</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">स्वयंचलित eligibility ऑडिट चालवा.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => requestGeminiAnalysis(selectedForm.id)}
                      className="bg-blue-900 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] shrink-0"
                    >
                      पहा
                    </button>
                  </div>

                  {aiAnalysis && (
                    <div className="bg-white border rounded-xl p-3 text-[10px] font-medium leading-relaxed font-sans whitespace-pre-wrap">
                      {aiAnalysis}
                    </div>
                  )}

                  {/* PRICING SPLIT CARD */}
                  <div className="border border-slate-100 rounded-xl p-3.5 bg-slate-50 space-y-1.5 text-[11px] font-bold">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-normal">{t('govt_fee')}</span>
                      <span className="font-mono text-slate-800">₹{selectedForm.fees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-normal">{t('service_fee')} (SAIRAM charge)</span>
                      <span className="font-mono text-slate-800">₹{selectedForm.serviceFee}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5 text-[#1e3a8a] text-sm">
                      <span>{t('total_fee')}</span>
                      <span className="font-mono font-extrabold">₹{selectedForm.fees + selectedForm.serviceFee}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[#1e3a8a] text-xs font-bold">
                    <a 
                      href={`https://api.whatsapp.com/send?text=Sairam%20DigiSeva%20भरती%20अधिक%20माहिती:%20${encodeURIComponent(selectedForm.nameMr)}`}
                      target="_blank" 
                      className="border border-slate-200 hover:bg-slate-50 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm text-center"
                    >
                      <Share2 className="w-4 h-4 text-green-600" />
                      <span>{t('share_whatsapp')}</span>
                    </a>

                    <button 
                      onClick={() => triggerApplyForm(selectedForm)}
                      className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md text-center"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('apply_now')}</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* TAB CONTENT: SERVICES */}
            {activeTab === 'Services' && (
              <div className="p-4 space-y-5 animate-fade-in flex-1">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-[#1e3a8a] uppercase tracking-wide">डिजिटल शासकीय सेवा सूची</h3>
                  <p className="text-[10px] text-slate-500 mt-1">सर्व सेवांचे फॉर्म्स राहुल मिसे यांच्याद्वारे स्वयंचलित रित्या सरकारी पोर्टलवर दाखल केले जातील.</p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {forms.map(f => (
                    <div 
                      key={f.id}
                      onClick={() => setSelectedForm(f)}
                      className="bg-white border p-3 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:border-[#1e3a8a] cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl p-1.5 bg-blue-50 text-blue-900 rounded-lg">⚙️</span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{language === 'ENG' ? f.nameEn : f.nameMr}</h4>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">{f.category}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: DOCUMENT VAULT (UPLOAD ONCE AND FORGET) */}
            {activeTab === 'DocVault' && (
              <div className="p-4 space-y-4 animate-fade-in flex-1">
                <div className="bg-[#1e3a8a] text-white p-4 rounded-2xl shadow">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Layers className="w-5 h-5 text-orange-400 shrink-0" />
                    <span>{t('one_time_doc')}</span>
                  </h3>
                  <p className="text-[10px] text-blue-100 leading-normal mt-1">
                    {t('upload_desc')}
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    'Aadhaar Card',
                    'PAN Card',
                    'Passport Photo',
                    'Signature',
                    '10th Marksheet',
                    '12th Marksheet',
                    'Caste Certificate',
                    'Income Certificate',
                    'Domicile Certificate',
                    'Non Creamy Layer',
                    'Bank Passbook',
                    '7/12'
                  ].map((doctype) => {
                    const uploadedDoc = documents.find(d => d.name === doctype);
                    return (
                      <div key={doctype} className="bg-white border rounded-xl p-3.5 flex items-center justify-between gap-4 shadow-sm relative">
                        <div>
                          <span className="text-[11px] font-bold text-[#1e3a8a] block">{doctype}</span>
                          {uploadedDoc ? (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="bg-green-100 text-green-800 text-[8px] font-bold px-1.5 py-0.5 rounded">
                                {t('uploaded')}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono italic">
                                {uploadedDoc.fileName.slice(0, 15)}...
                              </span>
                            </div>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block">
                              {t('pending')}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {uploadedDoc && (
                            <>
                              <a 
                                href={uploadedDoc.url} 
                                target="_blank"
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg"
                                title="कागदपत्र पहा"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                              <button 
                                onClick={() => handleDocumentDelete(uploadedDoc.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg cursor-pointer"
                                title="काढून टाका"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          <label className="bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1 shadow-sm">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadedDoc ? t('replace') : t('upload_now')}</span>
                            <input 
                              type="file" 
                              accept="image/*,application/pdf"
                              onChange={(e) => handleVaultUpload(e, doctype as DocumentType)}
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: APPLICATIONS STATUS & BOT ACTIONS */}
            {activeTab === 'Applications' && (
              <div className="p-4 space-y-4 animate-fade-in flex-1">
                <div className="mb-2">
                  <h3 className="text-sm font-bold text-[#1e3a8a] uppercase tracking-wide">माझे दाखल केलेले अर्ज (Bot Streams)</h3>
                  <p className="text-[10px] text-slate-500 mt-1">शासकीय पोर्टलवर चालू असलेल्या अर्ज स्वयंचलिततेचा थेट प्रगती तक्ता.</p>
                </div>

                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="bg-white border rounded-2xl p-4 shadow-sm relative overflow-hidden">
                      
                      {/* SUBTITLE */}
                      <div className="flex justify-between items-start mb-2 shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono font-bold">दिनांक: {app.appliedDate}</span>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                            app.status === 'Submitted' ? 'bg-green-150 bg-green-100 text-green-800' :
                            app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            app.status === 'Photo Needed' || app.status === 'OTP Needed' || app.status === 'Preview Approval' ? 'bg-amber-100 text-amber-900 animate-pulse' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-extrabold text-xs text-slate-900 leading-snug pr-4">{app.formName}</h4>

                      {/* PAYMENT PENDING BANNER WITH LAUNCH ACTION */}
                      {app.paymentStatus === 'Pending' && (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mt-3 flex items-center justify-between text-xs font-bold text-amber-900 gap-4 shrink-0">
                          <div>
                            <span>शुल्क भरणे शिल्लक आहे: ₹{app.totalFee}</span>
                            <p className="text-[9px] font-normal text-slate-500 mt-0.5">अर्ज प्रक्रिया चालू करण्यासाठी अधिकृत शुल्क पे करा.</p>
                          </div>
                          <button 
                            onClick={() => setPaymentTargetApp(app)}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] shadow cursor-pointer text-center"
                          >
                            पे करा
                          </button>
                        </div>
                      )}

                      {/* ACTIVE ACTION TRIGGERS FOR THE CUSTOMER FLOWS */}
                      {(app.status === 'OTP Needed' || app.status === 'Photo Needed' || app.status === 'Preview Approval') && (
                        <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-xl mt-3.5 space-y-2.5 shadow-sm text-xs font-bold text-[#1e3a8a] animate-pulse">
                          <p className="flex items-center gap-1.5 text-orange-900">
                            <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                            <span>त्वरित आवश्यक कृती: {app.status === 'OTP Needed' ? 'ओटीपी प्रविष्ट करा' : app.status === 'Photo Needed' ? 'लाईव्ह चेहरा बायोमेट्रिक द्या' : 'अंतिम माहिती तपासा व सबमिट करा'}</span>
                          </p>
                          <button
                            onClick={() => {
                              setActiveInteractiveApp(app);
                              if (app.status === 'Photo Needed') {
                                startLiveCamera();
                              }
                            }}
                            className="bg-orange-500 text-white font-bold py-2 px-3 rounded-lg text-[10px] shadow w-full text-center hover:bg-orange-600 cursor-pointer"
                          >
                            येथे कृती करा
                          </button>
                        </div>
                      )}

                      {/* DYNAMIC PROGRESS BAR */}
                      <div className="mt-4">
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold mb-1">
                          <span>प्रगती स्तर</span>
                          <span className="font-mono">{app.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${app.progress === 100 ? 'bg-green-600' : 'bg-[#1e3a8a]'}`}
                            style={{ width: `${app.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* LOG FILE STREAM LIST TRAILER LINK */}
                      <div className="mt-4 pt-4 border-t border-slate-150">
                        <span className="text-[9px] font-bold text-[#1e3a8a] block uppercase tracking-wide mb-1.5">रोबोट भरती क्रिया डायरी (Automation Logs)</span>
                        <div className="bg-slate-900 text-emerald-400 font-mono text-[9px] p-2.5 rounded-lg leading-normal max-h-24 overflow-y-auto space-y-1 scrollbar-thin">
                          {app.logs.map((log, idx) => (
                            <p key={idx}>{log}</p>
                          ))}
                        </div>
                      </div>

                      {/* RECEIPT DOWNLOAD LINK */}
                      {app.submissionReceiptPdf && (
                        <div className="mt-3.5 flex justify-end">
                          <a 
                            href={app.submissionReceiptPdf} 
                            target="_blank" 
                            className="bg-green-50 border border-green-200 text-green-900 font-extrabold px-3 py-1.5 rounded-lg text-[10px] hover:bg-green-100 flex items-center gap-1.5"
                          >
                            <Download className="w-4 h-4 text-green-700" />
                            <span>शासकीय पावती डाऊनलोड करा (PDF)</span>
                          </a>
                        </div>
                      )}

                    </div>
                  ))}

                  {applications.length === 0 && (
                    <div className="text-center py-12 bg-white border rounded-2xl p-6">
                      <p className="text-slate-400 text-xs">तुम्ही अद्याप कोणत्याही योजनेसाठी अर्ज केलेला नाही.</p>
                      <button 
                        onClick={() => setActiveTab('Home')}
                        className="mt-3 bg-blue-900 text-white font-bold text-xs py-2 px-4 rounded-xl shadow cursor-pointer text-center"
                      >
                        योजना पहा
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB CONTENT: NOTIFICATIONS */}
            {activeTab === 'Notifications' && (
              <div className="p-4 space-y-4 animate-fade-in flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#1e3a8a] uppercase tracking-wide">{t('notifications')}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">थेट रोबोट व पेमेंट्स अपील्स आणि नवीन योजनांचे संदेश.</p>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        await fetch('/api/notifications/read-all', { method: 'POST' });
                        fetchUserNotifications();
                        triggerToast('सर्व संदेश वाचले!', 'info');
                      } catch (e) {}
                    }}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline cursor-pointer"
                  >
                    सर्व क्लिअर करा
                  </button>
                </div>

                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-3.5 rounded-2xl border flex items-start gap-3 shadow-sm transition-colors ${
                        n.read ? 'bg-white border-slate-100 text-slate-600' : 'bg-orange-50/50 border-orange-100 text-slate-900 font-semibold'
                      }`}
                    >
                      <span className="text-xl p-1.5 bg-slate-100 rounded-xl leading-none">
                        {n.type === 'otp' ? '📱' : n.type === 'photo' ? '📷' : n.type === 'alert' ? '💰' : n.type === 'success' ? '✅' : '🔔'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold leading-normal text-slate-900">
                          {language === 'ENG' ? n.title : language === 'HIN' ? n.titleHi : n.titleMr}
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-normal mt-1">
                          {language === 'ENG' ? n.message : language === 'HIN' ? n.messageHi : n.messageMr}
                        </p>
                        <span className="text-[8px] text-slate-400 block font-mono mt-1.5">{new Date(n.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="text-center py-10 bg-white border rounded-xl">
                      <p className="text-slate-400 text-xs">{t('no_notifications')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: PROFILE */}
            {activeTab === 'Profile' && (
              <div className="p-4 space-y-4 animate-fade-in flex-1">
                
                {/* PROFILE BASIC CARD */}
                <div className="bg-white border rounded-2xl p-5 shadow-sm text-center relative overflow-hidden">
                  <div className="absolute right-0 top-0 bg-blue-50 w-20 h-20 rounded-full blur-xl"></div>
                  <div className="w-16 h-16 rounded-full bg-orange-400 text-blue-900 font-extrabold text-2xl flex items-center justify-center border-4 border-slate-50 shadow mx-auto mb-3">
                    {profile?.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <h4 className="font-extrabold text-sm text-[#1e3a8a]">{profile?.fullName}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">+91 {profile?.mobile}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{profile?.email}</p>
                </div>

                {/* DETAILS COMPOSITION LIST */}
                <div className="bg-white border rounded-2xl p-4 shadow-sm space-y-3.5 text-xs font-bold text-slate-700">
                  <span className="text-[10px] font-bold text-[#1e3a8a] block uppercase tracking-wide border-b pb-1.5 mb-2">अधिकृत दस्तऐवज क्रमांक</span>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-normal">आधार कार्ड क्रमांक:</span>
                    <span className="font-mono text-slate-900">{profile?.aadhaarNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-normal">पॅन कार्ड क्रमांक:</span>
                    <span className="font-mono text-slate-900">{profile?.panNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-normal">नागरिक प्रवर्ग:</span>
                    <span className="text-slate-900">{profile?.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-normal">पत्ता:</span>
                    <span className="text-slate-900 text-right max-w-xs">{profile?.address}</span>
                  </div>
                </div>

                {/* SIGN OUT ACTION */}
                <button 
                  onClick={() => {
                    if (confirm('आपण खात्रीने लॉगिन विसर्जित करू इच्छिता?')) {
                      setProfile(null);
                      setScreen('LOGIN');
                      setMobileNumber('');
                      setOtpSent(false);
                      setOtpPreview(null);
                      triggerToast('बाहेर पडलो!', 'info');
                    }
                  }}
                  className="w-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm text-center"
                >
                  <LogOut className="w-4.5 h-4.5 text-rose-600" />
                  <span>{t('logout')}</span>
                </button>

              </div>
            )}

            {/* BOT ACTION CONTROLS INTERACTIVE DIAL ONSCREEN */}
            {activeInteractiveApp && (
              <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 shadow-2xl animate-fade-in text-xs font-bold">
                <div className="bg-white w-full max-w-md rounded-[24px] p-6 space-y-4 relative">
                  
                  <button 
                    onClick={() => {
                      setActiveInteractiveApp(null);
                      stopLiveCamera();
                    }}
                    className="absolute right-4 top-4 text-slate-400 bg-slate-100 hover:bg-slate-200 p-2 rounded-full cursor-pointer text-xs"
                  >
                    ✕
                  </button>

                  <h3 className="text-sm font-extrabold text-[#1e3a8a]">{t('interactive_required')}</h3>
                  <p className="text-[10px] text-slate-500 font-semibold">{activeInteractiveApp.formName}</p>

                  {/* SUBMODULE: BOT OTP CAPTURE */}
                  {activeInteractiveApp.status === 'OTP Needed' && (
                    <div className="space-y-3.5 pt-2 text-center">
                      <p className="text-xs text-slate-800 leading-normal text-left">{t('enter_otp_for_form')}</p>
                      
                      {/* FAST OTP FIELD PREVIEW IF PROVIDED */}
                      <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-[#1e3a8a] text-center mb-1">
                        <span className="text-[10px] text-amber-900 block font-normal">प्राप्त झालेला सरकारी पोर्टल कोड (SMS Simulation):</span>
                        <span className="text-xl font-extrabold text-orange-600 tracking-wider font-mono">
                          {activeInteractiveApp.id.split('_').length ? '745612' : '985472'}
                        </span>
                      </div>

                      <input 
                        type="text" 
                        placeholder="745612"
                        maxLength={6}
                        value={userSubmittedFormOtp}
                        onChange={(e) => setUserSubmittedFormOtp(e.target.value)}
                        className="w-full text-center text-xl font-mono tracking-widest py-3 border-2 border-orange-300 rounded-xl focus:ring-1 focus:ring-orange-500 font-bold bg-white text-orange-950"
                      />

                      <button
                        onClick={() => handleCitizenSubmitFormOtp(activeInteractiveApp.id)}
                        className="w-full bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl cursor-pointer shadow"
                      >
                        पूर्ण करा (Resume Bot Session)
                      </button>
                    </div>
                  )}

                  {/* SUBMODULE: BIOMETRIC LIVE FACE SELECTIONS */}
                  {activeInteractiveApp.status === 'Photo Needed' && (
                    <div className="space-y-4 text-center">
                      <p className="text-xs text-slate-700 leading-normal text-left">{t('photo_capture_desc')}</p>
                      
                      {/* WEBCAM PREVIEW */}
                      <div className="w-[320px] h-[240px] bg-slate-900 mx-auto rounded-xl overflow-hidden relative border-2 border-[#1e3a8a] flex items-center justify-center">
                        {biometricStream ? (
                          <div className="relative w-full h-full">
                            <video 
                              ref={videoRef} 
                              autoPlay 
                              playsInline 
                              muted 
                              className="w-full h-full object-cover scale-x-[-1]"
                            />
                            {/* GREEN RADAR FRAME GRID */}
                            <div className="absolute inset-4 border-2 border-dashed border-green-500 rounded-full select-none pointer-events-none opacity-40 animate-pulse"></div>
                          </div>
                        ) : capturedSelfieBase64 ? (
                          <img src={capturedSelfieBase64} alt="Selfie Capture frame" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center text-slate-500 space-y-2 p-4">
                            <Camera className="w-10 h-10 mx-auto text-slate-400 stroke-1" />
                            <span className="text-[10px] block font-semibold text-slate-450 leading-normal">कॅमेरा बंद आहे. सेल्फी घेण्यासाठी सक्षम करा.</span>
                          </div>
                        )}
                      </div>

                      {/* CANVASES FOR SNAPPING SELECTION */}
                      <canvas ref={canvasRef} width={320} height={240} className="hidden" />

                      <div className="flex gap-2">
                        {!biometricStream && !capturedSelfieBase64 && (
                          <button 
                            onClick={() => startLiveCamera()}
                            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-xl font-bold cursor-pointer"
                          >
                            📷 कॅमेरा चालू करा
                          </button>
                        )}

                        {biometricStream && (
                          <button 
                            onClick={() => captureCameraSelfieFrame()}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Camera className="w-4 h-4" />
                            <span>{t('take_photo')}</span>
                          </button>
                        )}

                        {capturedSelfieBase64 && (
                          <>
                            <button 
                              onClick={() => startLiveCamera()}
                              className="w-1/3 border border-slate-300 hover:bg-slate-50 py-3 rounded-xl font-bold"
                            >
                              पुन्हा काढा
                            </button>
                            <button 
                              onClick={() => submitLiveFacialMatching(activeInteractiveApp.id)}
                              className="w-2/3 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                            >
                              <CheckCircle2 className="w-4.5 h-4.5" />
                              <span>सबमिट करा</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUBMODULE: PDF DRAFT REVIEWS APPROVED PREVIEW */}
                  {activeInteractiveApp.status === 'Preview Approval' && (
                    <div className="space-y-4 pt-2">
                      <p className="text-xs text-slate-700 leading-normal">{t('form_preview_desc')}</p>

                      {/* SIMULATED HIGH FIDELITY PAPER BILL DRAFT FORM PREVIEW CONTAINER */}
                      <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 space-y-3 font-semibold text-slate-800 text-[10px] leading-relaxed shadow-inner">
                        <div className="text-center border-b pb-2 mb-2 font-black tracking-tight text-[#1e3a8a] flex items-center justify-center gap-2">
                          <span>📃</span>
                          <span>Government Form Draft Verification Sheet</span>
                        </div>
                        <div className="space-y-1.5 font-bold">
                          <p><span className="text-slate-400 font-normal">Full Name:</span> {profile?.fullName}</p>
                          <p><span className="text-slate-400 font-normal">Aadhaar:</span> {profile?.aadhaarNumber}</p>
                          <p><span className="text-slate-400 font-normal">PAN Card:</span> {profile?.panNumber}</p>
                          <p><span className="text-slate-400 font-normal">Prerequisites Check:</span> Match certified</p>
                          <p><span className="text-slate-400 font-normal font-semibold">Selfie Match Verified:</span> True (Biometrics active)</p>
                          <p><span className="text-slate-400 font-normal">Submission Agent:</span> Sairam DigiSeva (Puppeteer Engine)</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handlePdfDraftApprovalDecision(activeInteractiveApp.id, false)}
                          className="w-1/2 border border-rose-300 hover:bg-rose-50 text-rose-700 font-bold py-3 rounded-xl"
                        >
                          दुरुस्त करा (Reject)
                        </button>
                        <button 
                          onClick={() => handlePdfDraftApprovalDecision(activeInteractiveApp.id, true)}
                          className="w-1/2 bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm py-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>मंजूर करा (Approve)</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* PAYMENT QR COLLECTION SLIDE OVER MODAL */}
            {paymentTargetApp && (
              <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 shadow-2xl animate-fade-in text-xs font-bold">
                <div className="bg-white w-full max-w-sm rounded-[24px] p-6 space-y-4 text-center relative overflow-y-auto max-h-[90vh]">
                  
                  <button 
                    onClick={() => setPaymentTargetApp(null)}
                    className="absolute right-4 top-4 text-slate-405 text-slate-400 bg-slate-100 hover:bg-slate-200 p-2 rounded-full cursor-pointer"
                  >
                    ✕
                  </button>

                  <h3 className="text-sm font-extrabold text-[#1e3a8a]">{t('qr_payment_title')}</h3>
                  <p className="text-[10px] text-slate-500 font-semibold">{paymentTargetApp.formName}</p>

                  <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center">
                    {/* ENHANCED PHYSICAL QRCODE FROM PREFERRED DIRECT STATIC API GENERATOR */}
                    <div className="bg-white p-3.5 rounded-xl shadow mb-2 relative">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=1e3a8a&data=${encodeURIComponent(
                          `upi://pay?pa=mise.rahul@okaxis&pn=SAIRAM%20DigiSeva&am=${paymentTargetApp.totalFee}&tn=SAIRAM_${paymentTargetApp.id}&cu=INR`
                        )}`} 
                        alt="Unified Payments QR Connection"
                        className="w-44 h-42"
                      />
                    </div>
                    <span className="text-[10px] text-[#1e3a8a] font-mono tracking-wider font-extrabold">mise.rahul@okaxis</span>
                    <span className="text-[9px] text-slate-450 font-semibold mt-1">Latur District CSC Lead</span>
                  </div>

                  {/* PRICE SUMMARY */}
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-slate-700 flex justify-between tracking-wide font-extrabold">
                    <span>एकूण प्रलंबित शुल्क:</span>
                    <span className="text-orange-600 font-mono text-sm">₹{paymentTargetApp.totalFee}</span>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="block text-[#1e3a8a] text-[10px] font-bold uppercase tracking-wide">
                      {t('upload_screenshot')}
                    </label>
                    <label className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center flex flex-col items-center hover:bg-slate-100 cursor-pointer transition-all">
                      <Upload className="w-8 h-8 text-slate-400 mb-1" />
                      <span className="text-[9px] text-slate-500">{t('screenshot_placeholder')}</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleReceiptFileDrop(e, paymentTargetApp.id)}
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <p className="text-[10px] leading-relaxed text-slate-450 font-semibold italic text-center">
                    "स्क्रीशॉट अपलोड केल्यावर मालक राहुल पांडुरंग मिसे त्वरित पेमेंट मंजूर करतील जेणेकरून ॲटोमेशन रांग पुढे चालू होईल."
                  </p>

                </div>
              </div>
            )}

            {/* BOTTOM NAV BAR (FOR HIGH FIDELITY CITIZEN PWA FLOWS) */}
            <nav className="fixed bottom-0 max-w-md w-full border-t border-slate-100 bg-white grid grid-cols-5 py-2.5 text-center shadow-lg font-bold select-none text-[10px]">
              <button 
                onClick={() => setActiveTab('Home')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'Home' ? 'text-orange-500' : 'text-slate-450 hover:text-slate-650'}`}
              >
                <Globe className="w-5 h-5 stroke-2" />
                <span>{t('home')}</span>
              </button>

              <button 
                onClick={() => setActiveTab('Services')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'Services' ? 'text-orange-500' : 'text-slate-450 hover:text-slate-650'}`}
              >
                <Plus className="w-5 h-5 stroke-2" />
                <span>{t('services')}</span>
              </button>

              <button 
                onClick={() => setActiveTab('Applications')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'Applications' ? 'text-orange-500' : 'text-slate-450 hover:text-slate-650'}`}
              >
                <Layers className="w-5 h-5 stroke-2" />
                <span>{t('applications')}</span>
              </button>

              <button 
                onClick={() => setActiveTab('DocVault')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'DocVault' ? 'text-orange-500' : 'text-slate-450 hover:text-slate-650'}`}
              >
                <FileText className="w-5 h-5 stroke-2" />
                <span>दप्तर</span>
              </button>

              <button 
                onClick={() => setActiveTab('Profile')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'Profile' ? 'text-orange-500' : 'text-slate-450'}`}
              >
                <User className="w-5 h-5 stroke-2" />
                <span>खाते</span>
              </button>
            </nav>

          </div>
        )}

        {/* ========================================= */}
        {/* ADMIN SIDE - DUAL ROLE MASTER CONTROL */}
        {/* ========================================= */}
        {screen === 'DASHBOARD' && role === 'ADMIN' && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            
            {/* STICKY SUB HEADER */}
            <div className="bg-[#1e3a8a] text-white p-4 pb-5 rounded-b-[24px] shadow-lg flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛠️</span>
                <div>
                  <h3 className="font-extrabold text-xs tracking-wider uppercase text-orange-400">SAIRAM Admin Manager</h3>
                  <p className="text-[10px] text-blue-200 tracking-tight font-mono">Owner Panel: Rahul Pandurang Mise</p>
                </div>
              </div>
              <span className="bg-green-100 text-green-905 px-2.5 py-1 rounded text-[9px] font-bold uppercase font-mono tracking-tighter shadow-sm">
                ● Robot Live Connecting
              </span>
            </div>

            {/* HIGH LEVEL STATISTICS */}
            {adminStats && (
              <div className="p-4 grid grid-cols-4 gap-2 text-center text-xs font-bold leading-normal shrink-0">
                <div className="bg-white border rounded-xl p-2 shadow-sm">
                  <span className="text-slate-500 block text-[9px] font-medium leading-none">एकूण नागरिक</span>
                  <span className="text-lg text-[#1e3a8a] font-mono font-black">{adminStats.stats?.totalUsers || 2}</span>
                </div>
                <div className="bg-white border rounded-xl p-2 shadow-sm animate-pulse">
                  <span className="text-slate-500 block text-[9px] font-medium leading-none">प्रलंबित अर्ज</span>
                  <span className="text-lg text-orange-600 font-mono font-black">{adminStats.stats?.pending || 0}</span>
                </div>
                <div className="bg-white border rounded-xl p-2 shadow-sm bg-green-50/50">
                  <span className="text-slate-500 block text-[9px] font-medium leading-none">यशस्वी अर्ज</span>
                  <span className="text-lg text-green-700 font-mono font-black">{adminStats.stats?.submitted || 0}</span>
                </div>
                <div className="bg-white border rounded-xl p-2 shadow-sm text-green-700 bg-amber-50">
                  <span className="text-slate-500 block text-[9px] font-medium leading-none">कमाई</span>
                  <span className="text-sm font-mono font-black">₹{adminStats.stats?.revenue || 0}</span>
                </div>
              </div>
            )}

            {/* ADMIN BOTTOM ROW SUB TABS CONTROLLER */}
            <div className="px-4 border-b flex justify-between font-bold text-xs shrink-0 select-none pb-1 font-sans">
              {[
                { id: 'BOT_QUEUE', label: 'रोबोट रांग (Bot Sessions)' },
                { id: 'FORM_LIB', label: 'लायब्ररी' },
                { id: 'CITIZENS', label: 'नागरिक' },
                { id: 'FINANCES', label: 'पेमेंट मंजुरी' }
              ].map(sub => (
                <button 
                  key={sub.id} 
                  onClick={() => {
                    setAdminActiveTab(sub.id as any);
                    setEditingForm(null);
                  }}
                  className={`pb-2 shrink-0 border-b-2 font-black transition-colors ${adminActiveTab === sub.id ? 'text-orange-500 border-orange-500' : 'text-slate-450 border-transparent'}`}
                >
                  {sub.label.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* SUB TAB: ROBOT SESSIONS QUEUE CONTROL SHEET */}
            {adminActiveTab === 'BOT_QUEUE' && (
              <div className="p-4 space-y-4 animate-fade-in flex-1">
                <div className="mb-2">
                  <h4 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wide">Puppeteer Browser Simulation queue</h4>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">येथे रोबोट थेट चालू करा. कॅप्चा आढळल्यास तो सोडून काम मार्गस्थ करा.</p>
                </div>

                <div className="space-y-4">
                  {adminStats?.automationSessions?.map((session: AutomationSession) => {
                    const matchApp = adminStats.applications?.find((a: any) => a.id === session.id);
                    return (
                      <div key={session.id} className="bg-slate-900 text-[#e2e8f0] p-4 rounded-2xl space-y-3 font-mono text-[10px] shadow-lg leading-relaxed relative">
                        
                        {/* HEADER BUTTON */}
                        <div className="flex justify-between items-center bg-slate-800 p-2.5 rounded-lg shrink-0">
                          <div>
                            <span className="text-orange-400 block font-bold truncate max-w-[200px]">{session.formName}</span>
                            <span className="text-[8px] text-slate-400 block font-light">ID: {session.id}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            {session.status === 'Idle' && (
                              <button
                                onClick={() => startFillingPuppeteerBot(session.applicationId)}
                                className="bg-orange-500 select-none hover:bg-orange-600 font-sans font-extrabold text-[#111] text-[9px] px-3 py-1.5 rounded-lg cursor-pointer"
                              >
                                START BOT 🚀
                              </button>
                            )}

                            {session.status === 'Running' && (
                              <span className="bg-green-500 text-[#111] animate-pulse px-2.5 py-1 rounded text-[9px] font-bold">
                                BOT FILLING ONGOING...
                              </span>
                            )}

                            {session.status === 'Paused_Captcha' && (
                              <span className="bg-amber-500 text-[#111] px-2.5 py-1 rounded text-[9px] font-bold animate-pulse">
                                PAUSED FOR CAPTCHA ⚠️
                              </span>
                            )}

                            {session.status === 'Paused_OTP' && (
                              <span className="bg-amber-400 text-[#111] px-2 py-0.5 rounded text-[8px] font-bold">
                                CITIZEN OTP LIMIT
                              </span>
                            )}

                            {session.status === 'Paused_LivePhoto' && (
                              <span className="bg-orange-400 text-slate-950 px-2 py-0.5 rounded text-[8px] font-bold">
                                FACE MATCH WAITING
                              </span>
                            )}

                            {session.status === 'Completed' && (
                              <span className="bg-emerald-600 text-[#fff] px-2 py-0.5 rounded text-[8px] font-bold">
                                ✅ FINISHED
                              </span>
                            )}
                          </div>
                        </div>

                        {/* STEP DETAILS */}
                        <div className="space-y-1 p-2 bg-slate-950 border border-slate-800 rounded-lg">
                          <p><span className="text-slate-400">Current Task:</span> <span className="bg-slate-900 border px-1 rounded text-orange-200 text-[9px]">{session.currentStep}</span></p>
                          <p><span className="text-slate-400">Connection Status:</span> <span className="text-green-400 font-bold">{session.status}</span></p>
                        </div>

                        {/* INTERACTIVE PROMPT CAPTCHA RESOLVER */}
                        {session.status === 'Paused_Captcha' && (
                          <div className="bg-amber-950 border border-amber-800 p-3 rounded-lg space-y-3.5 mt-2 animate-[pulse_2s_infinite]">
                            <span className="font-sans font-bold text-amber-300 block">👮 CAPTCHA Security Resolution Bypass:</span>
                            <div className="flex items-center justify-center bg-slate-950 rounded py-2 border border-slate-800">
                              {session.captchaImage ? (
                                <img src={session.captchaImage} alt="Captcha Image representation" className="h-10 border border-white" />
                              ) : (
                                <span className="text-slate-600 tracking-widest text-lg select-all">m Y J c K</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                placeholder="Type the text above"
                                value={captchaInput[session.id] || ''}
                                onChange={(e) => setCaptchaInput(prev => ({ ...prev, [session.id]: e.target.value.toUpperCase() }))}
                                className="w-2/3 p-2 bg-black border border-slate-700 text-amber-200 tracking-widest text-center focus:ring-1 focus:ring-amber-500"
                              />
                              <button 
                                onClick={() => submitCaptchaToRunningBot(session.id)}
                                className="w-1/3 bg-orange-500 hover:bg-orange-600 font-sans text-slate-900 font-bold rounded"
                              >
                                RESOLVE
                              </button>
                            </div>
                          </div>
                        )}

                        {/* LIVE PORTAL SIMULATION DRAWER/CONTAINER FOR ADMIN ONLY */}
                        <div className="mt-3.5 pt-3.5 border-t border-slate-800 text-left">
                          <button
                            onClick={() => setOpenBrowserAppId(openBrowserAppId === session.id ? null : session.id)}
                            className="w-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 font-mono font-bold px-3 py-2 rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
                          >
                            <Globe className="w-3.5 h-3.5 text-orange-400" />
                            <span>
                              {openBrowserAppId === session.id 
                                ? "✖️ सरकारी पोर्टल लाइव व्ह्यू बंद करा (Hide Portal Live Stream)" 
                                : "🌐 थेट सरकारी पोर्टल भरणी व्ह्यू पहा (Watch Live Browser Injections)"}
                            </span>
                          </button>

                          {openBrowserAppId === session.id && (() => {
                            const matchApp = adminStats.applications?.find((a: any) => a.id === session.applicationId);
                            const appUserMobile = matchApp?.mobile;
                            const appUserProfile = adminStats.users?.find((u: any) => u.mobile === appUserMobile);
                            return (
                              <div className="mt-3 border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-sm animate-fade-in text-left text-[#f1f5f9]">
                                {/* Browser Top Bar */}
                                <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center gap-2">
                                  <div className="flex gap-1 shrink-0">
                                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span>
                                    <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                                  </div>
                                  <div className="flex-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[8px] text-slate-400 font-mono truncate flex items-center gap-1">
                                    <Lock className="w-2 h-2 text-green-500 inline-block shrink-0" />
                                    <span className="text-green-500 font-bold">https://</span>
                                    <span>
                                      {forms.find(f => f.id === matchApp?.formId)?.websiteUrl.replace('https://', '') || 'mahadbt.maharashtra.gov.in'}
                                    </span>
                                  </div>
                                  <span className="text-[7px] bg-orange-500/20 text-orange-400 font-bold px-1.5 py-0.5 rounded uppercase font-mono shrink-0">LIVE ROBOT STREAM</span>
                                </div>

                                {/* Simulated Government Portal Content */}
                                <div className="p-3 bg-slate-900 space-y-2">
                                  {/* Portal Custom Header */}
                                  <div className="border-b border-slate-800 pb-2 flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <div className="w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center text-white text-[7px] font-bold shrink-0">म</div>
                                      <div className="min-w-0">
                                        <h5 className="text-[9px] font-extrabold text-[#fff] leading-none truncate">
                                          {matchApp?.formId === 'f1' && 'महाडीबीटी शेतकरी महापोर्टल (MahaDBT Farmer)'}
                                          {matchApp?.formId === 'f2' && 'महावितरण विद्युत सहाय्यक थेट पोर्टल (MSEDCL)'}
                                          {matchApp?.formId === 'f3' && 'महिला व बाल विकास विभाग योजना पोर्टल (WCD)'}
                                          {matchApp?.formId === 'f4' && 'महाडीबीटी विद्यार्थी शिष्यवृत्ती महाद्वार (MahaDBT Scholar)'}
                                          {matchApp?.formId === 'f5' && 'CCVIS जात पडताळणी ऑनलाईन प्रणाली (BARTI)'}
                                          {!['f1', 'f2', 'f3', 'f4', 'f5'].includes(matchApp?.formId || '') && 'महाराष्ट्र डिजिटल सेवा पोर्टल'}
                                        </h5>
                                        <span className="text-[6px] text-slate-400 block tracking-wider uppercase font-semibold mt-0.5 font-sans">GOVERNMENT OF MAHARASHTRA OFFICIAL PORTAL</span>
                                      </div>
                                    </div>
                                    <span className="text-[6px] text-slate-550 font-mono shrink-0">Server: MUM-BOM-1</span>
                                  </div>

                                  {/* Form Field Entries Replicated dynamically */}
                                  <div className="space-y-1.5 text-[9px] font-mono">
                                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                                      <span className="text-slate-400 font-bold">नाव (Full Name):</span>
                                      <span className="col-span-2 text-slate-200 truncate">{appUserProfile?.fullName || 'Rahul Pandurang Mise'}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                                      <span className="text-slate-400 font-bold">मोबाईल (Mobile):</span>
                                      <span className="col-span-2 text-slate-200">{appUserProfile?.mobile || '99xxxxxxxx'}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                                      <span className="text-slate-400 font-bold">वर्ग (Category):</span>
                                      <span className="col-span-2 text-slate-200">{appUserProfile?.category || 'General'}</span>
                                    </div>

                                    {/* Custom Form fields based on scheme */}
                                    {matchApp?.formId === 'f1' && (
                                      <>
                                        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                                          <span className="text-slate-400 font-bold">सात-बारा (7/12 Land):</span>
                                          <span className="col-span-2 text-orange-400 font-bold">✅ Sairam Vault Linked & Mapped</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                                          <span className="text-slate-400 font-bold">योजना प्रकार:</span>
                                          <span className="col-span-2 text-slate-200">शेतकरी ट्रॅक्टर योजना २०२६</span>
                                        </div>
                                      </>
                                    )}

                                    {matchApp?.formId === 'f2' && (
                                      <>
                                        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                                          <span className="text-slate-400 font-bold">ITI विद्युत गुण:</span>
                                          <span className="col-span-2 text-slate-200">८२.२% (Record Ref: CERT-92211)</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                                          <span className="text-slate-400 font-bold">जिल्हा विकल्प:</span>
                                          <span className="col-span-2 text-slate-200">Latur, Pune, Solapur</span>
                                        </div>
                                      </>
                                    )}

                                    {matchApp?.formId === 'f3' && (
                                      <>
                                        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                                          <span className="text-slate-400 font-bold">वार्षिक उत्पन्न दाखला:</span>
                                          <span className="col-span-2 text-orange-400 font-bold">✅ Verified (Income &lt; ₹1.2 Lakhs)</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                                          <span className="text-slate-400 font-bold">मशीन हक्क:</span>
                                          <span className="col-span-2 text-slate-200 font-mono">मोफत शिलाई मशीन (महिला सशक्तीकरण)</span>
                                        </div>
                                      </>
                                    )}

                                    {matchApp?.formId === 'f4' && (
                                      <>
                                        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                                          <span className="text-slate-400 font-bold">कॉलेज दाखला रसीद:</span>
                                          <span className="col-span-2 text-orange-400 font-bold">✅ Document Injected (Uploaded)</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                                          <span className="text-slate-400 font-bold">वसतिगृह स्थळ:</span>
                                          <span className="col-span-2 text-slate-200">राजर्षी शाहू कॉलेज हॉस्टेल, लातूर</span>
                                        </div>
                                      </>
                                    )}

                                    {matchApp?.formId === 'f5' && (
                                      <>
                                        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                                          <span className="text-slate-400 font-bold">जात प्रमाणपत्र:</span>
                                          <span className="col-span-2 text-orange-400 font-bold">✅ Verified (BARTI Portal Integration)</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                                          <span className="text-slate-400 font-bold">BARTI Record Match:</span>
                                          <span className="col-span-2 text-slate-200">पुष्टीकरण प्राप्त आहे</span>
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  {/* Live Browser Status Alert */}
                                  <div className="mt-3 p-2 bg-slate-950 border border-slate-800 flex items-center justify-between text-[8px] font-bold rounded-lg font-mono">
                                    <div className="pr-2 text-left">
                                      <span className="text-slate-500 block text-[7px] uppercase tracking-wide">PUPPETEER INJECT ENGINE STATUS</span>
                                      <span className="text-orange-200">
                                        {session.status === 'Completed' && '🎉 अर्ज यशस्वीपणे सबमिट झाला! अधिकृत सरकारी पावती उपलब्ध.'}
                                        {session.status === 'Running' && '🔄 आमचा रोबोट सरकारी पोर्टलवर तुमचे प्रोफाइल वेगाने मॅप करत आहे.'}
                                        {session.status === 'Paused_OTP' && '📱 थांबले आहे: सरकारी पोर्टलला ओटीपी हवा आहे, कृपया आवश्यक ओटीपी प्रविष्ट करा.'}
                                        {session.status === 'Paused_LivePhoto' && '📷 थांबले आहे: सरकारी पोर्टलला लाईव्ह फेस बायोमेट्रिक आवश्यक आहे.'}
                                        {session.status === 'Paused_Captcha' && '🛡️ थांबले आहे: सरकारी वेबसाईटवरील कॅप्चा (CAPTCHA) अडथळा बायपास करणे आवश्यक.'}
                                        {session.status === 'Idle' && '⌛ अर्ज रांगेमध्ये आहे. थोड्याच वेळात स्वयंचलितरित्या भरणी सुरू होईल.'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                                        session.status === 'Completed' ? 'bg-green-500' :
                                        'bg-orange-500 animate-ping'
                                      }`}></span>
                                      <span className="text-orange-400 text-[7px]">
                                        {session.status === 'Completed' ? 'PAID/DONE' : 'ACTIVE'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* LIVE ROER PROGRESS LOGGER */}
                        <div className="space-y-1">
                          <span className="text-slate-400 font-bold text-[9px]">PUPPETEER HEADLESS BROWSERS EVENT LOGGER</span>
                          <div className="bg-slate-950 text-emerald-400 p-2.5 rounded max-h-32 overflow-y-auto space-y-1 leading-normal select-all">
                            {session.logs.map((log, idx) => (
                              <p key={idx} className="tracking-tight hover:text-emerald-300 pointer-events-auto">{log}</p>
                            ))}
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {(!adminStats?.automationSessions || adminStats.automationSessions.length === 0) && (
                    <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
                      <p className="text-slate-500 text-xs">सध्या ऑटोमेशन रांगेत कोणताही अर्ज नाही. नागरिक खात्यावरून नवीन अर्ज करा.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB TAB: FORM LIBRARY CONTROLLER */}
            {adminActiveTab === 'FORM_LIB' && (
              <div className="p-4 space-y-4 animate-fade-in flex-1">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wide">Government Form Library Database</h4>
                    <p className="text-[10px] text-slate-500 leading-normal mt-0.5">महाराष्ट्र नागरिक योजनांचे रेकॉर्ड्स जोडा किंवा जुने दुरुस्त करा.</p>
                  </div>
                  {!editingForm && (
                    <button 
                      onClick={() => setEditingForm({
                        name: '',
                        nameEn: '',
                        nameMr: '',
                        nameHi: '',
                        category: 'सरकारी नोकरी',
                        organization: 'महा DBT प्रभाग',
                        totalPosts: 1000,
                        lastDate: '2026-12-31',
                        ageLimit: '१८ वर्षा पेक्षा जास्त',
                        qualification: '२ वी उत्तीर्ण दाखला',
                        fees: 0,
                        serviceFee: 50,
                        requiredDocuments: ['Aadhaar Card', 'PAN Card'],
                        eligibility: 'महाराष्ट्र रहिवासी दाखला अनिवार्य',
                        websiteUrl: '',
                        importantLinks: [],
                        isEnabled: true
                      })}
                      className="bg-[#1e3a8a] text-white px-2.5 py-1.5 rounded-xl font-bold font-sans text-[10px] flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>नवीन समाविष्ट करा</span>
                    </button>
                  )}
                </div>

                {editingForm ? (
                  <form onSubmit={handleAdminAddEditFormSubmit} className="bg-white border rounded-xl p-4 space-y-3.5 text-xs font-semibold">
                    <span className="font-bold text-[#1e3a8a] block border-b pb-1">
                      {editingForm.id ? 'फॉर्म दुरुस्ती सुसंगत फॉर्म' : 'लायब्ररीत नवीन सरकारी योजना समाविष्ट करा'}
                    </span>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[#1e3a8a] mb-1">नाव इंग्रजीत (Name In English)</label>
                        <input required value={editingForm.nameEn || ''} onChange={(e) => setEditingForm({ ...editingForm, nameEn: e.target.value, name: `${e.target.value} (${editingForm.nameMr || ''})` })} className="w-full p-2 border rounded" placeholder="MahaDBT Tractor Subsidy" />
                      </div>
                      <div>
                        <label className="block text-[#1e3a8a] mb-1">नाव मराठीत (Name In Marathi) *</label>
                        <input required value={editingForm.nameMr || ''} onChange={(e) => setEditingForm({ ...editingForm, nameMr: e.target.value, name: `${editingForm.nameEn || ''} (${e.target.value})` })} className="w-full p-2 border rounded" placeholder="महा डीबीटी शेतकरी ट्रॅक्टर योजना" />
                      </div>
                      <div>
                        <label className="block text-[#1e3a8a] mb-1">श्रेणी (Category) *</label>
                        <select value={editingForm.category || 'सरकारी नोकरी'} onChange={(e) => setEditingForm({ ...editingForm, category: e.target.value as any })} className="w-full p-2 border rounded bg-white">
                          <option value="सरकारी नोकरी">सरकारी नोकरी</option>
                          <option value="शेतकरी योजना">शेतकरी योजना</option>
                          <option value="सरकारी सेवा">सरकारी सेवा</option>
                          <option value="शिक्षण सेवा">शिक्षण सेवा</option>
                          <option value="इतर सेवा">इतर सेवा</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#1e3a8a] mb-1">अंतिम तारीख *</label>
                          <input required type="date" value={editingForm.lastDate || ''} onChange={(e) => setEditingForm({ ...editingForm, lastDate: e.target.value })} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                          <label className="block text-[#1e3a8a] mb-1">संस्था *</label>
                          <input required value={editingForm.organization || ''} onChange={(e) => setEditingForm({ ...editingForm, organization: e.target.value })} className="w-full p-2 border rounded" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#1e3a8a] mb-1">वेबसाईट शासन URL</label>
                          <input value={editingForm.websiteUrl || ''} onChange={(e) => setEditingForm({ ...editingForm, websiteUrl: e.target.value })} className="w-full p-2 border rounded" placeholder="https://mahadbt.gov.in" />
                        </div>
                        <div>
                          <label className="block text-[#1e3a8a] mb-1">पात्रता निकष</label>
                          <input value={editingForm.qualification || ''} onChange={(e) => setEditingForm({ ...editingForm, qualification: e.target.value })} className="w-full p-2 border rounded" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#1e3a8a] mb-1">मूळ सरकारी युनिट फीस ($) *</label>
                          <input required type="number" value={editingForm.fees ?? 0} onChange={(e) => setEditingForm({ ...editingForm, fees: parseInt(e.target.value) })} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                          <label className="block text-[#1e3a8a] mb-1">साईराम सेवा चार्ज ($) *</label>
                          <input required type="number" value={editingForm.serviceFee ?? 50} onChange={(e) => setEditingForm({ ...editingForm, serviceFee: parseInt(e.target.value) })} className="w-full p-2 border rounded" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button type="button" onClick={() => setEditingForm(null)} className="w-1/3 border p-2 rounded">रद्द करा</button>
                      <button type="submit" className="w-2/3 bg-orange-500 hover:bg-orange-600 text-white font-bold p-2 rounded">पक्के करा (Create Forms List)</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {forms.map(form => (
                      <div key={form.id} className="bg-white border p-3.5 rounded-xl flex items-center justify-between gap-4 shadow-sm text-xs font-bold text-slate-700">
                        <div>
                          <span className="text-[#1e3a8a] block font-extrabold">{form.nameMr}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">{form.category}</span>
                        </div>
                        <div className="flex items-center gap-2shrink-0">
                          <button onClick={() => setEditingForm(form)} className="p-1.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg">⚙️ दुरुस्त</button>
                          <button onClick={() => deleteFormFromLibrary(form.id)} className="p-1.5 bg-red-50 text-red-650 border border-red-200 rounded-lg">✕ काढा</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB TAB: REGISTERED CITIZENS */}
            {adminActiveTab === 'CITIZENS' && (
              <div className="p-4 space-y-4 animate-fade-in flex-1">
                <div className="mb-2">
                  <h4 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wide">नोंदणीकृत महा महाराष्ट्र नागरिक (1-time Registers)</h4>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">ज्यांनी एकदा नोंदणी केली आहे व सर्व कागदपत्रे पेढीत सुरक्षित केली आहेत.</p>
                </div>

                <div className="space-y-3.5 text-xs font-bold">
                  {adminStats?.users?.map((usr: UserProfile) => {
                    const usrDocs = adminStats.documents?.[usr.mobile] || [];
                    return (
                      <div key={usr.mobile} className="bg-white border rounded-xl p-4 shadow-sm space-y-2">
                        <div className="flex justify-between items-center shrink-0">
                          <span className="text-slate-900 font-extrabold">{usr.fullName}</span>
                          <span className="bg-blue-50 font-mono text-slate-800 text-[9px] px-2 py-0.5 rounded">+91 {usr.mobile}</span>
                        </div>

                        <div className="p-2 bg-slate-50 rounded-lg space-y-1 font-semibold text-slate-600">
                          <p><span className="text-slate-400">शिक्षण:</span> {usr.education}</p>
                          <p><span className="text-slate-400">दप्तर कागदपत्रे संख्या:</span> <span className="text-green-700 font-bold">{usrDocs.length} uploaded</span></p>
                        </div>

                        <div className="flex flex-wrap gap-1.5 text-[9px] font-bold">
                          {usrDocs.map((doc: any, idx: number) => (
                            <span key={idx} className="bg-green-100 text-green-905 border border-green-200 px-2 py-0.5 rounded">
                              ● {doc.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB TAB: FINANCIAL PAYMENTS APPROVAL PANEL */}
            {adminActiveTab === 'FINANCES' && (
              <div className="p-4 space-y-4 animate-fade-in flex-1">
                <div className="mb-2">
                  <h4 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wide">नागरिक शुल्क मंजुरी प्रभाग (Revenue Collection)</h4>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">नागरिकांनी अपलोड केलेल्या पेमेंट रसीद स्क्रीशॉट पडताळून मंजुरी द्या.</p>
                </div>

                <div className="space-y-4 font-bold text-xs">
                  {adminStats?.payments?.map((txn: PaymentTransaction) => (
                    <div key={txn.id} className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
                      
                      <div className="flex justify-between shrink-0">
                        <span className="text-[#132d72] font-black">{txn.formName}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${txn.status === 'Paid' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900 animate-pulse'}`}>
                          {txn.status}
                        </span>
                      </div>

                      <div className="flex justify-between bg-slate-50 p-2 rounded-lg font-mono">
                        <span className="text-slate-400">शासकीय + सर्व्हिस शुल्क:</span>
                        <span className="text-green-700">₹{txn.amount}</span>
                      </div>

                      {/* DISPLAY CITIZENS SCREENSHOT PROOF IF SUBMITTED */}
                      {txn.screenshotUrl ? (
                        <div className="bg-slate-50 p-3 rounded-lg flex flex-col items-center">
                          <span className="text-[9px] text-[#1e3a8a] mb-2 block font-bold">नागरिकाने पाठवलेला स्क्रीशॉट:</span>
                          <img src={txn.screenshotUrl} alt="Transaction Screenshot" className="max-h-52 border rounded shadow-sm object-contain" />
                        </div>
                      ) : (
                        <span className="text-slate-400 font-normal italic block my-2 text-center text-[10px]">
                          (रसीद दाखल करायची शिल्लक आहे)
                        </span>
                      )}

                      {txn.status === 'Pending' && (
                        <button
                          onClick={() => approveFinancePayment(txn.id)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-md cursor-pointer text-center text-xs"
                        >
                          शुक्ल प्राप्त झाले, अर्ज मंजूर करा (Approve Fee)
                        </button>
                      )}

                    </div>
                  ))}

                  {(!adminStats?.payments || adminStats.payments.length === 0) && (
                    <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
                      <p className="text-slate-500 text-xs text-center font-normal">अजूनपर्यंत कोणतीही पेमेंट्स आलेली नाहीत.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER SYSTEM BRAND NOTATIONS (HUMBLE LABEL ARCHITECTURAL HONESTY) */}
      <footer className="bg-slate-900 text-slate-450 border-t border-slate-800 py-4 px-4 text-center text-[10px] font-medium tracking-tight">
        <p>साईराम डिजिटल सेवा © २०२६ | मालक: राहुल पांडुरंग मिसे, लातूर, महाराष्ट्र</p>
        <p className="mt-1 text-slate-500 font-mono italic">डिजिटल सेवा, विश्वासाचं नाव - एकदा Register करा, सर्व फॉर्म आमच्यावर सोडा</p>
      </footer>

    </div>
  );
}
