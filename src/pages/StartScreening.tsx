import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Clock, 
  ArrowRight, 
  ClipboardCheck, 
  BookOpen, 
  Image, 
  ShieldAlert, 
  CheckCircle2, 
  Shield, 
  Activity, 
  TrendingUp, 
  Volume2, 
  Sparkles, 
  Check,
  Info,
  Lightbulb,
  FileText,
  ScanFace,
  Eye,
  Video,
  Wifi,
  X
} from 'lucide-react';
import { SCREENING_TASKS } from '../data/tasks';
import { isLoggedIn } from '../utils/storage';
import { ScreeningTaskType } from '../types';

// Metadata mapping for task cards visual styles - using muted brand colors
const TASK_METADATA: Record<ScreeningTaskType, {
  category: string;
  categoryClass: string;
  difficulty: string;
  recommendedFor: string;
  iconBg: string;
  icon: React.ReactNode;
  expectedAnalysis: string[];
}> = {
  'describe-day': {
    category: "Memory & Narrative",
    categoryClass: "bg-emerald-50/70 text-emerald-900 border border-emerald-200/50",
    difficulty: "Easy",
    recommendedFor: "Cognitive Baseline",
    iconBg: "bg-emerald-50/70 border border-emerald-200/40",
    icon: <BookOpen className="w-5 h-5 text-emerald-850" />,
    expectedAnalysis: ["Speech Rate", "Pause Duration", "Narrative Coherence", "Semantic Fluency", "Lexical Diversity", "Cognitive Biomarkers"]
  },
  'picture-description': {
    category: "Visual Cognition",
    categoryClass: "bg-amber-50/70 text-amber-900 border border-amber-200/50",
    difficulty: "Easy",
    recommendedFor: "Clinical Standard",
    iconBg: "bg-amber-50/70 border border-amber-200/40",
    icon: <Image className="w-5 h-5 text-amber-850" />,
    expectedAnalysis: ["Speech Rate", "Pause Duration", "Narrative Coherence", "Lexical Diversity"]
  },
  'story-recall': {
    category: "Recall & Sequencing",
    categoryClass: "bg-blue-50/70 text-blue-900 border border-blue-200/50",
    difficulty: "Easy",
    recommendedFor: "Working Memory Test",
    iconBg: "bg-blue-50/70 border border-blue-200/40",
    icon: <FileText className="w-5 h-5 text-blue-850" />,
    expectedAnalysis: ["Pause Duration", "Narrative Coherence", "Lexical Diversity"]
  },
  'facial-expression': {
    category: "Non-Verbal Biomarkers",
    categoryClass: "bg-purple-50/70 text-purple-900 border border-purple-200/50",
    difficulty: "Easy",
    recommendedFor: "Recommended Baseline",
    iconBg: "bg-purple-50/70 border border-purple-200/40",
    icon: <ScanFace className="w-5 h-5 text-purple-850" />,
    expectedAnalysis: ["Eye Contact", "Blink Rate", "Facial Expressiveness", "Emotional Reactivity", "Facial Symmetry", "Engagement Level"]
  },
  // Legacy: kept for type compatibility with existing report history
  'free-speech': {
    category: "Semantic Fluency",
    categoryClass: "bg-purple-50/70 text-purple-900 border border-purple-200/50",
    difficulty: "Easy",
    recommendedFor: "First Time Users",
    iconBg: "bg-purple-50/70 border border-purple-200/40",
    icon: <Mic className="w-5 h-5 text-purple-850" />,
    expectedAnalysis: ["Speech Rate", "Semantic Fluency", "Cognitive Biomarkers"]
  }
};

const ANALYSIS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Speech Rate": TrendingUp,
  "Pause Duration": Clock,
  "Narrative Coherence": BookOpen,
  "Semantic Fluency": Volume2,
  "Lexical Diversity": Sparkles,
  "Cognitive Biomarkers": Activity,
  "Eye Contact": Eye,
  "Blink Rate": Activity,
  "Facial Expressiveness": ScanFace,
  "Emotional Reactivity": Sparkles,
  "Facial Symmetry": Shield,
  "Engagement Level": TrendingUp,
};

