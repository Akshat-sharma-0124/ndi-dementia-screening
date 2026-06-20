import { PatientProfile, NDIReport } from '../types';

// Default Demo User Details
export const DEFAULT_PATIENT: PatientProfile = {
  name: 'Eleanor Vance',
  age: 74,
  gender: 'Female',
  email: 'eleanor.vance@example.com',
  phone: '+1 (555) 321-4890',
  educationLevel: 'Bachelor of Arts (English Lit)',
  languagePreference: 'English',
  caregiverName: 'William Vance (Son)',
  caregiverContact: '+1 (555) 765-4321',
  consentAccepted: true
};

// Historic dummy reports displaying a narrative degradation trend (84 -> 78 -> 72)
export const DEFAULT_REPORTS: NDIReport[] = [
  {
    id: 'rep-001',
    date: '2026-02-15',
    taskType: 'free-speech',
    taskTitle: 'Free Speech (Happy Memory)',
    ndiScore: 84,
    status: 'Mild / Dynamic Variation',
    riskLevel: 'Low',
    localCoherence: 88,
    globalCoherence: 85,
    storyGrammar: 5,
    speechRate: 110,
    averagePause: 1.2,
    longestPause: 2.8,
    whyThisScore: [
      'Normal vocabulary depth with fluent lexical retrieval.',
      'Slight pauses when transitioning between chronological events.',
      'Excellent theme preservation and logical continuity.',
      'Excellent syntax and sentence structuring.'
    ],
    transcript: 'We used to go to the lakeside house in Vermont every summer. The children would run and splash in the cool water. I remember the smell of pine trees in the damp morning breeze, and my father cooking pancakes in that old cast-iron skillet. It was a wonderful, golden period of our lives.',
    annotatedWords: [
      { text: 'We', type: 'normal' },
      { text: 'used', type: 'normal' },
      { text: 'to', type: 'normal' },
      { text: 'go', type: 'normal' },
      { text: 'to', type: 'normal' },
      { text: 'the', type: 'normal' },
      { text: 'lakeside', type: 'normal' },
      { text: 'house', type: 'normal' },
      { text: 'in', type: 'normal' },
      { text: 'Vermont', type: 'normal' },
      { text: 'every', type: 'normal' },
      { text: 'summer.', type: 'normal' },
      { text: 'The', type: 'normal' },
      { text: 'children', type: 'normal' },
      { text: 'would', type: 'normal' },
      { text: 'run', type: 'normal' },
      { text: 'and', type: 'normal' },
      { text: 'splash', type: 'normal' },
      { text: 'in', type: 'normal' },
      { text: 'the', type: 'normal' },
      { text: 'cool', type: 'normal' },
      { text: 'water.', type: 'normal' },
      { text: '[Pause 2.8s]', type: 'pause-long' },
      { text: 'I', type: 'normal' },
      { text: 'remember', type: 'normal' },
      { text: 'the', type: 'normal' },
      { text: 'smell', type: 'normal' },
      { text: 'of', type: 'normal' },
      { text: 'pine', type: 'normal' },
      { text: 'trees', type: 'normal' },
      { text: 'in', type: 'normal' },
      { text: 'the', type: 'normal' },
      { text: 'damp', type: 'normal' },
      { text: 'morning', type: 'normal' },
      { text: 'breeze,', type: 'normal' },
      { text: 'and', type: 'normal' },
      { text: 'my', type: 'normal' },
      { text: 'father', type: 'normal' },
      { text: 'cooking', type: 'normal' },
      { text: 'pancakes', type: 'normal' },
      { text: 'in', type: 'normal' },
      { text: 'that', type: 'normal' },
      { text: 'old', type: 'normal' },
      { text: 'cast-iron', type: 'normal' },
      { text: 'skillet.', type: 'normal' },
      { text: 'It', type: 'normal' },
      { text: 'was', type: 'normal' },
      { text: 'a', type: 'normal' },
      { text: 'wonderful,', type: 'normal' },
      { text: 'golden', type: 'normal' },
      { text: 'period', type: 'normal' },
      { text: 'of', type: 'normal' },
      { text: 'our', type: 'normal' },
      { text: 'lives.', type: 'normal' }
    ]
  },
  {
    id: 'rep-002',
    date: '2026-04-02',
    taskType: 'story-recall',
    taskTitle: 'Story Recall',
    ndiScore: 78,
    status: 'Mild / Dynamic Variation',
    riskLevel: 'Low',
    localCoherence: 82,
    globalCoherence: 77,
    storyGrammar: 4,
    speechRate: 98,
    averagePause: 1.6,
    longestPause: 3.5,
    whyThisScore: [
      'Successfully recalled primary character (Anna) and key location (Dover).',
      'Mild word omissions observed during the mid-narrative recall.',
      'Slightly elevated word searches (longer pauses) during transitional clauses.',
      'Maintained good structural grammar with 4 out of 6 crucial story points captured.'
    ],
    transcript: 'Let me see. The lady Anna... she was a teacher, I think, in Dover. It was raining on Tuesday. She went to get... umm... blueberry muffins. And she met someone... someone she knew, a friend Arthur. They talked about grandchildren and... they had an umbrella. I think it was a red or yellow umbrella. Then they went back home.',
    annotatedWords: [
      { text: 'Let', type: 'normal' },
      { text: 'me', type: 'normal' },
      { text: 'see.', type: 'normal' },
      { text: 'The', type: 'normal' },
      { text: 'lady', type: 'normal' },
      { text: 'Anna...', type: 'normal' },
      { text: 'she', type: 'normal' },
      { text: 'was', type: 'normal' },
      { text: 'a', type: 'normal' },
      { text: 'teacher,', type: 'normal' },
      { text: 'I', type: 'normal' },
      { text: 'think,', type: 'normal' },
      { text: 'in', type: 'normal' },
      { text: 'Dover.', type: 'normal' },
      { text: 'It', type: 'normal' },
      { text: 'was', type: 'normal' },
      { text: 'raining', type: 'normal' },
      { text: 'on', type: 'normal' },
      { text: 'Tuesday.', type: 'normal' },
      { text: 'She', type: 'normal' },
      { text: 'went', type: 'normal' },
      { text: 'to', type: 'normal' },
      { text: 'get...', type: 'normal' },
      { text: 'umm...', type: 'filler' },
      { text: 'blueberry', type: 'normal' },
      { text: 'muffins.', type: 'normal' },
      { text: '[Pause 3.5s]', type: 'pause-long' },
      { text: 'And', type: 'normal' },
      { text: 'she', type: 'normal' },
      { text: 'met', type: 'normal' },
      { text: 'someone...', type: 'normal' },
      { text: 'someone', type: 'filler' },
      { text: 'she', type: 'normal' },
      { text: 'knew,', type: 'normal' },
      { text: 'a', type: 'normal' },
      { text: 'friend', type: 'normal' },
      { text: 'Arthur.', type: 'normal' },
      { text: 'They', type: 'normal' },
      { text: 'talked', type: 'normal' },
      { text: 'about', type: 'normal' },
      { text: 'grandchildren', type: 'normal' },
      { text: 'and...', type: 'normal' },
      { text: 'they', type: 'normal' },
      { text: 'had', type: 'normal' },
      { text: 'an', type: 'normal' },
      { text: 'umbrella.', type: 'normal' },
      { text: 'I', type: 'normal' },
      { text: 'think', type: 'normal' },
      { text: 'it', type: 'normal' },
      { text: 'was', type: 'normal' },
      { text: 'a', type: 'normal' },
      { text: 'red', type: 'drift' },
      { text: 'or', type: 'normal' },
      { text: 'yellow', type: 'normal' },
      { text: 'umbrella.', type: 'normal' },
      { text: 'Then', type: 'normal' },
      { text: 'they', type: 'normal' },
      { text: 'went', type: 'normal' },
      { text: 'back', type: 'normal' },
      { text: 'home.', type: 'normal' }
    ]
  },
  {
    id: 'rep-003',
    date: '2026-05-19',
    taskType: 'describe-day',
    taskTitle: 'Describe Your Day',
    ndiScore: 72,
    status: 'Mild / Dynamic Variation',
    riskLevel: 'Low',
    localCoherence: 77,
    globalCoherence: 71,
    storyGrammar: 4,
    speechRate: 91,
    averagePause: 1.9,
    longestPause: 4.2,
    whyThisScore: [
      'Chronological sequence drifted slightly toward the afternoon routine.',
      'Slight increase in filler repetitions ("like", "you know") noted.',
      'Word-finding gaps of over 4 seconds detected during food-item recall.',
      'High comprehension remains, patient responded to all prompts appropriately.'
    ],
    transcript: 'Well yesterday, I remember getting up around eight. I had... what did I have? I had tea. Yes, hot chamomile tea and some biscuits. Then I looked at the news, not much news. My neighbour... she has a black spaniel, you know, very loud. He barked... umm... for a long time. Later on, William came by and brought food, like carrots and potatoes. We ate dinner together and talked.',
    annotatedWords: [
      { text: 'Well', type: 'normal' },
      { text: 'yesterday,', type: 'normal' },
      { text: 'I', type: 'normal' },
      { text: 'remember', type: 'normal' },
      { text: 'getting', type: 'normal' },
      { text: 'up', type: 'normal' },
      { text: 'around', type: 'normal' },
      { text: 'eight.', type: 'normal' },
      { text: 'I', type: 'normal' },
      { text: 'had...', type: 'normal' },
      { text: 'what', type: 'normal' },
      { text: 'did', type: 'normal' },
      { text: 'I', type: 'normal' },
      { text: 'have?', type: 'normal' },
      { text: '[Pause 4.2s]', type: 'pause-long' },
      { text: 'I', type: 'normal' },
      { text: 'had', type: 'normal' },
      { text: 'tea.', type: 'normal' },
      { text: 'Yes,', type: 'normal' },
      { text: 'hot', type: 'normal' },
      { text: 'chamomile', type: 'normal' },
      { text: 'tea', type: 'normal' },
      { text: 'and', type: 'normal' },
      { text: 'some', type: 'normal' },
      { text: 'biscuits.', type: 'normal' },
      { text: 'Then', type: 'normal' },
      { text: 'I', type: 'normal' },
      { text: 'looked', type: 'normal' },
      { text: 'at', type: 'normal' },
      { text: 'the', type: 'normal' },
      { text: 'news,', type: 'normal' },
      { text: 'not', type: 'normal' },
      { text: 'much', type: 'normal' },
      { text: 'news.', type: 'normal' },
      { text: 'My', type: 'normal' },
      { text: 'neighbour...', type: 'normal' },
      { text: 'she', type: 'normal' },
      { text: 'has', type: 'normal' },
      { text: 'a', type: 'normal' },
      { text: 'black', type: 'normal' },
      { text: 'spaniel,', type: 'drift' },
      { text: 'you', type: 'filler' },
      { text: 'know,', type: 'filler' },
      { text: 'very', type: 'normal' },
      { text: 'loud.', type: 'normal' },
      { text: 'He', type: 'normal' },
      { text: 'barked...', type: 'normal' },
      { text: 'umm...', type: 'filler' },
      { text: 'for', type: 'normal' },
      { text: 'a', type: 'normal' },
      { text: 'long', type: 'normal' },
      { text: 'time.', type: 'normal' },
      { text: 'Later', type: 'normal' },
      { text: 'on,', type: 'normal' },
      { text: 'William', type: 'normal' },
      { text: 'came', type: 'normal' },
      { text: 'by', type: 'normal' },
      { text: 'and', type: 'normal' },
      { text: 'brought', type: 'normal' },
      { text: 'food,', type: 'normal' },
      { text: 'like', type: 'filler' },
      { text: 'carrots', type: 'normal' },
      { text: 'and', type: 'normal' },
      { text: 'potatoes.', type: 'normal' },
      { text: 'We', type: 'normal' },
      { text: 'ate', type: 'normal' },
      { text: 'dinner', type: 'normal' },
      { text: 'together', type: 'normal' },
      { text: 'and', type: 'normal' },
      { text: 'talked.', type: 'normal' }
    ]
  }
];

