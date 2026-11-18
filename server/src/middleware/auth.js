import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/user.model.js';
import { ApiError, asyncHandler } from '../utils/api-error.js';

export const AUTH_COOKIE = 'shopsphere_token';

/** Requires a valid session cookie and attaches the user to req.user. */
export const protect = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) throw new ApiError(401, 'Please sign in to continue');

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Your session has expired. Please sign in again');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'Account not found');
  req.user = user;
  next();
});

export const adminOnly = (req, _res, next) => {
  if (req.user?.role !== 'admin') return next(new ApiError(403, 'Admin access only'));
  next();
};
