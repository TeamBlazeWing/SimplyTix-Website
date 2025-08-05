const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const auth = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication
 */

/**
 * @swagger
 * /api/tickets/my:
 *   get:
 *     summary: 
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the list of tickets purchased by the user
 *       401:
 *         description: Unauthorized (no/invalid token)
 */
router.get('/my', auth, ticketController.getMyTickets);

router.get('/count', auth, ticketController.getAllTicketCount);

module.exports = router;
