import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { initDatabase } from './db/connection.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { rateLimit, authRateLimit } from './middleware/rateLimit.js';
import { authenticateToken, requireAdmin } from './middleware/auth.js';

import authRoutes from './routes/auth.js';
import moviesRoutes from './routes/movies.js';
import reviewsRoutes from './routes/reviews.js';
import watchlistRoutes from './routes/watchlist.js';
import historyRoutes from './routes/history.js';
import testRoutes from './routes/test.js';
import usersRoutes from './routes/users.js';
import seedRoutes from './routes/seed.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MockFlix API',
      version: '1.0.0',
      description: 'A streaming platform API for automation testing scenarios',
      contact: {
        name: 'MockFlix Team'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        UserDTO: {
          title: 'UserDTO',
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            username: { type: 'string', example: 'johndoe' },
            subscription_tier: { type: 'string', enum: ['free', 'premium'], example: 'free' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            is_banned: { type: 'boolean', example: false },
            created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
          }
        },
        MovieDTO: {
          title: 'MovieDTO',
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            tmdb_id: { type: 'integer', example: 550 },
            title: { type: 'string', example: 'Fight Club' },
            description: { type: 'string', example: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club.' },
            poster_url: { type: 'string', example: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
            release_year: { type: 'integer', example: 1999 },
            rating: { type: 'number', format: 'float', example: 8.4 },
            genres: { type: 'array', items: { type: 'string' }, example: ['Drama', 'Thriller'] },
            youtube_video_id: { type: 'string', example: 'dQw4w9WgXcQ' }
          }
        },
        ReviewDTO: {
          title: 'ReviewDTO',
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            movie_id: { type: 'integer', example: 1 },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
            review_text: { type: 'string', example: 'Great movie! Highly recommend.' },
            created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
            updated_at: { type: 'string', format: 'date-time', example: '2024-01-15T11:00:00Z' },
            username: { type: 'string', example: 'johndoe' }
          }
        },
        WatchlistItemDTO: {
          title: 'WatchlistItemDTO',
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            movie_id: { type: 'integer', example: 1 },
            added_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
            title: { type: 'string', example: 'Fight Club' },
            poster_url: { type: 'string', example: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
            rating: { type: 'number', format: 'float', example: 8.4 }
          }
        },
        HistoryItemDTO: {
          title: 'HistoryItemDTO',
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            movie_id: { type: 'integer', example: 1 },
            watched_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
            progress_seconds: { type: 'integer', example: 3600 },
            completed: { type: 'boolean', example: false },
            title: { type: 'string', example: 'Fight Club' },
            poster_url: { type: 'string', example: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' }
          }
        },
        AuthResponseDTO: {
          title: 'AuthResponseDTO',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User registered successfully' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/UserDTO' },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
              }
            }
          }
        },
        UserResponseDTO: {
          title: 'UserResponseDTO',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: '#/components/schemas/UserDTO' }
          }
        },
        MovieResponseDTO: {
          title: 'MovieResponseDTO',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Movie created successfully' },
            data: { $ref: '#/components/schemas/MovieDTO' }
          }
        },
        MoviesListResponseDTO: {
          title: 'MoviesListResponseDTO',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                movies: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/MovieDTO' }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 20 },
                    total: { type: 'integer', example: 100 },
                    totalPages: { type: 'integer', example: 5 }
                  }
                }
              }
            }
          }
        },
        ReviewsListResponseDTO: {
          title: 'ReviewsListResponseDTO',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ReviewDTO' }
            }
          }
        },
        SuccessResponseDTO: {
          title: 'SuccessResponseDTO',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' }
          }
        },
        ErrorResponseDTO: {
          title: 'ErrorResponseDTO',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'ValidationError' },
            message: { type: 'string', example: 'Email, password, and username are required' },
            details: { type: 'object' }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Movies', description: 'Movie catalog endpoints' },
      { name: 'Reviews', description: 'Movie reviews and ratings' },
      { name: 'Watchlist', description: 'User watchlist management' },
      { name: 'History', description: 'Watch history and progress tracking' },
      { name: 'Users', description: 'User management (admin only)' },
      { name: 'Testing', description: 'Network simulation and testing endpoints' },
      { name: 'Seed/Reset', description: 'Database reset operations (admin only)' }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting disabled for test automation app
// app.use('/api/', rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 1000
// }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MockFlix API Documentation'
}));

// Serve swagger.json
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MockFlix API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/movies', reviewsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/watchlist', authenticateToken, watchlistRoutes);
app.use('/api/history', authenticateToken, historyRoutes);
app.use('/api/users', authenticateToken, usersRoutes);
app.use('/api/test', testRoutes);
app.use('/api/seed', seedRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log('');
      console.log('🎬 MockFlix API Server');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('📋 Test Accounts:');
      console.log('   test@example.com / password123 (Free User)');
      console.log('   admin@example.com / admin123 (Admin, Premium)');
      console.log('   premium@example.com / premium123 (Premium User)');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
