"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.optionalAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authenticate = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
        else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_1.default.findById(decoded.id).select('-password -refreshTokens');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.',
            });
            return;
        }
        req.user = {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Token expired. Please refresh your token.',
                error: 'TOKEN_EXPIRED',
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
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
exports.authenticate = authenticate;
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
        else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const user = await User_1.default.findById(decoded.id).select('-password -refreshTokens');
                if (user) {
                    req.user = {
                        id: user._id.toString(),
                        email: user.email,
                        username: user.username,
                    };
                }
            }
            catch (error) {
                console.log('Optional auth failed:', error instanceof Error ? error.message : 'Unknown error');
            }
        }
        next();
    }
    catch (error) {
        console.error('Optional authentication error:', error);
        next();
    }
};
exports.optionalAuth = optionalAuth;
const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({
                success: false,
                message: 'Refresh token not provided.',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User_1.default.findById(decoded.id);
        if (!user || !user.refreshTokens.includes(refreshToken)) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token.',
            });
            return;
        }
        const tokens = user.generateTokens();
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();
        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
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
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Refresh token expired. Please login again.',
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
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
exports.refreshToken = refreshToken;
//# sourceMappingURL=auth.js.map