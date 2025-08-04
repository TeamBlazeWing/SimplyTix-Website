# Subscription System Integration Guide

## Overview
This guide explains how to integrate the subscription system with the real backend for managing user subscription status.

## Backend API Endpoints

### 1. OTP Request
**Endpoint:** `POST /api/subscription/otp-request`
**Body:**
```json
{
  "mobileNumber": "94712345678"
}
```
**Response:**
```json
{
  "success": true,
  "referenceNo": "ABC123"
}
```

### 2. OTP Verification
**Endpoint:** `POST /api/subscription/otp-verify`
**Body:**
```json
{
  "referenceNo": "ABC123",
  "otp": "123456",
  "mobileNumber": "94712345678"
}
```
**Response:**
```json
{
  "success": true,
  "subscriptionStatus": "active",
  "user": { ... }
}
```

### 3. Get Subscription Status
**Endpoint:** `POST /api/subscription/get-status`
**Body:**
```json
{
  "maskedMobile": "tel:94712345678"
}
```
**Response:**
```json
{
  "success": true,
  "subscriptionStatus": "active"
}
```

### 4. Unsubscribe
**Endpoint:** `POST /api/subscription/unsubscribe`
**Body:**
```json
{
  "maskedMobile": "tel:94712345678"
}
```
**Response:**
```json
{
  "success": true,
  "subscriptionStatus": "inactive"
}
```

### 5. User Login
**Endpoint:** `POST /api/users/login`
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "mobileNumber": "94712345678",
    "subscriptionStatus": "active"
  }
}
```

## Frontend Integration

### 1. Login Flow Integration

```javascript
import { checkSubscriptionStatusOnLogin } from '../../utils/subscriptionUtils';

const handleLogin = async (email, password) => {
  try {
    const loginResponse = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const loginData = await loginResponse.json();
    
    if (loginData.message === 'Login successful') {
      // Store user data with subscription status
      const userData = {
        ...loginData.user,
        token: loginData.token,
        subscriptionActive: loginData.user.subscriptionStatus === 'active'
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Sync with mSpace subscription status
      await checkSubscriptionStatusOnLogin();
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

### 2. Database Schema Updates

The user model already includes the `subscriptionStatus` field:

```javascript
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
  points: { type: Number, default: 30, min: 0 },
}, {
  timestamps: true
});
```

### 3. Key Features

1. **OTP Verification:** After successful OTP verification, the user's subscription status is automatically updated to 'active' in the database.

2. **Login Sync:** Every time a user logs in, the frontend checks the subscription status from both:
   - The database (via login response)
   - mSpace API (via get-status endpoint)

3. **Real-time Updates:** The subscription status is updated in both localStorage and the database when:
   - User subscribes (OTP verification)
   - User unsubscribes
   - Login occurs (sync check)

4. **Error Handling:** Comprehensive error handling for network issues and API failures.

## Usage Instructions

1. **Import utilities in your components:**
```javascript
import { checkSubscriptionStatusOnLogin, updateSubscriptionStatus } from '../utils/subscriptionUtils';
```

2. **Call on login:**
```javascript
await checkSubscriptionStatusOnLogin();
```

3. **Check current status:**
```javascript
const { isActive, subscriptionStatus } = getCurrentSubscriptionStatus();
```

4. **Update status manually:**
```javascript
updateSubscriptionStatus(true, 'active');
```

## Testing

1. Start the real backend server on port 3000
2. Test the subscription flow:
   - Register/Login user
   - Click subscribe button
   - Enter OTP (check mSpace for actual OTP)
   - Verify subscription status updates
   - Test unsubscribe functionality
   - Test login sync

## Important Notes

- Make sure the backend server is running on `http://localhost:3000`
- The mobile number format should match mSpace requirements
- All API calls include proper error handling
- Subscription status is stored both in database and localStorage for quick access
