import { Request, Response, NextFunction } from 'express';
export declare const errorHandler: (error: any, req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
//# sourceMappingURL=errorHandler.d.ts.map