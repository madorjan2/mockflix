import express from 'express';
import { query, queryOne, run } from '../db/connection.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Get list of movies with pagination and filters
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         example: 20
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         example: Action
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         example: 2020
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [rating, year, title]
 *         example: rating
 *     responses:
 *       200:
 *         description: List of movies with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     movies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movie'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           example: 100
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: ValidationError
 *               message: Invalid parameters
 */
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const genre = req.query.genre;
    const year = req.query.year;
    const sort = req.query.sort || 'rating';

    const offset = (page - 1) * limit;

    // Build query
    let whereConditions = [];
    let params = [];

    if (genre) {
      whereConditions.push(`genres LIKE ?`);
      params.push(`%"${genre}"%`);
    }

    if (year) {
      whereConditions.push('release_year = ?');
      params.push(parseInt(year));
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Sort mapping
    const sortMap = {
      'rating': 'rating DESC',
      'year': 'release_year DESC',
      'title': 'title ASC'
    };
    const orderBy = sortMap[sort] || 'rating DESC';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM movies ${whereClause}`;
    const countResult = queryOne(countQuery, params);
    const total = countResult.total;

    // Get movies
    const moviesQuery = `
      SELECT id, tmdb_id, title, description, poster_url, backdrop_url, 
             release_year, rating, genres, runtime, youtube_video_id
      FROM movies 
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const movies = query(moviesQuery, [...params, limit, offset]);

    // Parse genres JSON
    const moviesWithParsedGenres = movies.map(movie => ({
      ...movie,
      genres: JSON.parse(movie.genres || '[]')
    }));

    res.json({
      success: true,
      data: {
        movies: moviesWithParsedGenres,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to fetch movies'
    });
  }
});

/**
 * @swagger
 * /api/movies/search:
 *   get:
 *     summary: Search movies by title
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: fight club
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     movies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movie'
 *                     count:
 *                       type: integer
 *                       example: 5
 *       400:
 *         description: Missing search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: ValidationError
 *               message: Search query is required
 */
router.get('/search', (req, res) => {
  try {
    const searchQuery = req.query.q;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Search query is required'
      });
    }

    const movies = query(
      `SELECT id, tmdb_id, title, description, poster_url, backdrop_url, 
              release_year, rating, genres, runtime, youtube_video_id
       FROM movies 
       WHERE title LIKE ? OR description LIKE ?
       ORDER BY rating DESC
       LIMIT 50`,
      [`%${searchQuery}%`, `%${searchQuery}%`]
    );

    const moviesWithParsedGenres = movies.map(movie => ({
      ...movie,
      genres: JSON.parse(movie.genres || '[]')
    }));

    res.json({
      success: true,
      data: {
        movies: moviesWithParsedGenres,
        count: moviesWithParsedGenres.length
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to search movies'
    });
  }
});

/**
 * @swagger
 * /api/movies/trending:
 *   get:
 *     summary: Get trending movies
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: List of trending movies
 */
router.get('/trending', (req, res) => {
  try {
    const movies = query(
      `SELECT id, tmdb_id, title, description, poster_url, backdrop_url, 
              release_year, rating, genres, runtime, youtube_video_id
       FROM movies 
       ORDER BY rating DESC, vote_count DESC
       LIMIT 10`
    );

    const moviesWithParsedGenres = movies.map(movie => ({
      ...movie,
      genres: JSON.parse(movie.genres || '[]')
    }));

    res.json({
      success: true,
      data: moviesWithParsedGenres
    });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to fetch trending movies'
    });
  }
});

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Get movie details by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Movie details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Movie'
 *                     - type: object
 *                       properties:
 *                         review_count:
 *                           type: integer
 *                           example: 25
 *                         user_avg_rating:
 *                           type: number
 *                           example: 4.2
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
 */
