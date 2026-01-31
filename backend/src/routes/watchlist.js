import express from 'express';
import { query, queryOne, run } from '../db/connection.js';

const router = express.Router();

/**
 * @swagger
 * /api/watchlist:
 *   get:
 *     summary: Get user's watchlist
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's watchlist
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
 *                     $ref: '#/components/schemas/WatchlistItem'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Unauthorized
 *               message: Token is required
 */
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;

    const watchlist = query(
      `SELECT w.id, w.added_at,
              m.id as movie_id, m.title, m.poster_url, m.rating, m.release_year
       FROM watchlist w
       JOIN movies m ON w.movie_id = m.id
       WHERE w.user_id = ?
       ORDER BY w.added_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: watchlist
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to fetch watchlist'
    });
  }
});

/**
 * @swagger
 * /api/watchlist/{movieId}:
 *   post:
 *     summary: Add movie to watchlist
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       201:
 *         description: Movie added to watchlist
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
 *                   example: Movie added to watchlist
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     movie_id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: Fight Club
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Unauthorized
 *               message: Token is required
 *       404:
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: NotFound
 *               message: Movie not found
 *       409:
 *         description: Movie already in watchlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Conflict
 *               message: Movie already in watchlist
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

    // Check if already in watchlist
    const existing = queryOne(
      'SELECT id FROM watchlist WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'Movie already in watchlist'
      });
    }

    // Add to watchlist
    const result = run(
      'INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)',
      [userId, movieId]
    );

    res.status(201).json({
      success: true,
      message: 'Movie added to watchlist',
      data: {
        id: result.lastID,
        movie_id: movieId,
        movie_title: movie.title
      }
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to add to watchlist'
    });
  }
});

/**
 * @swagger
 * /api/watchlist/{movieId}:
 *   delete:
 *     summary: Remove movie from watchlist
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       204:
 *         description: Movie removed from watchlist
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Unauthorized
 *               message: Token is required
 *       404:
 *         description: Movie not in watchlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: NotFound
 *               message: Movie not in watchlist
 */
router.delete('/:movieId', (req, res) => {
  try {
    const userId = req.user.id;
    const movieId = parseInt(req.params.movieId);

    const result = run(
      'DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Movie not in watchlist'
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to remove from watchlist'
    });
  }
});

export default router;
