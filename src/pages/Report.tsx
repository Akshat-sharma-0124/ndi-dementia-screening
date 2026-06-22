import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Heart, 
  HelpCircle, 
  Play, 
  Printer, 
  ShieldAlert, 
  Activity, 
  CheckCircle, 
  Calendar,
  AlertCircle,
  FileCheck2,
  Info
} from 'lucide-react';
import { getReports, isLoggedIn } from '../utils/storage';
import { NDIReport } from '../types';

export default function Report() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<NDIReport | null>(null);
  const [pdfConverting, setPdfConverting] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    const allReports = getReports();
    const found = allReports.find(r => r.id === id) || allReports[allReports.length - 1];
    
    if (found) {
      setReport(found);
    } else {
      navigate('/dashboard');
    }
  }, [id, navigate]);

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-[#F7F4ED]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6E8168]"></div>
      </div>
    );
  }

  // Determine color classifications based on score or metrics
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-bg-soft border-secondary/45', text: 'text-primary', fill: 'bg-accent', textLight: 'text-primary' };
    if (score >= 70) return { bg: 'bg-bg-soft/80 border-secondary/40', text: 'text-primary', fill: 'bg-accent', textLight: 'text-primary' };
    return { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-950', fill: 'bg-accent', textLight: 'text-amber-900' };
  };

  const colors = getScoreColor(report.ndiScore);

  // Simulated PDF Downloader
  const triggerPdfDownload = () => {
    setPdfConverting(true);
    setPdfSuccess(false);

    setTimeout(() => {
      setPdfConverting(false);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 bg-bg-main text-text-dark animate-fadeIn">
      
      {/* Back & Breadcrumb links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-secondary hover:text-primary text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4 text-accent" />
          Back to Patient Active Console
        </Link>
        
        <span className="text-xs text-secondary font-mono font-bold flex items-center gap-1.5 bg-bg-soft px-3.5 py-1.5 border-2 border-secondary/30 rounded-full">
          <Calendar className="w-4 h-4 text-accent" />
          SCREEN COMPLETED ON: {report.date}
        </span>
      </div>

      {/* Main Scoring Header banner */}
      <div className={`p-6 sm:p-10 border-2 rounded-3xl ${colors.bg} grid md:grid-cols-12 gap-8 items-center relative overflow-hidden`}>
        {/* Background visual watermarks */}
        <div className="absolute right-0 bottom-0 translate-y-1/4 w-40 h-40 bg-accent/10 rounded-full pointer-events-none" />

        <div className="md:col-span-8 space-y-4 relative z-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-bg-main text-primary border border-secondary/35 shadow-xs">
            <Activity className="w-4.5 h-4.5 text-accent" />
            Active NDI Report Registry
          </div>
          <span className="text-xs font-bold leading-normal text-accent uppercase tracking-widest font-mono block">TASK TYPE: {report.taskTitle}</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary leading-tight">
            NDI Screening & Communicative Trajectory: <span className="text-accent">{report.ndiScore}% Coherence Index</span>
          </h1>
          <p className="text-secondary text-xs sm:text-sm max-w-2xl leading-relaxed font-semibold">
            Coherence Standing: <strong className="text-primary">{report.status}</strong>. This metric measures your conversational pacing, pause counts, and chronological narrative retention baseline.
          </p>
        </div>

        {/* Big circular score gauge */}
        <div className="md:col-span-4 flex justify-center relative z-10">
          <div className="bg-bg-main p-6 rounded-3xl shadow-xs border-2 border-secondary/30 text-center w-48 relative">
            <span className="text-xs uppercase font-mono font-bold text-accent tracking-wider">NDI Score</span>
            <div className="mt-1 text-5xl font-extrabold text-primary font-display">
              {report.ndiScore}
            </div>
            <div className="w-full bg-bg-soft h-3 rounded-full overflow-hidden mt-3 max-w-[120px] mx-auto">
              <div className={`${colors.fill} h-full rounded-full`} style={{ width: `${report.ndiScore}%` }} />
            </div>
            <span className="text-[10px] text-secondary mt-2.5 block font-bold">calibrated out of 100</span>
          </div>
        </div>
      </div>

      {/* Safety Medical Disclaimer */}
      <div className="bg-bg-soft border-2 border-amber-300 p-5 rounded-2xl flex gap-3 text-xs sm:text-sm text-secondary shadow-xs font-semibold">
        <ShieldAlert className="w-5.5 h-5.5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-900 font-bold block mb-1">Clinician Non-Diagnostic Notice:</strong> 
          This assessment represents a dynamic communication screen support and is <strong className="text-primary">not a permanent memory or dementia diagnosis</strong>. Verb searches and narrative pacing can fluctuate safely due to tiredness, stress, quiet levels, or medication. Please review this report with your qualified physician or neurologist.
        </div>
      </div>

      {/* Dashboard Metrics Grid (Local coherence, global coherence, pauses, grammar etc.) */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-accent" />
          Primary Communication Markers
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Local Coherence */}
          <div className="bg-card-bg border-2 border-secondary/40 rounded-2xl p-5 shadow-xs space-y-2.5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-accent uppercase font-mono tracking-wider">Local Coherence</span>
              <span className="text-xs font-bold text-primary bg-bg-main px-2.5 py-1 rounded-md">{report.localCoherence}%</span>
            </div>
            <h4 className="font-extrabold text-primary text-sm">Sentence-to-Sentence Unity</h4>
            <p className="text-[11px] text-secondary leading-relaxed font-semibold">
              Measures how logically consecutive speech sequences connect. High local coherence represents stable transition flow during story narrative.
            </p>
          </div>

          {/* Card 2: Global Coherence */}
          <div className="bg-card-bg border-2 border-secondary/40 rounded-2xl p-5 shadow-xs space-y-2.5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-accent uppercase font-mono tracking-wider">Global Coherence</span>
              <span className="text-xs font-bold text-primary bg-bg-main px-2.5 py-1 rounded-md">{report.globalCoherence}%</span>
            </div>
            <h4 className="font-extrabold text-primary text-sm">Theme Retention Status</h4>
            <p className="text-[11px] text-secondary leading-relaxed font-semibold">
              Evaluates if the speaker successfully stays on-topic relative to the primary assignment prompt, without rambling or experiencing topic drifts.
            </p>
          </div>

          {/* Card 3: Story Grammar */}
          <div className="bg-card-bg border-2 border-secondary/40 rounded-2xl p-5 shadow-xs space-y-2.5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-accent uppercase font-mono tracking-wider">Story Grammar</span>
              <span className="text-xs font-bold text-primary bg-bg-main px-2.5 py-1 rounded-md">{report.storyGrammar} / 6</span>
            </div>
            <h4 className="font-extrabold text-primary text-sm">Key Element Recall Content</h4>
            <p className="text-[11px] text-secondary leading-relaxed font-semibold">
              Counts how many major structural plots, settings, actions, or outcomes (from a clinical total of 6) were successfully retained and reported.
            </p>
          </div>

          {/* Card 4: Speech Rate */}
          <div className="bg-card-bg border-2 border-secondary/40 rounded-2xl p-5 shadow-xs space-y-2.5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-accent uppercase font-mono tracking-wider">Speech Rate</span>
              <span className="text-xs font-bold text-primary bg-bg-main px-2.5 py-1 rounded-md">{report.speechRate} WPM</span>
            </div>
            <h4 className="font-extrabold text-primary text-sm">Speech Tempo (Fluency)</h4>
            <p className="text-[11px] text-secondary leading-relaxed font-semibold">
              Words Spoken Per Minute. Fluency rates typically sit around 90-130 WPM. Extremely slow levels may indicate word-finding efforts.
            </p>
          </div>

          {/* Card 5: Average Pause */}
          <div className="bg-card-bg border-2 border-secondary/40 rounded-2xl p-5 shadow-xs space-y-2.5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-accent uppercase font-mono tracking-wider">Average Pause</span>
              <span className="text-xs font-bold text-amber-955 bg-amber-100 border border-amber-350 px-2.5 py-1 rounded-md">{report.averagePause} sec</span>
            </div>
            <h4 className="font-extrabold text-primary text-sm">Lateness & Silence Cycles</h4>
            <p className="text-[11px] text-secondary leading-relaxed font-semibold">
              Average duration of gaps and acoustic silence segments detected between active words or statements.
            </p>
          </div>

          {/* Card 6: Longest Pause */}
          <div className="bg-card-bg border-2 border-secondary/40 rounded-2xl p-5 shadow-xs space-y-2.5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-accent uppercase font-mono tracking-wider">Longest Pause</span>
              <span className="text-xs font-bold text-amber-955 bg-amber-100 border border-amber-350 px-2.5 py-1 rounded-md">{report.longestPause} sec</span>
            </div>
            <h4 className="font-extrabold text-primary text-sm">Max Hesitation Segment</h4>
            <p className="text-[11px] text-secondary leading-relaxed font-semibold">
              The longest singular silence block recorded (often occurring during lexical retrieval blocks or transitional story shifts).
            </p>
          </div>
        </div>
      </div>

      {/* Explainability Section - "Why this score?" */}
      <div className="bg-card-bg border-2 border-secondary/40 rounded-3xl p-6 sm:p-8 shadow-xs grid md:grid-cols-2 gap-8 items-start animate-fadeIn">
        
        {/* Why this score Bulletpoints details */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <Info className="w-5 h-5 text-accent" />
            Linguistic Coherence Diagnostic
          </h3>
          <p className="text-secondary text-xs sm:text-sm font-semibold">
            Our machine transcript algorithm breaks down your exact spoken patterns to identify minor characteristics that contributed to your {report.ndiScore}/100 standing:
          </p>

          <ul className="space-y-3 pt-1">
            {report.whyThisScore.map((bullet, idx) => (
              <li key={idx} className="flex gap-2.5 text-xs sm:text-sm text-primary font-bold">
                <span className="text-accent font-extrabold shrink-0">✓</span>
                <span className="leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Callouts */}
        <div className="bg-bg-soft border-2 border-secondary/35 p-6 rounded-2xl space-y-5">
          <h4 className="font-bold text-primary text-sm flex items-center gap-2">
            <Heart className="w-4.5 h-4.5 text-rose-700 shrink-0" />
            Support Actions
          </h4>
          <p className="text-xs text-secondary leading-relaxed font-semibold">
            You can analyze the highlighted speaking transcript, print your score sheets, download a secure clinician-ready medical document, or begin another screening exercise entirely.
          </p>

          <div className="space-y-3 pt-2">
            <Link
              id="report-view-transcript-btn"
              to={`/transcript/${report.id}`}
              className="w-full py-3.5 bg-accent hover:bg-primary text-white font-bold text-sm rounded-xl text-center transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <FileText className="w-4.5 h-4.5 shrink-0 text-white" />
              Analyze Annotated Transcript
            </Link>

            <button
              onClick={triggerPdfDownload}
              disabled={pdfConverting}
              className="w-full py-3 bg-bg-main hover:bg-bg-soft text-primary border-2 border-secondary/40 font-bold text-xs sm:text-sm rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-colors"
            >
              {pdfConverting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin shrink-0" />
                  Generating secure PDF...
                </>
              ) : pdfSuccess ? (
                <>
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-800 shrink-0" />
                  PDF Saved!
                </>
              ) : (
                <>
                  <Download className="w-4.5 h-4.5 shrink-0 text-secondary" />
                  Download Clinical PDF
                </>
              )}
            </button>

            <Link
               id="report-start-new-screening-btn"
               to="/screening"
               className="w-full py-3 hover:bg-card-bg text-primary border-2 border-secondary/35 font-bold text-sm rounded-xl text-center flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 shrink-0 fill-current text-accent" />
              Conduct Another Task
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
