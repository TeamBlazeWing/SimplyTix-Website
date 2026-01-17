const Ticket = require('../models/ticket.model');
const User = require('../models/user.model');

exports.generateTickets = async (paymentId, userId, eventId, tickets) => {
  
  // Create tickets
  const ticketPromises = tickets.flatMap(ticket => {
  return Array.from({ length: ticket.quantity }, () => {
    const newTicket = new Ticket({
      paymentId: paymentId,
      eventId: eventId,
      userId: userId,
      ticketType: ticket.type, // Use ticket.type as sent from frontend
      purchaseDate: new Date()
    });
    return newTicket.save();
  });
});

return Promise.all(ticketPromises);
};

exports.getMyTickets = async (userId) => {

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const tickets = await Ticket.find({ userId: userId }).populate('eventId', 'title date location imageUrl description type');
  return tickets;
};  

exports.getallTicketCount = async () => {
  const ticketCount = await Ticket.countDocuments();
  return ticketCount;
};

exports.verifyAndCheckInTicket = async (ticketCode, eventId) => {
  try {
    // Find the ticket by ticket code
    const ticket = await Ticket.findOne({ ticketCode: ticketCode })
      .populate('userId', 'name email')
      .populate('eventId', 'title date location');

    if (!ticket) {
      return {
        success: false,
        message: 'Invalid ticket code. Ticket not found.'
      };
    }

    // Check if ticket belongs to the specified event (if eventId is provided)
    if (eventId && ticket.eventId._id.toString() !== eventId) {
      return {
        success: false,
        message: 'Ticket is not valid for this event.'
      };
    }

    // Check if ticket is already checked in
    if (ticket.checkedIn) {
      return {
        success: false,
        message: 'This ticket has already been used for check-in.',
        alreadyCheckedIn: true,
        ticket: {
          ticketId: ticket._id,
          ticketCode: ticket.ticketCode,
          eventId: ticket.eventId._id,
          attendeeName: ticket.userId.name,
          customerName: ticket.userId.name,
          ticketType: ticket.ticketType,
          checkedIn: ticket.checkedIn,
          purchaseDate: ticket.purchaseDate
        }
      };
    }

    // Update ticket to checked in
    ticket.checkedIn = true;
    ticket.checkInTime = new Date();
    await ticket.save();

    return {
      success: true,
      message: 'Ticket verified successfully. Check-in completed.',
      alreadyCheckedIn: false,
      ticket: {
        ticketId: ticket._id,
        ticketCode: ticket.ticketCode,
        eventId: ticket.eventId._id,
        attendeeName: ticket.userId.name,
        customerName: ticket.userId.name,
        ticketType: ticket.ticketType,
        checkedIn: ticket.checkedIn,
        purchaseDate: ticket.purchaseDate,
        checkInTime: ticket.checkInTime
      }
    };
  } catch (error) {
    console.error('Error verifying ticket:', error);
    return {
      success: false,
      message: 'Error verifying ticket. Please try again.'
    };
  }
};