export default function StartScreening() {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<ScreeningTaskType>('describe-day');
  const [showStimulusModal, setShowStimulusModal] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  const activeTaskObj = SCREENING_TASKS.find(t => t.id === selectedTask) || SCREENING_TASKS[0];

  const handleStartTask = () => {
    navigate(`/recording?task=${selectedTask}`);
  };

  return (
    <div className="w-full min-h-screen bg-bg-main py-10 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes activeStepGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(123, 196, 127, 0.4); }
          50% { transform: scale(1.02); box-shadow: 0 0 0 8px rgba(123, 196, 127, 0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .animate-active-step-pulse {
          animation: activeStepGlow 3s infinite ease-in-out;
        }
        .animate-pulse-dot {
          animation: pulseDot 2s infinite ease-in-out;
        }
        .hover-card-elevate {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-card-elevate:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -8px rgba(47, 74, 67, 0.15);
          border-color: rgba(110, 138, 123, 0.5);
        }
        .selected-card {
          border-color: var(--color-primary);
          background-color: var(--color-card-bg);
          box-shadow: 0 8px 20px -6px rgba(47, 74, 67, 0.2);
        }
      `}} />
      <div className="max-w-[1200px] mx-auto px-4 space-y-8 text-text-dark animate-fadeIn">
        
        {/* 1. Assessment Overview Banner (Top Section) */}
        <div className="bg-[#E9E6DC]/60 border border-secondary/25 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm backdrop-blur-md relative overflow-hidden">
          {/* Subtle gradient accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="space-y-2 text-left max-w-xl relative z-10">
            <h1 className="text-3xl font-extrabold text-primary font-display tracking-tight">Cognitive Assessment Center</h1>
            <p className="text-secondary text-sm leading-relaxed font-bold">
              Complete clinically inspired narrative, memory, visual cognition and non-verbal communication tasks.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-card-bg/40 p-5 rounded-2xl border border-secondary/20 relative z-10 shrink-0">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block font-mono">Overview Statistics</span>
              <div className="text-xs font-bold text-primary space-y-0.5">
                <div>• Total Tasks: <span className="font-extrabold">4</span></div>
                <div>• Estimated Duration: <span className="font-extrabold">8–10 min</span></div>
                <div>• AI Analysis Depth: <span className="font-extrabold text-accent">Advanced</span></div>
              </div>
            </div>
            
            <div className="hidden sm:block w-px h-12 bg-secondary/20" />
            
            <div className="flex flex-col gap-1.5 text-left">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block font-mono">Monitoring Status</span>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-xs font-extrabold text-emerald-900 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                AI Monitoring Active
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* 2. Left Side: Tasks Section (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-widest text-primary block font-mono">
                Available Assessment Methods
              </span>
            </div>
            
            <div className="space-y-4">
              {SCREENING_TASKS.filter(t => t.id !== 'free-speech').map((task) => {
                const isSelected = selectedTask === task.id;
                const metadata = TASK_METADATA[task.id as ScreeningTaskType];
                
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task.id as ScreeningTaskType)}
                    className={`p-5 rounded-[24px] border-2 text-left cursor-pointer hover-card-elevate relative overflow-hidden ${
                      isSelected ? 'selected-card animate-active-step-pulse' : 'bg-[#E9E6DC]/40 border-secondary/20'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute inset-y-0 left-0 w-1.5 bg-primary rounded-l-[24px]" />
                    )}
                    
                    <div className="flex items-start gap-5">
                      {/* Icon Wrapper */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${metadata.iconBg}`}>
                        {metadata.icon}
                      </div>

                      {/* Card Details */}
                      <div className="space-y-1.5 text-left flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-extrabold text-primary text-lg leading-tight font-display">{task.title}</h3>
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase border shadow-3xs ${metadata.categoryClass}`}>
                            {metadata.category}
                          </span>
                        </div>
                        
                        <p className="text-secondary text-xs leading-relaxed font-bold pr-4">
                          {task.description}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] mt-3 text-secondary font-bold select-none">
                          <span className="flex items-center gap-1.5 bg-bg-main px-2 py-1 rounded-md border border-secondary/10">
                            <Clock className="w-3 h-3 text-primary" />
                            Est: {task.estimatedTime}
                          </span>
                          <span className="bg-bg-main px-2 py-1 rounded-md border border-secondary/10">
                            Difficulty: <span className="text-primary font-extrabold">{metadata.difficulty}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Right Side: Dynamic Task Preview Panel (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-[#E9E6DC]/60 border border-secondary/25 rounded-[32px] shadow-lg p-6 sm:p-8 sticky top-24 space-y-8 backdrop-blur-md">
              
              {/* Header */}
              <div className="text-left space-y-2">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest font-mono block flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Dynamic Task Preview
                </span>
                <h2 className="text-2xl font-extrabold text-primary font-display leading-tight">{activeTaskObj.title}</h2>
                <div className="flex items-center gap-3 text-xs font-bold text-secondary">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> {activeTaskObj.estimatedTime}</span>
                  <span>•</span>
                  <span>{TASK_METADATA[selectedTask].category}</span>
                </div>
              </div>

              <div className="h-px bg-secondary/15 w-full" />

              {/* Dynamic Content Based on Task */}
              <div className="space-y-6">
                
                {/* Clinical Objective */}
                <div className="text-left space-y-2">
                  <span className="text-[11px] font-extrabold text-primary uppercase tracking-wider font-mono block">Clinical Objective</span>
                  <p className="text-secondary text-sm leading-relaxed font-bold">
                    {selectedTask === 'facial-expression' 
                      ? "Analyze non-verbal emotional signaling and facial responsiveness."
                      : activeTaskObj.description}
                  </p>
                </div>

                {/* Task Specific Visuals */}
                {activeTaskObj.id === 'picture-description' && (
                  <div className="space-y-2">
                    <div 
                      onClick={() => setShowStimulusModal(true)}
                      className="rounded-2xl overflow-hidden border border-secondary/25 relative bg-white cursor-pointer group shadow-sm hover:shadow-md transition-all"
                    >
                      <img 
                        src={activeTaskObj.imageUrl} 
                        alt="Cookie Theft Picture"
                        className="w-full h-40 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/0 group-hover:bg-primary/10 transition-colors">
                        <span className="bg-white/90 text-primary text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                          Click to enlarge
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTaskObj.id === 'facial-expression' && (
                  <div className="rounded-2xl border-2 border-dashed border-secondary/30 h-32 bg-card-bg/30 flex flex-col items-center justify-center gap-2 text-secondary/60">
                    <ScanFace className="w-8 h-8 opacity-50" />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider">Camera Preview Area</span>
                  </div>
                )}

                {/* AI Will Analyze */}
                <div className="text-left space-y-3">
                  <span className="text-[11px] font-extrabold text-primary uppercase tracking-wider font-mono block">AI Biomarkers</span>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-secondary font-bold">
                    {TASK_METADATA[selectedTask].expectedAnalysis.map((item) => {
                      const IconComponent = ANALYSIS_ICONS[item] || Activity;
                      return (
                        <div key={item} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Guidelines */}
                <div className="text-left space-y-2 bg-white/40 p-4 rounded-2xl border border-secondary/15">
                  <span className="text-[11px] font-extrabold text-primary uppercase tracking-wider font-mono block">Screening Guidelines</span>
                  <ul className="space-y-1.5 text-xs text-secondary font-bold list-disc pl-4 marker:text-accent">
                    {activeTaskObj.guidelines.map((line, i) => (
                      <li key={i} className="leading-relaxed pl-1">{line}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="h-px bg-secondary/15 w-full" />

              {/* 4. Assessment Readiness Card */}
              <div className="text-left space-y-3">
                <span className="text-[11px] font-extrabold text-primary uppercase tracking-wider font-mono block">Assessment Readiness</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/60 border border-secondary/20 rounded-xl p-3 flex items-center justify-between shadow-3xs">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-bold text-primary">Microphone</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Ready</span>
                  </div>
                  <div className="bg-white/60 border border-secondary/20 rounded-xl p-3 flex items-center justify-between shadow-3xs">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-bold text-primary">Camera</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Ready</span>
                  </div>
                  <div className="bg-white/60 border border-secondary/20 rounded-xl p-3 flex items-center justify-between shadow-3xs">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-bold text-primary">Noise</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Low</span>
                  </div>
                  <div className="bg-white/60 border border-secondary/20 rounded-xl p-3 flex items-center justify-between shadow-3xs">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-bold text-primary">Connection</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Stable</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                 onClick={handleStartTask}
                 className="w-full py-4 bg-gradient-to-r from-primary to-[#3c6b5e] hover:from-[#2a453d] hover:to-primary text-white font-extrabold rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-[0_0_24px_rgba(47,74,67,0.4)] group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <span className="relative z-10 flex items-center gap-2 text-sm uppercase tracking-wider font-mono">
                  {selectedTask === 'facial-expression' ? 'Begin Facial Screening' : 'Begin Cognitive Assessment'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

            </div>
          </div>
        </div>

      </div>

      {/* Cookie Theft Full-Screen Modal */}
      {showStimulusModal && (
        <div 
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowStimulusModal(false)}
        >
          <div 
            className="relative max-w-4xl w-full bg-[#F8F6EE] rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-secondary/20 flex items-center justify-between">
              <div>
                <span className="text-sm font-extrabold text-primary block">Cookie Theft Picture</span>
                <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Boston Diagnostic Aphasia Examination (BDAE)</span>
              </div>
              <button 
                onClick={() => setShowStimulusModal(false)}
                className="w-10 h-10 rounded-full bg-white hover:bg-rose-50 border border-secondary/25 flex items-center justify-center text-secondary hover:text-rose-700 transition-colors cursor-pointer shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-white p-6 flex justify-center items-center">
              <img 
                src={activeTaskObj.imageUrl || '/assets/cookie-theft.png'}
                alt="Cookie Theft Picture — Full View"
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-xs border border-secondary/10"
              />
            </div>
            <div className="p-4 border-t border-secondary/20 text-center bg-[#F8F6EE]">
              <span className="text-xs font-bold text-primary uppercase tracking-widest font-mono">Assessment Stimulus</span>
              <span className="text-[11px] font-bold text-secondary block mt-1">Describe everything you observe in this scene during your screening.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
