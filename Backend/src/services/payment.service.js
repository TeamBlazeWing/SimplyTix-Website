const User = require('../models/user.model');
const Payment = require('../models/payment.model');
const Ticket = require('../models/ticket.model');
const TicketService = require('./ticket.service');
const eventService = require('./event.service');

const MSPACE_APP_ID = process.env.MSPACE_APP_ID || 'APP_008542';
const MSPACE_PASSWORD = process.env.MSPACE_PASSWORD || 'd927d68199499f5e7114070bf88f9e6e';
const CAAS_DIRECT_DEBIT_URL = 'https://api.mspace.lk/caas/direct/debit';

exports.buyTickets = async (eventId, tickets, method, userId) => {
  try {
    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate ticket availability before processing payment
    const ticketPurchases = tickets.map(ticket => ({
      ticketName: ticket.type, // Use ticket.type as received from frontend
      quantity: ticket.quantity
    }));
    
    await eventService.validateTicketAvailability(eventId, ticketPurchases);

    // Calculate total amount
    let totalAmount = 0;
    tickets.forEach(ticket => {
      totalAmount += ticket.price * ticket.quantity;
    });

    // Create pending payment record
    const pendingPayment = await Payment.create({
      userId: userId,
      paymentType: 'ticket_purchase',
      amount: totalAmount,
      paymentMethod: method,
      status: 'pending',
    });

    // Process actual payment
    const paymentResult = await processPayment(method, totalAmount, pendingPayment._id);
    
    if (!paymentResult.success) {
      // Update payment status to failed
      await Payment.findByIdAndUpdate(pendingPayment._id, { status: 'failed' });
      throw new Error('Payment processing failed: ' + paymentResult.error);
    }

    // Update payment status to confirmed
    const confirmedPayment = await Payment.findByIdAndUpdate(
      pendingPayment._id, 
      { 
        status: 'confirmed',
        transactionId: paymentResult.transactionId 
      },
      { new: true }
    );

    // Update ticket quantities in event
    await eventService.updateTicketQuantities(eventId, ticketPurchases);

    // Generate tickets
    const ticketsData = await TicketService.generateTickets(
      confirmedPayment._id, 
      userId, 
      eventId, 
      tickets
    );

    return ticketsData;
  } catch (error) {
    throw new Error(`Ticket purchase failed: ${error.message}`);
  }
};

exports.buyPoints = async (pointsAmount, method, userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Points pricing: 1 point = 10 currency units
    const totalAmount = pointsAmount * 10;

    // Create pending payment
    const pendingPayment = await Payment.create({
      userId: userId,
      paymentType: 'topup',
      amount: totalAmount,
      paymentMethod: method,
      status: 'pending',
    });

    // Process payment
    const paymentResult = await processPayment(method, totalAmount, pendingPayment._id);
    
    if (!paymentResult.success) {
      await Payment.findByIdAndUpdate(pendingPayment._id, { status: 'failed' });
      throw new Error('Payment processing failed: ' + paymentResult.error);
    }

    // Update payment and user points
    const confirmedPayment = await Payment.findByIdAndUpdate(
      pendingPayment._id,
      { 
        status: 'confirmed',
        transactionId: paymentResult.transactionId 
      },
      { new: true }
    );

    // Add points to user
    await User.findByIdAndUpdate(userId, { 
      $inc: { points: pointsAmount } 
    });

    return {
      payment: confirmedPayment,
      pointsAdded: pointsAmount
    };

  } catch (error) {
    throw new Error(`Points purchase failed: ${error.message}`);
  }
};

exports.getPaymentHistory = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const payments = await Payment.find({ userId: userId })
    .sort({ createdAt: -1 });

  return payments;
};

exports.verifyPayment = async (paymentId, userId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new Error('Payment not found');
  }
  if (payment.userId.toString() !== userId) {
    throw new Error('Unauthorized access to payment');
  }
  if (payment.status !== 'confirmed') {
    throw new Error('Payment is not confirmed');
  }
  return payment;
}

// Actual payment processing function
const processPayment = async (method, amount, paymentId) => {
  try {
    switch (method) {
      case 'card':
      case 'credit': // Handle both 'card' and 'credit' from frontend
        return await processCardPayment(amount, paymentId);
      case 'mobile':
        return await processMobilePayment(amount, paymentId);
      case 'paypal':
        return await processPayPalPayment(amount, paymentId);
      default:
        throw new Error('Invalid payment method');
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Payment gateway integrations
const processCardPayment = async (amount, paymentId) => {
  // Integrate with Stripe, Square, etc.
  // For now, simulate success
  return { 
    success: true, 
    transactionId: `card_${paymentId}_${Date.now()}` 
  };
};

const processMobilePayment = async (amount, paymentId) => {
  // Integrate with mSpace, mobile money, etc.
  return { 
    success: true, 
    transactionId: `mobile_${paymentId}_${Date.now()}` 
  };
};

const processPayPalPayment = async (amount, paymentId) => {
  // Integrate with PayPal API
  return { 
    success: true, 
    transactionId: `paypal_${paymentId}_${Date.now()}` 
  };
};
