"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.asyncHandler = exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', error);
    }
    if (error.name === 'ValidationError') {
        statusCode = 400;
        const errors = Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
        }));
        res.status(statusCode).json({
            success: false,
            message: 'Validation Error',
            errors,
        });
        return;
    }
    if (error.code === 11000) {
        statusCode = 400;
        const field = Object.keys(error.keyValue)[0];
        message = `${field} already exists`;
        res.status(statusCode).json({
            success: false,
            message,
            error: 'DUPLICATE_FIELD',
        });
        return;
    }
    if (error.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
        res.status(statusCode).json({
            success: false,
            message,
            error: 'INVALID_ID',
        });
        return;
    }
    if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        res.status(statusCode).json({
            success: false,
            message,
            error: 'INVALID_TOKEN',
        });
        return;
    }
    if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
        res.status(statusCode).json({
            success: false,
            message,
            error: 'TOKEN_EXPIRED',
        });
        return;
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = 'File too large';
        res.status(statusCode).json({
            success: false,
            message,
            error: 'FILE_TOO_LARGE',
        });
        return;
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        statusCode = 400;
        message = 'Unexpected file field';
        res.status(statusCode).json({
            success: false,
            message,
            error: 'UNEXPECTED_FILE',
        });
        return;
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
//# sourceMappingURL=errorHandler.js.map