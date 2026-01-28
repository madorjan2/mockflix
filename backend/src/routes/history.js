import express from 'express';
import { query, queryOne, run } from '../db/connection.js';

const router = express.Router();

/**
 * @swagger
 * /api/history:
 *   get:
 *     summary: Get user's watch history
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's watch history
 *       401:
 *         description: Not authenticated
 */
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;

    const history = query(
      `SELECT h.id, h.watched_at, h.progress_seconds, h.completed,
              m.id as movie_id, m.title, m.poster_url, m.runtime
       FROM watch_history h
       JOIN movies m ON h.movie_id = m.id
       WHERE h.user_id = ?
       ORDER BY h.watched_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to fetch watch history'
    });
  }
});

/**
 * @swagger
 * /api/history/{movieId}:
 *   post:
 *     summary: Add movie to watch history
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Movie added to history
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Movie not found
 */
router.post('/:movieId', (req, res) => {
  try {
    const userId = req.user.id;
    const movieId = parseInt(req.params.movieId);

    // Check if movie exists
    const movie = queryOne('SELECT id, title FROM movies WHERE id = ?', [movieId]);
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Movie not found'
      });
    }

    // Add to history
    const result = run(
      'INSERT INTO watch_history (user_id, movie_id) VALUES (?, ?)',
      [userId, movieId]
    );

    res.status(201).json({
      success: true,
      message: 'Movie added to watch history',
      data: {
        id: result.lastID,
        movie_id: movieId,
        movie_title: movie.title
      }
    });
  } catch (error) {
    console.error('Add to history error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to add to watch history'
    });
  }
});

/**
 * @swagger
 * /api/history/{movieId}/progress:
 *   put:
 *     summary: Update watch progress for a movie
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - progress_seconds
 *             properties:
 *               progress_seconds:
 *                 type: integer
 *                 minimum: 0
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Progress updated
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Movie not in history
 */
router.put('/:movieId/progress', (req, res) => {
  try {
    const userId = req.user.id;
    const movieId = parseInt(req.params.movieId);
    const { progress_seconds, completed } = req.body;

    // Find the most recent history entry
    const historyEntry = queryOne(
      'SELECT id FROM watch_history WHERE user_id = ? AND movie_id = ? ORDER BY watched_at DESC LIMIT 1',
      [userId, movieId]
    );

    if (!historyEntry) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Movie not in watch history'
      });
    }

    // Update progress
    const updates = [];
    const params = [];

    if (progress_seconds !== undefined) {
      updates.push('progress_seconds = ?');
      params.push(progress_seconds);
    }
    if (completed !== undefined) {
      updates.push('completed = ?');
      params.push(completed ? 1 : 0);
    }

    params.push(historyEntry.id);

    run(`UPDATE watch_history SET ${updates.join(', ')} WHERE id = ?`, params);

    const updated = queryOne(
      `SELECT h.id, h.watched_at, h.progress_seconds, h.completed,
              m.id as movie_id, m.title, m.runtime
       FROM watch_history h
       JOIN movies m ON h.movie_id = m.id
       WHERE h.id = ?`,
      [historyEntry.id]
    );

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to update progress'
    });
  }
});

export default router;
