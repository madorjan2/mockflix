import express from 'express';
import { query, queryOne, run } from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/movies/{id}/reviews:
 *   get:
 *     summary: Get reviews for a movie
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: List of reviews
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
 *                     $ref: '#/components/schemas/ReviewDTO'
 *       404:
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: NotFound
 *               message: Movie not found
 */
router.get('/:id/reviews', (req, res) => {
  try {
    const movieId = parseInt(req.params.id);

    // Check if movie exists
    const movie = queryOne('SELECT id FROM movies WHERE id = ?', [movieId]);
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Movie not found'
      });
    }

    const reviews = query(
      `SELECT r.id, r.rating, r.review_text, r.created_at, r.updated_at,
              u.id as user_id, u.username
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.movie_id = ?
       ORDER BY r.created_at DESC`,
      [movieId]
    );

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to fetch reviews'
    });
  }
});

/**
 * @swagger
 * /api/movies/{id}/reviews:
 *   post:
 *     summary: Create a review for a movie
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 8
 *               review_text:
 *                 type: string
 *                 example: Amazing movie! Must watch.
 *     responses:
 *       201:
 *         description: Review created
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
 *                   example: Review created successfully
 *                 data:
 *                   $ref: '#/components/schemas/ReviewDTO'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: ValidationError
 *               message: Rating must be between 1 and 10
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: Unauthorized
 *               message: Token is required
 *       404:
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: NotFound
 *               message: Movie not found
 *       409:
 *         description: User already reviewed this movie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: Conflict
 *               message: You have already reviewed this movie
 */
router.post('/:id/reviews', authenticateToken, (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const userId = req.user.id;
    const { rating, review_text } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 10) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Rating must be between 1 and 10'
      });
    }

    // Check if movie exists
    const movie = queryOne('SELECT id FROM movies WHERE id = ?', [movieId]);
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Movie not found'
      });
    }

    // Check if user already reviewed
    const existingReview = queryOne(
      'SELECT id FROM reviews WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );

    if (existingReview) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'You have already reviewed this movie'
      });
    }

    // Create review
    const result = run(
      'INSERT INTO reviews (user_id, movie_id, rating, review_text) VALUES (?, ?, ?, ?)',
      [userId, movieId, rating, review_text || null]
    );

    const review = queryOne(
      `SELECT r.id, r.rating, r.review_text, r.created_at, r.updated_at,
              u.id as user_id, u.username
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [result.lastID]
    );

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to create review'
    });
  }
});

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 9
 *               review_text:
 *                 type: string
 *                 example: Updated review text - even better on rewatch!
 *     responses:
 *       200:
 *         description: Review updated
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
 *                   example: Review updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/ReviewDTO'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: ValidationError
 *               message: Rating must be between 1 and 10
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: Unauthorized
 *               message: Token is required
 *       403:
 *         description: Not authorized to update this review
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: Forbidden
 *               message: You can only update your own reviews
 *       404:
 *         description: Review not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: NotFound
 *               message: Review not found
 */
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const userId = req.user.id;
    const { rating, review_text } = req.body;

    // Check if review exists
    const review = queryOne('SELECT user_id FROM reviews WHERE id = ?', [reviewId]);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only update your own reviews'
      });
    }

    // Validation
    if (rating && (rating < 1 || rating > 10)) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Rating must be between 1 and 10'
      });
    }

    // Update review
    const updates = [];
    const params = [];

    if (rating !== undefined) {
      updates.push('rating = ?');
      params.push(rating);
    }
    if (review_text !== undefined) {
      updates.push('review_text = ?');
      params.push(review_text);
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');

    params.push(reviewId);

    run(`UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`, params);

    const updatedReview = queryOne(
      `SELECT r.id, r.rating, r.review_text, r.created_at, r.updated_at,
              u.id as user_id, u.username
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [reviewId]
    );

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to update review'
    });
  }
});

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       204:
 *         description: Review deleted
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: Unauthorized
 *               message: Token is required
 *       403:
 *         description: Not authorized to delete this review
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: Forbidden
 *               message: You can only delete your own reviews
 *       404:
 *         description: Review not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseDTO'
 *             example:
 *               success: false
 *               error: NotFound
 *               message: Review not found
 */
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const userId = req.user.id;

    // Check if review exists
    const review = queryOne('SELECT user_id FROM reviews WHERE id = ?', [reviewId]);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only delete your own reviews'
      });
    }

    run('DELETE FROM reviews WHERE id = ?', [reviewId]);

    res.status(204).send();
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to delete review'
    });
  }
});

export default router;
