const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Mock data
let mockReferenceNo = "123456";
let mockMobileNumber = "9876543210";
let mockOTP = "654321";
let userSubscriptionStatus = false; // Track user subscription status

// Mock endpoints

// OTP Request Endpoint
app.post('/api/subscription/otp-request', (req, res) => {
  const { mobileNumber } = req.body;
  if (mobileNumber) {
    mockMobileNumber = mobileNumber;
    mockReferenceNo = Math.random().toString(36).substring(2, 8).toUpperCase();
    return res.json({ success: true, referenceNo: mockReferenceNo });
  }
  return res.status(400).json({ success: false, message: 'Mobile number is required.' });
});

// OTP Verify Endpoint
app.post('/api/subscription/otp-verify', (req, res) => {
  const { otp, referenceNo, mobileNumber } = req.body;
  if (otp === mockOTP && referenceNo === mockReferenceNo && mobileNumber === mockMobileNumber) {
    // Set user as subscribed after successful OTP verification
    userSubscriptionStatus = true;
    return res.json({ success: true, message: 'OTP verified successfully.' });
  }
  return res.status(400).json({ success: false, message: 'Invalid OTP or reference number.' });
});

// Get Subscription Status Endpoint
app.get('/api/subscription/get-status', (req, res) => {
  return res.json({ 
    success: true, 
    verified: true,
    isActive: userSubscriptionStatus,
    message: userSubscriptionStatus ? 'Subscription is active' : 'Subscription is inactive'
  });
});

// Unsubscribe Endpoint
app.post('/api/subscription/unsubscribe', (req, res) => {
  userSubscriptionStatus = false;
  return res.json({ 
    success: true, 
    message: 'Successfully unsubscribed from notifications'
  });
});

// Start the server
app.listen(3008, () => {
  console.log(`Mock server is running on http://localhost:3008`);
});
