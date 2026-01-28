import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { initDatabase } from './db/connection.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { rateLimit, authRateLimit } from './middleware/rateLimit.js';
import { authenticateToken } from './middleware/auth.js';

import authRoutes from './routes/auth.js';
import moviesRoutes from './routes/movies.js';
import reviewsRoutes from './routes/reviews.js';
import watchlistRoutes from './routes/watchlist.js';
import historyRoutes from './routes/history.js';
import testRoutes from './routes/test.js';

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
      }
    },
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Movies', description: 'Movie catalog endpoints' },
      { name: 'Reviews', description: 'Movie reviews and ratings' },
      { name: 'Watchlist', description: 'User watchlist management' },
      { name: 'History', description: 'Watch history and progress tracking' },
      { name: 'Testing', description: 'Network simulation and testing endpoints' }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

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
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/movies', authenticateToken, reviewsRoutes);
app.use('/api/reviews', authenticateToken, reviewsRoutes);
app.use('/api/watchlist', authenticateToken, watchlistRoutes);
app.use('/api/history', authenticateToken, historyRoutes);
app.use('/api/test', testRoutes);

// Protected route for /api/auth/me
app.get('/api/auth/me', authenticateToken, authRoutes);

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
      console.log('   test@example.com / password123 (Free)');
      console.log('   admin@example.com / admin123 (Premium)');
      console.log('   premium@example.com / premium123 (Premium)');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
