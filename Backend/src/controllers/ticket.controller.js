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