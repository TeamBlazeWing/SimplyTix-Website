const userService = require('../services/user.service');

exports.registerUser = async (req, res, next) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    next(err);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    res.status(200).json({ message: 'Login successful', ...result });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateSubscriptionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await userService.updateSubscriptionStatus(req.user.id, status);
    res.status(200).json({ message: 'Subscription status updated', user });
  } catch (err) {
    next(err);
  }
};

exports.getSubscriptionStatus = async (req, res, next) => {
  try {
    const status = await userService.getSubscriptionStatus(req.user.id);
    res.status(200).json({ 
      success: true, 
      message: status ? true : false
    });
  } catch (err) {
    next(err);
  }
};




