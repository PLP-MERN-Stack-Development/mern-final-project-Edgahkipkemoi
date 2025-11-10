"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = exports.verifyEmail = exports.changePassword = exports.getMe = exports.logoutAll = exports.logout = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("../middleware/errorHandler");
exports.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;
    const existingUser = await User_1.default.findOne({
        $or: [{ email: email.toLowerCase() }, { username }],
    });
    if (existingUser) {
        const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
        throw new errorHandler_1.AppError(`User with this ${field} already exists`, 400);
    }
    const user = await User_1.default.create({
        username,
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
    });
    const tokens = user.generateTokens();
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
    const response = {
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
    res.status(201).json(response);
});
exports.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { identifier, password } = req.body;
    const user = await User_1.default.findOne({
        $or: [
            { email: identifier.toLowerCase() },
            { username: identifier },
        ],
    }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        throw new errorHandler_1.AppError('Invalid credentials', 401);
    }
    const tokens = user.generateTokens();
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
    const response = {
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
    res.json(response);
});
exports.logout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken && req.user) {
        await User_1.default.findByIdAndUpdate(req.user.id, {
            $pull: { refreshTokens: refreshToken },
        });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    const response = {
        success: true,
        message: 'Logout successful',
    };
    res.json(response);
});
exports.logoutAll = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    await User_1.default.findByIdAndUpdate(req.user.id, {
        refreshTokens: [],
    });
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    const response = {
        success: true,
        message: 'Logged out from all devices successfully',
    };
    res.json(response);
});
exports.getMe = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const user = await User_1.default.findById(req.user.id)
        .populate('followers', 'username firstName lastName profilePicture')
        .populate('following', 'username firstName lastName profilePicture');
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    const response = {
        success: true,
        message: 'User profile retrieved successfully',
        data: { user },
    };
    res.json(response);
});
exports.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const user = await User_1.default.findById(req.user.id).select('+password');
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    if (!(await user.comparePassword(currentPassword))) {
        throw new errorHandler_1.AppError('Current password is incorrect', 400);
    }
    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    const response = {
        success: true,
        message: 'Password changed successfully. Please login again.',
    };
    res.json(response);
});
exports.verifyEmail = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const response = {
        success: true,
        message: 'Email verification feature coming soon',
    };
    res.json(response);
});
exports.forgotPassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const response = {
        success: true,
        message: 'Password reset feature coming soon',
    };
    res.json(response);
});
//# sourceMappingURL=authController.js.map