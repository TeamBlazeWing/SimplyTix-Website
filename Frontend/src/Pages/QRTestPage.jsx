import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRTestPage = () => {
  const [scanResult, setScanResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');

  const startScanning = () => {
    setError('');
    setScanResult('');
    setIsScanning(true);

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-test-reader",
      { 
        fps: 10,
        qrbox: 250,
        rememberLastUsedCamera: true
      },
      false
    );

    html5QrcodeScanner.render(
      (decodedText, decodedResult) => {
        console.log("QR Code result:", decodedText);
        setScanResult(decodedText);
        html5QrcodeScanner.clear();
        setIsScanning(false);
      },
      (errorMessage) => {
        // Only show actual errors, not scanning attempts
        if (!errorMessage.includes("QR code parse error") && !errorMessage.includes("No QR code found")) {
          console.error("QR scanning error:", errorMessage);
          setError(errorMessage);
        }
      }
    );
  };

  const stopScanning = () => {
    setIsScanning(false);
    // The scanner will be cleared automatically when component unmounts
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">QR Scanner Test</h1>
        
        {!isScanning && (
          <button
            onClick={startScanning}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded mb-4"
          >
            Start QR Scanner
          </button>
        )}

        {isScanning && (
          <div className="mb-4">
            <div id="qr-test-reader" className="w-full"></div>
            <button
              onClick={stopScanning}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Stop Scanner
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {scanResult && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Scanned Result:</strong>
            <pre className="mt-2 whitespace-pre-wrap break-all">{scanResult}</pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-bold mb-2">Instructions:</h3>
          <ul className="text-sm space-y-1">
            <li>• Make sure camera permissions are enabled</li>
            <li>• Point camera at any QR code</li>
            <li>• Hold steady and ensure good lighting</li>
            <li>• QR code should be clearly visible in frame</li>
          </ul>
        </div>

        <div className="mt-4 text-center">
          <a 
            href="/validate-ticket" 
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Back to Ticket Validator
          </a>
        </div>
      </div>
    </div>
  );
};

export default QRTestPage;
