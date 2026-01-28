import express from 'express';
import { query, queryOne } from '../db/connection.js';

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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [rating, year, title]
 *     responses:
 *       200:
 *         description: List of movies
 *       400:
 *         description: Invalid parameters
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
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Missing search query
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
 *     responses:
 *       200:
 *         description: Movie details
 *       404:
 *         description: Movie not found
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
 *     responses:
 *       200:
 *         description: List of similar movies
 *       404:
 *         description: Movie not found
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

export default router;
