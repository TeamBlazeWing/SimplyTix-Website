const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { registerSchema, loginSchema } = require('../validators/user.validator');

// Validation schema for login


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - mobileNumber
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               mobileNumber:
 *                   type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
router.post('/register', validate(registerSchema), userController.registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Unauthorized
 */
router.post('/login', validate(loginSchema), userController.loginUser);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user profile
 *       401:
 *         description: Unauthorized (no/invalid token)
 */
router.get('/profile', auth, userController.getProfile);


router.get('/profile/subscription-status', auth, userController.getSubscriptionStatus);

router.post('/profile/subscription-status', auth, userController.updateSubscriptionStatus);

module.exports = router;
