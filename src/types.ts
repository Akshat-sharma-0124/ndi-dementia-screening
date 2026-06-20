export type LanguagePreference = 'English' | 'Hindi' | 'Hinglish';

export interface PatientProfile {
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  educationLevel: string;
  languagePreference: LanguagePreference;
  caregiverName: string;
  caregiverContact: string;
  consentAccepted: boolean;
}

export type ScreeningTaskType = 'describe-day' | 'picture-description' | 'story-recall' | 'free-speech' | 'facial-expression';

export interface ScreeningTask {
  id: ScreeningTaskType;
  title: string;
  description: string;
  prompt: string;
  estimatedTime: string;
  guidelines: string[];
  imageUrl?: string; // especially for picture description task
}

export interface MetricDetail {
  label: string;
  value: string | number;
  percentage?: number;
  status: 'normal' | 'caution' | 'warning';
  description: string;
}

export interface NDIReport {
  id: string;
  date: string;
  taskType: ScreeningTaskType;
  taskTitle: string;
  ndiScore: number;
  status: 'Mild / Dynamic Variation' | 'Moderate Communication Change Detected' | 'Significant Narrative Degradation Detected';
  riskLevel: 'Low' | 'Moderate' | 'High';
  
  // Cognitive Metrics
  localCoherence: number; // %
  globalCoherence: number; // %
  storyGrammar: number; // score out of 6
  speechRate: number; // WPM
  averagePause: number; // seconds
  longestPause: number; // seconds
  
  // Explanation bullet points
  whyThisScore: string[];
  
  // Transcript text & annotation markup
  transcript: string;
  annotatedWords: { text: string; type: 'normal' | 'filler' | 'pause-long' | 'drift' }[];
}
