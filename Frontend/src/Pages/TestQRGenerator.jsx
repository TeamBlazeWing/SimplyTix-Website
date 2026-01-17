import React, { useState } from 'react';
import QRCode from 'qrcode';

const TestQRGenerator = () => {
  const [ticketCode, setTicketCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQR = async () => {
    if (!ticketCode.trim()) {
      alert('Please enter a ticket code');
      return;
    }

    setIsGenerating(true);
    try {
      // Generate QR code with ticket information matching the validation format
      const ticketData = {
        ticketCode: ticketCode,
        eventId: 'test-event-id',
        type: 'ticket-validation',
        attendeeName: 'Test User',
        ticketType: 'General',
        timestamp: new Date().toISOString()
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(ticketData), {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrCodeDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSampleTicketCode = () => {
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    setTicketCode(`TKT${random}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          QR Code Generator (For Testing)
        </h1>
        
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Ticket Code:
              </label>
              <input
                type="text"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                placeholder="Enter ticket code (e.g., TKT123456)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={generateQR}
                disabled={isGenerating}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate QR'}
              </button>
              
              <button
                onClick={generateSampleTicketCode}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
              >
                Sample
              </button>
            </div>

            {qrCodeUrl && (
              <div className="mt-6 text-center">
                <h3 className="font-semibold text-gray-700 mb-4">Generated QR Code:</h3>
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="mx-auto border border-gray-300 rounded-lg"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Scan this QR code with the ticket validator
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
          <h3 className="text-white font-semibold mb-2">Instructions:</h3>
          <ul className="text-purple-200 text-sm space-y-1">
            <li>• Enter a ticket code (like TKT123456)</li>
            <li>• Click "Generate QR" to create a QR code</li>
            <li>• Use this QR code to test the ticket validator</li>
            <li>• Click "Sample" to generate a random ticket code</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestQRGenerator;
