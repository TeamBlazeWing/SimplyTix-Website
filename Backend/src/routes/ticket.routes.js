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

/**
 * @swagger
 * /api/tickets/verify:
 *   post:
 *     summary: Verify and check-in a ticket using ticket code
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ticketCode:
 *                 type: string
 *                 description: The ticket code to verify
 *               eventId:
 *                 type: string
 *                 description: The event ID to verify against
 *     responses:
 *       200:
 *         description: Ticket verified successfully
 *       400:
 *         description: Ticket already checked in or invalid ticket
 *       404:
 *         description: Ticket not found
 *       401:
 *         description: Unauthorized
 */
router.post('/verify', auth, ticketController.verifyTicket);

module.exports = router;
