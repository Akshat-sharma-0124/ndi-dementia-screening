import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shield, HelpCircle, Heart, Phone, ArrowUpRight } from 'lucide-react';

// Shared Contexts
import { AvatarProvider } from './contexts/AvatarContext';

// Common Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Page imports
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import StartScreening from './pages/StartScreening';
import Recording from './pages/Recording';
import Processing from './pages/Processing';
import Report from './pages/Report';
import Transcript from './pages/Transcript';
import History from './pages/History';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <AvatarProvider>
      <div className="flex flex-col min-h-screen bg-bg-main text-text-dark selection:bg-accent selection:text-white">

        
        {/* Navigation header */}
        <Navbar />

        {/* Primary Page Content Wrapper */}
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/screening" 
              element={
                <ProtectedRoute>
                  <StartScreening />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recording" 
              element={
                <ProtectedRoute>
                  <Recording />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/processing" 
              element={
                <ProtectedRoute>
                  <Processing />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/report/:id" 
              element={
                <ProtectedRoute>
                  <Report />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transcript/:id" 
              element={
                <ProtectedRoute>
                  <Transcript />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />

            {/* Fallback Catch-all -> Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Soft Section Divider */}
        <div className="w-full max-w-6xl mx-auto px-6 my-10">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        </div>

        {/* Unified Patient-Oriented Redesigned Premium Footer */}
        <footer className="bg-[#2F4A43] border-t border-[rgba(255,255,255,0.1)] text-[#F5F2E8] py-16 px-6 select-none">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            
            {/* Brand column */}
            <div className="space-y-4 font-bold text-left">
              <div className="flex items-center gap-1.5 font-bold text-white text-base">
                <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
                NDI Screening Hub
              </div>
              <p className="text-xs text-[rgba(245,242,232,0.75)] leading-relaxed max-w-sm">
                Proactively screening cognitive communicative baselines through non-invasive speech, rhythm, and narrative structure analyzing tools. Registered and processed locally for ultimate privacy.
              </p>
              <div className="text-[11px] text-[rgba(245,242,232,0.6)] font-mono uppercase tracking-wider">
                System state: Sandbox Mode V1.0.0
              </div>
            </div>

            {/* Quick references */}
            <div className="space-y-4 font-bold text-left">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-widest font-mono">Screening Guidelines</h4>
              <ul className="space-y-3 text-xs text-[rgba(245,242,232,0.75)]">
                <li className="hover:text-white transition-colors duration-200 cursor-default">• Best taken in a soundproofed, quiet indoor room.</li>
                <li className="hover:text-white transition-colors duration-200 cursor-default">• Aim for at least 1–2 minutes of continuous, natural talking.</li>
                <li className="hover:text-white transition-colors duration-200 cursor-default">• Complete screenings once per month to monitor progression traits.</li>
                <li className="hover:text-white transition-colors duration-200 cursor-default">• Always share and download reports to present details to caregiver physicians.</li>
              </ul>
            </div>

            {/* Medical disclaimer panel */}
            <div className="space-y-4 font-bold text-left">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-widest font-mono">Clinical Note & Support</h4>
              <p className="text-xs text-[rgba(245,242,232,0.75)] leading-relaxed">
                <strong>Disclaimer:</strong> NDI reports are non-diagnostic, informational support assets. They do not replace formal neuropsychological diagnostic reviews, clinical standard MMSE audits, or physical hospital examinations.
              </p>
              
              <div className="pt-3 border-t border-[rgba(255,255,255,0.1)] flex flex-wrap gap-4 items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-[rgba(245,242,232,0.7)]">
                  <Shield className="w-3.5 h-3.5 text-[rgba(245,242,232,0.7)] shrink-0" />
                  HIPAA-Privacy sandbox
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-white hover:text-accent cursor-pointer transition-colors duration-200">
                  Patient Support
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                </span>
              </div>
            </div>

          </div>
        </footer>

        {/* Dedicated Bottom Bar Strip */}
        <div className="bg-[#20332E] py-4 px-4 text-center border-t border-[rgba(255,255,255,0.05)] select-none">
          <div className="text-[11px] text-[#F5F2E8] font-bold tracking-wide">
            © 2026 Narrative Degradation Index (NDI)
          </div>
        </div>

      </div>
      </AvatarProvider>
    </BrowserRouter>
  );
}
