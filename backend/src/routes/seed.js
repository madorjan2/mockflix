import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { getDatabase, run, saveDatabase } from '../db/connection.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execPromise = promisify(exec);
const router = express.Router();

/**
 * @swagger
 * /api/seed/reset:
 *   post:
 *     summary: Reset entire database to default state (admin only)
 *     tags: [Testing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database reset successfully
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Reset failed
 */
router.post('/reset', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔄 Admin triggered full database reset...');
    
    // Run the seed script
    const seedScriptPath = path.join(__dirname, '..', 'db', 'seed.js');
    await execPromise(`node "${seedScriptPath}"`, {
      cwd: path.join(__dirname, '..', '..')
    });

    console.log('✅ Full database reset complete');
    
    res.json({
      success: true,
      message: 'Database reset to default state successfully',
      data: {
        users: 5,
        movies: 20,
        reviews: 10,
        watchlist: 9,
        history: 6
      }
    });
  } catch (error) {
    console.error('Database reset error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to reset database',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/seed/reset-users:
 *   post:
 *     summary: Reset users table to default state (admin only)
 *     tags: [Testing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users reset successfully
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Reset failed
 */
router.post('/reset-users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔄 Admin triggered users reset...');
    
    const db = getDatabase();
    
    // Clear users table and related data
    db.exec(`
      DELETE FROM watch_history;
      DELETE FROM watchlist;
      DELETE FROM reviews;
      DELETE FROM users;
    `);
    
    // Reseed users
    const users = [
      { email: 'test@example.com', username: 'TestUser', password: 'password123', subscription_tier: 'free', role: 'user' },
      { email: 'admin@example.com', username: 'Admin', password: 'admin123', subscription_tier: 'premium', role: 'admin' },
      { email: 'premium@example.com', username: 'PremiumUser', password: 'premium123', subscription_tier: 'premium', role: 'user' },
      { email: 'john.doe@example.com', username: 'JohnDoe', password: 'john123', subscription_tier: 'free', role: 'user' },
      { email: 'jane.smith@example.com', username: 'JaneSmith', password: 'jane123', subscription_tier: 'premium', role: 'user' }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      run(
        'INSERT INTO users (email, username, password_hash, subscription_tier, role) VALUES (?, ?, ?, ?, ?)',
        [user.email, user.username, hashedPassword, user.subscription_tier, user.role]
      );
    }

    saveDatabase();
    console.log('✅ Users reset complete');
    
    res.json({
      success: true,
      message: 'Users reset to default state successfully',
      data: { users: 5 }
    });
  } catch (error) {
    console.error('Users reset error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to reset users',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/seed/reset-movies:
 *   post:
 *     summary: Reset movies table to default state (admin only)
 *     tags: [Testing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Movies reset successfully
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Reset failed
 */
router.post('/reset-movies', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔄 Admin triggered movies reset...');
    
    const db = getDatabase();
    
    // Clear movies table and related data
    db.exec(`
      DELETE FROM watch_history;
      DELETE FROM watchlist;
      DELETE FROM reviews;
      DELETE FROM movies;
    `);
    
    // Load movies from data file
    const moviesDataPath = path.join(__dirname, '..', '..', 'data', 'movies.json');
    const moviesData = JSON.parse(fs.readFileSync(moviesDataPath, 'utf8'));
    
    for (const movie of moviesData) {
      const genresJson = JSON.stringify(movie.genres);
      run(
        `INSERT INTO movies (tmdb_id, title, description, poster_url, backdrop_url, release_year, rating, vote_count, genres, runtime, youtube_video_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          movie.tmdb_id,
          movie.title,
          movie.description,
          movie.poster_url,
          movie.backdrop_url,
          movie.release_year,
          movie.rating,
          movie.vote_count || 0,
          genresJson,
          movie.runtime,
          movie.youtube_video_id
        ]
      );
    }

    saveDatabase();
    console.log('✅ Movies reset complete');
    
    res.json({
      success: true,
      message: 'Movies reset to default state successfully',
      data: { movies: moviesData.length }
    });
  } catch (error) {
    console.error('Movies reset error:', error);
    res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to reset movies',
      details: error.message
    });
  }
});

export default router;
