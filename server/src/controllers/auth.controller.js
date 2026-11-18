import jwt from 'jsonwebtoken';
import { cookieSecure, env } from '../config/env.js';
import { AUTH_COOKIE } from '../middleware/auth.js';
import { User } from '../models/user.model.js';
import { ApiError, asyncHandler } from '../utils/api-error.js';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

/**
 * The JWT lives in an httpOnly cookie, so JavaScript in the page (including any injected
 * script) can't read it. sameSite=lax blocks it from being sent on cross-site POSTs.
 * The frontend always reaches the API through a same-origin /api proxy (Vite, nginx or a
 * Vercel rewrite), so the cookie never needs to be a third-party cookie.
 */
const cookieOptions = () => ({ httpOnly: true, secure: cookieSecure, sameSite: 'lax' });

function setSession(res, user) {
  const token = jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
  res.cookie(AUTH_COOKIE, token, { ...cookieOptions(), maxAge: SEVEN_DAYS });
}

export const register = asyncHandler(async (req, res) => {
  const exists = await User.exists({ email: req.body.email.toLowerCase() });
  if (exists) throw new ApiError(409, 'An account with this email already exists');
  const user = await User.create(req.body);
  setSession(res, user);
  res.status(201).json({ user: user.toPublic() });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(req.body.password))) {
    throw new ApiError(401, 'Email or password is incorrect');
  }
  setSession(res, user);
  res.json({ user: user.toPublic() });
});

export const logout = (_req, res) => {
  res.clearCookie(AUTH_COOKIE, cookieOptions());
  res.status(204).end();
};

export const me = (req, res) => res.json({ user: req.user.toPublic() });
