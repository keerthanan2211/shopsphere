import mongoose from 'mongoose';
import { isProd } from '../config/env.js';
import { ApiError } from '../utils/api-error.js';

export const notFound = (req, _res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.status ?? 500;
  let message = err.message ?? 'Something went wrong';

  if (err instanceof mongoose.Error.CastError) {
    status = 404;
    message = 'Resource not found';
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
  } else if (err?.code === 11000) {
    status = 409;
    message = `That ${Object.keys(err.keyValue ?? {})[0] ?? 'value'} is already in use`;
  }

  if (status >= 500) console.error(err);
  // Never leak internal error messages or stack traces to clients in production
  if (status >= 500 && isProd) message = 'Something went wrong on our side';

  res.status(status).json({ message, ...(err instanceof ApiError && err.details ? { details: err.details } : {}) });
}
