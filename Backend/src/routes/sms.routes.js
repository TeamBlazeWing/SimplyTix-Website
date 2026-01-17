const express = require('express');
const router = express.Router();
const smsController = require('../controllers/sms.controller');
const auth = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: SMS
 *   description: SMS notifications and registration
 */

/**
 * @swagger
 * /api/sms/webhook:
 *   post:
 *     summary: Handle incoming SMS messages
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               version:
 *                 type: string
 *                 example: "1.0"
 *               applicationId:
 *                 type: string
 *                 example: "APP_000029"
 *               sourceAddress:
 *                 type: string
 *                 example: "tel:94702227779"
 *               message:
 *                 type: string
 *                 example: "REG EVT12345 2"
 *               requestId:
 *                 type: string
 *                 example: "APP_000001"
 *               encoding:
 *                 type: string
 *                 example: "0"
 *     responses:
 *       200:
 *         description: SMS processed successfully
 */
router.post('/webhook', smsController.handleIncomingSMS);

/**
 * @swagger
 * /api/sms/event/updates:
 *   post:
 *     summary: Send an update message to all event attendees
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - userId
 *               - updateMessage
 *             properties:
 *               eventId:
 *                 type: string
 *                 example: "EVT12345"
 *                 description: "The event ID to send updates for"
 *               userId:
 *                 type: string
 *                 example: "68643578adb0736bd6e822b5"
 *                 description: "The user ID of the event creator"
 *               updateMessage:
 *                 type: string
 *                 example: "Your event has a new update!"
 *                 description: "The update message to send to attendees"
 *     responses:
 *       200:
 *         description: Update message sent successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
router.post('/event/updates', auth, smsController.sendEventUpdate);


router.post('/confirmation', auth, smsController.sendConfirmationMessage);

module.exports = router;