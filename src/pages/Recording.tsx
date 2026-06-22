import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mic, 
  Pause, 
  Play, 
  Square, 
  UploadCloud, 
  AlertCircle, 
  Volume2, 
  Clock, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { SCREENING_TASKS } from '../data/tasks';
import { isLoggedIn } from '../utils/storage';

export default function Recording() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const taskParam = searchParams.get('task') || 'describe-day';
  const activeTask = SCREENING_TASKS.find(t => t.id === taskParam) || SCREENING_TASKS[0];

  // States
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Waveform bars simulation
  const [waveBars, setWaveBars] = useState<number[]>(Array(36).fill(5));
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  // Audio timer ticker
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  // Dynamic waveform fluctuations
  useEffect(() => {
    let animationId: number;
    const generateWave = () => {
      if (isRecording && !isPaused) {
        setWaveBars(() => {
          return Array(36).fill(0).map(() => {
            // Generate peak points simulating human narration cadences
            const base = Math.sin(Date.now() / 200) * 15;
            const variance = Math.random() * 45;
            return Math.max(6, Math.round(Math.abs(base + variance)));
          });
        });
      } else {
        // Flatline / Resting breath rate pulses
        setWaveBars((prev) => prev.map(val => Math.max(5, val - 4)));
      }
      animationId = requestAnimationFrame(generateWave);
    };
    
    animationId = requestAnimationFrame(generateWave);
    return () => cancelAnimationFrame(animationId);
  }, [isRecording, isPaused]);

  // Format seconds to MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Controller Operations
  const handleStart = () => {
    setErrorMessage('');
    setIsRecording(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    if (seconds < 5) {
      setErrorMessage('Recording is too short. Please speak for at least 15-30 seconds to allow natural linguistic coherence scoring.');
      setIsRecording(false);
      setIsPaused(false);
      setSeconds(0);
      return;
    }

    setIsRecording(false);
    setIsPaused(false);
    
    // Auto navigate to analytical processing screen
    navigate(`/processing?task=${taskParam}`);
  };

  // Mock file picker upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setErrorMessage('');
      setUploadProgress(10);
      
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) return null;
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              navigate(`/processing?task=${taskParam}`);
            }, 600);
            return 100;
          }
          return prev + 25;
        });
      }, 300);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 bg-bg-main text-text-dark">
      {/* Back to selection */}
      <div className="flex items-center justify-between">
        <Link
          to="/screening"
          className="inline-flex items-center gap-2 text-secondary hover:text-primary text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4 text-accent" />
          Choose another task
        </Link>
        <span className="text-xs uppercase bg-bg-soft border border-secondary/35 text-primary px-3.5 py-1.5 rounded-full font-mono font-bold tracking-wider">
          Step 2 of 4: Voice Capture
        </span>
      </div>

      {/* Task Description Board */}
      <div className="bg-card-bg border-2 border-secondary/40 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-mono font-bold text-accent uppercase tracking-widest block">ACTIVE VERBAL PROMPT</span>
          <h1 className="text-2xl font-extrabold text-primary mt-0.5">{activeTask.title}</h1>
        </div>

        <p className="text-primary text-base leading-relaxed bg-bg-soft/70 border-2 border-secondary/35 p-5 rounded-2xl font-semibold">
          {activeTask.prompt}
        </p>

        {activeTask.id === 'story-recall' && (
          <div className="p-4 bg-amber-100 border border-amber-300 rounded-xl text-xs text-amber-950 leading-relaxed font-bold">
            <strong>Clinical Task Reminder:</strong> Take a moment to read the story paragraph above twice. Once you hit 'Start Recording' below, try to recall and describe as many details as you can from memory without reading back.
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Recorder deck (7 cols) */}
        <div className="md:col-span-8 bg-card-bg border-2 border-secondary/40 rounded-3xl p-6 sm:p-8 shadow-xs text-center space-y-8">
          
          {/* Header */}
          <div>
            <h3 className="font-extrabold text-primary text-lg animate-fadeIn">Speech Recording Console</h3>
            <p className="text-secondary text-xs mt-1 font-semibold">Please ensure your microphone is working and click the start button below.</p>
          </div>

          {/* Oscilloscope/Waveform Simulator */}
          <div className="bg-primary h-44 rounded-2xl relative overflow-hidden flex items-end justify-center px-6 pb-6 border border-secondary/35">
            
            {/* Status indicators */}
            <div className="absolute top-4 left-4 flex items-center gap-2 text-xs">
              {isRecording ? (
                <>
                  <span className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-red-500 animate-pulse'} shrink-0`} />
                  <span className="font-mono text-white tracking-widest uppercase text-[10px]">
                    {isPaused ? 'RECORDING PAUSED' : 'STREAMING VOICE ACTIVE'}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary/55 shrink-0" />
                  <span className="font-mono text-bg-soft/70 tracking-widest uppercase text-[10px]">MICROPHONE STANDBY</span>
                </>
              )}
            </div>

            {/* Time indicator (Large Clock) */}
            <div className="absolute top-4 right-4 bg-bg-soft/15 backdrop-blur-xs border border-white/20 text-bg-soft font-mono text-lg font-bold px-3.5 py-1 rounded-xl animate-pulse">
              {formatTime(seconds)}
            </div>

            {/* Dynamic Waveform visualization bars */}
            <div className="w-full h-32 flex items-end justify-between gap-1 max-w-sm mx-auto pt-4">
              {waveBars.map((barHeight, idx) => (
                <div 
                  key={idx}
                  className={`w-full rounded-t-full transition-all duration-75 ${
                    isRecording && !isPaused ? 'bg-accent opacity-95' : 'bg-secondary/20'
                  }`}
                  style={{ height: `${barHeight}%` }}
                />
              ))}
            </div>
          </div>

          {/* Time Limit Helper and Error message */}
          {errorMessage && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-950 text-xs text-left flex gap-2 font-bold animate-pulse">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-700 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Check indicator if healthy duration reached */}
          {seconds >= 60 && (
            <div className="p-3 bg-bg-soft border-2 border-secondary/35 rounded-xl text-primary text-xs text-left flex items-center gap-2 font-bold animate-fadeIn">
              <CheckCircle className="w-4.5 h-4.5 text-accent shrink-0" />
              <span>Recommended minimum speech volume achieved (1 minute). You can complete at any time.</span>
            </div>
          )}

          {/* Dynamic control states */}
          <div className="flex justify-center items-center gap-6">
            
            {/* Play/Pause control */}
            {isRecording && (
              isPaused ? (
                <button
                  onClick={handleResume}
                  title="Resume Recording"
                  className="w-12 h-12 rounded-full border-2 border-secondary/45 bg-bg-soft hover:bg-bg-main text-primary flex items-center justify-center cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4 fill-current text-accent" />
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  title="Pause Recording"
                  className="w-12 h-12 rounded-full border-2 border-secondary/45 bg-bg-soft hover:bg-bg-main text-primary flex items-center justify-center cursor-pointer transition-all"
                >
                  <Pause className="w-4 h-4 fill-current text-accent" />
                </button>
              )
            )}

            {/* MAIN SPEECH RECORD CTA */}
            {!isRecording ? (
              <button
                onClick={handleStart}
                className="w-20 h-20 bg-accent hover:bg-primary text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 cursor-pointer"
              >
                <Mic className="w-8 h-8 text-white animate-pulse" />
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="w-20 h-20 bg-red-650 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 cursor-pointer"
              >
                <Square className="w-6 h-6 fill-current text-white" />
              </button>
            )}

            {/* Stop backup button to balance visual structure */}
            {isRecording && (
              <span className="w-12 text-xs text-accent uppercase font-mono font-bold animate-pulse">
                Speaking...
              </span>
            )}
          </div>

          {/* Secondary File Upload Option */}
          <div className="relative pt-4 text-center">
            <span className="absolute inset-x-0 top-1/2 h-[1px] bg-secondary/30"></span>
            <span className="relative bg-card-bg px-3 text-xs text-accent font-mono font-bold tracking-wider uppercase">Alternative Upload</span>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-secondary/40 bg-bg-soft/40 p-5 rounded-2xl">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-accent" />
              <span className="text-xs font-bold text-primary max-w-xs block text-left">Have a pre-recorded audio file?</span>
            </div>
            <p className="text-[11px] text-secondary mt-1 font-semibold">Upload a natural voice clip directly (size up to 25MB, duration 1-3 mins).</p>
            
            {uploadProgress === null ? (
              <label className="mt-3.5 inline-flex items-center gap-1.5 bg-bg-soft hover:bg-bg-main text-primary border-2 border-secondary/45 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors shadow-xs">
                Choose Audio File
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
            ) : (
              <div className="w-full max-w-xs mt-4 space-y-1.5">
                <div className="w-full bg-bg-soft h-2 rounded-full overflow-hidden">
                  <div className="bg-accent h-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <span className="text-[10px] uppercase font-mono text-accent font-bold tracking-wider block">
                  UPLOADING AUDIO BIOMARKER TRACK... {uploadProgress}%
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Instructions list (4 cols) */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-bg-soft border-2 border-secondary/40 rounded-3xl p-6 sm:p-8 space-y-5">
            <h3 className="font-extrabold text-primary text-sm sm:text-base border-b border-secondary/35 pb-2.5 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-accent" />
              Capture Instructions
            </h3>
            
            <ul className="space-y-4 text-xs sm:text-sm text-secondary font-semibold">
              <li className="flex gap-3">
                <span className="text-accent font-bold">✓</span>
                <div>
                  <strong className="text-primary">Sit in a quiet space:</strong>
                  <p className="text-xs text-secondary mt-0.5">Background noises such as television, clocks, or pets can distort natural pause measurements.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">✓</span>
                <div>
                  <strong className="text-primary">Speak naturally:</strong>
                  <p className="text-xs text-secondary mt-0.5">Try to articulate clearly, using your standard voice pace and conversational depth.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">✓</span>
                <div>
                  <strong className="text-primary">Do not use notes:</strong>
                  <p className="text-xs text-secondary mt-0.5">Spontaneous construction of memory is necessary for logical coherence analysis.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">✓</span>
                <div>
                  <strong className="text-primary">Maintain 1-3 minutes minimum:</strong>
                  <p className="text-xs text-secondary mt-0.5">Linguistic richness ratings require sufficient word length to synthesize scores safely.</p>
                </div>
              </li>
            </ul>

            <div className="bg-bg-main p-3.5 rounded-xl border border-secondary/30 text-[11px] text-primary flex gap-2 leading-relaxed font-bold">
              <HelpCircle className="w-4 h-4 shrink-0 text-accent mt-0.5" />
              <span>
                Need help with your microphone? Check browser settings to confirm standard system permissions.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
