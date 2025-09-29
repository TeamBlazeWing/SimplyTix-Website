import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { isTokenValid } from '../utils/ticketUtils';

const ValidateTicket = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [scanner, setScanner] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualTicketCode, setManualTicketCode] = useState('');
  const [scannerKey, setScannerKey] = useState(0); // Add key for forcing re-mount

  // Function to verify ticket with backend
  const verifyTicketCode = async (ticketCode) => {
    setIsVerifying(true);
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      
      if (!token || !isTokenValid(token)) {
        console.log("Token missing or invalid during ticket verification");
        return {
          success: false,
          isValid: false,
          message: 'Authentication required. Please log in again.'
        };
      }

      // Extract TKT code from scanned data
      let tktCode = ticketCode;
      
      // Check if it's in the format "simplitix-ticket:ticketcode"
      if (ticketCode.includes('SimplyTix-Ticket:')) {
        tktCode = ticketCode.split('SimplyTix-Ticket:')[1];
        console.log("Extracted ticket code from simplitix format:", tktCode);
      } else {
        // Check if it's JSON and extract ticket code
        try {
          const parsedData = JSON.parse(ticketCode);
          tktCode = parsedData.ticketCode || parsedData.tktCode || parsedData.code || ticketCode;
        } catch (e) {
          // If not JSON, use the raw string as ticket code
          tktCode = ticketCode;
        }
      }

      console.log("Verifying ticket code:", tktCode);

      // Call backend API to verify ticket
      const response = await fetch(`http://167.71.220.214:3000/api/tickets/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ticketCode: tktCode,
          eventId: eventId
        })
      });

      const result = await response.json();
      console.log("Verification response:", result);
      
      if (response.status === 401) {
        console.log("Unauthorized: Token rejected by server during verification");
        // Clear auth data and redirect to login
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        
        alert("Your session has expired. Please log in again.");
        navigate("/login");
        
        return {
          success: false,
          isValid: false,
          message: 'Session expired. Please log in again.'
        };
      }
      
      if (response.ok) {
        return {
          success: true,
          isValid: true,
          alreadyCheckedIn: result.alreadyCheckedIn,
          ticketData: result.ticket,
          message: result.message
        };
      } else {
        return {
          success: false,
          isValid: false,
          message: result.message || 'Invalid ticket code'
        };
      }
    } catch (error) {
      console.error('Error verifying ticket:', error);
      return {
        success: false,
        isValid: false,
        message: 'Error connecting to server. Please try again.'
      };
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    let currentScanner = null;
    
    if (isScanning) {
      setError(null);
      
      // Clean up any existing scanner first
      if (scanner) {
        scanner.clear().catch(console.error);
        setScanner(null);
      }
      
      // Check camera permissions first
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => {
          setCameraPermission(true);
          console.log("Camera permission granted");
          
          // Add a small delay to ensure DOM is ready
          setTimeout(() => {
            // Check if component is still mounted and scanning
            if (!isScanning) return;
            
            // Initialize QR scanner
            currentScanner = new Html5QrcodeScanner(
              "qr-reader",
              { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true,
                showZoomSliderIfSupported: true,
                defaultZoomValueIfSupported: 2
              },
              false
            );

            currentScanner.render(
              async (decodedText, decodedResult) => {
                console.log("QR Code scanned successfully:", decodedText);
                
                try {
                  if (currentScanner) {
                    await currentScanner.clear();
                    currentScanner = null;
                  }
                  setScanner(null);
                  setIsScanning(false);
                  
                  // Verify the ticket code with backend
                  const verificationResult = await verifyTicketCode(decodedText);
                  
                  setScanResult({
                    success: verificationResult.success,
                    data: decodedText,
                    timestamp: new Date().toLocaleString(),
                    verification: verificationResult
                  });
                } catch (clearError) {
                  console.error("Error clearing scanner:", clearError);
                }
              },
              (error) => {
                // Only log errors that aren't just scanning attempts
                if (!error.includes("No QR code found")) {
                  console.warn("QR Code scan error:", error);
                }
              }
            );

            setScanner(currentScanner);
          }, 100);
        })
        .catch((err) => {
          console.error("Camera permission denied or not available:", err);
          setCameraPermission(false);
          setError("Camera access is required for QR code scanning. Please allow camera permissions and refresh the page.");
        });
    }

    return () => {
      // Cleanup function
      if (currentScanner) {
        currentScanner.clear().catch((err) => {
          console.error("Error cleaning up scanner:", err);
        });
        currentScanner = null;
      }
      if (scanner) {
        scanner.clear().catch((err) => {
          console.error("Error cleaning up scanner state:", err);
        });
        setScanner(null);
      }
    };
  }, [isScanning, eventId]);

  const handleBack = () => {
    // Clean up scanner before navigating
    if (scanner && isScanning) {
      scanner.clear().catch(console.error);
      setScanner(null);
    }
    setIsScanning(false);
    navigate(-1);
  };

  const handleManualValidation = async () => {
    if (!manualTicketCode.trim()) {
      alert('Please enter a ticket code');
      return;
    }

    // Process the manual entry to extract ticket code if in simplitix format
    let processedCode = manualTicketCode.trim();
    if (processedCode.includes('simplitix-ticket:')) {
      processedCode = processedCode.split('simplitix-ticket:')[1];
      console.log("Extracted ticket code from manual entry:", processedCode);
    }

    setIsVerifying(true);
    const verificationResult = await verifyTicketCode(manualTicketCode);
    
    setScanResult({
      success: verificationResult.success,
      data: manualTicketCode,
      timestamp: new Date().toLocaleString(),
      verification: verificationResult
    });
    
    setManualEntry(false);
  };

  const handleScanAgain = () => {
    // Clean up current scanner state
    if (scanner) {
      scanner.clear().catch(console.error);
      setScanner(null);
    }
    
    setScanResult(null);
    setError(null);
    setCameraPermission(null);
    setManualEntry(false);
    setManualTicketCode('');
    setScannerKey(prev => prev + 1); // Force re-mount of scanner
    setIsScanning(true);
  };

  const validateTicketData = (data, verification = null) => {
    if (verification) {
      // Use verification result from backend
      return {
        isValid: verification.isValid,
        ticketId: verification.ticketData?.ticketId || verification.ticketData?._id || 'Unknown',
        eventId: verification.ticketData?.eventId || eventId || 'Unknown',
        attendeeName: verification.ticketData?.attendeeName || verification.ticketData?.customerName || 'Unknown',
        ticketType: verification.ticketData?.ticketType || verification.ticketData?.type || 'General',
        alreadyCheckedIn: verification.alreadyCheckedIn,
        message: verification.message
      };
    }

    // Fallback for when verification is not available
    try {
      const ticketData = JSON.parse(data);
      return {
        isValid: true,
        ticketId: ticketData.ticketId || ticketData.ticketCode || 'Unknown',
        eventId: ticketData.eventId || 'Unknown',
        attendeeName: ticketData.attendeeName || 'Unknown',
        ticketType: ticketData.ticketType || 'General',
        alreadyCheckedIn: false,
        message: 'Ticket scanned successfully'
      };
    } catch (error) {
      return {
        isValid: data.length > 0,
        ticketId: data,
        eventId: eventId || 'Unknown',
        attendeeName: 'Unknown',
        ticketType: 'General',
        alreadyCheckedIn: false,
        message: 'Ticket code detected'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors duration-300"
          >
            <FaArrowLeft className="text-xl" />
            <span className="text-lg font-semibold">Back</span>
          </button>
        </div>

        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            Ticket Validation
          </h1>

          {/* Error State */}
          {error && (
            <div className="bg-red-100 border border-red-400 rounded-2xl p-6 shadow-2xl mb-6">
              <div className="text-center">
                <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-800 mb-2">
                  Camera Error
                </h2>
                <p className="text-red-700 mb-4">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          )}

          {/* Camera Permission Check */}
          {cameraPermission === false && !error && (
            <div className="bg-yellow-100 border border-yellow-400 rounded-2xl p-6 shadow-2xl mb-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-yellow-800 mb-2">
                  Camera Permission Required
                </h2>
                <p className="text-yellow-700 mb-4">
                  Please allow camera access to scan QR codes. Check your browser settings and reload the page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* QR Scanner Section */}
          {isScanning && !error && cameraPermission !== false && (
            <div className="bg-white rounded-2xl p-6 shadow-2xl mb-6">
              <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
                Scan QR Code
              </h2>
              <div id="qr-reader" key={scannerKey} className="w-full"></div>
              <p className="text-gray-600 text-center mt-4 text-sm">
                Position the QR code within the camera frame to scan
              </p>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setManualEntry(true)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 text-sm mr-2"
                >
                  Enter Code Manually
                </button>
                <button
                  onClick={async () => {
                    setIsScanning(false);
                    // Test with a real verification call
                    const verificationResult = await verifyTicketCode("TKT123456");
                    setScanResult({
                      success: verificationResult.success,
                      data: "TKT123456",
                      timestamp: new Date().toLocaleString(),
                      verification: verificationResult
                    });
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 text-sm"
                >
                  Test Mode
                </button>
              </div>
            </div>
          )}

          {/* Manual Entry Section */}
          {manualEntry && (
            <div className="bg-white rounded-2xl p-6 shadow-2xl mb-6">
              <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
                Enter Ticket Code Manually
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={manualTicketCode}
                  onChange={(e) => setManualTicketCode(e.target.value)}
                  placeholder="Enter ticket code (e.g., simplitix-ticket:TKT123456 or TKT123456)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center font-mono"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleManualValidation}
                    disabled={isVerifying || !manualTicketCode.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {isVerifying ? 'Validating...' : 'Validate Ticket'}
                  </button>
                  <button
                    onClick={() => {
                      setManualEntry(false);
                      setManualTicketCode('');
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isVerifying && (
            <div className="bg-white rounded-2xl p-6 shadow-2xl mb-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Verifying Ticket...
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your ticket
                </p>
              </div>
            </div>
          )}

          {/* Scan Result Section */}
          {scanResult && !isVerifying && (
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="text-center mb-6">
                {scanResult.verification?.isValid ? (
                  scanResult.verification?.alreadyCheckedIn ? (
                    <FaTimesCircle className="text-orange-500 text-6xl mx-auto mb-4" />
                  ) : (
                    <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                  )
                ) : (
                  <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
                )}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {scanResult.verification?.isValid ? (
                    scanResult.verification?.alreadyCheckedIn ? 'Ticket Already Used!' : 'Ticket Verified!'
                  ) : (
                    'Invalid Ticket'
                  )}
                </h2>
                {scanResult.verification?.message && (
                  <p className={`text-lg font-medium ${
                    scanResult.verification?.isValid ? (
                      scanResult.verification?.alreadyCheckedIn ? 'text-orange-600' : 'text-green-600'
                    ) : 'text-red-600'
                  }`}>
                    {scanResult.verification.message}
                  </p>
                )}
              </div>

              {scanResult.success && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Scanned Code:</h3>
                    <p className="text-gray-600 break-all font-mono text-sm bg-white p-2 rounded border">
                      {scanResult.data}
                    </p>
                  </div>

                  {/* Ticket Validation Info */}
                  {(() => {
                    const validationInfo = validateTicketData(scanResult.data, scanResult.verification);
                    return (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-700 mb-3">Ticket Information:</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-semibold ${
                              validationInfo.isValid ? (
                                validationInfo.alreadyCheckedIn ? 'text-orange-600' : 'text-green-600'
                              ) : 'text-red-600'
                            }`}>
                              {validationInfo.isValid ? (
                                validationInfo.alreadyCheckedIn ? 'Already Checked In' : 'Valid - Checked In'
                              ) : 'Invalid'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ticket ID:</span>
                            <span className="font-semibold text-gray-800">{validationInfo.ticketId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Event ID:</span>
                            <span className="font-semibold text-gray-800">{validationInfo.eventId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Attendee:</span>
                            <span className="font-semibold text-gray-800">{validationInfo.attendeeName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ticket Type:</span>
                            <span className="font-semibold text-gray-800">{validationInfo.ticketType}</span>
                          </div>
                          {validationInfo.alreadyCheckedIn && (
                            <div className="bg-orange-100 border border-orange-300 rounded p-3 mt-3">
                              <p className="text-orange-800 font-semibold text-center">
                                ⚠️ This ticket has already been used for check-in
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="text-center text-sm text-gray-500">
                    Scanned at: {scanResult.timestamp}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleScanAgain}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300"
                >
                  Scan Again
                </button>
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 rounded-lg transition-all duration-300"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          {isScanning && (
            <div className="bg-purple-900/30 rounded-lg p-4 mt-6 border border-purple-500/30">
              <h3 className="text-white font-semibold mb-2">Instructions:</h3>
              <ul className="text-purple-200 text-sm space-y-1">
                <li>• Point your camera at the QR code</li>
                <li>• Make sure the code is well-lit and in focus</li>
                <li>• Hold steady until the scan completes</li>
                <li>• The camera will automatically detect and scan the code</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidateTicket;
