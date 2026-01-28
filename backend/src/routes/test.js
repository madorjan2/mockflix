import express from 'express';
import { triggerRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

/**
 * @swagger
 * /api/test/slow:
 *   get:
 *     summary: Simulate slow response
 *     tags: [Testing]
 *     parameters:
 *       - in: query
 *         name: delay
 *         schema:
 *           type: integer
 *           default: 3000
 *         description: Delay in milliseconds
 *     responses:
 *       200:
 *         description: Delayed response
 */
router.get('/slow', (req, res) => {
  const delay = parseInt(req.query.delay) || 3000;
  
  setTimeout(() => {
    res.json({
      success: true,
      message: `Response delayed by ${delay}ms`,
      data: { delay }
    });
  }, delay);
});

/**
 * @swagger
 * /api/test/timeout:
 *   get:
 *     summary: Simulate timeout (30 second delay)
 *     tags: [Testing]
 *     responses:
 *       503:
 *         description: Service unavailable
 */
router.get('/timeout', (req, res) => {
  setTimeout(() => {
    res.status(503).json({
      success: false,
      error: 'ServiceUnavailable',
      message: 'Request timed out'
    });
  }, 30000);
});

/**
 * @swagger
 * /api/test/error/{code}:
 *   get:
 *     summary: Return specific HTTP status code
 *     tags: [Testing]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: integer
 *         description: HTTP status code to return
 *     responses:
 *       default:
 *         description: Custom status code response
 */
router.get('/error/:code', (req, res) => {
  const code = parseInt(req.params.code);
  
  const errorMessages = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    503: 'Service Unavailable'
  };

  const message = errorMessages[code] || `HTTP ${code}`;
  
  res.status(code).json({
    success: false,
    error: message.replace(/\s+/g, ''),
    message: `Test error: ${message}`
  });
});

/**
 * @swagger
 * /api/test/rate-limit:
 *   get:
 *     summary: Trigger rate limiting response
 *     tags: [Testing]
 *     responses:
 *       429:
 *         description: Too many requests
 */
router.get('/rate-limit', triggerRateLimit);

export default router;
