import express from 'express';
import { query, queryOne, run } from '../db/connection.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Admin access required
 */
router.get('/users', (req, res) => {
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
 * /api/admin/users/{id}/ban:
 *   put:
 *     summary: Ban a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User banned successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.put('/users/:id/ban', (req, res) => {
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
 * /api/admin/users/{id}/unban:
 *   put:
 *     summary: Unban a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User unbanned successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.put('/users/:id/unban', (req, res) => {
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
 * /api/admin/users/{id}/promote:
 *   put:
 *     summary: Promote user to admin (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User promoted to admin
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 *       409:
 *         description: User is already admin
 */
router.put('/users/:id/promote', (req, res) => {
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
 * /api/admin/users/{id}/demote:
 *   put:
 *     summary: Demote admin to regular user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Admin demoted to user
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 *       409:
 *         description: User is already a regular user
 */
router.put('/users/:id/demote', (req, res) => {
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

/**
 * @swagger
 * /api/admin/movies:
 *   post:
 *     summary: Add a new movie (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               poster_url:
 *                 type: string
 *               backdrop_url:
 *                 type: string
 *               release_year:
 *                 type: integer
 *               rating:
 *                 type: number
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *               runtime:
 *                 type: integer
 *               youtube_video_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movie created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */
router.post('/movies', (req, res) => {
  try {
    const {
      title,
      description,
      poster_url,
      backdrop_url,
      release_year,
      rating,
      genres,
      runtime,
      youtube_video_id
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Title is required'
      });
    }

    const genresJson = JSON.stringify(genres || []);

    const result = run(
      `INSERT INTO movies (title, description, poster_url, backdrop_url, release_year, rating, genres, runtime, youtube_video_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, poster_url, backdrop_url, release_year, rating || 0, genresJson, runtime, youtube_video_id]
    );

    const movie = queryOne('SELECT * FROM movies WHERE id = ?', [result.lastID]);
    movie.genres = JSON.parse(movie.genres || '[]');

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: movie
    });
  } catch (error) {
    console.error('Create movie error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to create movie'
    });
  }
});

/**
 * @swagger
 * /api/admin/movies/{id}:
 *   put:
 *     summary: Update a movie (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               poster_url:
 *                 type: string
 *               backdrop_url:
 *                 type: string
 *               release_year:
 *                 type: integer
 *               rating:
 *                 type: number
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *               runtime:
 *                 type: integer
 *               youtube_video_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Movie not found
 */
router.put('/movies/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      poster_url,
      backdrop_url,
      release_year,
      rating,
      genres,
      runtime,
      youtube_video_id
    } = req.body;

    const movie = queryOne('SELECT id FROM movies WHERE id = ?', [id]);
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Movie not found'
      });
    }

    const genresJson = genres ? JSON.stringify(genres) : undefined;

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (poster_url !== undefined) {
      updates.push('poster_url = ?');
      values.push(poster_url);
    }
    if (backdrop_url !== undefined) {
      updates.push('backdrop_url = ?');
      values.push(backdrop_url);
    }
    if (release_year !== undefined) {
      updates.push('release_year = ?');
      values.push(release_year);
    }
    if (rating !== undefined) {
      updates.push('rating = ?');
      values.push(rating);
    }
    if (genresJson !== undefined) {
      updates.push('genres = ?');
      values.push(genresJson);
    }
    if (runtime !== undefined) {
      updates.push('runtime = ?');
      values.push(runtime);
    }
    if (youtube_video_id !== undefined) {
      updates.push('youtube_video_id = ?');
      values.push(youtube_video_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'No fields to update'
      });
    }

    values.push(id);
    run(`UPDATE movies SET ${updates.join(', ')} WHERE id = ?`, values);

    const updatedMovie = queryOne('SELECT * FROM movies WHERE id = ?', [id]);
    updatedMovie.genres = JSON.parse(updatedMovie.genres || '[]');

    res.json({
      success: true,
      message: 'Movie updated successfully',
      data: updatedMovie
    });
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to update movie'
    });
  }
});

/**
 * @swagger
 * /api/admin/movies/{id}:
 *   delete:
 *     summary: Delete a movie (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Movie deleted successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Movie not found
 */
router.delete('/movies/:id', (req, res) => {
  try {
    const { id } = req.params;

    const movie = queryOne('SELECT id FROM movies WHERE id = ?', [id]);
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Movie not found'
      });
    }

    run('DELETE FROM movies WHERE id = ?', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to delete movie'
    });
  }
});

export default router;
