import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  BookOpen, 
  Heart, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Lock, 
  FileSignature, 
  AlertCircle, 
  Activity,
  HeartPulse,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { setLoggedIn, savePatientProfile } from '../utils/storage';
import { LanguagePreference, PatientProfile } from '../types';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(75);
  const [gender, setGender] = useState('Female');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [educationLevel, setEducationLevel] = useState('High School Graduate');
  const [languagePreference, setLanguagePreference] = useState<LanguagePreference>('English');
  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverContact, setCaregiverContact] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      setError('Please fill out all primary patient details (Name, Email, and Password).');
      return;
    }

    if (!consentAccepted) {
      setError('You must accept the speech and audio analysis consent waiver to register.');
      return;
    }

    const newProfile: PatientProfile = {
      name,
      age: Number(age),
      gender,
      email,
      phone: phone || '+1 (555) 000-0000',
      educationLevel,
      languagePreference,
      caregiverName: caregiverName || 'Self / Not Registered',
      caregiverContact: caregiverContact || 'Self',
      consentAccepted
    };

    // Save profile and log in
    savePatientProfile(newProfile);
    setLoggedIn(true, email);
    setError('');
    navigate('/dashboard');
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden bg-bg-main pt-24 pb-12"
      style={{
        backgroundImage: `linear-gradient(rgba(218, 217, 203, 0.72), rgba(218, 217, 203, 0.84)), url("/assets/auth-bg.png")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Soft blurred background circles for deep premium visuals */}
      <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-[#6E8A7B]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-[#2F4A43]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Glass Container */}
      <div 
        className="w-full max-w-4xl z-10 border border-white/30 rounded-[32px] overflow-hidden shadow-2xl relative"
        style={{
          backgroundColor: 'rgba(233, 230, 220, 0.72)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
        }}
      >
        {/* Registration Header Banner */}
        <div className="border-b border-[#2F4A43]/15 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2F4A43]/10 border border-[#2F4A43]/15 text-[#2F4A43] text-[10px] font-mono tracking-widest uppercase rounded-full font-bold">
              <Activity className="w-3.5 h-3.5 text-[#6E8A7B]" />
              Secure Baseline Initialization
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2F4A43] tracking-tight">
              Create Patient Profile
            </h1>
            <p className="text-xs sm:text-sm text-[#4A635A] max-w-xl font-bold leading-relaxed">
              Set up your secure screening baseline for guided cognitive communication analysis. All speech and narrative metrics are saved locally in this sandboxed setup.
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center w-14 h-14 bg-[#2F4A43] text-[#E9E6DC] rounded-2xl shadow-md">
            <HeartPulse className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>

        {/* Input Form Fields */}
        <form onSubmit={handleSignup} className="p-6 sm:p-8 space-y-8">
          
          {error && (
            <div className="p-4 bg-rose-50 border-l-4 border-rose-600 text-rose-800 rounded-2xl text-xs sm:text-sm flex gap-3 shadow-2xs font-semibold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION 1: Personal Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#2F4A43]/15 pb-2">
              <div className="w-8 h-8 rounded-lg bg-[#2F4A43] flex items-center justify-center text-white shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-extrabold text-[#2F4A43] tracking-tight">
                1. Patient Personal Details
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-[#2F4A43] font-bold text-xs mb-1.5 uppercase tracking-wider" htmlFor="p-name">
                  Full Name
                </label>
                <input
                  id="p-name"
                  type="text"
                  required
                  placeholder="Eleanor Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#DAD9CB]/40 border border-[#2F4A43]/20 rounded-xl focus:bg-[#E9E6DC] focus:outline-none focus:ring-2 focus:ring-[#6E8A7B] text-[#203832] placeholder-[#4A635A]/50 text-sm font-semibold transition-all"
                />
              </div>

              <div>
                <label className="block text-[#2F4A43] font-bold text-xs mb-1.5 uppercase tracking-wider" htmlFor="p-age">
                  Age (Years)
                </label>
                <input
                  id="p-age"
                  type="number"
                  min="1"
                  max="130"
                  required
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-[#DAD9CB]/40 border border-[#2F4A43]/20 rounded-xl focus:bg-[#E9E6DC] focus:outline-none focus:ring-2 focus:ring-[#6E8A7B] text-[#203832] placeholder-[#4A635A]/50 text-sm font-semibold transition-all"
                />
              </div>

              <div>
                <label className="block text-[#2F4A43] font-bold text-xs mb-1.5 uppercase tracking-wider" htmlFor="p-gender">
                  Gender
                </label>
                <select
                  id="p-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 bg-[#DAD9CB]/40 border border-[#2F4A43]/20 rounded-xl focus:bg-[#E9E6DC] focus:outline-none focus:ring-2 focus:ring-[#6E8A7B] text-[#203832] text-sm font-semibold transition-all cursor-pointer"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-[#2F4A43] font-bold text-xs mb-1.5 uppercase tracking-wider" htmlFor="p-email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#4A635A]">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="p-email"
                    type="email"
                    required
                    placeholder="eleanor.vance@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#DAD9CB]/40 border border-[#2F4A43]/20 rounded-xl focus:bg-[#E9E6DC] focus:outline-none focus:ring-2 focus:ring-[#6E8A7B] text-[#203832] placeholder-[#4A635A]/50 text-sm font-semibold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#2F4A43] font-bold text-xs mb-1.5 uppercase tracking-wider" htmlFor="p-phone">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#4A635A]">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="p-phone"
                    type="tel"
                    placeholder="+1 (555) 321-4890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#DAD9CB]/40 border border-[#2F4A43]/20 rounded-xl focus:bg-[#E9E6DC] focus:outline-none focus:ring-2 focus:ring-[#6E8A7B] text-[#203832] placeholder-[#4A635A]/50 text-sm font-semibold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#2F4A43] font-bold text-xs mb-1.5 uppercase tracking-wider" htmlFor="p-password">
                  Account Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#4A635A]">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="p-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#DAD9CB]/40 border border-[#2F4A43]/20 rounded-xl focus:bg-[#E9E6DC] focus:outline-none focus:ring-2 focus:ring-[#6E8A7B] text-[#203832] placeholder-[#4A635A]/50 text-sm font-semibold transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Cognitive baseline info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#2F4A43]/15 pb-2">
              <div className="w-8 h-8 rounded-lg bg-[#2F4A43] flex items-center justify-center text-white shrink-0">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-extrabold text-[#2F4A43] tracking-tight">
                2. Cognitive & Education Context
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[#2F4A43] font-bold text-xs uppercase tracking-wider" htmlFor="p-edu">
                  Highest Level of Education
                </label>
                <select
                  id="p-edu"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-[#DAD9CB]/40 border border-[#2F4A43]/20 rounded-xl focus:bg-[#E9E6DC] focus:outline-none focus:ring-2 focus:ring-[#6E8A7B] text-[#203832] text-sm font-semibold transition-all cursor-pointer"
                >
                  <option value="Some Schooling">Some Schooling / Literacy Support</option>
                  <option value="High School Graduate">High School Graduate</option>
                  <option value="Vocational or Trade School">Vocational Certification / Trade School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor of Arts / Science">Bachelor's Degree</option>
                  <option value="Postgraduate Degree (Master/PhD)">Postgraduate (Master's / PhD / MD)</option>
                </select>
                <p className="text-[11px] text-[#4A635A] font-bold leading-normal">
                  * Helps calibrate baseline expectations for chronological syntax depth, coherence ratios, and phrase structure density.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[#2F4A43] font-bold text-xs uppercase tracking-wider" htmlFor="p-lang">
                  Preferred Speaking Language
                </label>
                <select
                  id="p-lang"
                  value={languagePreference}
                  onChange={(e) => setLanguagePreference(e.target.value as LanguagePreference)}
                  className="w-full px-4 py-3 bg-[#DAD9CB]/40 border border-[#2F4A43]/20 rounded-xl focus:bg-[#E9E6DC] focus:outline-none focus:ring-2 focus:ring-[#6E8A7B] text-[#203832] text-sm font-semibold transition-all cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Hinglish">Hinglish (English-Hindi hybrid speech)</option>
                </select>
                <p className="text-[11px] text-[#4A635A] font-bold leading-normal">
                  * The system dynamically configures standard templates, triggers, and pause tracking indexes to fit your natural native accent.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: Emergency & Caregiver */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#2F4A43]/15 pb-2">
              <div className="w-8 h-8 rounded-lg bg-[#2F4A43] flex items-center justify-center text-white shrink-0">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-extrabold text-[#2F4A43] tracking-tight">
                3. Emergency & Caregiver Contact
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[#2F4A43] font-bold text-xs mb-1.5 uppercase tracking-wider" htmlFor="c-name">
                  Caregiver / Family Contact Person Name
                </label>
                <input
                  id="c-name"
                  type="text"
                  placeholder="William Vance"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#DAD9CB]/40 border border-[#2F4A43]/20 rounded-xl focus:bg-[#E9E6DC] focus:ring-2 focus:ring-[#6E8A7B] text-[#203832] placeholder-[#4A635A]/50 text-sm font-semibold transition-all"
                />
              </div>

              <div>
                <label className="block text-[#2F4A43] font-bold text-xs mb-1.5 uppercase tracking-wider" htmlFor="c-phone">
                  Caregiver Phone or Email Address
                </label>
                <input
                  id="c-phone"
                  type="text"
                  placeholder="+1 (555) 765-4321"
                  value={caregiverContact}
                  onChange={(e) => setCaregiverContact(e.target.value)}
                  className="w-full px-4 py-3 bg-[#DAD9CB]/40 border border-[#2F4A43]/20 rounded-xl focus:bg-[#E9E6DC] focus:ring-2 focus:ring-[#6E8A7B] text-[#203832] placeholder-[#4A635A]/50 text-sm font-semibold transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Legal Consent (Waiver layout visually distinct) */}
          <div className="bg-[#E9E6DC]/90 border border-[#C8CBB7] rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#6E8A7B] flex items-center justify-center text-white shrink-0">
                <FileSignature className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-extrabold text-[#2F4A43] text-sm tracking-wide">
                4. Linguistic Analysis & Patient Consent Waiver
              </h4>
            </div>
            
            <p className="text-xs text-[#4A635A] leading-relaxed font-bold">
              By taking this screening, you authorize the program to temporarily run speaking analysis. The audio recording is used exclusively to generate transcribing feedback and narrative coherence indexes. All records reside entirely within the safe sandbox of this browser. No HIPAA-protected speech databases are permanently stored externally, and no medical diagnosis is generated. NDI supports cognitive mapping baselines only and does not replace formal clinical assessment.
            </p>
            
            <div className="pt-2 flex items-start gap-3">
              <input
                id="consent"
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="w-5 h-5 text-[#6E8A7B] bg-[#DAD9CB]/50 border-2 border-[#2F4A43]/30 rounded focus:ring-[#6E8A7B] shrink-0 mt-0.5 cursor-pointer"
              />
              <label htmlFor="consent" className="text-[#203832] font-semibold text-xs sm:text-sm select-none cursor-pointer leading-relaxed">
                I hereby grant consent for audio recording, natural language processing, and chronological communication metrics analysis for screening support.
              </label>
            </div>
          </div>

          {/* Submission and signin link */}
          <div className="pt-6 border-t border-[#2F4A43]/15 flex flex-col sm:flex-row items-center justify-between gap-5">
            <p className="text-[#4A635A] text-sm font-semibold order-2 sm:order-1 text-center sm:text-left">
              Already registered?{' '}
              <Link to="/login" className="text-[#6E8A7B] hover:text-[#2F4A43] font-bold hover:underline decoration-dotted transition-colors">
                Sign In
              </Link>
            </p>
            <button
              id="signup-submit-btn"
              type="submit"
              className="w-full sm:w-auto px-8 py-4 bg-[#6E8A7B] hover:bg-[#2F4A43] text-white font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer text-sm uppercase tracking-wider flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              Register & Start Dashboard
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>

        {/* Local sandbox safe indicator footer */}
        <div className="bg-[#E9E6DC]/40 px-6 sm:px-8 py-4.5 border-t border-[#2F4A43]/10 flex items-center gap-2 justify-center text-xs text-[#4A635A] font-extrabold">
          <ShieldCheck className="w-5 h-5 text-[#6E8A7B]" />
          <span>Protected Local Browser Sandbox. Absolutely NO off-device transmission.</span>
        </div>

      </div>
    </div>
  );
}
