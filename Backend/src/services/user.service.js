const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { comparePassword } = require('../utils/hash');

exports.register = async (data) => {
  return await User.create(data);
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { token, user };
};

exports.getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  return user;
};

exports.updateSubscriptionStatus = async (userId, status) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  user.subscriptionStatus = status;
  await user.save();
  return user;
};


exports.getSubscriptionStatus = async (userId) => {
  const user = await User.findById(userId).select('subscriptionStatus');
  if (!user) throw new Error('User not found');
  return user.subscriptionStatus;
};
