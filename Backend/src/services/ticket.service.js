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