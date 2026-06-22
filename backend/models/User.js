import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: '+1 (555) 000-0000'
  },
  educationLevel: {
    type: String,
    default: ''
  },
  languagePreference: {
    type: String,
    enum: ['English', 'Hindi', 'Hinglish'],
    default: 'English'
  },
  caregiverName: {
    type: String,
    default: 'Self / Not Registered'
  },
  caregiverContact: {
    type: String,
    default: 'Self'
  },
  consentAccepted: {
    type: Boolean,
    default: false
  },
  avatarUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
