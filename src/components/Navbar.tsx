import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Menu, X, LogIn, UserPlus, LogOut, Award, User, History, Settings, ChevronDown, Shield } from 'lucide-react';
import { isLoggedIn, getPatientProfile, setLoggedIn } from '../utils/storage';
import { useAvatar } from '../contexts/AvatarContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(isLoggedIn());
  const [profileName, setProfileName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { avatarUrl, clearAvatar } = useAvatar();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Re-check authentication status and fetch patient name when location changes
    const authStatus = isLoggedIn();
    setAuthenticated(authStatus);
    if (authStatus) {
      const p = getPatientProfile();
      if (p) {
        setProfileName(p.name);
      }
    }
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setLoggedIn(false);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    navigate('/');
    window.location.reload(); // clear state cleanly
  };

  const handleHowItWorksClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.getElementById('how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#how-it-works');
    }
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'text-primary bg-card-bg/45 nav-item-active' 
      : 'text-secondary hover:text-primary hover:bg-card-bg/25';
  };

  const getInitials = () => {
    if (profileName) {
      return profileName.split(' ').map(n => n[0]).join('');
    }
    return 'P';
  };

  return (
    <nav className="navbar-custom sticky top-0 z-50 shadow-xs">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo / Brand */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group focus:outline-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm transition-transform group-hover:scale-105">
              <Activity className="w-5 h-5 text-bg-main" />
            </div>
            <div>
              <span className="font-extrabold text-[#203832] tracking-tight block text-sm sm:text-base">
                NDI Screening
              </span>
              <span className="text-[10px] text-secondary font-mono tracking-wider block uppercase">
                Narrative Health Index
              </span>
            </div>
          </Link>

          {/* Desktop Navigation links */}
          <div className="hidden md:flex items-center gap-2.5">
            {authenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 nav-item-custom ${isActive('/dashboard')}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/screening" 
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 nav-item-custom ${isActive('/screening')}`}
                >
                  Start Assessment
                </Link>
                <Link 
                  to="/history" 
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 nav-item-custom ${isActive('/history')}`}
                >
                  History Logs
                </Link>
                <Link 
                  to="/profile" 
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 nav-item-custom ${isActive('/profile')}`}
                >
                  My Profile
                </Link>

                <span className="h-6 w-[1px] bg-card-bg/60 mx-1" />

                {/* Profile Avatar with Dropdown */}
                <div className="relative flex items-center gap-2.5 pl-2" ref={dropdownRef}>
                  
                  {/* Monitoring Active Badge */}
                  <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/60 select-none">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700 tracking-wide uppercase">Monitoring Active</span>
                  </div>

                  {/* Avatar Button */}
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="navbar-avatar-btn relative flex items-center gap-1.5 cursor-pointer focus:outline-none group"
                    title={profileName || 'Profile'}
                  >
                    <div className="navbar-avatar-ring relative w-9 h-9 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(123,196,127,0.35)]">
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt={profileName || 'Profile'} 
                          className="w-9 h-9 rounded-full object-cover border-2 border-[#b8c9b0] shadow-sm"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-card-bg text-primary font-bold text-xs flex items-center justify-center border-2 border-[#b8c9b0] shadow-sm">
                          {getInitials()}
                        </div>
                      )}
                      {/* Online indicator dot */}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-secondary transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div 
                      className="absolute right-0 top-full mt-2.5 w-56 bg-[#F8F6EE] border border-[#D6D8CC] rounded-2xl shadow-lg overflow-hidden z-[60]"
                      style={{ animation: 'navDropdownFadeIn 0.2s ease-out' }}
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-[#D6D8CC]/60 bg-[#EFEEE4]/60">
                        <div className="flex items-center gap-2.5">
                          {avatarUrl ? (
                            <img 
                              src={avatarUrl} 
                              alt={profileName} 
                              className="w-8 h-8 rounded-full object-cover border border-[#b8c9b0]" 
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-card-bg text-primary font-bold text-[10px] flex items-center justify-center border border-[#b8c9b0]">
                              {getInitials()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-[#31584E] truncate">{profileName || 'Patient'}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                              <span className="text-[9px] font-bold text-emerald-700">Monitoring Active</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1.5">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#4A635A] hover:bg-[#E9E6DC]/60 hover:text-[#31584E] transition-colors"
                        >
                          <User className="w-4 h-4 text-[#7BC47F]" />
                          Profile
                        </Link>
                        <Link
                          to="/history"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#4A635A] hover:bg-[#E9E6DC]/60 hover:text-[#31584E] transition-colors"
                        >
                          <History className="w-4 h-4 text-[#7BC47F]" />
                          Assessment History
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#4A635A] hover:bg-[#E9E6DC]/60 hover:text-[#31584E] transition-colors"
                        >
                          <Settings className="w-4 h-4 text-[#7BC47F]" />
                          Settings
                        </Link>
                      </div>

                      {/* Logout Divider */}
                      <div className="border-t border-[#D6D8CC]/60">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50/60 hover:text-rose-700 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 nav-item-custom ${isActive('/')}`}
                >
                  Home
                </Link>
                <a 
                  href="#how-it-works" 
                  onClick={handleHowItWorksClick}
                  className="px-4 py-2.5 rounded-xl font-bold text-sm text-secondary hover:text-primary hover:bg-card-bg/25 transition-all duration-300 nav-item-custom"
                >
                  How It Works
                </a>
                
                <span className="h-6 w-[1px] bg-card-bg/60 mx-2" />

                <Link 
                  to="/login" 
                  className="px-4 py-2.5 text-secondary hover:text-primary font-bold text-sm transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-[#4A635A]/65" />
                  Sign In
                </Link>

                <Link 
                  to="/signup" 
                  className="px-4 py-2.5 bg-accent hover:bg-primary text-white font-bold text-sm rounded-xl transition-colors shadow-xs"
                >
                  Register Profile
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger open trigger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-secondary hover:text-primary hover:bg-card-bg/30 rounded-xl transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile expand menu panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-card-bg/40 bg-bg-soft px-4 py-4 space-y-2 shadow-inner">
          {authenticated ? (
            <>
              {/* Mobile user info header */}
              <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-[#EFEEE4]/60 rounded-xl border border-[#D6D8CC]/40">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={profileName} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#b8c9b0] shadow-sm" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-card-bg text-primary font-bold text-sm flex items-center justify-center border-2 border-[#b8c9b0]">
                    {getInitials()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-[#31584E] truncate">{profileName || 'Patient'}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Monitoring Active</span>
                  </div>
                </div>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-bold text-sm transition-colors ${isActive('/dashboard')}`}
              >
                Dashboard
              </Link>
              <Link
                to="/screening"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-bold text-sm transition-colors ${isActive('/screening')}`}
              >
                Start Assessment
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-bold text-sm transition-colors ${isActive('/history')}`}
              >
                History Logs
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-bold text-sm transition-colors ${isActive('/profile')}`}
              >
                My Profile
              </Link>
              
              <div className="h-[1px] bg-card-bg/40 my-2" />

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-rose-700 font-bold text-sm rounded-xl hover:bg-rose-50 hover:text-rose-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Disconnect Portal
              </button>
            </>
          ) : (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-bold text-sm transition-colors ${isActive('/')}`}
              >
                Home
              </Link>
              <a
                href="#how-it-works"
                onClick={handleHowItWorksClick}
                className="block px-4 py-3 rounded-xl font-bold text-sm text-secondary hover:text-primary hover:bg-card-bg/30 transition-colors"
                style={{ contentVisibility: 'auto' }}
              >
                How It Works
              </a>

              <div className="h-[1px] bg-card-bg/40 my-2" />

              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-secondary hover:text-primary font-bold text-sm transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4 text-secondary/70" />
                Sign In
              </Link>

              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-3 bg-accent hover:bg-primary text-white font-bold text-sm rounded-xl transition-colors shadow-xs"
              >
                Register Profile
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
