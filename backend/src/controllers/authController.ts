import { Request, Response } from 'express';
import User from '../models/User';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';

/**
 * Authentication Controller
 * Handles user registration, login, logout, and token refresh
 */

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { username, email, password, firstName, lastName } = req.body;

    console.log('📝 Registration attempt:', { username, email, firstName, lastName });

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
        const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
        console.log('❌ Registration failed: User already exists', field);
        throw new AppError(`User with this ${field} already exists`, 400);
    }

    // Create new user
    const user = await User.create({
        username,
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
    });

    console.log('✅ User created successfully:', user._id);

    // Generate tokens
    const tokens = user.generateTokens();

    // Save refresh token to user
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    console.log('🔑 Tokens generated and saved');

    // Set HTTP-only cookies for security
    res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const response: ApiResponse = {
        success: true,
        message: 'User registered successfully',
        data: {
            accessToken: tokens.accessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isEmailVerified: user.isEmailVerified,
            },
        },
    };

    console.log('✅ Registration successful, sending response');
    res.status(201).json(response);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { identifier, password } = req.body;

    console.log('🔐 Login attempt:', { identifier });

    // Find user by email or username (including password for comparison)
    const user = await User.findOne({
        $or: [
            { email: identifier.toLowerCase() },
            { username: identifier },
        ],
    }).select('+password');

    if (!user) {
        console.log('❌ Login failed: User not found');
        throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        console.log('❌ Login failed: Invalid password');
        throw new AppError('Invalid credentials', 401);
    }

    console.log('✅ User authenticated:', user._id);

    // Update streak on login
    const { updateUserStreak } = await import('../utils/streakHelper');
    const streakInfo = updateUserStreak(user);
    await user.save();

    console.log('📊 Streak updated:', streakInfo);

    // Generate tokens
    const tokens = user.generateTokens();

    // Save refresh token to user
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    console.log('🔑 Tokens generated and saved');

    // Set HTTP-only cookies
    res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
            accessToken: tokens.accessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isEmailVerified: user.isEmailVerified,
                profilePicture: user.profilePicture,
            },
        },
    };

    console.log('✅ Login successful, sending response');
    res.json(response);
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken && req.user) {
        // Remove refresh token from user's token list
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { refreshTokens: refreshToken },
        });
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
    };

    res.json(response);
});

/**
 * @desc    Logout from all devices
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
export const logoutAll = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    // Clear all refresh tokens
    await User.findByIdAndUpdate(req.user.id, {
        refreshTokens: [],
    });

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    const response: ApiResponse = {
        success: true,
        message: 'Logged out from all devices successfully',
    };

    res.json(response);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const user = await User.findById(req.user.id)
        .populate('followers', 'username firstName lastName profilePicture')
        .populate('following', 'username firstName lastName profilePicture');

    if (!user) {
        throw new AppError('User not found', 404);
    }

    const response: ApiResponse = {
        success: true,
        message: 'User profile retrieved successfully',
        data: { user },
    };

    res.json(response);
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;

    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Verify current password
    if (!(await user.comparePassword(currentPassword))) {
        throw new AppError('Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;

    // Clear all refresh tokens to force re-login on all devices
    user.refreshTokens = [];

    await user.save();

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully. Please login again.',
    };

    res.json(response);
});

/**
 * @desc    Verify email (placeholder for future implementation)
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // This would typically involve email verification tokens
    // For now, we'll just return a placeholder response

    const response: ApiResponse = {
        success: true,
        message: 'Email verification feature coming soon',
    };

    res.json(response);
});

/**
 * @desc    Request password reset (placeholder for future implementation)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // This would typically involve sending password reset emails
    // For now, we'll just return a placeholder response

    const response: ApiResponse = {
        success: true,
        message: 'Password reset feature coming soon',
    };

    res.json(response);
});