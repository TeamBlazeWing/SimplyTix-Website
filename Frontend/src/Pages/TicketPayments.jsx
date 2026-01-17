import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaLock,
  FaCheck,
  FaCreditCard,
  FaPaypal,
  FaCircleInfo,
  FaTriangleExclamation,
  FaCircleCheck,
  FaUser,
  FaShield,
} from 'react-icons/fa6';
import { FaMobile } from 'react-icons/fa';

// Utility function to detect card type
const getCardType = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'MasterCard';
  if (/^3[47]/.test(cleaned)) return 'American Express';
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
  return 'Unknown';
};

const TicketPayments = ({ setUserPoints }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pointsToAdd = location.state?.pointsToAdd || 0;

  // Mock event data (replace with actual event data from your app)
  const selectedEvent = {
    title: 'Add Points to Account',
    date: new Date(),
    location: 'Online',
    price: pointsToAdd, // Assuming 1 point = $1 for simplicity
    tickets: [
      {
        name: 'Points Package',
        price: pointsToAdd,
        quantity: 1,
        availableQuantity: 9999,
        soldQuantity: 0,
      },
    ],
  };

  const [ticketSelections, setTicketSelections] = useState([1]); // Default to 1 for points package
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    saveCard: false,
    acceptTerms: false,
    agreeRefund: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Real-time validation
    if (name === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setFormErrors((prev) => ({ ...prev, email: 'Invalid email address' }));
      } else {
        setFormErrors((prev) => ({ ...prev, email: '' }));
      }
    }
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length !== 10) {
        setFormErrors((prev) => ({ ...prev, phone: 'Phone number must be 10 digits' }));
      } else {
        setFormErrors((prev) => ({ ...prev, phone: '' }));
        setFormData((prev) => ({ ...prev, phone: cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') }));
      }
    }
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length < 13 || cleaned.length > 19) {
        setFormErrors((prev) => ({ ...prev, cardNumber: 'Invalid card number' }));
      } else {
        setFormErrors((prev) => ({ ...prev, cardNumber: '' }));
        setFormData((prev) => ({ ...prev, cardNumber: cleaned.replace(/(\d{4})/g, '$1 ').trim() }));
      }
    }
    if (name === 'expiryDate') {
      if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(value)) {
        setFormErrors((prev) => ({ ...prev, expiryDate: 'Invalid expiry date (MM/YY)' }));
      } else {
        setFormErrors((prev) => ({ ...prev, expiryDate: '' }));
      }
    }
    if (name === 'cvv') {
      if (!/^\d{3,4}$/.test(value)) {
        setFormErrors((prev) => ({ ...prev, cvv: 'Invalid CVV' }));
      } else {
        setFormErrors((prev) => ({ ...prev, cvv: '' }));
      }
    }
  };

  const handleTicketQuantityChange = (index, quantity) => {
    if (quantity >= 0 && quantity <= (selectedEvent.tickets[index].availableQuantity || 9999)) {
      setTicketSelections((prev) => {
        const newSelections = [...prev];
        newSelections[index] = quantity;
        return newSelections;
      });
    }
  };

  const getTotalTickets = () => ticketSelections.reduce((sum, qty) => sum + (qty || 0), 0);

  const getTotalPrice = () => {
    return selectedEvent.tickets.reduce(
      (sum, ticket, index) => sum + ticket.price * (ticketSelections[index] || 0),
      0
    );
  };

  const getTicketSummary = () => {
    return selectedEvent.tickets
      .map((ticket, index) => ({
        type: ticket.name,
        quantity: ticketSelections[index] || 0,
        price: ticket.price,
      }))
      .filter((item) => item.quantity > 0);
  };

  const isFormValid = () => {
    return (
      formData.fullName &&
      formData.email &&
      formData.phone &&
      !formErrors.email &&
      !formErrors.phone &&
      (paymentMethod !== 'card' ||
        (formData.cardholderName &&
          formData.cardNumber &&
          formData.expiryDate &&
          formData.cvv &&
          formData.billingAddress &&
          !formErrors.cardNumber &&
          !formErrors.expiryDate &&
          !formErrors.cvv)) &&
      formData.acceptTerms &&
      formData.agreeRefund &&
      getTotalTickets() > 0
    );
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    console.log('handlePurchase called');
    if (!isFormValid()) {
      console.log('Form is not valid:', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        formErrors,
        card: paymentMethod === 'card' ? {
          cardholderName: formData.cardholderName,
          cardNumber: formData.cardNumber,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          billingAddress: formData.billingAddress,
        } : undefined,
        acceptTerms: formData.acceptTerms,
        agreeRefund: formData.agreeRefund,
        getTotalTickets: getTotalTickets(),
      });
      return;
    }
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken"); // Assuming JWT is stored in localStorage
      if (!token) {
        setErrorMessage('You must be logged in to make a payment. Please log in and try again.');
        setLoading(false);
        return;
      }
      const response = await fetch('http://167.71.220.214:3000/api/payments/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pointsAmount: pointsToAdd,
          method: paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process payment');
      }

      // Update userPoints after successful purchase
      setSuccessMessage(data.message || 'Points purchased successfully!');
      alert('Points purchased successfully!');

      // Redirect to home after a brief delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group min-h-screen bg-gray-900 p-4">
      <div className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 text-white border border-white/20 shadow-2xl transform transition-all duration-500 hover:shadow-purple-500/25 max-w-2xl mx-auto">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center">
            <FaCircleCheck className="text-green-400 mr-2" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center">
            <FaTriangleExclamation className="text-red-400 mr-2" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Enhanced Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              Secure Checkout
            </h2>
            <div className="flex items-center space-x-2 text-sm bg-green-500/20 px-4 py-2 rounded-full border border-green-500/30">
              <FaLock className="text-green-400 animate-pulse" />
              <span className="text-green-300 font-medium">SSL Protected</span>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div className={`relative flex flex-col items-center transition-all duration-500 ${currentStep >= 1 ? 'scale-110' : 'scale-100'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                  currentStep >= 1 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-black shadow-lg shadow-green-500/50' 
                    : 'bg-gray-600'
                }`}>
                  {currentStep > 1 ? <FaCheck className="text-lg" /> : '1'}
                </div>
                <span className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                  currentStep >= 1 ? 'text-green-400' : 'text-gray-400'
                }`}>
                  Contact Info
                </span>
                {currentStep === 1 && (
                  <div className="absolute -bottom-8 w-20 h-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                )}
              </div>

              <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
                currentStep >= 2 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gray-600'
              }`}></div>

              <div className={`relative flex flex-col items-center transition-all duration-500 ${currentStep >= 2 ? 'scale-110' : 'scale-100'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                  currentStep >= 2 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-black shadow-lg shadow-green-500/50' 
                    : 'bg-gray-600'
                }`}>
                  {currentStep > 2 ? <FaCheck className="text-lg" /> : '2'}
                </div>
                <span className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                  currentStep >= 2 ? 'text-green-400' : 'text-gray-400'
                }`}>
                  Payment
                </span>
                {currentStep === 2 && (
                  <div className="absolute -bottom-8 w-20 h-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                )}
              </div>

              <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
                currentStep >= 3 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gray-600'
              }`}></div>

              <div className={`relative flex flex-col items-center transition-all duration-500 ${currentStep >= 3 ? 'scale-110' : 'scale-100'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                  currentStep >= 3 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-black shadow-lg shadow-green-500/50' 
                    : 'bg-gray-600'
                }`}>
                  {currentStep > 3 ? <FaCheck className="text-lg" /> : '3'}
                </div>
                <span className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                  currentStep >= 3 ? 'text-green-400' : 'text-gray-400'
                }`}>
                  Review
                </span>
                {currentStep === 3 && (
                  <div className="absolute -bottom-8 w-20 h-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handlePurchase} className="space-y-6">
          {/* Step 1: Contact Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>

              <div>
                <label className="block text-sm font-medium mb-3">Points Package</label>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{selectedEvent.tickets[0].name}</h4>
                      <p className="text-green-400 font-bold">${selectedEvent.tickets[0].price}</p>
                      <p className="text-sm text-gray-400">
                        Available: {selectedEvent.tickets[0].availableQuantity - selectedEvent.tickets[0].soldQuantity} / {selectedEvent.tickets[0].quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-12 text-center font-semibold">{ticketSelections[0]}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <span className="text-gray-400">Subtotal: </span>
                    <span className="text-green-400 font-semibold">${selectedEvent.tickets[0].price}</span>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Points: {pointsToAdd}</span>
                    <span className="text-xl font-bold text-green-400">${getTotalPrice()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-gray-800 border text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                      formErrors.email ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter your email"
                  />
                  {formErrors.email && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <FaTriangleExclamation className="mr-1" />
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength="14"
                  className={`w-full p-3 rounded-lg bg-gray-800 border text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                    formErrors.phone ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="(123) 456-7890"
                />
                {formErrors.phone && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <FaTriangleExclamation className="mr-1" />
                    {formErrors.phone}
                  </p>
                )}
                {formData.phone && !formErrors.phone && formData.phone.length === 14 && (
                  <p className="text-green-400 text-xs mt-1 flex items-center">
                    <FaCircleCheck className="mr-1" />
                    Valid phone number
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!formData.fullName || !formData.email || !formData.phone || formErrors.email || formErrors.phone || getTotalTickets() === 0}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                Continue to Payment ({pointsToAdd} points)
              </button>
            </div>
          )}

          {/* Step 2: Payment Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Payment Information</h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  ← Back to Contact Info
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                    paymentMethod === 'card' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 hover:border-gray-500'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <FaCreditCard className="mr-2 text-xl" />
                    <span>Credit/Debit Card</span>
                  </label>
                  <label className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                    paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 hover:border-gray-500'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <FaPaypal className="mr-2 text-xl text-blue-400" />
                    <span>PayPal</span>
                  </label>
                  <label className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                    paymentMethod === 'mobile' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 hover:border-gray-500'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mobile"
                      checked={paymentMethod === 'mobile'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <FaMobile className="mr-2 text-xl text-blue-400" />
                    <span>Mobile Payment</span>
                  </label>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FaCircleInfo className="text-blue-400 mr-2" />
                      <span className="text-sm font-medium">Card Information</span>
                    </div>
                    <p className="text-xs text-gray-300">
                      Your payment information is encrypted and secure. We never store your card details.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cardholder Name *</label>
                    <input
                      type="text"
                      name="cardholderName"
                      required
                      value={formData.cardholderName}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Name on card"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Card Number *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        required
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        maxLength="19"
                        className={`w-full p-3 pl-12 rounded-lg bg-gray-800 border text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                          formErrors.cardNumber ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="1234 5678 9012 3456"
                      />
                      <FaCreditCard className="absolute left-3 top-3 text-gray-400" />
                      {formData.cardNumber && getCardType(formData.cardNumber) !== 'Unknown' && (
                        <div className="absolute right-3 top-3 text-sm text-green-400 flex items-center">
                          <FaCircleCheck className="mr-1" />
                          {getCardType(formData.cardNumber)}
                        </div>
                      )}
                    </div>
                    {formErrors.cardNumber && (
                      <p className="text-red-400 text-xs mt-1 flex items-center">
                        <FaTriangleExclamation className="mr-1" />
                        {formErrors.cardNumber}
                      </p>
                    )}
                    {formData.cardNumber && !formErrors.cardNumber && formData.cardNumber.length >= 13 && (
                      <p className="text-green-400 text-xs mt-1 flex items-center">
                        <FaCircleCheck className="mr-1" />
                        Valid card number
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                      <input
                        type="text"
                        name="expiryDate"
                        required
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        maxLength="5"
                        className={`w-full p-3 rounded-lg bg-gray-800 border text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                          formErrors.expiryDate ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="MM/YY"
                      />
                      {formErrors.expiryDate && (
                        <p className="text-red-400 text-xs mt-1 flex items-center">
                          <FaTriangleExclamation className="mr-1" />
                          {formErrors.expiryDate}
                        </p>
                      )}
                      {formData.expiryDate && !formErrors.expiryDate && formData.expiryDate.length === 5 && (
                        <p className="text-green-400 text-xs mt-1 flex items-center">
                          <FaCircleCheck className="mr-1" />
                          Valid expiry date
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV *</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cvv"
                          required
                          value={formData.cvv}
                          onChange={handleInputChange}
                          maxLength="4"
                          className={`w-full p-3 rounded-lg bg-gray-800 border text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                            formErrors.cvv ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder="123"
                        />
                        <div className="absolute right-3 top-3">
                          <FaCircleInfo className="text-gray-400 text-sm" title="3-digit code on back of card (4 digits for Amex)" />
                        </div>
                      </div>
                      {formErrors.cvv && (
                        <p className="text-red-400 text-xs mt-1 flex items-center">
                          <FaTriangleExclamation className="mr-1" />
                          {formErrors.cvv}
                        </p>
                      )}
                      {formData.cvv && !formErrors.cvv && (formData.cvv.length === 3 || formData.cvv.length === 4) && (
                        <p className="text-green-400 text-xs mt-1 flex items-center">
                          <FaCircleCheck className="mr-1" />
                          Valid CVV
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Billing Address *</label>
                    <textarea
                      name="billingAddress"
                      required
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter your billing address"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="saveCard"
                      checked={formData.saveCard}
                      onChange={handleInputChange}
                      className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-300">
                      Save card for future purchases (optional)
                    </label>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="space-y-4">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 text-center">
                    <FaPaypal className="text-4xl text-blue-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold mb-2">PayPal Checkout</h4>
                    <p className="text-sm text-gray-300 mb-4">
                      You will be redirected to PayPal to complete your payment securely.
                    </p>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>• Pay with your PayPal balance, bank account, or linked cards</p>
                      <p>• No need to enter card details here</p>
                      <p>• Your payment is protected by PayPal's Buyer Protection</p>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FaCircleInfo className="text-yellow-400 mr-2" />
                      <span className="text-sm font-medium">Important Notice</span>
                    </div>
                    <p className="text-xs text-gray-300">
                      After clicking "Continue to Review", you'll proceed to PayPal's secure checkout where you can log in and confirm your payment.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'mobile' && (
                <div className="space-y-4">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 text-center">
                    <FaMobile className="text-4xl text-blue-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold mb-2">Mobile Payment</h4>
                    <p className="text-sm text-gray-300 mb-4">
                      Complete your payment using a mobile payment service (e.g., Apple Pay, Google Pay).
                    </p>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>• Select your preferred mobile payment app</p>
                      <p>• Follow the prompts to authenticate and pay</p>
                      <p>• Secure and fast checkout</p>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FaCircleInfo className="text-yellow-400 mr-2" />
                      <span className="text-sm font-medium">Important Notice</span>
                    </div>
                    <p className="text-xs text-gray-300">
                      Ensure your mobile payment app is set up before proceeding.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={paymentMethod === 'card' && (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardholderName || !formData.billingAddress || Object.keys(formErrors).length > 0)}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                Continue to Review
              </button>
            </div>
          )}

          {/* Step 3: Review and Terms */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Review Your Order</h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  ← Back to Payment
                </button>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <FaUser className="mr-2 text-blue-400" />
                  Contact Information
                </h4>
                <div className="text-sm space-y-1">
                  <p><strong>Name:</strong> {formData.fullName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                </div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <FaCreditCard className="mr-2 text-green-400" />
                  Payment Method
                </h4>
                <div className="text-sm">
                  {paymentMethod === 'card' ? (
                    <div className="space-y-1">
                      <p><strong>Method:</strong> Credit/Debit Card</p>
                      <p><strong>Card:</strong> **** **** **** {formData.cardNumber.slice(-4)}</p>
                      <p><strong>Card Type:</strong> {getCardType(formData.cardNumber)}</p>
                    </div>
                  ) : paymentMethod === 'paypal' ? (
                    <p><strong>Method:</strong> PayPal</p>
                  ) : (
                    <p><strong>Method:</strong> Mobile Payment</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <FaCircleCheck className="mr-2 text-green-400" />
                  Order Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Event: {selectedEvent.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date: {new Date(selectedEvent.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location: {selectedEvent.location}</span>
                  </div>

                  {getTicketSummary().map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.type} ({item.quantity}x @ ${item.price})</span>
                      <span>${item.price * item.quantity}</span>
                    </div>
                  ))}

                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>$2.99</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total Amount</span>
                      <span className="text-green-400">${getTotalPrice() + 2.99}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                  <FaShield className="text-green-400 mr-2" />
                  <span className="text-sm font-medium">Secure Transaction</span>
                </div>
                <p className="text-xs text-gray-300">
                  Your payment is protected by 256-bit SSL encryption and our secure payment partners.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className="mt-1 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <label className="text-sm text-gray-300">
                    I agree to the{' '}
                    <a href="/terms" className="text-blue-400 hover:text-blue-300 underline" target="_blank">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline" target="_blank">
                      Privacy Policy
                    </a>
                  </label>
                </div>
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    name="agreeRefund"
                    checked={formData.agreeRefund}
                    onChange={handleInputChange}
                    className="mt-1 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <label className="text-sm text-gray-300">
                    I understand the{' '}
                    <a href="/refund-policy" className="text-blue-400 hover:text-blue-300 underline" target="_blank">
                      Refund Policy
                    </a>{' '}
                    and cancellation terms
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.acceptTerms || !formData.agreeRefund || !isFormValid() || getTotalTickets() === 0}
                className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <FaLock className="mr-2" />
                    Complete Purchase - ${getTotalPrice() + 2.99}
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TicketPayments;