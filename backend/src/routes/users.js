import express from 'express';
import { query, queryOne, run } from '../db/connection.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Forbidden
 *               message: Admin access required
 */
router.get('/', requireAdmin, (req, res) => {
  try {
    const users = query(
      'SELECT id, email, username, subscription_tier, role, is_banned, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to get users'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}/ban:
 *   put:
 *     summary: Ban a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *     responses:
 *       200:
 *         description: User banned successfully
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
 *                   example: User banned successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Cannot ban admin users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: BadRequest
 *               message: Cannot ban admin users
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Forbidden
 *               message: Admin access required
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: NotFound
 *               message: User not found
 */
router.put('/:id/ban', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = queryOne('SELECT id, role FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'User not found'
      });
    }

    // Can't ban admins
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        error: 'BadRequest',
        message: 'Cannot ban admin users'
      });
    }

    run('UPDATE users SET is_banned = 1 WHERE id = ?', [id]);

    const updatedUser = queryOne(
      'SELECT id, email, username, subscription_tier, role, is_banned, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User banned successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to ban user'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}/unban:
 *   put:
 *     summary: Unban a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *     responses:
 *       200:
 *         description: User unbanned successfully
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
 *                   example: User unbanned successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Forbidden
 *               message: Admin access required
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: NotFound
 *               message: User not found
 */
router.put('/:id/unban', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const user = queryOne('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'User not found'
      });
    }

    run('UPDATE users SET is_banned = 0 WHERE id = ?', [id]);

    const updatedUser = queryOne(
      'SELECT id, email, username, subscription_tier, role, is_banned, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User unbanned successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to unban user'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}/promote:
 *   put:
 *     summary: Promote user to admin (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *     responses:
 *       200:
 *         description: User promoted to admin
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
 *                   example: User promoted to admin successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Forbidden
 *               message: Admin access required
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: NotFound
 *               message: User not found
 *       409:
 *         description: User is already admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Conflict
 *               message: User is already an admin
 */
router.put('/:id/promote', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const user = queryOne('SELECT id, role FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'User is already an admin'
      });
    }

    run('UPDATE users SET role = ? WHERE id = ?', ['admin', id]);

    const updatedUser = queryOne(
      'SELECT id, email, username, subscription_tier, role, is_banned, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User promoted to admin successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Promote user error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to promote user'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}/demote:
 *   put:
 *     summary: Demote admin to regular user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 3
 *     responses:
 *       200:
 *         description: Admin demoted to user
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
 *                   example: User demoted to regular user
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Forbidden
 *               message: Admin access required
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: NotFound
 *               message: User not found
 *       409:
 *         description: User is already a regular user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Conflict
 *               message: User is already a regular user
 */
router.put('/:id/demote', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const user = queryOne('SELECT id, role FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'User not found'
      });
    }

    if (user.role === 'user') {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'User is already a regular user'
      });
    }

    run('UPDATE users SET role = ? WHERE id = ?', ['user', id]);

    const updatedUser = queryOne(
      'SELECT id, email, username, subscription_tier, role, is_banned, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User demoted to regular user',
      data: updatedUser
    });
  } catch (error) {
    console.error('Demote user error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to demote user'
    });
  }
});

export default router;
