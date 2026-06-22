import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get patient profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json({
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
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// Update patient profile
router.put('/', auth, async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      email,
      phone,
      educationLevel,
      languagePreference,
      caregiverName,
      caregiverContact,
      avatarUrl
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // If email is changing, make sure it is not already taken
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already associated with another profile' });
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (age !== undefined) user.age = Number(age);
    if (gender) user.gender = gender;
    if (phone !== undefined) user.phone = phone;
    if (educationLevel !== undefined) user.educationLevel = educationLevel;
    if (languagePreference) user.languagePreference = languagePreference;
    if (caregiverName !== undefined) user.caregiverName = caregiverName;
    if (caregiverContact !== undefined) user.caregiverContact = caregiverContact;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl; // Can be base64 string or image URI

    await user.save();

    res.json({
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
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

export default router;
