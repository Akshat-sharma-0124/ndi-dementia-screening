import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Activity, Brain, Server, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { saveReport, isLoggedIn } from '../utils/storage';
import { NDIReport, ScreeningTaskType } from '../types';

export default function Processing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const taskParam = (searchParams.get('task') || 'picture-description') as ScreeningTaskType;

  // Progress metrics states
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing acoustic channels...');
  
  // Checking lists
  const [milestones, setMilestones] = useState([
    { id: 1, label: 'Audio Processing', percentage: 25, completed: false, description: 'Converting raw WAV timeline stream...' },
    { id: 2, label: 'Speech-to-Text Complete', percentage: 50, completed: false, description: 'Analyzing sentence blocks & filler counts...' },
    { id: 3, label: 'Narrative Analysis Complete', percentage: 75, completed: false, description: 'Calculating local & global coherence...' },
    { id: 4, label: 'NDI Report Ready', percentage: 100, completed: false, description: 'Structuring risk and recommendations...' },
  ]);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        
        // Dynamic status messages corresponding to percentages
        if (next === 10) setStatusMessage('De-noising ambient room acoustics...');
        if (next === 25) {
          setStatusMessage('Converting speech to text...');
          setMilestones(m => m.map(item => item.id === 1 ? { ...item, completed: true } : item));
        }
        if (next === 40) setStatusMessage('Checking pauses and hesitation intervals...');
        if (next === 50) {
          setStatusMessage('Analyzing narrative coherence...');
          setMilestones(m => m.map(item => item.id === 2 ? { ...item, completed: true } : item));
        }
        if (next === 65) setStatusMessage('Comparing structure against educational age baseline...');
        if (next === 75) {
          setStatusMessage('Generating NDI profile...');
          setMilestones(m => m.map(item => item.id === 3 ? { ...item, completed: true } : item));
        }
        if (next === 90) setStatusMessage('Compiling final explainable metric cards...');
        
        if (next >= 100) {
          clearInterval(timer);
          setMilestones(m => m.map(item => item.id === 4 ? { ...item, completed: true } : item));
          
          // Generate the custom screening report and save to storage
          const reportId = `rep-new-${Date.now()}`;
          const generated = createCustomReport(reportId, taskParam);
          saveReport(generated);
          
          // Forward to report view
          setTimeout(() => {
            navigate(`/report/${reportId}`);
          }, 800);
          
          return 100;
        }
        return next;
      });
    }, 45); // Takes about 4.5 seconds for complete processing feel

    return () => clearInterval(timer);
  }, [taskParam, navigate]);

  // Helper method to forge customized reports relative to selected tasks
  const createCustomReport = (id: string, type: ScreeningTaskType): NDIReport => {
    const dateStr = new Date().toISOString().split('T')[0];

    if (type === 'picture-description') {
      return {
        id,
        date: dateStr,
        taskType: 'picture-description',
        taskTitle: 'Picture Description (Cookie Theft)',
        ndiScore: 67,
        status: 'Moderate Communication Change Detected',
        riskLevel: 'Moderate',
        localCoherence: 72,
        globalCoherence: 64,
        storyGrammar: 3,
        speechRate: 85,
        averagePause: 2.1,
        longestPause: 5.4,
        whyThisScore: [
          'Reduced global coherence: The speaker focused on isolated nouns rather than explaining the larger situation details (i.e. overflows, falls).',
          'Missing story outcome: Failed to communicate the consequences of the stool tipping or the children falling.',
          'Slower speech rate: Spoke at 85 WPM, which is slightly below the standard 100-115 WPM average of peers.',
          'Longer pause duration: Exhibited one critical word-finding flatline of 5.4 seconds while addressing the mother character.',
          'Frequent hesitations: Multiple filler word repeats ("umm", "like") disrupted sentence continuity.'
        ],
        transcript: 'The boy is reaching... getting some... cookies from the jar. The stool is tipping over. He is going to fall, I think. Umm... his sister is waiting next to him. And the mother... she is washing dishes... but water... water is flowing out onto the floor. She is not paying attention.',
        annotatedWords: [
          { text: 'The', type: 'normal' },
          { text: 'boy', type: 'normal' },
          { text: 'is', type: 'normal' },
          { text: 'reaching...', type: 'normal' },
          { text: 'getting', type: 'normal' },
          { text: 'some...', type: 'normal' },
          { text: 'cookies', type: 'normal' },
          { text: 'from', type: 'normal' },
          { text: 'the', type: 'normal' },
          { text: 'jar.', type: 'normal' },
          { text: 'The', type: 'normal' },
          { text: 'stool', type: 'normal' },
          { text: 'is', type: 'normal' },
          { text: 'tipping', type: 'normal' },
          { text: 'over.', type: 'normal' },
          { text: 'He', type: 'normal' },
          { text: 'is', type: 'normal' },
          { text: 'going', type: 'normal' },
          { text: 'to', type: 'normal' },
          { text: 'fall,', type: 'normal' },
          { text: 'I', type: 'normal' },
          { text: 'think.', type: 'normal' },
          { text: '[Pause 5.4s]', type: 'pause-long' },
          { text: 'Umm...', type: 'filler' },
          { text: 'his', type: 'normal' },
          { text: 'sister', type: 'normal' },
          { text: 'is', type: 'normal' },
          { text: 'waiting', type: 'normal' },
          { text: 'next', type: 'normal' },
          { text: 'to', type: 'normal' },
          { text: 'him.', type: 'normal' },
          { text: 'And', type: 'normal' },
          { text: 'the', type: 'normal' },
          { text: 'mother...', type: 'normal' },
          { text: 'she', type: 'normal' },
          { text: 'is', type: 'normal' },
          { text: 'washing', type: 'normal' },
          { text: 'dishes...', type: 'normal' },
          { text: 'but', type: 'normal' },
          { text: 'water...', type: 'drift' },
          { text: 'water', type: 'normal' },
          { text: 'is', type: 'normal' },
          { text: 'flowing', type: 'normal' },
          { text: 'out', type: 'normal' },
          { text: 'onto', type: 'normal' },
          { text: 'the', type: 'normal' },
          { text: 'floor.', type: 'normal' },
          { text: 'She', type: 'normal' },
          { text: 'is', type: 'normal' },
          { text: 'not', type: 'normal' },
          { text: 'paying', type: 'normal' },
          { text: 'attention.', type: 'normal' }
        ]
      };
    }

    if (type === 'describe-day') {
      return {
        id,
        date: dateStr,
        taskType: 'describe-day',
        taskTitle: 'Describe Your Day',
        ndiScore: 78,
        status: 'Mild / Dynamic Variation',
        riskLevel: 'Low',
        localCoherence: 82,
        globalCoherence: 79,
        storyGrammar: 5,
        speechRate: 98,
        averagePause: 1.5,
        longestPause: 3.2,
        whyThisScore: [
          'Excellent structural continuity: Stated morning, midday, and bedtime routines chronologically.',
          'Slight vocabulary pauses when recalling meal menus.',
          'Theme preservation remains healthy with no un-guided topic drifts.'
        ],
        transcript: 'I woke up and dressed in my warm yellow sweater. For breakfast, I cooked some scrambled eggs and buttered toast, then made tea. Around midday, my cousin phoned, and we talked of family tree news. At night, I read a book and slept well.',
        annotatedWords: [
          { text: 'I', type: 'normal' },
          { text: 'woke', type: 'normal' },
          { text: 'up', type: 'normal' },
          { text: 'and', type: 'normal' },
          { text: 'dressed', type: 'normal' },
          { text: 'in', type: 'normal' },
          { text: 'my', type: 'normal' },
          { text: 'warm', type: 'normal' },
          { text: 'yellow', type: 'normal' },
          { text: 'sweater.', type: 'normal' },
          { text: 'For', type: 'normal' },
          { text: 'breakfast,', type: 'normal' },
          { text: 'I', type: 'normal' },
          { text: 'cooked', type: 'normal' },
          { text: 'some', type: 'normal' },
          { text: 'scrambled', type: 'normal' },
          { text: 'eggs', type: 'normal' },
          { text: 'and', type: 'normal' },
          { text: 'buttered', type: 'normal' },
          { text: 'toast,', type: 'normal' },
          { text: 'then', type: 'normal' },
          { text: 'made', type: 'normal' },
          { text: 'tea.', type: 'normal' },
          { text: '[Pause 3.2s]', type: 'pause-long' },
          { text: 'Around', type: 'normal' },
          { text: 'midday,', type: 'normal' },
          { text: 'my', type: 'normal' },
          { text: 'cousin', type: 'normal' },
          { text: 'phoned,', type: 'normal' },
          { text: 'and', type: 'normal' },
          { text: 'we', type: 'normal' },
          { text: 'talked', type: 'normal' },
          { text: 'of', type: 'normal' },
          { text: 'family', type: 'normal' },
          { text: 'tree', type: 'drift' },
          { text: 'news.', type: 'normal' },
          { text: 'At', type: 'normal' },
          { text: 'night,', type: 'normal' },
          { text: 'I', type: 'normal' },
          { text: 'read', type: 'normal' },
          { text: 'a', type: 'normal' },
          { text: 'book', type: 'normal' },
          { text: 'and', type: 'normal' },
          { text: 'slept', type: 'normal' },
          { text: 'well.', type: 'normal' }
        ]
      };
    }

    if (type === 'story-recall') {
      return {
        id,
        date: dateStr,
        taskType: 'story-recall',
        taskTitle: 'Story Recall',
        ndiScore: 71,
        status: 'Moderate Communication Change Detected',
        riskLevel: 'Moderate',
        localCoherence: 74,
        globalCoherence: 69,
        storyGrammar: 3,
        speechRate: 88,
        averagePause: 2.0,
        longestPause: 4.8,
        whyThisScore: [
          'Partial story schema recall: Successfully described modern key characters like Arthur and Anna but missed the primary bakery objective.',
          'Missing Dover location name representation.',
          'Slower structural transition with a 4.8 second hesitate pause when describing the yellow umbrella item.'
        ],
        transcript: 'Anna was some lady... she had some school teacher jobs. On a Tuesday, she was walking outside, very wet rain. She went to get food. She met her old buddy... he was called Arthur. They talked of their children... children or grandkids. Then they walked under... umm... a yellow umbrella.',
        annotatedWords: [
          { text: 'Anna', type: 'normal' },
          { text: 'was', type: 'normal' },
          { text: 'some', type: 'normal' },
          { text: 'lady...', type: 'filler' },
          { text: 'she', type: 'normal' },
          { text: 'had', type: 'normal' },
          { text: 'some', type: 'normal' },
          { text: 'school', type: 'normal' },
          { text: 'teacher', type: 'normal' },
          { text: 'jobs.', type: 'normal' },
          { text: 'On', type: 'normal' },
          { text: 'a', type: 'normal' },
          { text: 'Tuesday,', type: 'normal' },
          { text: 'she', type: 'normal' },
          { text: 'was', type: 'normal' },
          { text: 'walking', type: 'normal' },
          { text: 'outside,', type: 'normal' },
          { text: 'very', type: 'normal' },
          { text: 'wet', type: 'normal' },
          { text: 'rain.', type: 'normal' },
          { text: 'She', type: 'normal' },
          { text: 'went', type: 'normal' },
          { text: 'to', type: 'normal' },
          { text: 'get', type: 'normal' },
          { text: 'food.', type: 'normal' },
          { text: 'She', type: 'normal' },
          { text: 'met', type: 'normal' },
          { text: 'her', type: 'normal' },
          { text: 'old', type: 'normal' },
          { text: 'buddy...', type: 'normal' },
          { text: 'he', type: 'normal' },
          { text: 'was', type: 'normal' },
          { text: 'called', type: 'normal' },
          { text: 'Arthur.', type: 'normal' },
          { text: 'They', type: 'normal' },
          { text: 'talked', type: 'normal' },
          { text: 'of', type: 'normal' },
          { text: 'their', type: 'normal' },
          { text: 'children...', type: 'drift' },
          { text: 'children', type: 'filler' },
          { text: 'or', type: 'normal' },
          { text: 'grandkids.', type: 'normal' },
          { text: '[Pause 4.8s]', type: 'pause-long' },
          { text: 'Then', type: 'normal' },
          { text: 'they', type: 'normal' },
          { text: 'walked', type: 'normal' },
          { text: 'under...', type: 'normal' },
          { text: 'umm...', type: 'filler' },
          { text: 'a', type: 'normal' },
          { text: 'yellow', type: 'normal' },
          { text: 'umbrella.', type: 'normal' }
        ]
      };
    }

    // Default to 'free-speech'
    return {
      id,
      date: dateStr,
      taskType: 'free-speech',
      taskTitle: 'Free Speech (Happy Memory)',
      ndiScore: 82,
      status: 'Mild / Dynamic Variation',
      riskLevel: 'Low',
      localCoherence: 85,
      globalCoherence: 81,
      storyGrammar: 4,
      speechRate: 104,
      averagePause: 1.3,
      longestPause: 3.1,
      whyThisScore: [
        'Vibrant vocabulary and high thematic coherence values.',
        'Slight pauses during mid-sentence transitions.',
        'Excellent description of sensory cues (smells, colors, layouts).'
      ],
      transcript: 'I remember our small garden in Ohio. We had these red tomato bushes and some white daisies near the fence. The sun would set in a soft pink sky, and the neighbor would wave. It was so peaceful. I would read books there all day.',
      annotatedWords: [
        { text: 'I', type: 'normal' },
        { text: 'remember', type: 'normal' },
        { text: 'our', type: 'normal' },
        { text: 'small', type: 'normal' },
        { text: 'garden', type: 'normal' },
        { text: 'in', type: 'normal' },
        { text: 'Ohio.', type: 'normal' },
        { text: 'We', type: 'normal' },
        { text: 'had', type: 'normal' },
        { text: 'these', type: 'normal' },
        { text: 'red', type: 'normal' },
        { text: 'tomato', type: 'normal' },
        { text: 'bushes', type: 'normal' },
        { text: 'and', type: 'normal' },
        { text: 'some', type: 'normal' },
        { text: 'white', type: 'normal' },
        { text: 'daisies', type: 'normal' },
        { text: 'near', type: 'normal' },
        { text: 'the', type: 'normal' },
        { text: 'fence.', type: 'normal' },
        { text: '[Pause 3.1s]', type: 'pause-long' },
        { text: 'The', type: 'normal' },
        { text: 'sun', type: 'normal' },
        { text: 'would', type: 'normal' },
        { text: 'set', type: 'normal' },
        { text: 'in', type: 'normal' },
        { text: 'a', type: 'normal' },
        { text: 'soft', type: 'normal' },
        { text: 'pink', type: 'normal' },
        { text: 'sky,', type: 'normal' },
        { text: 'and', type: 'normal' },
        { text: 'the', type: 'normal' },
        { text: 'neighbor', type: 'normal' },
        { text: 'would', type: 'normal' },
        { text: 'wave.', type: 'normal' },
        { text: 'It', type: 'normal' },
        { text: 'was', type: 'normal' },
        { text: 'so', type: 'normal' },
        { text: 'peaceful.', type: 'normal' },
        { text: 'I', type: 'normal' },
        { text: 'would', type: 'normal' },
        { text: 'read', type: 'normal' },
        { text: 'books', type: 'normal' },
        { text: 'there', type: 'normal' },
        { text: 'all', type: 'normal' },
        { text: 'day.', type: 'normal' }
      ]
    };
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-bg-main px-4 py-12">
      <div className="w-full max-w-lg bg-card-bg border-2 border-secondary/40 rounded-3xl shadow-xs p-8 text-center space-y-8 relative overflow-hidden text-text-dark">
        
        {/* Glow progress line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-bg-soft">
          <div 
            className="h-full bg-accent transition-all duration-300 rounded-full" 
            style={{ width: `${progress}%` }} 
          />
        </div>

        {/* Dynamic central animation logo */}
        <div className="flex justify-center pt-4">
          <div className="relative">
            <div className="w-24 h-24 bg-bg-soft border-2 border-secondary/40 rounded-full flex items-center justify-center relative z-10 animate-pulse">
              <Brain className="w-12 h-12 text-accent" />
            </div>
            {/* Pulsing ring */}
            <div className="absolute -inset-2 bg-accent/10 rounded-full scale-105 animate-ping pointer-events-none" />
          </div>
        </div>

        {/* Loading status strings */}
        <div className="space-y-2">
          <span className="text-xs uppercase font-mono font-bold tracking-widest text-accent block animate-bounce">
            NDI ANALYSIS ENGINE RUNNING
          </span>
          <h2 className="text-3xl font-extrabold text-primary">
            {progress}% Analyzed
          </h2>
          <p className="text-accent font-mono text-xs sm:text-sm h-6 font-semibold italic">
            “{statusMessage}”
          </p>
        </div>

        {/* Milestones List Display */}
        <div className="bg-bg-soft border-2 border-secondary/35 p-5 rounded-2xl space-y-4 text-left max-w-sm mx-auto">
          {milestones.map((ms) => (
            <div key={ms.id} className="flex gap-3.5 items-start">
              <div className="mt-0.5">
                {ms.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                ) : progress >= ms.percentage - 15 ? (
                  <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-secondary/30 bg-bg-main text-accent flex items-center justify-center text-xs font-bold font-mono">
                    {ms.id}
                  </div>
                )}
              </div>
              <div>
                <h4 className={`text-xs font-bold leading-normal ${ms.completed ? 'text-primary' : 'text-accent/80'}`}>
                  {ms.label} ({ms.percentage}%)
                </h4>
                <p className="text-[10px] text-secondary mt-0.5 leading-relaxed font-semibold">
                  {ms.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Private Shield Assurance */}
        <div className="bg-bg-main border border-secondary/35 rounded-xl p-3 flex items-center gap-2.5 justify-center text-[11px] text-primary font-bold leading-normal">
          <Server className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>Local calculations secure. All data resides privately in sandbox.</span>
        </div>

      </div>
    </div>
  );
}