// Helper methods to read/write state in LocalStorage safely
export function getPatientProfile(): PatientProfile | null {
  const data = localStorage.getItem('ndi_patient_profile');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function savePatientProfile(profile: PatientProfile): void {
  localStorage.setItem('ndi_patient_profile', JSON.stringify(profile));
}

export function getReports(): NDIReport[] {
  const data = localStorage.getItem('ndi_screening_reports');
  if (!data) {
    // initialize with default list
    localStorage.setItem('ndi_screening_reports', JSON.stringify(DEFAULT_REPORTS));
    return DEFAULT_REPORTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_REPORTS;
  }
}

export function saveReport(report: NDIReport): void {
  const current = getReports();
  // Prevent duplicate additions
  if (!current.some(r => r.id === report.id)) {
    const updated = [...current, report];
    localStorage.setItem('ndi_screening_reports', JSON.stringify(updated));
  }
}

export function resetAllData(): void {
  localStorage.removeItem('ndi_patient_profile');
  localStorage.setItem('ndi_screening_reports', JSON.stringify(DEFAULT_REPORTS));
  localStorage.removeItem('ndi_current_user_session');
}

export function isLoggedIn(): boolean {
  return localStorage.getItem('ndi_current_user_session') !== null;
}

export function setLoggedIn(status: boolean, userEmail?: string): void {
  if (status) {
    localStorage.setItem('ndi_current_user_session', userEmail || 'eleanor.vance@example.com');
    // If profile doesn't exist yet, seed with default
    if (!getPatientProfile()) {
      savePatientProfile(DEFAULT_PATIENT);
    }
  } else {
    localStorage.removeItem('ndi_current_user_session');
  }
}
