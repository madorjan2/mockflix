/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let error = err.name || 'ServerError';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    error = 'ValidationError';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    error = 'Unauthorized';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    error = 'Unauthorized';
    message = 'Invalid token';
  }

  res.status(statusCode).json({
    success: false,
    error,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * 404 handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `Route ${req.method} ${req.url} not found`
  });
}
