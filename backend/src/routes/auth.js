import express from 'express';
import bcrypt from 'bcryptjs';
import { query, queryOne, run } from '../db/connection.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newuser@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 example: johndoe
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserDTO'
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: ValidationError
 *               message: Email, password, and username are required
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: Conflict
 *               message: Email already registered
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Email, password, and username are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user exists
    const existingUser = queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'Email already registered'
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const result = run(
      'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)',
      [email, username, password_hash]
    );

    const user = queryOne('SELECT id, email, username, subscription_tier, role, created_at FROM users WHERE id = ?', [result.lastID]);

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to register user'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
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
 *                 format: email
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserDTO'
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: Unauthorized
 *               message: Invalid email or password
 *       403:
 *         description: User is banned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: Forbidden
 *               message: Your account has been banned
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: ValidationError
 *               message: Email and password are required
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(422).json({
        success: false,
        error: 'ValidationError',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = queryOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid email or password'
      });
    }
    // Check if banned
    if (user.is_banned) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Your account has been banned'
      });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid email or password'
      });
    }

    // Remove password from response
    delete user.password_hash;

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to login'
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticateToken, (req, res) => {
  const user = queryOne(
    'SELECT id, email, username, subscription_tier, role, is_banned, created_at FROM users WHERE id = ?',
    [req.user.id]
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'NotFound',
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout successful
 */
router.post('/logout', (req, res) => {
  // For JWT, logout is handled client-side by removing the token
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * @swagger
 * /api/auth/upgrade:
 *   post:
 *     summary: Upgrade user to premium (mock)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User upgraded to premium
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User upgraded to premium
 *                 data:
 *                   $ref: '#/components/schemas/UserDTO'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: Unauthorized
 *               message: Not authenticated
 *       409:
 *         description: Already premium
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: Conflict
 *               message: User is already premium
 */
router.post('/upgrade', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Not authenticated'
    });
  }

  // Get current user
  const user = queryOne(
    'SELECT id, email, username, subscription_tier, role FROM users WHERE id = ?',
    [req.user.id]
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'NotFound',
      message: 'User not found'
    });
  }

  // Check if already premium
  if (user.subscription_tier === 'premium') {
    return res.status(409).json({
      success: false,
      error: 'Conflict',
      message: 'User is already premium'
    });
  }

  // Upgrade to premium (mock - instant upgrade)
  run(
    'UPDATE users SET subscription_tier = ? WHERE id = ?',
    ['premium', req.user.id]
  );

  // Get updated user
  const updatedUser = queryOne(
    'SELECT id, email, username, subscription_tier, role, created_at FROM users WHERE id = ?',
    [req.user.id]
  );

  res.json({
    success: true,
    message: 'Successfully upgraded to premium! 🎉',
    data: updatedUser
  });
});

/**
 * @swagger
 * /api/auth/downgrade:
 *   post:
 *     summary: Downgrade user to free (mock)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User downgraded to free
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Downgraded to free tier
 *                 data:
 *                   $ref: '#/components/schemas/UserDTO'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: Unauthorized
 *               message: Not authenticated
 *       409:
 *         description: Already free
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: Conflict
 *               message: User is already on free tier
 */
router.post('/downgrade', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Not authenticated'
    });
  }

  // Get current user
  const user = queryOne(
    'SELECT id, subscription_tier, role FROM users WHERE id = ?',
    [req.user.id]
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'NotFound',
      message: 'User not found'
    });
  }

  // Check if already free
  if (user.subscription_tier === 'free') {
    return res.status(409).json({
      success: false,
      error: 'Conflict',
      message: 'User is already on free tier'
    });
  }

  // Downgrade to free
  run(
    'UPDATE users SET subscription_tier = ? WHERE id = ?',
    ['free', req.user.id]
  );

  // Get updated user
  const updatedUser = queryOne(
    'SELECT id, email, username, subscription_tier, role, created_at FROM users WHERE id = ?',
    [req.user.id]
  );

  res.json({
    success: true,
    message: 'Downgraded to free tier',
    data: updatedUser
  });
});

export default router;
