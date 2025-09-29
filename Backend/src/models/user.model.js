const mongoose = require('mongoose');
const { hashPassword } = require('../utils/hash');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  points: { type: Number, default: 30,min: 0, } , // Default points for new users
  maskedMobile: { type: String, default: null },
  subscribedAt: { type: Date, default: null },
  subscriptionExpiresAt: { type: Date, default: null }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
