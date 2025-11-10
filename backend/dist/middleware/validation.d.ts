import { Request, Response, NextFunction } from 'express';
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateUserRegistration: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const validateUserLogin: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const validateUserUpdate: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const validateWorkout: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const validateExercise: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const validateGoal: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const validatePost: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const validateComment: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const validateObjectId: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const validatePagination: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
//# sourceMappingURL=validation.d.ts.map