import express from 'express';

// Centralized JSON error handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errorHandler(err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Internal server error';
  const details = err.details || undefined;

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('Error:', err);
  }

  res.status(status).json({
    error: {
      code,
      message,
      details,
    },
  });
}