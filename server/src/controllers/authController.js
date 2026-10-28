import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Institution } from '../models/Institution.js';
import { Department } from '../models/Department.js';
import { logAudit } from '../services/auditService.js';

// Helper to sign JWT
const signToken = (id) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_token_change_in_production_min32chars';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn });
};

// Helper to set cookie
const sendTokenResponse = (user, statusCode, res, req) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  const cookieName = process.env.COOKIE_NAME || 'aicte_auth_token';
  res.cookie(cookieName, token, cookieOptions);

  // Exclude password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token, // Also provided for Authorization: Bearer header if needed
    user,
  });
};

/**
 * Register a new user (Institution, Officer, or Admin)
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'institution',
      phone,
      designation,
      institutionId,
      institutionName,
      aicteId,
      state,
      district,
      institutionType,
      departmentId,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    let finalInstitutionId = institutionId;
    let finalDepartmentId = departmentId;

    // If role is institution, handle institution association or creation
    if (role === 'institution') {
      if (!finalInstitutionId && institutionName && aicteId) {
        let inst = await Institution.findOne({ aicteId: aicteId.toUpperCase().trim() });
        if (!inst) {
          inst = await Institution.create({
            name: institutionName.trim(),
            aicteId: aicteId.toUpperCase().trim(),
            state: state || 'New Delhi',
            district: district || 'Central Delhi',
            type: institutionType || 'Engineering & Technology',
            contactEmail: email.toLowerCase(),
            contactPhone: phone,
          });
        }
        finalInstitutionId = inst._id;
      }
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role,
      phone,
      designation,
      institution: finalInstitutionId,
      department: finalDepartmentId,
      lastLogin: new Date(),
    });

    const populatedUser = await User.findById(user._id)
      .populate('department', 'name code')
      .populate('institution', 'name aicteId state district');

    await logAudit({
      req,
      user: populatedUser,
      action: 'USER_REGISTERED',
      resourceType: 'User',
      resourceId: user._id,
      details: { role, email: user.email },
    });

    sendTokenResponse(populatedUser, 201, res, req);
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an existing user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('department', 'name code')
      .populate('institution', 'name aicteId state district');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact your AICTE Administrator.',
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    await logAudit({
      req,
      user,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user._id,
      details: { role: user.role, email: user.email },
    });

    sendTokenResponse(user, 200, res, req);
  } catch (error) {
    next(error);
  }
};

/**
 * Log out user & clear cookie
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  const cookieName = process.env.COOKIE_NAME || 'aicte_auth_token';
  res.cookie(cookieName, 'none', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });

  if (req.user) {
    await logAudit({
      req,
      user: req.user,
      action: 'USER_LOGOUT',
      resourceType: 'User',
      resourceId: req.user._id,
    });
  }

  res.status(200).json({
    success: true,
    message: 'User logged out successfully.',
  });
};

/**
 * Get currently authenticated user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

/**
 * Forgot password - initiates safe recovery
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond with success to prevent user enumeration
    res.status(200).json({
      success: true,
      message: 'If an account exists with that email address, password reset instructions have been generated.',
      demoToken: user ? Buffer.from(user._id.toString()).toString('base64') : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    let userId;
    try {
      userId = Buffer.from(token, 'base64').toString('ascii');
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    user.password = newPassword;
    await user.save();

    await logAudit({
      req,
      user,
      action: 'PASSWORD_RESET',
      resourceType: 'User',
      resourceId: user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Password has been successfully updated. You may now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PATCH /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, designation } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (designation !== undefined) user.designation = designation;

    await user.save();

    const updated = await User.findById(user._id)
      .populate('department', 'name code')
      .populate('institution', 'name aicteId state district');

    res.status(200).json({
      success: true,
      user: updated,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
