const { get } = require('mongoose');
const ticketService = require('../services/ticket.service');

exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await ticketService.getMyTickets(req.user.id);
    res.status(200).json({
      success: true,
      tickets: tickets
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllTicketCount = async (req, res, next) => {
  try {
    const count = await ticketService.getallTicketCount();
    res.status(200).json({
      success: true,
      totalTickets: count
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyTicket = async (req, res, next) => {
  try {
    const { ticketCode, eventId } = req.body;
    
    if (!ticketCode) {
      return res.status(400).json({
        success: false,
        message: 'Ticket code is required'
      });
    }

    const result = await ticketService.verifyAndCheckInTicket(ticketCode, eventId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      alreadyCheckedIn: result.alreadyCheckedIn,
      ticket: result.ticket
    });
  } catch (err) {
    next(err);
  }
};