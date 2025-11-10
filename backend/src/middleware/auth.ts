import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from Authorization header or cookies
        let token: string | undefined;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
            return;
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // Get user from database (excluding password)
        const user = await User.findById(decoded.id).select('-password -refreshTokens');

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.',
            });
            return;
        }

        // Attach user info to request
        req.user = {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Token expired. Please refresh your token.',
                error: 'TOKEN_EXPIRED',
            });
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Invalid token.',
            });
            return;
        }

        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.',
        });
    }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is valid, but doesn't block request if not
 */
export const optionalAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token: string | undefined;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
                const user = await User.findById(decoded.id).select('-password -refreshTokens');

                if (user) {
                    req.user = {
                        id: user._id.toString(),
                        email: user.email,
                        username: user.username,
                    };
                }
            } catch (error) {
                // Token is invalid, but we continue without user info
                console.log('Optional auth failed:', error instanceof Error ? error.message : 'Unknown error');
            }
        }

        next();
    } catch (error) {
        console.error('Optional authentication error:', error);
        next(); // Continue without authentication
    }
};

/**
 * Refresh token middleware
 * Handles token refresh using refresh tokens stored in HTTP-only cookies
 */
export const refreshToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(401).json({
                success: false,
                message: 'Refresh token not provided.',
            });
            return;
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

        // Get user and check if refresh token exists in database
        const user = await User.findById(decoded.id);

        if (!user || !user.refreshTokens.includes(refreshToken)) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token.',
            });
            return;
        }

        // Generate new tokens
        const tokens = user.generateTokens();

        // Remove old refresh token and add new one
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();

        // Set new tokens in cookies
        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: tokens.accessToken,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
            },
        });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Refresh token expired. Please login again.',
            });
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token.',
            });
            return;
        }

        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during token refresh.',
        });
    }
};