router.get('/:id', (req, res) => {
  try {
    const movieId = parseInt(req.params.id);

    const movie = queryOne(
      `SELECT id, tmdb_id, title, description, poster_url, backdrop_url, 
              release_year, rating, genres, runtime, youtube_video_id, created_at
       FROM movies 
       WHERE id = ?`,
      [movieId]
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Movie not found'
      });
    }

    // Parse genres
    movie.genres = JSON.parse(movie.genres || '[]');

    // Get review count and average rating
    const reviewStats = queryOne(
      'SELECT COUNT(*) as review_count, AVG(rating) as avg_rating FROM reviews WHERE movie_id = ?',
      [movieId]
    );

    res.json({
      success: true,
      data: {
        ...movie,
        review_count: reviewStats.review_count,
        user_avg_rating: reviewStats.avg_rating
      }
    });
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to fetch movie'
    });
  }
});

/**
 * @swagger
 * /api/movies/{id}/similar:
 *   get:
 *     summary: Get similar movies
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: List of similar movies
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
 *                     $ref: '#/components/schemas/Movie'
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
 */
router.get('/:id/similar', (req, res) => {
  try {
    const movieId = parseInt(req.params.id);

    const movie = queryOne('SELECT genres FROM movies WHERE id = ?', [movieId]);

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Movie not found'
      });
    }

    // Get movies with similar genres (simple implementation)
    const genres = JSON.parse(movie.genres || '[]');
    const genre = genres[0]; // Use first genre

    const similarMovies = query(
      `SELECT id, tmdb_id, title, description, poster_url, backdrop_url, 
              release_year, rating, genres, runtime, youtube_video_id
       FROM movies 
       WHERE id != ? AND genres LIKE ?
       ORDER BY rating DESC
       LIMIT 5`,
      [movieId, `%"${genre}"%`]
    );

    const moviesWithParsedGenres = similarMovies.map(m => ({
      ...m,
      genres: JSON.parse(m.genres || '[]')
    }));

    res.json({
      success: true,
      data: moviesWithParsedGenres
    });
  } catch (error) {
    console.error('Get similar movies error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to fetch similar movies'
    });
  }
});

/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: Add a new movie (admin only)
 *     tags: [Movies]
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
 *                 example: Inception
 *               description:
 *                 type: string
 *                 example: A thief who steals corporate secrets through dream-sharing technology
 *               poster_url:
 *                 type: string
 *                 example: https://image.tmdb.org/t/p/w500/example.jpg
 *               backdrop_url:
 *                 type: string
 *                 example: https://image.tmdb.org/t/p/original/example.jpg
 *               release_year:
 *                 type: integer
 *                 example: 2010
 *               rating:
 *                 type: number
 *                 example: 8.8
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Action", "Sci-Fi", "Thriller"]
 *               runtime:
 *                 type: integer
 *                 example: 148
 *               youtube_video_id:
 *                 type: string
 *                 example: dQw4w9WgXcQ
 *     responses:
 *       201:
 *         description: Movie created successfully
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
 *                   example: Movie created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: ValidationError
 *               message: Title is required
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
router.post('/', authenticateToken, requireAdmin, (req, res) => {
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
 * /api/movies/{id}:
 *   put:
 *     summary: Update a movie (admin only)
 *     tags: [Movies]
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
 *               title:
 *                 type: string
 *                 example: Updated Movie Title
 *               description:
 *                 type: string
 *                 example: Updated movie description
 *               poster_url:
 *                 type: string
 *               backdrop_url:
 *                 type: string
 *               release_year:
 *                 type: integer
 *                 example: 2023
 *               rating:
 *                 type: number
 *                 example: 8.5
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Action", "Drama"]
 *               runtime:
 *                 type: integer
 *                 example: 120
 *               youtube_video_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Movie updated successfully
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
 *                   example: Movie updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Movie'
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
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: NotFound
 *               message: Movie not found
 */
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
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
 * /api/movies/{id}:
 *   delete:
 *     summary: Delete a movie (admin only)
 *     tags: [Movies]
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
 *         description: Movie deleted successfully
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
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: NotFound
 *               message: Movie not found
 */
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
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
