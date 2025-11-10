import { Request, Response } from 'express';

/**
 * 404 Not Found middleware
 * Handles requests to non-existent routes
 */
export const notFound = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        error: 'NOT_FOUND',
    });
};