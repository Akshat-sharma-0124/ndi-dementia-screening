// IMPORTANT:
// Place images inside public/assets/
// doctor-consultation.png
// ndi-architecture.png
// biomarker-analysis.png
// remote-care.png

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Brain, 
  LineChart, 
  ArrowRight, 
  Activity, 
  ShieldAlert, 
  HelpCircle,
  Maximize2,
  Check,
  Mic,
  ClipboardList,
  FileText,
  Shield,
  Clock,
  Briefcase
} from 'lucide-react';
import { isLoggedIn } from '../utils/storage';


export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const authenticated = isLoggedIn();
  
  // Dialog / Lightbox Modal State for inspecting diagrams
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string; category: string } | null>(null);

  // Demo interactive score state: 'severe' | 'moderate' | 'mci' | 'healthy'
  const [demoCategory, setDemoCategory] = useState<'severe' | 'moderate' | 'mci' | 'healthy'>('healthy');

  const demoData = {
    severe: {
      score: 28,
      status: 'Severe',
      riskLevel: 'High Risk',
      progressBar: '28%',
      confidence: '88%',
      description: 'Communication patterns show significant cognitive concern. Clinical review is strongly recommended.',
      statusColor: 'bg-rose-100/90 border border-rose-350 text-rose-800',
      statusDot: 'bg-rose-500',
      riskColor: 'bg-rose-50 border border-rose-250 text-rose-700',
      barColor: 'bg-rose-600',
      highlightClass: 'border-2 border-rose-500 bg-rose-50/80 text-rose-950 shadow-3xs font-extrabold'
    },
    moderate: {
      score: 42,
      status: 'Moderate',
      riskLevel: 'Moderate Risk',
      progressBar: '42%',
      confidence: '90%',
      description: 'Speech and narrative markers indicate moderate cognitive communication changes.',
      statusColor: 'bg-amber-100/90 border border-amber-350 text-amber-800',
      statusDot: 'bg-amber-500',
      riskColor: 'bg-amber-50 border border-amber-250 text-amber-700',
      barColor: 'bg-amber-600',
      highlightClass: 'border-2 border-amber-500 bg-amber-50/80 text-amber-950 shadow-3xs font-extrabold'
    },
    mci: {
      score: 56,
      status: 'Mild Cognitive Impairment',
      riskLevel: 'Attention Recommended',
      progressBar: '56%',
      confidence: '91%',
      description: 'Current communication biomarkers indicate mild cognitive changes. Continued monitoring is recommended.',
      statusColor: 'bg-yellow-100/90 border border-yellow-350 text-yellow-850',
      statusDot: 'bg-yellow-500',
      riskColor: 'bg-yellow-50 border border-yellow-250 text-yellow-750',
      barColor: 'bg-yellow-500',
      highlightClass: 'border-2 border-yellow-500 bg-yellow-50/80 text-yellow-950 shadow-3xs font-extrabold'
    },
    healthy: {
      score: 72,
      status: 'Healthy',
      riskLevel: 'Low Risk',
      progressBar: '72%',
      confidence: '92%',
      description: 'Communication biomarkers appear stable with strong narrative coherence.',
      statusColor: 'bg-emerald-100 border border-emerald-250 text-emerald-800',
      statusDot: 'bg-emerald-500',
      riskColor: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
      barColor: 'bg-emerald-600',
      highlightClass: 'border-2 border-emerald-500 bg-emerald-100/90 text-emerald-950 shadow-3xs font-extrabold'
    }
  };

  useEffect(() => {
    if (location.hash === '#how-it-works') {
      const element = document.getElementById('how-it-works');
      if (element) {
        // Subtle offset delay to ensure DOM is fully content-ready and loaded
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [location]);

  const handleStartCTA = () => {
    if (authenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleStartScreeningCTA = () => {
    if (authenticated) {
      navigate('/screening');
    } else {
      navigate('/login');
    }
  };

  const handleViewSampleReport = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const element = document.getElementById('sample-preview');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-dark font-sans flex flex-col">
      
      {/* Main Container with max width constraints to prevent ultra-wide stretching */}
      <div className="max-w-[1200px] mx-auto w-full flex-grow px-4 sm:px-6">

        {/* 1. Hero Section - Two Column Layout */}
        <section className="py-12 border-b border-secondary/25">
          <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Hero Text */}
            <div className="md:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-soft border border-secondary/35 rounded-full text-primary text-xs font-bold font-mono tracking-wide uppercase shadow-2xs">
                <Activity className="w-3.5 h-3.5 text-accent" />
                AI-Powered Cognitive Screening
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-primary tracking-tight leading-[1.12] font-display">
                Early Cognitive Screening Through Communication Analysis
              </h1>

              <p className="text-sm sm:text-base text-secondary leading-relaxed max-w-xl font-bold">
                NDI helps analyze speech, pauses, story flow, and communication patterns to support early cognitive health screening.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handleStartCTA}
                  id="hero-start-btn"
                  className="px-6 py-3 bg-accent hover:bg-primary text-bg-soft font-extrabold rounded-xl shadow-md cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  Start Screening
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#how-it-works"
                  className="px-6 py-3 bg-bg-soft hover:bg-card-bg text-primary font-extrabold rounded-xl transition-all duration-200 text-center text-xs sm:text-sm border border-secondary/20"
                >
                  Learn More
                </a>
              </div>

              {/* Trust Indicators Section */}
              <div className="p-3 sm:p-4 bg-[#F5F4ED] border border-secondary/35 rounded-2xl shadow-xs flex flex-col sm:grid sm:grid-cols-2 md:flex md:flex-row md:items-center justify-between gap-4 max-w-2xl text-text-dark font-sans">
                
                {/* 1. Privacy First */}
                <div className="flex items-center gap-3 text-left trust-badge-card flex-1 p-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 transition-colors duration-280 trust-badge-icon">
                    <Shield className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-primary text-xs">
                      Privacy First
                    </h5>
                    <p className="text-[10px] text-secondary font-semibold leading-tight mt-0.5">
                      Your data stays local and secure
                    </p>
                  </div>
                </div>

                <div className="hidden md:block w-[1px] h-8 bg-secondary/20 shrink-0" />

                {/* 2. 2 Minute Assessment */}
                <div className="flex items-center gap-3 text-left trust-badge-card flex-1 p-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 transition-colors duration-280 trust-badge-icon">
                    <Clock className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-primary text-xs">
                      2 Minute Assessment
                    </h5>
                    <p className="text-[10px] text-secondary font-semibold leading-tight mt-0.5">
                      Quick and simple to complete
                    </p>
                  </div>
                </div>

                <div className="hidden md:block w-[1px] h-8 bg-secondary/20 shrink-0" />

                {/* 3. Explainable AI Reports */}
                <div className="flex items-center gap-3 text-left trust-badge-card flex-1 p-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 transition-colors duration-280 trust-badge-icon">
                    <Brain className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-primary text-xs">
                      Explainable AI Reports
                    </h5>
                    <p className="text-[10px] text-secondary font-semibold leading-tight mt-0.5">
                      Clear insights you can trust
                    </p>
                  </div>
                </div>

                <div className="hidden md:block w-[1px] h-8 bg-secondary/20 shrink-0" />

                {/* 4. Clinical Best Practices */}
                <div className="flex items-center gap-3 text-left trust-badge-card flex-1 p-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 transition-colors duration-280 trust-badge-icon">
                    <Briefcase className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-primary text-xs">
                      Clinical Best Practices
                    </h5>
                    <p className="text-[10px] text-secondary font-semibold leading-tight mt-0.5">
                      Built with healthcare-inspired design principles
                    </p>
                  </div>
                </div>

              </div>

              {/* Disclaimer card inside left content */}
              <div className="p-3.5 bg-card-bg border border-secondary/35 rounded-xl text-[11px] sm:text-xs flex gap-3 text-primary max-w-xl shadow-2xs font-bold">
                <ShieldAlert className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Clinical Notice:</strong> This is a screening support tool, not a medical diagnosis.
                </p>
              </div>
            </div>

            {/* Right Column: Doctor Consultation Image */}
            <div className="md:col-span-5 relative w-full flex flex-col justify-stretch self-stretch h-[350px] md:h-full">
              <div 
                className="relative overflow-hidden cursor-pointer group rounded-[32px] border border-[#C8CBB7] shadow-xl h-full w-full flex" 
                onClick={() => setZoomImage({
                  src: "/assets/doctor-consultation.png",
                  alt: "Doctor Consultation",
                  category: "Clinical Asset"
                })}
              >
                <img
                  src="/assets/doctor-consultation.png"
                  alt="Doctor consultation"
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
            </div>

          </div>
        </section>

        {/* 2. How It Works Section */}
        <section id="how-it-works" className="py-16 border-b border-secondary/25 scroll-mt-20">
          <div className="max-w-4xl mx-auto text-center mb-12 space-y-3.5">
            <span className="inline-block text-[11px] font-mono font-bold tracking-widest text-[#2F4A43] bg-[#E9E6DC] px-3.5 py-1 rounded-full uppercase border border-[#C8CBB7]">
              HOW NDI WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2F4A43] tracking-tight">
              Simple Speech-Based Cognitive Screening
            </h2>
            <p className="text-sm sm:text-base text-[#4A635A] leading-relaxed max-w-2xl mx-auto font-bold">
              NDI analyzes guided speech tasks to understand communication patterns, speech pauses, narrative flow, and cognitive communication changes.
            </p>
          </div>

          {/* Grid Layout for Steps and Infographic */}
          <div className="grid md:grid-cols-12 gap-8 items-stretch mt-8">
            
            {/* Left side: 4-step process cards */}
            <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
              
              {/* Step 1 */}
              <div className="bg-[#E9E6DC] hover:bg-[#C8CBB7]/40 border border-[#C8CBB7] p-5 rounded-2xl shadow-xs transition-colors duration-300 flex items-start gap-4 text-left relative">
                <div className="w-10 h-10 bg-[#2F4A43] text-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-[#6E8A7B] text-white">
                      Step 01
                    </span>
                    <h3 className="text-sm font-extrabold text-[#2F4A43]">
                      Record Speech
                    </h3>
                  </div>
                  <p className="text-xs text-[#4A635A] leading-relaxed mt-1 font-bold">
                    Speak naturally for 1–3 minutes following a simple prompt in a quiet setting.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#E9E6DC] hover:bg-[#C8CBB7]/40 border border-[#C8CBB7] p-5 rounded-2xl shadow-xs transition-colors duration-300 flex items-start gap-4 text-left relative">
                <div className="w-10 h-10 bg-[#2F4A43] text-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-[#6E8A7B] text-white">
                      Step 02
                    </span>
                    <h3 className="text-sm font-extrabold text-[#2F4A43]">
                      Convert to Text
                    </h3>
                  </div>
                  <p className="text-xs text-[#4A635A] leading-relaxed mt-1 font-bold">
                    The speech data is securely transcribed to analyze text features alongside vocal pacing.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#E9E6DC] hover:bg-[#C8CBB7]/40 border border-[#C8CBB7] p-5 rounded-2xl shadow-xs transition-colors duration-300 flex items-start gap-4 text-left relative">
                <div className="w-10 h-10 bg-[#2F4A43] text-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-[#6E8A7B] text-white">
                      Step 03
                    </span>
                    <h3 className="text-sm font-extrabold text-[#2F4A43]">
                      Analyze Narrative & Speech
                    </h3>
                  </div>
                  <p className="text-xs text-[#4A635A] leading-relaxed mt-1 font-bold">
                    Our AI algorithm processes vocabulary density, grammatical structure, coherence, and pause markers.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-[#E9E6DC] hover:bg-[#C8CBB7]/40 border border-[#C8CBB7] p-5 rounded-2xl shadow-xs transition-colors duration-300 flex items-start gap-4 text-left relative">
                <div className="w-10 h-10 bg-[#2F4A43] text-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-[#6E8A7B] text-white">
                      Step 04
                    </span>
                    <h3 className="text-sm font-extrabold text-[#2F4A43]">
                      Generate NDI Report
                    </h3>
                  </div>
                  <p className="text-xs text-[#4A635A] leading-relaxed mt-1 font-bold">
                    Get an explainable report displaying cognitive screening indices, visual charts, and actionable insights.
                  </p>
                </div>
              </div>

            </div>

            {/* Right side: NDI Architecture Infographic card */}
            <div className="md:col-span-5 flex flex-col justify-center">
              <div 
                onClick={() => setZoomImage({
                  src: "/assets/ndi-architecture.png",
                  alt: "NDI Architecture & Flow Diagram",
                  category: "System Architecture"
                })}
                className="cursor-pointer relative group overflow-hidden rounded-[24px] border border-secondary/35 bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 h-full flex items-center justify-center"
              >
                <img
                  src="/assets/ndi-architecture.png"
                  alt="NDI Architecture"
                  className="w-full object-contain rounded-xl max-h-[400px] transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
            </div>

          </div>

          {/* Bottom disclaimer note */}
          <div className="mt-8 text-center bg-[#E9E6DC]/40 py-2.5 px-4 rounded-xl max-w-xl mx-auto border border-[#C8CBB7]/40">
            <p className="text-xs font-mono font-bold text-[#4A635A] tracking-wide">
              * This tool supports early screening only and does not replace clinical diagnosis.
            </p>
          </div>

          {/* CTA Button below section */}
          <div className="mt-10 text-center">
            <button
              onClick={handleStartScreeningCTA}
              className="px-8 py-4 bg-[#6E8A7B] hover:bg-[#2F4A43] text-white font-extrabold rounded-2xl transition-all duration-300 text-sm cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2 mx-auto"
            >
              Start Your Screening
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Sample NDI Result Preview Section */}
        <section id="sample-preview" className="py-12 border-b border-secondary/25">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            
            <div className="space-y-2">
              <span className="inline-block text-[11px] font-mono font-bold tracking-widest text-[#2F4A43] bg-[#E9E6DC] px-3.5 py-1 rounded-full uppercase border border-[#C8CBB7]">
                NDI Analytics Preview
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2F4A43] tracking-tight">
                Sample NDI Result Preview
              </h2>
              <p className="text-xs sm:text-sm text-[#4A635A] max-w-lg mx-auto font-bold leading-relaxed">
                See how cognitive biomarkers and speech analysis flow into a unified patient indicator sheet.
              </p>
            </div>

            {/* Centered Preview Card */}
            <div className="bg-[#E9E6DC] border-2 border-secondary/40 rounded-3xl p-6 sm:p-8 shadow-md text-left space-y-6 relative overflow-hidden transition-all duration-300">
              
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-secondary/25 pb-4 gap-3">
                <div>
                  <h3 className="font-extrabold text-primary text-sm tracking-wide uppercase font-mono">
                    Sample Screening Result
                  </h3>
                  <span className="text-[10px] text-secondary font-semibold font-mono">
                    ID: DEMO-729481 | Verified ✓
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${demoData[demoCategory].statusColor} text-xs font-extrabold uppercase tracking-wider select-none shadow-3xs transition-all duration-300`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${demoData[demoCategory].statusDot} shrink-0`} />
                    {demoData[demoCategory].status}
                  </span>
                  
                  {/* Risk Badge */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${demoData[demoCategory].riskColor} text-[10px] font-extrabold uppercase tracking-wide select-none transition-all duration-300`}>
                    {demoData[demoCategory].riskLevel}
                  </span>
                </div>
              </div>

              {/* Main Content: Score + Progress */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                
                {/* Large Score Indicator */}
                <div className="sm:col-span-4 flex flex-col items-center sm:items-start justify-center border-b sm:border-b-0 sm:border-r border-secondary/25 pb-4 sm:pb-0 sm:pr-6">
                  <span className="text-[10px] text-accent uppercase tracking-widest font-mono font-bold block mb-1">
                    NDI Score
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl sm:text-6xl font-extrabold text-primary font-display tracking-tight transition-all duration-300">
                      {demoData[demoCategory].score}
                    </span>
                    <span className="text-secondary font-mono font-bold text-sm">
                      /100
                    </span>
                  </div>
                </div>

                {/* Progress bar and details */}
                <div className="sm:col-span-8 space-y-4">
                  
                  {/* Progress bar label */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary font-bold">Progress Indicator</span>
                    <span className="font-mono font-extrabold text-primary transition-all duration-300">
                      {demoData[demoCategory].progressBar}
                    </span>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="w-full bg-[#DAD9CB] rounded-full h-3.5 overflow-hidden border border-secondary/20 shadow-inner">
                    <div 
                      className={`${demoData[demoCategory].barColor} h-full rounded-full transition-all duration-500 ease-out`} 
                      style={{ width: demoData[demoCategory].progressBar }}
                    />
                  </div>

                  {/* Confidence metrics */}
                  <div className="flex items-center justify-between text-xs font-mono font-bold pt-1.5 border-t border-secondary/15">
                    <span className="text-secondary">Analysis Confidence:</span>
                    <span className="text-primary font-extrabold transition-all duration-300">
                      {demoData[demoCategory].confidence}
                    </span>
                  </div>

                </div>

              </div>

              {/* Dynamic Case Analysis Description */}
              <div className="bg-bg-soft/75 border border-secondary/20 p-4 rounded-xl text-xs text-secondary font-semibold leading-relaxed transition-all duration-300 min-h-[58px]">
                <strong className="text-primary block mb-0.5">Preview Case Analysis:</strong>
                <p className="transition-all duration-300 text-primary/95">
                  {demoData[demoCategory].description}
                </p>
              </div>

              {/* Mini Score Scale */}
              <div className="pt-4 border-t border-secondary/25 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[9px] text-accent font-mono uppercase tracking-widest font-bold block">
                    Cognitive Health Score Classification
                  </span>
                  <span className="text-[9px] text-secondary font-bold font-mono">
                    Click a category to preview how the NDI report changes.
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center font-mono text-[9px] font-bold">
                  {/* Severe */}
                  <button
                    type="button"
                    onClick={() => setDemoCategory('severe')}
                    className={`p-2 rounded-md text-center transition-all duration-200 cursor-pointer ${
                      demoCategory === 'severe'
                        ? demoData.severe.highlightClass
                        : 'bg-[#DAD9CB]/25 border border-secondary/15 text-secondary/60 hover:bg-bg-soft/50 hover:border-secondary/35'
                    }`}
                  >
                    <div className="font-bold">Severe</div>
                    <div className="text-[8px] mt-0.5">&lt; 35</div>
                  </button>
                  
                  {/* Moderate */}
                  <button
                    type="button"
                    onClick={() => setDemoCategory('moderate')}
                    className={`p-2 rounded-md text-center transition-all duration-200 cursor-pointer ${
                      demoCategory === 'moderate'
                        ? demoData.moderate.highlightClass
                        : 'bg-[#DAD9CB]/25 border border-secondary/15 text-secondary/60 hover:bg-bg-soft/50 hover:border-secondary/35'
                    }`}
                  >
                    <div className="font-bold">Moderate</div>
                    <div className="text-[8px] mt-0.5">35–50</div>
                  </button>
                  
                  {/* MCI */}
                  <button
                    type="button"
                    onClick={() => setDemoCategory('mci')}
                    className={`p-2 rounded-md text-center transition-all duration-200 cursor-pointer ${
                      demoCategory === 'mci'
                        ? demoData.mci.highlightClass
                        : 'bg-[#DAD9CB]/25 border border-secondary/15 text-secondary/60 hover:bg-bg-soft/50 hover:border-secondary/35'
                    }`}
                  >
                    <div className="font-bold">MCI</div>
                    <div className="text-[8px] mt-0.5">50–60</div>
                  </button>
                  
                  {/* Healthy */}
                  <button
                    type="button"
                    onClick={() => setDemoCategory('healthy')}
                    className={`p-2 rounded-md text-center transition-all duration-200 cursor-pointer ${
                      demoCategory === 'healthy'
                        ? demoData.healthy.highlightClass
                        : 'bg-[#DAD9CB]/25 border border-secondary/15 text-secondary/60 hover:bg-bg-soft/50 hover:border-secondary/35'
                    }`}
                  >
                    <div className="font-bold">Healthy</div>
                    <div className="text-[8px] mt-0.5">60+</div>
                  </button>
                </div>
              </div>

              {/* Bottom Caption */}
              <p className="text-[10px] text-secondary font-semibold italic text-center pt-2 leading-relaxed">
                "This is a demonstration result. Actual scores are generated after completing a voice assessment."
              </p>

            </div>

          </div>
        </section>

        {/* 3. Quick stats below hero */}
        <section className="py-8 border-b border-secondary/25">
          <div className="grid sm:grid-cols-3 gap-4 font-sans">
            <div className="bg-bg-soft border border-secondary/35 p-4 rounded-xl shadow-2xs space-y-1.5 font-bold">
              <div className="w-8 h-8 rounded-lg bg-card-bg text-primary flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-xs sm:text-sm text-primary uppercase tracking-wider font-mono">Speech Analysis</h3>
              <p className="text-[11.5px] sm:text-xs text-secondary leading-relaxed">
                Evaluates vocal delays, recovery pauses, and acoustic timelines down to millisecond intervals.
              </p>
            </div>

            <div className="bg-bg-soft border border-secondary/35 p-4 rounded-xl shadow-2xs space-y-1.5 font-bold">
              <div className="w-8 h-8 rounded-lg bg-card-bg text-accent flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-accent" />
              </div>
              <h3 className="text-xs sm:text-sm text-primary uppercase tracking-wider font-mono">Narrative Coherence</h3>
              <p className="text-[11.5px] sm:text-xs text-secondary leading-relaxed">
                Measures paragraph local connections and how closely topics match targeted prompts.
              </p>
            </div>

            <div className="bg-bg-soft border border-secondary/35 p-4 rounded-xl shadow-2xs space-y-1.5 font-bold">
              <div className="w-8 h-8 rounded-lg bg-card-bg text-primary flex items-center justify-center">
                <LineChart className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-xs sm:text-sm text-primary uppercase tracking-wider font-mono">Progress Tracking</h3>
              <p className="text-[11.5px] sm:text-xs text-secondary leading-relaxed">
                Archived trend logs are preserved inside local storage to view monthly baseline fluctuations.
              </p>
            </div>
          </div>
        </section>

        {/* Workflow Progress Indicator Bar */}
        <section className="py-6 border-b border-secondary/25">
          <div className="bg-bg-soft border border-secondary/35 rounded-2xl p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="shrink-0 text-left">
                <span className="text-[10px] font-mono font-extrabold tracking-widest text-accent uppercase bg-accent/10 px-2 py-0.5 rounded">
                  SCREENING FLOW
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold text-primary mt-1.5">
                  Guideline Navigation
                </h4>
              </div>
              
              <div className="flex-grow max-w-2xl w-full">
                <div className="relative flex items-center justify-between">
                  {/* Background line */}
                  <div className="absolute left-4 right-4 top-4 h-[3px] bg-secondary/20 rounded-full -translate-y-1/2" />
                  {/* Highlight active progress line (connecting Step 1 and 2) */}
                  <div className="absolute left-4 w-1/2 top-4 h-[3px] bg-accent rounded-full -translate-y-1/2 flow-line-glow" />
                  
                  {/* Step 1: Record */}
                  <div className="relative flex flex-col items-center shrink-0 flow-item-hover">
                    <div className="w-8 h-8 rounded-full bg-accent text-bg-soft font-mono font-bold text-xs flex items-center justify-center border-4 border-bg-main shadow-sm transition-all duration-300 flow-circle-custom flow-step-pulse-1">
                      1
                    </div>
                    <span className="text-xs font-extrabold text-primary mt-1.5 font-sans">Record</span>
                    <span className="text-[10px] text-secondary font-bold hidden sm:inline mt-0.5">1-2 Min Speech</span>
                  </div>

                  {/* Step 2: Analyze */}
                  <div className="relative flex flex-col items-center shrink-0 flow-item-hover">
                    <div className="w-8 h-8 rounded-full bg-accent text-bg-soft font-mono font-bold text-xs flex items-center justify-center border-4 border-bg-main shadow-sm transition-all duration-300 flow-circle-custom flow-step-pulse-2">
                      2
                    </div>
                    <span className="text-xs font-extrabold text-primary mt-1.5 font-sans">Analyze</span>
                    <span className="text-[10px] text-secondary font-bold hidden sm:inline mt-0.5">Vocal Biomarkers</span>
                  </div>

                  {/* Step 3: Review */}
                  <div className="relative flex flex-col items-center shrink-0 flow-item-hover">
                    <div className="w-8 h-8 rounded-full bg-bg-main text-secondary border border-secondary/35 font-mono font-bold text-xs flex items-center justify-center border-4 border-bg-main shadow-sm transition-all duration-300 flow-circle-custom flow-step-pulse-3">
                      3
                    </div>
                    <span className="text-xs font-bold text-secondary mt-1.5 font-sans">Review</span>
                    <span className="text-[10px] text-secondary/70 font-semibold hidden sm:inline mt-0.5">Explore NDI Report</span>
                  </div>
                </div>

                {/* Optional flow subtitle caption */}
                <p className="text-[10px] text-secondary font-bold text-center mt-3 font-mono">
                  Follow the guided process from recording to explainable report.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Dementia Awareness Section - Visually card-based */}
        <section className="py-12 border-b border-secondary/25 space-y-6">
          <div className="text-left space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-wider text-accent uppercase bg-bg-soft px-2.5 py-0.5 rounded-sm">
              Cognitive Context
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary">
              Understanding Early Cognitive Changes
            </h2>
          </div>

          <div className="grid md:grid-cols-12 gap-5 items-stretch">
            
            {/* What is Dementia Panel (5 cols) */}
            <div className="md:col-span-5 bg-card-bg border border-secondary/35 p-5 sm:p-6 rounded-2xl flex flex-col justify-between font-bold">
              <div className="space-y-3.5">
                <h3 className="text-base sm:text-lg text-primary flex items-center gap-2">
                  <Brain className="w-4.5 h-4.5 text-accent" />
                  What is dementia?
                </h3>
                <p className="text-xs sm:text-sm text-secondary leading-relaxed font-bold">
                  Dementia is an umbrella term for decline in mental ability severe enough to interfere with daily life. It is caused by physical changes in the neurological networks of the brain.
                </p>
                <p className="text-xs text-secondary font-bold leading-relaxed">
                  Before memory hurdles completely disrupt daily activity, subtle variations in vocal structure and chronological narrative timing develop in conversation.
                </p>
              </div>
              <div className="pt-4 border-t border-secondary/25 text-[10px] text-accent font-mono uppercase tracking-widest mt-4">
                Clinical Research Baseline Core
              </div>
            </div>

            {/* Early Signs Checklist Panel (7 cols) */}
            <div className="md:col-span-7 bg-bg-soft border border-secondary/35 p-5 sm:p-6 rounded-2xl space-y-4 font-bold">
              <h3 className="text-base sm:text-lg text-primary flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-accent" />
                Signs of Communication Changes
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-bg-main border border-secondary/30 rounded-xl space-y-1">
                  <strong className="text-primary block">Word-finding Difficulty</strong>
                  <p className="text-secondary text-[11px] leading-relaxed">Substituting descriptions or using excessive conversational pauses ("um", "uh") when tracing names or nouns.</p>
                </div>
                
                <div className="p-3 bg-bg-main border border-secondary/30 rounded-xl space-y-1">
                  <strong className="text-primary block">Topic Drifting</strong>
                  <p className="text-secondary text-[11px] leading-relaxed">Gradually straying away from a specific question to recount unrelated anecdotes, revealing working memory load.</p>
                </div>

                <div className="p-3 bg-bg-main border border-secondary/30 rounded-xl space-y-1">
                  <strong className="text-primary block">Long Pauses</strong>
                  <p className="text-secondary text-[11px] leading-relaxed">Extended silent spans lasting over 2.5 seconds when formulating story components or chronologies.</p>
                </div>

                <div className="p-3 bg-bg-main border border-secondary/30 rounded-xl space-y-1">
                  <strong className="text-primary block">Story Confusion</strong>
                  <p className="text-secondary text-[11px] leading-relaxed">Struggling to arrange events chronologically or failing to establish main characters in continuous speech.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 5. Biomarker Section */}
        <section className="py-12 border-b border-secondary/25">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-accent bg-bg-soft px-2.5 py-0.5 rounded uppercase">
              Physical Dimensions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary">
              Multimodal Speech Biomarkers
            </h2>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-stretch">
            
            {/* Biomarker Image Left */}
            <div className="md:col-span-5 flex flex-col justify-center">
              <div 
                onClick={() => setZoomImage({
                  src: "/assets/biomarker-analysis.png",
                  alt: "Biomarker analysis",
                  category: "Linguistic Biomarker Map"
                })}
                className="cursor-pointer relative group"
              >
                <img
                  src="/assets/biomarker-analysis.png"
                  alt="Biomarker analysis"
                  className="w-full rounded-[28px] border border-[#C8CBB7] shadow-lg"
                />
              </div>
            </div>

            {/* Feature Cards Right */}
            <div className="md:col-span-7 grid sm:grid-cols-2 gap-4 font-bold">
              <div className="p-4 bg-bg-soft border border-secondary/35 rounded-xl space-y-1.5">
                <div className="w-7 h-7 bg-card-bg text-primary flex items-center justify-center rounded font-extrabold text-xs">
                  01
                </div>
                <h4 className="text-xs sm:text-sm text-primary font-bold">Speech Rate</h4>
                <p className="text-[11px] text-secondary leading-relaxed">
                  Counts continuous verbal tempos. Slowed rates identify cognitive fatigues.
                </p>
              </div>

              <div className="p-4 bg-bg-soft border border-secondary/35 rounded-xl space-y-1.5">
                <div className="w-7 h-7 bg-card-bg text-accent flex items-center justify-center rounded font-extrabold text-xs">
                  02
                </div>
                <h4 className="text-xs sm:text-sm text-primary font-bold">Pause Duration</h4>
                <p className="text-[11px] text-secondary leading-relaxed">
                  Precisely clocks silence durations longer than standard 2.5 second gaps.
                </p>
              </div>

              <div className="p-4 bg-bg-soft border border-secondary/35 rounded-xl space-y-1.5">
                <div className="w-7 h-7 bg-card-bg text-primary flex items-center justify-center rounded font-extrabold text-xs">
                  03
                </div>
                <h4 className="text-xs sm:text-sm text-primary font-bold">Local Coherence</h4>
                <p className="text-[11px] text-secondary leading-relaxed">
                  Evaluates how sentences flow together logically without structural interruption.
                </p>
              </div>

              <div className="p-4 bg-bg-soft border border-secondary/35 rounded-xl space-y-1.5">
                <div className="w-7 h-7 bg-card-bg text-accent flex items-center justify-center rounded font-extrabold text-xs">
                  04
                </div>
                <h4 className="text-xs sm:text-sm text-primary font-bold">Story Grammar</h4>
                <p className="text-[11px] text-secondary leading-relaxed">
                  Tracks character names, setup variables, and clear thematic delivery lines.
                </p>
              </div>

              <div className="p-4 bg-bg-soft border border-secondary/35 rounded-xl sm:col-span-2 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-accent" />
                  <h4 className="text-xs sm:text-sm text-primary font-bold">Explainable Report</h4>
                </div>
                <p className="text-[11px] text-secondary leading-relaxed text-left">
                  Provides a fully descriptive report combining vocal speed metrics, pause analysis logs, topic indicators, and clean print-friendly metrics.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 6. Remote Care / Impact Section */}
        <section className="py-12 border-b border-secondary/25 space-y-6">
          <div className="text-left space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-accent bg-bg-soft px-2.5 py-0.5 rounded uppercase">
              Care Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary">
              Empowering Remote Care Networks
            </h2>
          </div>

          <div className="bg-[#E9E6DC] border border-[#C8CBB7] rounded-3xl p-6 shadow-sm">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              
              {/* Left side: description and three cards stacked */}
              <div className="md:col-span-7 space-y-4 text-left">
                <p className="text-sm text-secondary font-bold leading-relaxed">
                  NDI integrates seamlessly into home care settings, family check-ins, and clinical review workflows to keep networks connected.
                </p>
                
                <div className="space-y-3">
                  <div className="space-y-1 bg-bg-soft p-4 rounded-xl border border-secondary/20 shadow-2xs font-bold">
                    <h4 className="font-extrabold text-[#203832] flex items-center gap-1.5 text-xs sm:text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
                      For Patients
                    </h4>
                    <p className="text-[11px] text-secondary leading-relaxed">
                      Complete independent voice screens inside under 4 minutes, directly from home and zero clinic travel hassles.
                    </p>
                  </div>
                  
                  <div className="space-y-1 bg-bg-soft p-4 rounded-xl border border-secondary/20 shadow-2xs font-bold">
                    <h4 className="font-extrabold text-[#203832] flex items-center gap-1.5 text-xs sm:text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
                      For Caregivers
                    </h4>
                    <p className="text-[11px] text-secondary leading-relaxed">
                      Preserve cognitive trajectories logs locally, spotting memory trends immediately and keeping support groups updated.
                    </p>
                  </div>

                  <div className="space-y-1 bg-bg-soft p-4 rounded-xl border border-secondary/20 shadow-2xs font-bold">
                    <h4 className="font-extrabold text-primary flex items-center gap-1.5 text-xs sm:text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                      For Clinical Review
                    </h4>
                    <p className="text-[11px] text-secondary leading-relaxed">
                      Share standardized parameters (coherence indices, speech rates, pauses) with physicians at scheduled visits.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side: remote-care.png */}
              <div className="md:col-span-5 flex flex-col justify-center">
                <div 
                  onClick={() => setZoomImage({
                    src: "/assets/remote-care.png",
                    alt: "Remote care and clinical reviews",
                    category: "Remote Health Integration"
                  })}
                  className="cursor-pointer relative group overflow-hidden rounded-[32px] border border-secondary/35 shadow-xl bg-bg-soft"
                >
                  <img
                    src="/assets/remote-care.png"
                    alt="Remote care"
                    className="w-full h-[420px] object-cover rounded-[32px] transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 7. Final CTA Section */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto bg-[#E9E6DC] border border-secondary/35 rounded-[32px] p-8 sm:p-10 shadow-md text-center space-y-6">
            
            {/* Centered Icon at Top */}
            <div className="w-12 h-12 bg-accent/15 text-accent rounded-full flex items-center justify-center mx-auto shadow-3xs">
              <Brain className="w-6 h-6 text-accent" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-primary font-display tracking-tight leading-tight">
                Take a 2-Minute Cognitive Baseline Assessment
              </h3>
              <p className="text-secondary text-xs sm:text-sm max-w-xl mx-auto font-bold leading-relaxed">
                Complete a guided speech screening from home and receive an explainable NDI communication profile.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={handleStartCTA}
                className="px-8 py-3.5 bg-accent hover:bg-primary text-white font-extrabold rounded-xl transition-all duration-200 text-xs sm:text-sm cursor-pointer shadow-sm hover:shadow-md flex items-center gap-1.5"
              >
                Start Assessment
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
              
              <button
                onClick={handleViewSampleReport}
                className="px-8 py-3.5 bg-bg-soft hover:bg-card-bg text-primary font-extrabold rounded-xl transition-all duration-200 text-xs sm:text-sm cursor-pointer border border-secondary/20 shadow-3xs"
              >
                View Sample Report
              </button>
            </div>

            {/* 3 Trust Points below buttons */}
            <div className="pt-6 border-t border-secondary/20 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-secondary font-mono text-[10.5px] font-bold">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                Private & Secure
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                Speech-Based Screening
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                Explainable Results
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* Lightbox / Zoom Modal Overlay Component */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-primary/75 z-50 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200 animate-fadeIn"
          onClick={() => setZoomImage(null)}
        >
          <div 
            className="bg-bg-main max-w-3xl w-full rounded-2xl overflow-hidden border-2 border-secondary/40 shadow-xl flex flex-col relative max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-secondary/35 bg-bg-soft">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-accent block">
                  {zoomImage.category}
                </span>
                <h4 className="font-extrabold text-primary text-xs sm:text-sm leading-tight">
                  {zoomImage.alt}
                </h4>
              </div>
              <button
                onClick={() => setZoomImage(null)}
                className="p-1 px-2 text-primary font-mono text-[10px] font-bold border border-secondary/30 rounded-md hover:bg-card-bg cursor-pointer"
              >
                CLOSE [X]
              </button>
            </div>

            {/* Graphic frame */}
            <div className="p-4 overflow-y-auto bg-bg-soft flex items-center justify-center aspect-[4/3] md:aspect-auto">
              <img 
                src={zoomImage.src} 
                alt={zoomImage.alt}
                className="max-h-[50vh] max-w-full object-contain rounded-lg border border-secondary/30 shadow-xs"
              />
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-secondary/30 bg-bg-main text-[10px] text-secondary font-mono text-center">
              Licensed clinical communication resource asset. Protected sandbox viewer.
            </div>
          </div>
        </div>
      )}

      {/* 8. Footer (Simple and Compact) */}
      <footer className="bg-primary text-bg-soft border-t border-secondary/30 py-6 px-4 mt-auto select-none">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-bg-soft" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight block text-xs">NDI Cognitive Screening Hub</span>
              <span className="text-[9px] text-bg-main block tracking-wider uppercase font-mono">Clinical Biomarker Support</span>
            </div>
          </div>
          <div className="font-mono text-[10px] text-bg-soft/70">
            © 2026 Narrative Degradation Index. Protected sandbox clinical protocols.
          </div>
        </div>
      </footer>
    </div>
  );
}
