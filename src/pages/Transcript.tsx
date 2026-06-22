import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  HelpCircle, 
  Clock, 
  Info, 
  Sparkles, 
  FileCheck2, 
  Bookmark, 
  Tag, 
  Mic2,
  Calendar
} from 'lucide-react';
import { getReports, isLoggedIn } from '../utils/storage';
import { NDIReport } from '../types';

export default function Transcript() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<NDIReport | null>(null);

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
      <div className="flex items-center justify-center min-h-[50vh] bg-bg-main">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Count highlights
  const pauseCount = report.annotatedWords.filter(w => w.type === 'pause-long').length;
  const fillerCount = report.annotatedWords.filter(w => w.type === 'filler').length;
  const driftCount = report.annotatedWords.filter(w => w.type === 'drift').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 bg-bg-main text-text-dark animate-fadeIn">
      
      {/* Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to={`/report/${report.id}`}
          className="inline-flex items-center gap-1.5 text-secondary hover:text-primary text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4 text-accent" />
          Back to NDI Report Metrics
        </Link>
        <span className="text-xs text-secondary font-mono font-bold flex items-center gap-1.5 bg-bg-soft px-3.5 py-1.5 border-2 border-secondary/30 rounded-full">
          <Calendar className="w-4 h-4 text-accent" strokeWidth={2.5} />
          RECORDED DATE: {report.date}
        </span>
      </div>

      {/* Header board */}
      <div className="bg-card-bg border-2 border-secondary/40 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-secondary/30 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-accent uppercase tracking-widest block">TRANSCRIPT AUDIT LOG</span>
            <h1 className="text-2xl font-extrabold text-primary mt-1">Highlighted Speech Text</h1>
            <p className="text-secondary text-xs sm:text-sm mt-1 max-w-xl font-bold">
              Each verbal sequence has been analyzed chronologically from the clinical voice recording. Speech pauses and vocal hesitations are mapped.
            </p>
          </div>
          <div className="p-3 bg-bg-soft border border-secondary/35 rounded-xl flex items-center gap-2 text-primary self-start sm:self-center">
            <Mic2 className="w-4.5 h-4.5 text-accent shrink-0" />
            <span className="text-xs font-bold font-mono">TASK: {report.taskTitle}</span>
          </div>
        </div>

        {/* Legend / Color-code map explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-bg-soft p-3.5 border-2 border-secondary/30 rounded-xl flex gap-2.5 items-center font-bold">
            <span className="w-3 h-3 rounded-full bg-accent block shrink-0" />
            <div>
              <span className="text-xs font-bold text-primary block">Standard Speech</span>
              <span className="text-[10px] text-secondary block">Natural vocabulary</span>
            </div>
          </div>

          <div className="bg-rose-50/75 p-3.5 border-2 border-rose-200 rounded-xl flex gap-2.5 items-center font-bold">
            <span className="w-5 h-5 rounded-md bg-rose-150 text-rose-950 text-[10px] font-bold flex items-center justify-center shrink-0 border border-rose-350">P</span>
            <div>
              <span className="text-xs font-bold text-rose-950 block">Long Pauses ({pauseCount})</span>
              <span className="text-[10px] text-rose-800 block">Silence &gt; 2.5 seconds</span>
            </div>
          </div>

          <div className="bg-amber-50/80 p-3.5 border-2 border-amber-200 rounded-xl flex gap-2.5 items-center font-bold">
            <span className="w-5 h-5 rounded-md bg-amber-150 text-amber-950 text-[10px] font-bold flex items-center justify-center shrink-0 border border-amber-300">F</span>
            <div>
              <span className="text-xs font-bold text-amber-950 block font-sans">Filler Words ({fillerCount})</span>
              <span className="text-[10px] text-amber-800 block">"Umm", "like", repeats</span>
            </div>
          </div>

          <div className="bg-bg-main p-3.5 border-2 border-secondary/40 rounded-xl flex gap-2.5 items-center font-bold">
            <span className="w-5 h-5 rounded-md bg-bg-soft text-primary text-[10px] font-bold flex items-center justify-center shrink-0 border border-secondary/45">T</span>
            <div>
              <span className="text-xs font-bold text-primary block font-sans">Topic Drifts ({driftCount})</span>
              <span className="text-[10px] text-secondary block">Tangential items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main transcript container */}
      <div className="bg-card-bg border-2 border-secondary/40 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        {/* Aesthetic left clinic binding strip */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-accent" />
        
        <h3 className="font-extrabold text-primary text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-dashed border-secondary/35 pb-4 mb-6">
          <Bookmark className="w-4 h-4 text-accent" />
          NARRATIVE AUDIO SCRIPT ANALYSIS
        </h3>

        {/* Word Map rendering */}
        <div className="text-lg sm:text-xl text-primary leading-loose tracking-wide flex flex-wrap gap-x-2.5 gap-y-3.5 font-sans font-bold">
          {report.annotatedWords.map((word, idx) => {
            if (word.type === 'pause-long') {
              return (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-950 rounded-lg text-xs font-bold font-mono border-2 border-rose-350 shrink-0 select-none animate-pulse"
                >
                  <Clock className="w-3.5 h-3.5 text-rose-700" />
                  {word.text}
                </span>
              );
            }
            if (word.type === 'filler') {
              return (
                <span 
                  key={idx}
                  className="px-2.5 py-0.5 bg-amber-100 text-amber-955 font-extrabold rounded-lg border-2 border-amber-300 text-sm font-mono"
                >
                  {word.text}
                </span>
              );
            }
            if (word.type === 'drift') {
              return (
                <span 
                  key={idx}
                  className="px-2.5 py-0.5 bg-bg-soft text-primary font-bold rounded-lg border-2 border-secondary/40 text-sm font-mono decoration-underline underline"
                >
                  {word.text}
                </span>
              );
            }
            return (
              <span key={idx} className="hover:text-accent transition-colors cursor-default">
                {word.text}
              </span>
            );
          })}
        </div>

        {/* Speech insights summary */}
        <div className="bg-bg-soft border-2 border-secondary/35 rounded-2xl p-5 mt-12 grid sm:grid-cols-2 gap-6 items-start text-xs sm:text-sm">
          <div className="space-y-2">
            <span className="text-primary font-extrabold text-xs uppercase font-mono tracking-wider block">Fluency Speed Diagnostic</span>
            <p className="text-secondary leading-relaxed font-sans font-bold">
              The patient completed the task with a speech tempo of <strong className="text-primary">{report.speechRate} words per minute</strong>. Hesitations occurred primarily when formulating complex chronological memory paths. Pauses over 2.5s averaged <strong className="text-primary">{report.averagePause} seconds</strong>, establishing normal to moderate fatigue indices.
            </p>
          </div>
          <div className="space-y-2">
            <span className="text-primary font-extrabold text-xs uppercase font-mono tracking-wider block">Classification Criteria Overview</span>
            <ul className="space-y-2 text-secondary text-xs font-bold">
              <li className="leading-relaxed">• <span className="font-extrabold text-rose-950 bg-rose-100/70 px-1.5 py-0.5 rounded border border-rose-250">Long Pauses</span> displays when lexical finding delays exceed average physical peer bounds.</li>
              <li className="leading-relaxed">• <span className="font-extrabold text-amber-955 bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-250">Filler Words</span> counts hesitations showing brain search algorithms for story grammar.</li>
              <li className="leading-relaxed">• <span className="font-extrabold text-primary bg-bg-main px-1.5 py-0.5 rounded border border-secondary/35 animate-none">Topic Drifts</span> tracks conceptual tangents away from standard target prompt outlines.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Bottom Option action buttons wrapper */}
      <div className="flex justify-center">
        <Link
          to={`/report/${report.id}`}
          className="px-6 py-3.5 bg-accent hover:bg-primary text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
        >
          Return to Report Metrics
        </Link>
      </div>

    </div>
  );
}
