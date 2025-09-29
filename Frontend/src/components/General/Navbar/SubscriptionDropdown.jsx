import { useState, useEffect, useRef } from "react";
import { FaRss, FaCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import "./styles.css";

const SubscriptionDropdown = ({
  subscriptionRef,
  isSubscriptionOpen,
  setIsSubscriptionOpen,
  subscriptionStatus,
  subscriptionLoading,
  otpModalOpen,
  setOtpModalOpen,
  otpData,
  setOtpData,
  otpInput,
  setOtpInput,
  otpLoading,
  setOtpLoading,
  otpError,
  setOtpError,
  userPhoneNumber,
  setUserPhoneNumber,
  getSubscriptionStatus,
  closeOTPModal,
  handleLogout,
}) => {

  // Countdown state
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownTime, setCountdownTime] = useState(60);
  const countdownIntervalRef = useRef(null);

  // Start countdown after successful subscription
  const startCountdown = () => {
    setShowCountdown(true);
    setCountdownTime(60);
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdownTime(prevTime => {
        if (prevTime <= 1) {
          clearInterval(countdownIntervalRef.current);
          setShowCountdown(false);
          // Logout user after countdown
          if (handleLogout) {
            handleLogout();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const verifyOTPLocal = async (otp, referenceNo, mobileNumber) => {
    try {
      setOtpLoading(true);
      setOtpError('');
      const response = await fetch('http://167.71.220.214:3000/api/subscription/otp-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp: otp, referenceNo: referenceNo, mobileNumber: mobileNumber }),
      });
      const data = await response.json();
      console.log('OTP Verify Response:', data);
      
      if (data.success) {
        // After successful OTP verification, check subscription status
        await checkAndUpdateSubscriptionStatus();
        // Close modal and refresh subscription status
        setOtpModalOpen(false);
        setOtpInput('');
        getSubscriptionStatus();
        // Start countdown timer for logout
        startCountdown();
      } else {
        setOtpError(data.message || 'OTP verification failed.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('Network error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Function to check subscription status and update user data
  const checkAndUpdateSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('Authorization token is missing.');
        return;
      }

      // First, get the current subscription status from the external API
      const userData = localStorage.getItem('userData');
      const maskedMobile = userData.maskedMobile;
      const statusResponse = await fetch("http://167.71.220.214:3000/api/subscription/get-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
              maskedMobile: maskedMobile,
              }),
            });

      const statusData = await statusResponse.json();
      console.log('External subscription status response:', statusData);

      if (statusData.success) {
        // Determine the status value to send
        const subscriptionStatus = statusData.isActive ? 'active' : 'inactive';
        console.log('Mapped subscription status:', subscriptionStatus);

        // Update subscription status in the backend database
        const updateResponse = await fetch('http://167.71.220.214:3000/api/users/profile/subscription-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: subscriptionStatus }),
        });

        const updateData = await updateResponse.json();
        console.log('Update subscription status response:', updateData);

        if (updateData.success) {
          console.log(`Subscription status successfully updated in the database to: ${subscriptionStatus}`);
        } else {
          console.error('Failed to update subscription status:', updateData.message || 'No message provided');
        }
      } else {
        console.error('Failed to fetch external subscription status:', statusData.message || 'External API error');
      }
    } catch (error) {
      console.error('Error checking or updating subscription status:', error);
    }
  };

  // Function to verify OTP and log backend response
  const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : {};
  console.log('User Data:', userData);
  const requestOTPVerify = async () => {
    try {
      console.log('Requesting OTP for phone number:', userData.mobileNumber);
      const response = await fetch('http://167.71.220.214:3000/api/subscription/otp-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobileNumber: userData.mobileNumber }),
      });
      const data = await response.json();
      console.log('OTP Request Response:', data);
      if (!data.success) {
        setOtpError(data.message || 'Failed to send OTP.');
      } else {
        setOtpError('');
        // Store the reference number for later use
        setOtpData({ referenceNo: data.referenceNo });
        setUserPhoneNumber(userData.mobileNumber);
      }
    } catch (error) {
      setOtpError('Network error. Please try again.');
      console.error('OTP Request Error:', error);
    }
  };

  // Function for resend OTP button
  const requestOTP = async () => {
    await requestOTPVerify();
    setOtpModalOpen(true);
  };

  // Function to handle unsubscription
  const handleUnsubscribe = async () => {
    try {
      const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : {};
      const maskedMobile = userData.maskedMobile;

      const response = await fetch('http://167.71.220.214:3000/api/subscription/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maskedMobile }),
      });
      const data = await response.json();
      
      if (data.success) {
        // Refresh the subscription status in the component
        getSubscriptionStatus();
        console.log('Successfully unsubscribed');
      } else {
        console.error('Unsubscribe failed:', data.message);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  // ...existing code...
  return (
    <div className="relative" ref={subscriptionRef}>
      <button
        onClick={() => {
          setIsSubscriptionOpen(!isSubscriptionOpen);
          if (!isSubscriptionOpen) {
            getSubscriptionStatus();
          }
        }}
        className={`text-white text-xl hover:text-purple-300 p-3 rounded-full hover:bg-white/10 transition-all duration-300 transform hover:scale-110 active:scale-95 relative ${
          subscriptionStatus && !subscriptionStatus.isActive
            ? "animate-pulse shadow-lg shadow-orange-500/50 ring-2 ring-orange-400/30 bg-orange-500/10"
            : ""
        }`}
      >
        <FaRss className={`transition-transform duration-300 ${subscriptionStatus && !subscriptionStatus.isActive ? "animate-bounce text-orange-400" : ""}`} />
        {subscriptionStatus?.isActive ? (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse shadow-lg">
            ✓
          </span>
        ) : subscriptionStatus && !subscriptionStatus.isActive ? (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-ping shadow-lg">
            !
          </span>
        ) : null}
        {subscriptionStatus && !subscriptionStatus.isActive && (
          <div className="absolute inset-0 rounded-full border-2 border-orange-400/50 animate-ping"></div>
        )}
      </button>
      {isSubscriptionOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-black/95 backdrop-blur-xl rounded-xl shadow-2xl border border-purple-500/30 z-[9999] animate-in slide-in-from-top-2 duration-300">
          <div className="p-4 border-b border-gray-600/50">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Subscription Service</h3>
              {subscriptionLoading && (
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            {subscriptionStatus && !subscriptionStatus.isActive && (
              <div className="mt-2 text-orange-400 text-xs font-medium animate-pulse">Get Subcription to continue your service</div>
            )}
          </div>
          <div className="p-6">
            {subscriptionLoading ? (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Checking subscription status...</p>
              </div>
            ) : subscriptionStatus ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${subscriptionStatus.isActive ? "bg-green-500/20 border-green-500/30" : "bg-red-500/20 border-red-500/30"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${subscriptionStatus.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
                    <h4 className="text-white font-medium">Status: {subscriptionStatus.isActive ? "Active" : "Inactive"}</h4>
                  </div>
                  <p className="text-gray-300 text-sm">{subscriptionStatus.message || "Subscription service status"}</p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={async () => {
                      if (!subscriptionStatus.isActive) {
                        // Call OTP request and open modal for subscribing
                        await requestOTPVerify();
                        setOtpModalOpen(true);
                        setIsSubscriptionOpen(false); // Close dropdown
                      } else {
                        // Unsubscribe logic
                        handleUnsubscribe();
                      }
                    }}
                    disabled={subscriptionLoading || otpLoading}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                      subscriptionLoading || otpLoading
                        ? "bg-gray-600/20 text-gray-400 cursor-not-allowed"
                        : subscriptionStatus.isActive
                        ? "bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30"
                        : "bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-400 hover:from-green-600/40 hover:to-emerald-600/40 border border-green-500/30 transform hover:scale-105 animate-pulse shadow-lg shadow-green-500/25"
                    }`}
                  >
                    {subscriptionLoading || otpLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        {otpLoading ? "Sending OTP..." : "Updating..."}
                      </div>
                    ) : subscriptionStatus.isActive ? (
                      "Unsubscribe"
                    ) : (
                      "Subscribe Now"
                    )}
                  </button>
                  <button
                    onClick={() => getSubscriptionStatus()}
                    className="w-full py-2 px-4 rounded-lg font-medium bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30 transition-all duration-300"
                  >
                    Refresh Status
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <FaRss className="text-4xl text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-4">Unable to load subscription status</p>
                <button
                  onClick={() => getSubscriptionStatus()}
                  className="py-2 px-4 rounded-lg font-medium bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30 transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {otpModalOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-center items-center bg-black/70 backdrop-blur-sm w-screen h-screen">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-blue-500/30 shadow-2xl w-full max-w-md mx-4 p-8 flex flex-col justify-center items-center">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Verify Your Phone Number</h3>
              <button onClick={closeOTPModal} className="text-gray-400 hover:text-gray-200">
                <IoClose size={24} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-300 mb-2">We've sent a verification code to your phone number ending in <span className='font-bold text-blue-400'>{userPhoneNumber ? userPhoneNumber.slice(-4) : '****'}</span></p>
              <p className="text-sm text-gray-400">Please enter the 6-digit code to confirm your subscription to event notifications.</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
              <input
                type="text"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full px-3 py-2 border border-blue-500/30 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength="6"
                disabled={otpLoading}
              />
            </div>
            {otpError && (
              <div className="mb-4 p-3 bg-red-900/80 border border-red-500 text-red-200 rounded">{otpError}</div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (otpData && otpData.referenceNo) {
                    verifyOTPLocal(otpInput, otpData.referenceNo, userPhoneNumber);
                  } else {
                    setOtpError('Reference number not found. Please request OTP again.');
                  }
                }}
                disabled={otpLoading || !otpInput.trim()}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 ${
                  otpLoading || !otpInput.trim() ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-blue-700 text-white hover:bg-blue-800"
                }`}
              >
                {otpLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify & Subscribe"
                )}
              </button>
              <button
                onClick={closeOTPModal}
                className="flex-1 py-2 px-4 rounded-md font-medium bg-gray-700 text-gray-200 hover:bg-gray-800 transition-all duration-300"
                disabled={otpLoading}
              >
                Cancel
              </button>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={requestOTP}
                disabled={otpLoading}
                className="text-sm text-blue-400 hover:text-blue-600 underline"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Countdown Modal */}
      {showCountdown && (
        <div className="fixed inset-0 z-[10000] flex justify-center items-center bg-black/80 backdrop-blur-sm w-screen h-screen">
          <div className="bg-gradient-to-br from-green-900 via-black to-green-900 rounded-2xl border border-green-500/30 shadow-2xl w-full max-w-md mx-4 p-8 flex flex-col justify-center items-center">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <FaCheck className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">Successfully Subscribed!</h3>
              <p className="text-gray-300 mb-4">You have been subscribed to event notifications.</p>
            </div>
            
            <div className="bg-black/50 rounded-xl p-6 w-full text-center border border-green-500/20">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {Math.floor(countdownTime / 60)}:{(countdownTime % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Waiting for subscription activation...
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((60 - countdownTime) / 60) * 100}%` }}
                ></div>
              </div>
              <p className="text-yellow-400 text-xs">
                You will be logged out automatically when the timer reaches zero.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDropdown;