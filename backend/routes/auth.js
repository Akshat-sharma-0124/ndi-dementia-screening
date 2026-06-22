import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Report from '../models/Report.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate Token helper
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Signup Endpoint
router.post('/signup', async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      age,
      gender,
      phone,
      educationLevel,
      languagePreference,
      caregiverName,
      caregiverContact,
      consentAccepted
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Patient profile with this email already exists' });
    }

    // Create new patient user
    const user = new User({
      email,
      password,
      name,
      age: Number(age),
      gender,
      phone,
      educationLevel,
      languagePreference,
      caregiverName,
      caregiverContact,
      consentAccepted
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        educationLevel: user.educationLevel,
        languagePreference: user.languagePreference,
        caregiverName: user.caregiverName,
        caregiverContact: user.caregiverContact,
        consentAccepted: user.consentAccepted,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
});

// Login Endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. Patient profile not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        educationLevel: user.educationLevel,
        languagePreference: user.languagePreference,
        caregiverName: user.caregiverName,
        caregiverContact: user.caregiverContact,
        consentAccepted: user.consentAccepted,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Demo Setup & Auth Endpoint
router.post('/demo', async (req, res) => {
  try {
    const demoEmail = 'eleanor.vance@example.com';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      // Create Eleanor Vance's profile
      user = new User({
        email: demoEmail,
        password: 'password123', // Dummy password
        name: 'Eleanor Vance',
        age: 74,
        gender: 'Female',
        phone: '+1 (555) 321-4890',
        educationLevel: 'Bachelor of Arts (English Lit)',
        languagePreference: 'English',
        caregiverName: 'William Vance (Son)',
        caregiverContact: '+1 (555) 765-4321',
        consentAccepted: true,
        avatarUrl: null
      });

      await user.save();

      // Seed 11 reports matching Eleanor's clinic demo
      const demoReports = [
        {
          id: 'rep-demo-1',
          date: '2025-08-15',
          taskType: 'describe-day',
          taskTitle: 'Describe Your Day',
          ndiScore: 78,
          status: 'Mild / Dynamic Variation',
          riskLevel: 'Low',
          localCoherence: 82,
          globalCoherence: 79,
          storyGrammar: 4,
          speechRate: 105,
          averagePause: 1.3,
          longestPause: 3.0,
          whyThisScore: [
            'Good structural continuity: Stated morning, midday, and bedtime routines chronologically.',
            'Slight vocabulary search pauses detected.'
          ],
          transcript: 'Yesterday was a pleasant day. I spent time reading, went for a short walk, had some tea with my daughter, and talked about past times before dinner.',
          annotatedWords: []
        },
        {
          id: 'rep-demo-2',
          date: '2025-09-10',
          taskType: 'picture-description',
          taskTitle: 'Picture Description (Cookie Theft)',
          ndiScore: 80,
          status: 'Mild / Dynamic Variation',
          riskLevel: 'Low',
          localCoherence: 84,
          globalCoherence: 81,
          storyGrammar: 5,
          speechRate: 108,
          averagePause: 1.25,
          longestPause: 2.8,
          whyThisScore: [
            'Normal vocabulary depth with fluent lexical retrieval.',
            'Excellent theme preservation and logical continuity.'
          ],
          transcript: 'The children are trying to reach the cookie jar while their mother is washing dishes. The stool is about to fall down, and water is spilling from the sink.',
          annotatedWords: []
        },
        {
          id: 'rep-demo-3',
          date: '2025-10-12',
          taskType: 'story-recall',
          taskTitle: 'Story Recall',
          ndiScore: 76,
          status: 'Mild / Dynamic Variation',
          riskLevel: 'Low',
          localCoherence: 80,
          globalCoherence: 76,
          storyGrammar: 4,
          speechRate: 98,
          averagePause: 1.45,
          longestPause: 3.2,
          whyThisScore: [
            'Successfully recalled primary character (Anna) and key location (Dover).',
            'Slightly elevated word searches during transitional clauses.'
          ],
          transcript: 'Anna was a schoolteacher from Dover who went to the local bakery on a rainy Tuesday. She bought muffins and talked with Arthur before walking back under an umbrella.',
          annotatedWords: []
        },
        {
          id: 'rep-demo-4',
          date: '2025-11-14',
          taskType: 'free-speech',
          taskTitle: 'Free Speech (Happy Memory)',
          ndiScore: 82,
          status: 'Mild / Dynamic Variation',
          riskLevel: 'Low',
          localCoherence: 85,
          globalCoherence: 83,
          storyGrammar: 5,
          speechRate: 110,
          averagePause: 1.2,
          longestPause: 2.7,
          whyThisScore: [
            'Vibrant vocabulary and high thematic coherence values.',
            'Excellent description of sensory cues (colors, layouts).'
          ],
          transcript: 'I remember our trip to the countryside during autumn. The trees were vibrant red and orange, the air was crisp, and we spent hours walking and laughing by the lake.',
          annotatedWords: []
        },
        {
          id: 'rep-demo-5',
          date: '2025-12-15',
          taskType: 'describe-day',
          taskTitle: 'Describe Your Day',
          ndiScore: 84,
          status: 'Mild / Dynamic Variation',
          riskLevel: 'Low',
          localCoherence: 87,
          globalCoherence: 85,
          storyGrammar: 5,
          speechRate: 112,
          averagePause: 1.15,
          longestPause: 2.6,
          whyThisScore: [
            'Excellent chronological flow of events from morning to night.',
            'No unguided topic drifts.'
          ],
          transcript: 'Yesterday I started the morning with light exercises, watered the indoor plants, read newspapers, and prepared a warm broth for dinner. It was a very productive day.',
          annotatedWords: []
        },
        {
          id: 'rep-demo-6',
          date: '2026-01-15',
          taskType: 'picture-description',
          taskTitle: 'Picture Description (Cookie Theft)',
          ndiScore: 84,
          status: 'Mild / Dynamic Variation',
          riskLevel: 'Low',
          localCoherence: 87,
          globalCoherence: 85,
          storyGrammar: 5,
          speechRate: 112,
          averagePause: 1.15,
          longestPause: 2.6,
          whyThisScore: [
            'Excellent descriptions of children reaching for cookies and wobbly stool.',
            'Consistent theme preservation.'
          ],
          transcript: 'The illustration shows a kitchen scene where a boy on a wobbly stool reaches for the cookie jar while the mother is wash dishes and sink water is spilling.',
          annotatedWords: []
        },
        {
          id: 'rep-demo-7',
          date: '2026-02-20',
          taskType: 'story-recall',
          taskTitle: 'Story Recall',
          ndiScore: 78,
          status: 'Mild / Dynamic Variation',
          riskLevel: 'Low',
          localCoherence: 82,
          globalCoherence: 80,
          storyGrammar: 4,
          speechRate: 104,
          averagePause: 1.35,
          longestPause: 2.9,
          whyThisScore: [
            'Accurate recall of Arthur, Anna, and the yellow umbrella.',
            'A few mid-narrative pause hesitations.'
          ],
          transcript: 'Anna bought blueberry muffins at the bakery on Tuesday. She met Arthur there, and they talked about their grandchildren before walking home under a yellow umbrella.',
          annotatedWords: []
        },
        {
          id: 'rep-demo-8',
          date: '2026-03-18',
          taskType: 'free-speech',
          taskTitle: 'Free Speech (Happy Memory)',
          ndiScore: 72,
          status: 'Mild / Dynamic Variation',
          riskLevel: 'Low',
          localCoherence: 78,
          globalCoherence: 75,
          storyGrammar: 4,
          speechRate: 98,
          averagePause: 1.5,
          longestPause: 3.3,
          whyThisScore: [
            'Mild pauses during transitions.',
            'Good thematic preservation and sentence structure.'
          ],
          transcript: 'We used to gather by the old oak tree during summer evenings. We shared stories, grilled food, and sang songs under the stars. The fire crackled warm and bright.',
          annotatedWords: []
        },
        {
          id: 'rep-demo-9',
          date: '2026-04-22',
          taskType: 'describe-day',
          taskTitle: 'Describe Your Day',
          ndiScore: 78,
          status: 'Mild / Dynamic Variation',
          riskLevel: 'Low',
          localCoherence: 82,
          globalCoherence: 80,
          storyGrammar: 4,
          speechRate: 104,
          averagePause: 1.3,
          longestPause: 2.95,
          whyThisScore: [
            'Clear descriptions of gardening tasks.',
            'Stable phrase grammar.'
          ],
          transcript: 'I spent the afternoon gardening and pruning the roses. I had a chat with a neighbor, cooked a light meal, and finished reading my favorite detective novel.',
          annotatedWords: []
        },
        {
          id: 'rep-demo-10',
          date: '2026-05-20',
          taskType: 'picture-description',
          taskTitle: 'Picture Description (Cookie Theft)',
          ndiScore: 68,
          status: 'Mild / Dynamic Variation',
          riskLevel: 'Low',
          localCoherence: 72,
          globalCoherence: 70,
          storyGrammar: 3,
          speechRate: 92,
          averagePause: 1.6,
          longestPause: 3.5,
          whyThisScore: [
            'Focused on key nouns instead of details.',
            'Mild word-finding pauses.'
          ],
          transcript: 'The cookie jar is open. A boy and girl are reaching in. The mother is distracted. The sink is full of water and spilling over the floor.',
          annotatedWords: []
        },
        {
          id: 'rep-demo-11',
          date: '2026-06-19',
          taskType: 'free-speech',
          taskTitle: 'Free Speech (Happy Memory)',
          ndiScore: 78,
          status: 'Mild / Dynamic Variation',
          riskLevel: 'Low',
          localCoherence: 81,
          globalCoherence: 78,
          storyGrammar: 4,
          speechRate: 100,
          averagePause: 1.3,
          longestPause: 3.1,
          whyThisScore: [
            'Good structural continuity: Stated morning, midday, and bedtime routines chronologically.',
            'Slight vocabulary search pauses detected.'
          ],
          transcript: 'I woke up and dressed in my warm yellow sweater. For breakfast, I cooked some scrambled eggs and buttered toast, then made tea. Around midday, my cousin phoned...',
          annotatedWords: []
        }
      ];

      // Insert all reports linked to Eleanor Vance
      await Report.insertMany(demoReports.map(rep => ({ ...rep, user: user._id })));
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        educationLevel: user.educationLevel,
        languagePreference: user.languagePreference,
        caregiverName: user.caregiverName,
        caregiverContact: user.caregiverContact,
        consentAccepted: user.consentAccepted,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Demo access failed', error: error.message });
  }
});

export default router;
