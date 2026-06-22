import { ScreeningTask } from '../types';

export const SCREENING_TASKS: ScreeningTask[] = [
  {
    id: 'describe-day',
    title: 'Describe Your Day',
    description: 'An evaluation of chronological structuring, episodic memory recall, and informational semantic fluency.',
    prompt: 'Take a moment to reflect on your day yesterday, from the moment you woke up until you went to sleep. Describe your activities, the people you spoke with, what you ate, and how you felt in as much chronological detail as you can.',
    estimatedTime: '2 mins',
    guidelines: [
      'Focus on the sequence of events (morning, afternoon, evening).',
      'Mention specific locations, names, and objects if you recall them.',
      'Speak smoothly without rushing. No need to look at any notes.'
    ]
  },
  {
    id: 'picture-description',
    title: 'Picture Description (Cookie Theft)',
    description: 'Clinical evaluation of visual-spatial processing, simultaneous attention, and propositional narrative speech.',
    prompt: 'Look closely at the scene shown. Analyze the actions in the foreground and background: the children reaching for the jar, the tilting stool, the mother washing dishes, and the overflowing sink water. Describe everything you see happening.',
    estimatedTime: '1 - 2 mins',
    guidelines: [
      'Describe all the active characters and what they are doing.',
      'Mention physical items (e.g., sink, cookie jar, water pool, window).',
      'Explain any cause-and-effect relationships you notice (e.g., the tipping stool).'
    ],
    imageUrl: '/assets/cookie-theft.png'
  },
  {
    id: 'story-recall',
    title: 'Story Recall',
    description: 'Evaluation of auditory working memory, immediate verbal recall, and macrostructural story grammar parsing.',
    prompt: 'First, read this brief story carefully. Once you are ready, hide the story and repeat it back from memory, recounting as many details, names, ideas, and events as you can recall: \n\n"Anna was a retired schoolteacher from Dover. On a rainy Tuesday afternoon, she walked to the local bakery to buy fresh blueberry muffins. She met her old friend Arthur there, and they talked about their grandchildren before walking home together under a yellow umbrella."',
    estimatedTime: '2 mins',
    guidelines: [
      'Repeat the names of the people and locations if you remember them.',
      'Try to include how the story starts, what happens, and what the outcomes are.',
      'Avoid pressure; just tell us whatever bits remain in your mind.'
    ]
  },
  {
    id: 'facial-expression',
    title: 'Facial Expression Screening',
    description: 'Evaluates emotional responsiveness, facial expressiveness, gaze behavior, engagement level, and non-verbal cognitive biomarkers through a short video capture session.',
    prompt: 'Look naturally at the camera. You will be shown simple emotion prompts. Respond with natural facial expressions. Stay relaxed and maintain comfortable eye contact with the screen.',
    estimatedTime: '30–60 sec',
    guidelines: [
      'Look naturally at the camera.',
      'Maintain a relaxed facial expression.',
      'Follow simple emotion prompts shown on screen.',
      'Avoid excessive movement during recording.',
      'Ensure adequate lighting.'
    ]
  }
];
