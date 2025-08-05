import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ValidateTicket = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    if (isScanning) {
      const qrScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      qrScanner.render(
        (decodedText, decodedResult) => {
          console.log("QR Code scanned:", decodedText);
          setScanResult({
            success: true,
            data: decodedText,
            timestamp: new Date().toLocaleString()
          });
          qrScanner.clear();
          setIsScanning(false);
        },
        (error) => {
          console.warn("QR Code scan error:", error);
        }
      );

      setScanner(qrScanner);

      return () => {
        if (qrScanner) {
          qrScanner.clear().catch(console.error);
        }
      };
    }
  }, [isScanning]);

  const handleBack = () => {
    if (scanner && isScanning) {
      scanner.clear().catch(console.error);
    }
    navigate(-1);
  };

  const handleScanAgain = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  const validateTicketData = (data) => {
    try {
      // Try to parse as JSON first
      const ticketData = JSON.parse(data);
      return {
        isValid: true,
        ticketId: ticketData.ticketId || 'Unknown',
        eventId: ticketData.eventId || 'Unknown',
        attendeeName: ticketData.attendeeName || 'Unknown',
        ticketType: ticketData.ticketType || 'General'
      };
    } catch (error) {
      // If not JSON, treat as simple string
      return {
        isValid: data.length > 0,
        ticketId: data,
        eventId: eventId || 'Unknown',
        attendeeName: 'Unknown',
        ticketType: 'General'
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

          {/* QR Scanner Section */}
          {isScanning && (
            <div className="bg-white rounded-2xl p-6 shadow-2xl mb-6">
              <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
                Scan QR Code
              </h2>
              <div id="qr-reader" className="w-full"></div>
              <p className="text-gray-600 text-center mt-4 text-sm">
                Position the QR code within the camera frame to scan
              </p>
            </div>
          )}

          {/* Scan Result Section */}
          {scanResult && (
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="text-center mb-6">
                {scanResult.success ? (
                  <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                ) : (
                  <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
                )}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {scanResult.success ? 'QR Code Scanned!' : 'Scan Failed'}
                </h2>
              </div>

              {scanResult.success && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Scan Result:</h3>
                    <p className="text-gray-600 break-all font-mono text-sm bg-white p-2 rounded border">
                      {scanResult.data}
                    </p>
                  </div>

                  {/* Ticket Validation Info */}
                  {(() => {
                    const validationInfo = validateTicketData(scanResult.data);
                    return (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-700 mb-3">Ticket Information:</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-semibold ${validationInfo.isValid ? 'text-green-600' : 'text-red-600'}`}>
                              {validationInfo.isValid ? 'Valid' : 'Invalid'}
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
