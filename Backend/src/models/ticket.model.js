const mongoose = require('mongoose');

// Ticket should only generate after a successful payment
const generateTicketId = () => {
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `TKT${random}`;
}

const ticketSchema = new mongoose.Schema({
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticketType: { type: String, required: true }, // e.g., "General", "VIP"
  ticketCode: {
    type: String,
    unique: true,
    default: generateTicketId
  },
  purchaseDate: { type: Date, default: Date.now },
  checkedIn: { type: Boolean, default: false },
  checkInTime: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);