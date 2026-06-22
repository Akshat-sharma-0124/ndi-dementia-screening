import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  BookOpen, 
  Heart, 
  ShieldCheck, 
  Calendar, 
  Edit2, 
  Check, 
  Languages, 
  ChevronRight, 
  Award,
  LogOut,
  Sparkles,
  Camera,
  Trash2
} from 'lucide-react';
import { getPatientProfile, savePatientProfile, getReports, setLoggedIn, isLoggedIn } from '../utils/storage';
import { PatientProfile, LanguagePreference } from '../types';
import { useAvatar } from '../contexts/AvatarContext';

export default function Profile() {
  const navigate = useNavigate();
  const { avatarUrl: avatar, setAvatarUrl: setAvatar } = useAvatar();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [reports, setReports] = useState<any[]>([]);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedAge, setEditedAge] = useState<number>(75);
  const [editedGender, setEditedGender] = useState('Female');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedEduLevel, setEditedEduLevel] = useState('');
  const [editedLangPref, setEditedLangPref] = useState<LanguagePreference>('English');
  const [editedCaregiverName, setEditedCaregiverName] = useState('');
  const [editedCaregiverContact, setEditedCaregiverContact] = useState('');

  // Profile photo states and refs
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    const currentProfile = getPatientProfile();
    if (currentProfile) {
      setProfile(currentProfile);
      
      // Seed values
      setEditedName(currentProfile.name);
      setEditedAge(currentProfile.age);
      setEditedGender(currentProfile.gender);
      setEditedEmail(currentProfile.email);
      setEditedPhone(currentProfile.phone);
      
      // Seed address (falling back to Bhopal example for legacy values)
      const initialEdu = currentProfile.educationLevel || '';
      if (initialEdu.includes('Bachelor') || initialEdu.includes('School') || initialEdu.includes('Graduate') || initialEdu === '') {
        setEditedEduLevel("A-12 Green Valley Colony\nBhopal, Madhya Pradesh, India - 462001");
      } else {
        setEditedEduLevel(initialEdu);
      }
      
      setEditedLangPref(currentProfile.languagePreference);
      setEditedCaregiverName(currentProfile.caregiverName);
      setEditedCaregiverContact(currentProfile.caregiverContact);
    }
    setReports(getReports());

    // Avatar is already loaded from context (AvatarProvider reads localStorage on init)
  }, [navigate]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-[#F7F4ED]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6E8168]"></div>
      </div>
    );
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PatientProfile = {
      ...profile,
      name: editedName,
      age: Number(editedAge),
      gender: editedGender,
      email: editedEmail,
      phone: editedPhone,
      educationLevel: editedEduLevel,
      languagePreference: editedLangPref,
      caregiverName: editedCaregiverName,
      caregiverContact: editedCaregiverContact
    };

    savePatientProfile(updated);
    setProfile(updated);

    // Commit avatar change through shared context (syncs Navbar instantly)
    setAvatar(tempAvatar);
    setTempAvatar(null);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setTempAvatar(avatar);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditedName(profile.name);
      setEditedAge(profile.age);
      setEditedGender(profile.gender);
      setEditedEmail(profile.email);
      setEditedPhone(profile.phone);
      
      const initialEdu = profile.educationLevel || '';
      if (initialEdu.includes('Bachelor') || initialEdu.includes('School') || initialEdu.includes('Graduate') || initialEdu === '') {
        setEditedEduLevel("A-12 Green Valley Colony\nBhopal, Madhya Pradesh, India - 462001");
      } else {
        setEditedEduLevel(initialEdu);
      }
      
      setEditedLangPref(profile.languagePreference);
      setEditedCaregiverName(profile.caregiverName);
      setEditedCaregiverContact(profile.caregiverContact);
    }
    setTempAvatar(null);
    setIsEditing(false);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    navigate('/');
    window.location.reload(); // refreshing clean state
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setTempAvatar(base64String);
        };
        reader.readAsDataURL(file);
      }
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const latestScore = reports.length > 0 ? reports[reports.length - 1].ndiScore : 'None';
  const latestStatus = reports.length > 0 ? reports[reports.length - 1].status : 'None';

  // Map legacy education values to address in read-only mode
  const displayAddress = (profile.educationLevel.includes('Bachelor') || profile.educationLevel.includes('School') || profile.educationLevel.includes('Graduate') || !profile.educationLevel)
    ? "A-12 Green Valley Colony\nBhopal, Madhya Pradesh, India - 462001"
    : profile.educationLevel;

  // Calculate Profile Completeness
  const completeness = (() => {
    let score = 0;
    if (profile.name) score += 10;
    if (profile.age) score += 10;
    if (profile.gender) score += 10;
    if (profile.languagePreference) score += 10;
    
    const edu = profile.educationLevel || '';
    if (edu && !edu.includes('Bachelor') && !edu.includes('School') && !edu.includes('Graduate')) {
      score += 15;
    } else if (edu) {
      score += 15;
    }
    
    if (profile.email) score += 15;
    if (profile.phone) score += 10;
    if (profile.caregiverName) score += 10;
    if (profile.caregiverContact) score += 10;
    return score;
  })();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 bg-bg-main text-text-dark animate-fadeIn">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-secondary/35 pb-4 font-bold">
        <div>
          <h1 className="text-3xl font-extrabold text-primary flex items-center gap-2">
            <User className="w-8 h-8 text-accent" />
            Patient Profile Registry
          </h1>
          <p className="text-secondary text-xs sm:text-sm mt-1">
            Configure your physiological baseline metrics and nominate support contacts.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2.5 bg-bg-soft hover:bg-rose-100 text-rose-950 font-bold text-xs rounded-xl transition-all border-2 border-rose-350 flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-xs"
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-800" />
          Disconnect Portal
        </button>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Summary and status cards (5 cols) */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-card-bg border-2 border-secondary/40 rounded-[24px] p-6 text-center space-y-5 shadow-md">
            
            {/* Circular Profile Photo or silhouette placeholder */}
            <div className="relative mx-auto w-32 h-32">
              <div 
                onClick={isEditing ? () => fileInputRef.current?.click() : undefined}
                className={`w-32 h-32 rounded-full border-4 border-secondary/40 shadow-md overflow-hidden relative mx-auto ${
                  isEditing ? 'cursor-pointer hover:border-accent transition-colors group' : ''
                }`}
              >
                {isEditing ? (
                  tempAvatar ? (
                    <img 
                      src={tempAvatar} 
                      alt="Patient Profile Preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-bg-soft flex items-center justify-center shadow-inner text-accent overflow-hidden relative">
                      <svg className="w-20 h-20 text-accent/70 mt-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )
                ) : (
                  avatar ? (
                    <img 
                      src={avatar} 
                      alt="Patient Profile" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-bg-soft flex items-center justify-center shadow-inner text-accent overflow-hidden relative">
                      <svg className="w-20 h-20 text-accent/70 mt-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )
                )}

                {/* Camera Overlay (only in edit mode) */}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center hover:bg-black/45 transition-colors duration-200">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 flex flex-col items-center">
              <h2 className="text-xl font-extrabold text-primary leading-tight">{profile.name}</h2>
              
              {/* Profile Verified status badge */}
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/90 border border-emerald-250 text-[10px] font-extrabold text-emerald-800 shadow-3xs uppercase tracking-wider select-none mb-1">
                Profile Verified ✓
              </div>

              {/* Edit Photo Actions */}
              {isEditing ? (
                tempAvatar ? (
                  <button 
                    type="button" 
                    onClick={() => setTempAvatar(null)} 
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 font-bold text-[11px] rounded-xl transition-all shadow-3xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0 text-rose-700" />
                    Remove Photo
                  </button>
                ) : (
                  <span className="text-[11px] text-secondary font-semibold">
                    Click photo to upload
                  </span>
                )
              ) : null}

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/png, image/jpeg, image/webp" 
                className="hidden" 
              />

              {/* Active Monitoring status badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 border border-emerald-250 text-[10px] font-extrabold text-emerald-800 shadow-3xs uppercase tracking-wider select-none mx-auto mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                Active Monitoring
              </div>
              
              <span className="text-[10px] text-accent font-mono font-bold tracking-wider block uppercase pt-0.5">Linguistic Baseline Certified</span>
            </div>

            <div className="border-t-2 border-secondary/30 pt-4 space-y-4 text-left text-xs font-bold">
              
              {/* Last Assessment */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-secondary text-[11px]">Last Assessment:</span>
                <span className="font-extrabold text-primary bg-bg-soft px-2.5 py-1 rounded-lg border border-secondary/15">{latestScore !== 'None' ? `${latestScore}% NDI` : 'Pending'}</span>
              </div>

              {/* Profile Completeness progress indicators */}
              <div className="space-y-2 border-t border-secondary/20 pt-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-secondary">Profile Completeness</span>
                  <span className="font-mono font-extrabold text-primary">{completeness}%</span>
                </div>
                <div className="w-full bg-bg-soft rounded-full h-2 overflow-hidden border border-secondary/20 shadow-inner">
                  <div 
                    className="bg-accent h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-secondary/85 leading-none select-none tracking-tight">
                  {(() => {
                    const filled = Math.round(completeness / 10);
                    return `[${'█'.repeat(filled)}${'░'.repeat(10 - filled)}] ${completeness}%`;
                  })()}
                </div>
              </div>

              {/* Standing Stacked without truncation */}
              <div className="flex flex-col gap-1 border-t border-secondary/20 pt-3">
                <span className="text-secondary text-[11px]">Standing:</span>
                <span className="font-extrabold text-primary bg-bg-soft px-3 py-1.5 rounded-xl border border-secondary/15 leading-relaxed text-xs sm:text-sm">
                  {(() => {
                    if (latestStatus === 'None') return 'Pending Assessment';
                    if (latestStatus.includes('Mild') || latestStatus.includes('Dynamic')) return 'Mild Cognitive Variation';
                    if (latestStatus.includes('Moderate')) return 'Moderate Variation';
                    if (latestStatus.includes('Significant')) return 'Significant Narrative Change';
                    return latestStatus;
                  })()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-bg-soft/75 border-2 border-secondary/35 rounded-3xl p-6 text-xs text-secondary leading-relaxed flex gap-3 font-bold">
            <ShieldCheck className="w-6 h-6 text-accent shrink-0" />
            <div>
              <strong className="text-primary block mb-1">Decentralized Encryption Core:</strong> 
              All conversational transcript files, speech timers, and NDI calculations are stored locally in sandbox state without cloud indexing.
            </div>
          </div>
        </div>

        {/* Right Side: Information sheet or clinical Editor Form (8 cols) */}
        <div className="md:col-span-8">
                 {!isEditing ? (
            <div className="bg-card-bg border-2 border-secondary/40 rounded-[24px] p-6 sm:p-8 shadow-md space-y-6 animate-fadeIn">
              
              <div className="flex justify-between items-center border-b-2 border-dashed border-secondary/30 pb-4">
                <h3 className="font-extrabold text-primary text-lg font-display">Personal Info Sheet</h3>
                <button
                  onClick={handleStartEdit}
                  id="profile-edit-btn"
                  className="px-3.5 py-2 border-2 border-secondary/35 hover:bg-bg-main text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 text-accent" />
                  Edit Profile
                </button>
              </div>

              {/* Read only info lists with vertical separators & increased spacing */}
              <div className="space-y-5">
                
                {/* Patient Name */}
                <div className="pb-3.5 border-b border-secondary/15 space-y-1 text-left">
                  <span className="text-[10px] text-accent uppercase tracking-widest block font-mono font-bold">Patient Name</span>
                  <p className="font-extrabold text-primary text-sm sm:text-base">{profile.name}</p>
                </div>

                {/* Patient Age & Gender */}
                <div className="pb-3.5 border-b border-secondary/15 space-y-1 text-left">
                  <span className="text-[10px] text-accent uppercase tracking-widest block font-mono font-bold">Patient Age & Gender</span>
                  <p className="font-extrabold text-primary text-sm sm:text-base">{profile.age} years / {profile.gender}</p>
                </div>

                {/* Language Preference */}
                <div className="pb-3.5 border-b border-secondary/15 space-y-1.5 text-left">
                  <span className="text-[10px] text-accent uppercase tracking-widest block font-mono font-bold flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-accent shrink-0" />
                    Language Preference
                  </span>
                  <p className="font-extrabold text-primary text-sm sm:text-base">{profile.languagePreference}</p>
                </div>

                {/* Address Section */}
                <div className="pb-3.5 border-b border-secondary/15 space-y-2 text-left">
                  <span className="text-[10px] text-accent uppercase tracking-widest block font-mono font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                    ADDRESS
                  </span>
                  <div className="space-y-1">
                    <span className="text-[10px] text-secondary font-semibold block leading-none">Residential Address</span>
                    <div className="whitespace-pre-line text-primary font-extrabold text-sm sm:text-base leading-relaxed">
                      {displayAddress}
                    </div>
                  </div>
                </div>

                {/* Email Coordinates */}
                <div className="pb-3.5 border-b border-secondary/15 space-y-1.5 text-left">
                  <span className="text-[10px] text-accent uppercase tracking-widest block font-mono font-bold flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-accent shrink-0" />
                    Email Credentials
                  </span>
                  <p className="font-extrabold text-secondary text-sm sm:text-base truncate">{profile.email}</p>
                </div>

                {/* Primary Contact */}
                <div className="pb-4 space-y-1.5 text-left">
                  <span className="text-[10px] text-accent uppercase tracking-widest block font-mono font-bold flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-accent shrink-0" />
                    Primary Contact
                  </span>
                  <p className="font-extrabold text-secondary text-sm sm:text-base font-mono">{profile.phone}</p>
                </div>

                {/* Caregiver Section */}
                <div className="border-t border-dashed border-secondary/35 pt-5 space-y-4">
                  <h4 className="font-extrabold text-primary text-sm flex items-center gap-1.5">
                    <Heart className="w-4.5 h-4.5 text-rose-700" />
                    Caregiver Designation
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1 bg-bg-soft border border-secondary/30 p-4 rounded-xl shadow-3xs">
                      <span className="text-[10px] text-accent block font-mono uppercase tracking-wider font-bold">Contact Person</span>
                      <p className="font-extrabold text-primary text-sm">{profile.caregiverName}</p>
                    </div>
                    <div className="space-y-1 bg-bg-soft border border-secondary/30 p-4 rounded-xl shadow-3xs">
                      <span className="text-[10px] text-accent block font-mono uppercase tracking-wider font-bold">Caregiver Phone / Email</span>
                      <p className="font-extrabold text-primary text-sm">{profile.caregiverContact}</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="bg-card-bg border-2 border-secondary/40 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
              
              <div className="flex justify-between items-center border-b border-secondary/30 pb-3">
                <h3 className="font-extrabold text-primary text-lg">Modify Baseline Sheet</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3.5 py-1.5 border-2 border-secondary/35 hover:bg-bg-soft text-secondary rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="profile-save-btn"
                    className="px-4 py-1.5 bg-accent hover:bg-primary text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 shrink-0 text-white animate-pulse" />
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Form entries */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm text-secondary font-bold">
                <div>
                  <label className="block text-primary font-extrabold text-sm mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-bg-main border-2 border-secondary/30 rounded-xl text-primary text-sm focus:bg-bg-soft focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-primary font-extrabold text-sm mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={editedAge}
                    onChange={(e) => setEditedAge(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-bg-main border-2 border-secondary/30 rounded-xl text-primary text-sm focus:bg-bg-soft focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-primary font-extrabold text-sm mb-1">Gender</label>
                  <select
                    value={editedGender}
                    onChange={(e) => setEditedGender(e.target.value)}
                    className="w-full px-3.5 py-3 bg-bg-main border-2 border-secondary/30 rounded-xl text-primary text-sm focus:outline-none focus:border-accent"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="sm:col-span-2 text-left">
                  <label className="block text-primary font-extrabold text-sm mb-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-accent shrink-0" />
                    Residential Address
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={editedEduLevel}
                    onChange={(e) => setEditedEduLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-bg-main border-2 border-secondary/30 rounded-xl text-primary text-sm focus:bg-bg-soft focus:outline-none focus:border-accent font-sans"
                    placeholder="House No. / Street / Area&#10;City, State, Country&#10;PIN Code"
                  />
                </div>

                <div>
                  <label className="block text-primary font-extrabold text-sm mb-1">Preferred Language</label>
                  <select
                    value={editedLangPref}
                    onChange={(e) => setEditedLangPref(e.target.value as LanguagePreference)}
                    className="w-full px-3.5 py-3 bg-bg-main border-2 border-secondary/30 rounded-xl text-primary text-sm focus:outline-none focus:border-accent"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Hinglish">Hinglish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-primary font-extrabold text-sm mb-1">Email Coordinates</label>
                  <input
                    type="email"
                    required
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-bg-main border-2 border-secondary/30 rounded-xl text-primary text-sm focus:bg-bg-soft focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="sm:col-span-2 border-t border-secondary/30 pt-4 space-y-4">
                  <h4 className="font-extrabold text-primary text-sm">Caregiver Nominee Credentials</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-primary font-extrabold text-sm mb-1">Caregiver Name</label>
                      <input
                        type="text"
                        value={editedCaregiverName}
                        onChange={(e) => setEditedCaregiverName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-bg-main border-2 border-secondary/30 rounded-xl text-primary text-sm focus:bg-bg-soft focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-primary font-extrabold text-sm mb-1">Caregiver Phone / Contact</label>
                      <input
                        type="text"
                        value={editedCaregiverContact}
                        onChange={(e) => setEditedCaregiverContact(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-bg-main border-2 border-secondary/30 rounded-xl text-primary text-sm focus:bg-bg-soft focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
