import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogIn, 
  Key, 
  Mail, 
  Shield, 
  AlertCircle, 
  Sparkles, 
  Activity,
  HeartPulse,
  Mic,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { setLoggedIn, savePatientProfile, DEFAULT_PATIENT } from '../utils/storage';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('eleanor.vance@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your registered physical or email credentials.');
      return;
    }
    
    // Simulate successful login
    setLoggedIn(true, email);
    setError('');
    navigate('/dashboard');
  };

  const handleQuickDemoAccess = () => {
    // Overwrite the session and profile with Eleanor's demo data directly
    savePatientProfile(DEFAULT_PATIENT);
    setLoggedIn(true, DEFAULT_PATIENT.email);
    navigate('/dashboard');
  };

  return (
    <div 
      className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden bg-bg-main"
      style={{
        backgroundImage: `linear-gradient(rgba(218, 217, 203, 0.72), rgba(218, 217, 203, 0.84)), url("/assets/auth-bg.png")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Soft blur visual blobs behind card */}
      <div className="absolute top-[15%] left-[20%] w-72 h-72 bg-[#6E8A7B]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] right-[15%] w-80 h-80 bg-[#2F4A43]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl z-10 flex flex-col md:flex-row gap-8 lg:gap-12 items-center justify-center py-6">
        
        {/* Left Side: Brand Introduction / Healthcare Credentials */}
        <div className="w-full md:w-1/2 text-left space-y-6 px-2 sm:px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2F4A43]/10 border border-[#2F4A43]/15 text-[#2F4A43] text-[11px] font-mono tracking-widest uppercase rounded-full font-bold">
            <HeartPulse className="w-3.5 h-3.5 text-[#6E8A7B]" />
            Cognitive Diagnostics Suite
          </div>

          <div className="space-y-3.5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2F4A43] tracking-tight leading-tight">
              Welcome Back to <br className="hidden lg:inline" />
              <span className="text-[#6E8A7B]">NDI Screening</span>
            </h1>
            <p className="text-[#4A635A] text-sm sm:text-base leading-relaxed max-w-md font-medium">
              Continue your guided cognitive communication screening and track your progress over time.
            </p>
          </div>

          {/* 3 small feature pills */}
          <div className="flex flex-col gap-3 max-w-sm pt-2">
            <div className="flex items-center gap-3 bg-[#E9E6DC]/60 border border-[#C8CBB7] px-4.5 py-3 rounded-2xl shadow-2xs font-bold text-[#203832]">
              <div className="w-8 h-8 rounded-xl bg-[#2F4A43] flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs tracking-wide">Secure Screening</span>
            </div>

            <div className="flex items-center gap-3 bg-[#E9E6DC]/60 border border-[#C8CBB7] px-4.5 py-3 rounded-2xl shadow-2xs font-bold text-[#203832]">
              <div className="w-8 h-8 rounded-xl bg-[#2F4A43] flex items-center justify-center text-white">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs tracking-wide">Speech-Based Analysis</span>
            </div>

            <div className="flex items-center gap-3 bg-[#E9E6DC]/60 border border-[#C8CBB7] px-4.5 py-3 rounded-2xl shadow-2xs font-bold text-[#203832]">
              <div className="w-8 h-8 rounded-xl bg-[#2F4A43] flex items-center justify-center text-white">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs tracking-wide">Progress Tracking</span>
            </div>
          </div>
        </div>

        {/* Right Side: The Glassmorphism login card */}
        <div className="w-full md:w-1/2 max-w-md">
          <div 
            className="w-full border border-white/30 rounded-[32px] p-6 sm:p-8 shadow-xl relative"
            style={{
              backgroundColor: 'rgba(233, 230, 220, 0.72)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
            }}
          >
            {/* Header portion */}
            <div className="text-center mb-6 space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2F4A43] tracking-tight">Patient Sign In</h2>
              <p className="text-xs text-[#4A635A] font-bold">Access your private screening dashboard</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border-l-4 border-rose-600 text-rose-800 rounded-xl text-xs sm:text-sm flex gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Inputs block */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[#2F4A43] font-bold text-xs mb-1.5 uppercase tracking-wider" htmlFor="email">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#4A635A]">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="email"
                    type="text"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#DAD9CB]/40 border border-[#2F4A43]/20 rounded-xl focus:bg-[#E9E6DC] focus:outline-none focus:ring-2 focus:ring-[#6E8A7B] transition-all text-[#203832] placeholder-[#4A635A]/50 text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#2F4A43] font-bold text-xs mb-1.5 uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#4A635A]">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#DAD9CB]/40 border border-[#2F4A43]/20 rounded-xl focus:bg-[#E9E6DC] focus:outline-none focus:ring-2 focus:ring-[#6E8A7B] transition-all text-[#203832] placeholder-[#4A635A]/50 text-sm font-semibold"
                  />
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className="w-full py-3.5 mt-2 bg-[#6E8A7B] hover:bg-[#2F4A43] text-white font-extrabold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wider hover:shadow-lg"
              >
                <LogIn className="w-4 h-4 text-white" />
                Secure Sign In
              </button>
            </form>

            {/* Quick Demo Login (Elegant & Compact) */}
            <div className="relative my-6 text-center">
              <span className="absolute inset-x-0 top-1/2 h-[1px] bg-[#2F4A43]/15"></span>
              <span className="relative bg-[#E9E6DC]/90 px-3 text-[10px] text-[#4A635A] uppercase font-mono tracking-widest font-extrabold">Demo Assessment</span>
            </div>

            <div className="bg-[#E9E6DC]/50 border border-[#C8CBB7] rounded-2xl p-4 text-center space-y-2">
              <h4 className="text-[#2F4A43] font-extrabold text-xs flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#6E8A7B] shrink-0" />
                Pre-Seeded Clinic Demo
              </h4>
              <p className="text-[11px] text-[#4A635A] leading-relaxed font-bold">
                Skip registration and examine sample historic records as <strong>Eleanor Vance (Age 74)</strong>.
              </p>
              <button
                onClick={handleQuickDemoAccess}
                type="button"
                className="w-full bg-[#6E8A7B]/10 hover:bg-[#6E8A7B]/20 text-[#2F4A43] border border-[#2F4A43]/25 font-extrabold text-xs py-2 px-3 rounded-xl cursor-pointer transition-all shadow-2xs"
              >
                Load Eleanor's Live Demo profile
              </button>
            </div>

            <p className="text-center text-[#203832] text-xs sm:text-sm mt-6 font-extrabold">
              Don't have a profile yet?{' '}
              <Link to="/signup" className="text-[#6E8A7B] hover:text-[#2F4A43] font-bold underline decoration-dotted">
                Create patient profile
              </Link>
            </p>

            {/* Encrypted Disclaimer bottom */}
            <div className="mt-5 pt-4 border-t border-[#2F4A43]/10 text-[10px] text-[#4A635A] text-center flex items-center justify-center gap-1.5 font-bold">
              <Shield className="w-3.5 h-3.5 text-[#6E8A7B] shrink-0" />
              Secure Encrypted Environment. No data leaves your host.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
