const axios = require('axios');
const User = require('../models/user.model');

const MSPACE_APP_ID = process.env.MSPACE_APP_ID || 'APP_008542';
const MSPACE_PASSWORD = process.env.MSPACE_PASSWORD || 'd927d68199499f5e7114070bf88f9e6e';
const OTP_REQUEST_URL = 'https://api.mspace.lk/otp/request';
const OTP_VERIFY_URL = 'https://api.mspace.lk/otp/verify';
const STATUS_URL = 'https://api.mspace.lk/subscription/getStatus';
const UNSUBSCRIBE_URL = 'https://api.mspace.lk/subscription/send';

exports.requestOtp = async (mobileNumber) => {
  const payload = {
    applicationId: MSPACE_APP_ID,
    password: MSPACE_PASSWORD,
    subscriberId: 'tel:' + mobileNumber,
    applicationHash: 'abcdefgh',
    applicationMetaData: {
      client: 'WEBAPP',
      device: 'Browser',
      os: 'Windows',
      appCode: 'http://localhost:3000'
    }
  };
  const res = await axios.post(OTP_REQUEST_URL, payload);
  if (res.data.statusCode !== 'S1000') {
    throw new Error('OTP request failed: ' + res.data.statusDetail);
  }
  return res.data.referenceNo;
};

exports.verifyOtp = async (referenceNo, otp, mobileNumber) => {
  const payload = {
    applicationId: MSPACE_APP_ID,
    password: MSPACE_PASSWORD,
    referenceNo: referenceNo,
    otp: otp,
  };

  const res = await axios.post(OTP_VERIFY_URL, payload);
  console.log('OTP verification response:', res.data);

  const status = res.data.subscriptionStatus;
  const user = await User.findOne({ mobileNumber });
  if (!user) throw new Error('User not found');

  user.subscriptionStatus = status === 'REGISTERED' ? 'active' : 'inactive';
  user.maskedMobile = res.data.subscriberId;

  if (status === 'REGISTERED') {
    user.points += 30; //  Increment points only when successfully subscribed
    user.subscribedAt = new Date();
    user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }

  await user.save();
  return { subscriptionStatus: status, user};
};

exports.getSubscriptionStatus = async (maskedMobile) => {
  const payload = {
    applicationId: MSPACE_APP_ID,
    password: MSPACE_PASSWORD,
    subscriberId: maskedMobile
  };
  console.log('Fetching subscription status with payload:', payload);
  const res = await axios.post(STATUS_URL, payload);
  console.log('Subscription status response:', res.data);

  const user = await User.findOne({ maskedMobile });
  user.subscriptionStatus = res.data.subscriptionStatus === 'REGISTERED' ? 'active' : 'inactive';
  await user.save();
  return res.data;
};

exports.unsubscribe = async (maskedMobile) => {
  const payload = {
    applicationId: MSPACE_APP_ID,
    password: MSPACE_PASSWORD,
    subscriberId: maskedMobile,
    action: '0'
  };

  const res = await axios.post(UNSUBSCRIBE_URL, payload);
  const status = res.data.subscriptionStatus;

  if (status === 'UNREGISTERED') {
    // Find user by maskedMobile
    const user = await User.findOne({ maskedMobile });
    if (user) {
      user.subscriptionStatus = 'inactive';
      user.points = 0;
      await user.save();
    }
  }

  return status;
};