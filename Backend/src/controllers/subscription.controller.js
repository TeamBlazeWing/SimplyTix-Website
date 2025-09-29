const service = require('../services/subscription.service');

exports.otpRequest = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const referenceNo = await service.requestOtp(mobileNumber);
    console.log('OTP request result:', referenceNo);
    res.json({ success: true, referenceNo: referenceNo });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.otpVerify = async (req, res) => {
  try {
    const { referenceNo, otp, mobileNumber } = req.body;
    const result = await service.verifyOtp(referenceNo, otp, mobileNumber);
    res.json({ success: true, ...result });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const { maskedMobile } = req.body;
    const status = await service.getSubscriptionStatus(maskedMobile);
    res.json({ success: true, subscriptionStatus: status });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    const { maskedMobile } = req.body;
    const status = await service.unsubscribe(maskedMobile);
    res.json({ success: true, subscriptionStatus: status });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};