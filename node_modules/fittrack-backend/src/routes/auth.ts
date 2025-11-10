import { Router } from 'express';
import {
    register,
    login,
    logout,
    logoutAll,
    getMe,
    changePassword,
    verifyEmail,
    forgotPassword,
} from '../controllers/authController';
import { authenticate, refreshToken } from '../middleware/auth';
import {
    validateUserRegistration,
    validateUserLogin,
    handleValidationErrors,
} from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

/**
 * Authentication Routes
 * Handles user authentication, registration, and account management
 */

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUserRegistration, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateUserLogin, login);

// @route   POST /api/auth/refresh
// @desc    Refresh access token using refresh token
// @access  Public (but requires refresh token in cookies)
router.post('/refresh', refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout user (clear tokens)
// @access  Private
router.post('/logout', authenticate, logout);

// @route   POST /api/auth/logout-all
// @desc    Logout from all devices
// @access  Private
router.post('/logout-all', authenticate, logoutAll);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, getMe);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put(
    '/change-password',
    authenticate,
    [
        body('currentPassword')
            .notEmpty()
            .withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('New password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
        handleValidationErrors,
    ],
    changePassword
);

// @route   POST /api/auth/verify-email
// @desc    Verify user email (placeholder)
// @access  Public
router.post('/verify-email', verifyEmail);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset (placeholder)
// @access  Public
router.post('/forgot-password', forgotPassword);

export default router;