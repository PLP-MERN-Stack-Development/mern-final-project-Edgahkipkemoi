import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/**
 * Global error handling middleware
 * Handles different types of errors and returns appropriate responses
 */
export const errorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';

    // Log error for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', error);
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
        statusCode = 400;
        const errors = Object.values(error.errors).map((err: any) => ({
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

    // Mongoose duplicate key error
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

    // Mongoose cast error (invalid ObjectId)
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

    // JWT errors
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

    // Multer errors (file upload)
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

    // Default error response
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass them to error handler
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}