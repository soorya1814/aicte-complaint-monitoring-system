import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie first
    const cookieName = process.env.COOKIE_NAME || 'aicte_auth_token';
    if (req.cookies && req.cookies[cookieName]) {
      token = req.cookies[cookieName];
    }
    // 2. Fallback to Authorization Header (Bearer token)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to access this resource.',
      });
    }

    // Verify token
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_token_change_in_production_min32chars';
    const decoded = jwt.verify(token, secret);

    // Fetch user from DB
    const user = await User.findById(decoded.id)
      .populate('department', 'name code')
      .populate('institution', 'name aicteId state district');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists or account has been deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please sign in again.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }
};
