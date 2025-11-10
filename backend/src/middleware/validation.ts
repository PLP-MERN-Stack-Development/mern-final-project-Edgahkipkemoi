import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

/**
 * Validation result handler
 * Checks for validation errors and returns appropriate response
 */
export const handleValidationErrors = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.type === 'field' ? (error as any).path : 'unknown',
            message: error.msg,
            value: error.type === 'field' ? (error as any).value : undefined,
        }));

        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors,
        });
        return;
    }

    next();
};

// User validation rules
export const validateUserRegistration = [
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

    body('firstName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),

    body('lastName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters'),

    handleValidationErrors,
];

export const validateUserLogin = [
    body('identifier')
        .notEmpty()
        .withMessage('Email or username is required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors,
];

export const validateUserUpdate = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),

    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters'),

    body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Date of birth must be a valid date')
        .custom((value) => {
            if (new Date(value) >= new Date()) {
                throw new Error('Date of birth cannot be in the future');
            }
            return true;
        }),

    body('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),

    body('height')
        .optional()
        .isFloat({ min: 50, max: 300 })
        .withMessage('Height must be between 50 and 300 cm'),

    body('weight')
        .optional()
        .isFloat({ min: 20, max: 500 })
        .withMessage('Weight must be between 20 and 500 kg'),

    body('activityLevel')
        .optional()
        .isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'])
        .withMessage('Invalid activity level'),

    handleValidationErrors,
];

// Workout validation rules
export const validateWorkout = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Workout name must be between 1 and 100 characters'),

    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),

    body('exercises')
        .isArray({ min: 1 })
        .withMessage('At least one exercise is required'),

    body('exercises.*.exercise')
        .isMongoId()
        .withMessage('Invalid exercise ID'),

    body('exercises.*.sets')
        .isArray({ min: 1 })
        .withMessage('At least one set is required for each exercise'),

    body('date')
        .optional()
        .isISO8601()
        .withMessage('Date must be a valid ISO date'),

    body('duration')
        .optional()
        .isInt({ min: 0, max: 1440 })
        .withMessage('Duration must be between 0 and 1440 minutes'),

    body('caloriesBurned')
        .optional()
        .isInt({ min: 0, max: 10000 })
        .withMessage('Calories burned must be between 0 and 10000'),

    handleValidationErrors,
];

// Exercise validation rules
export const validateExercise = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Exercise name must be between 1 and 100 characters'),

    body('category')
        .isIn(['strength', 'cardio', 'flexibility', 'sports', 'other'])
        .withMessage('Invalid exercise category'),

    body('muscleGroups')
        .isArray({ min: 1 })
        .withMessage('At least one muscle group is required'),

    body('difficulty')
        .isIn(['beginner', 'intermediate', 'advanced'])
        .withMessage('Difficulty must be beginner, intermediate, or advanced'),

    body('instructions')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Instructions cannot exceed 1000 characters'),

    handleValidationErrors,
];

// Goal validation rules
export const validateGoal = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Goal title must be between 1 and 100 characters'),

    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),

    body('type')
        .isIn(['weight_loss', 'weight_gain', 'muscle_gain', 'endurance', 'strength', 'custom'])
        .withMessage('Invalid goal type'),

    body('targetValue')
        .isFloat({ min: 0 })
        .withMessage('Target value must be a positive number'),

    body('unit')
        .isIn(['kg', 'lbs', 'minutes', 'hours', 'reps', 'sets', 'km', 'miles', 'calories', 'days', 'weeks', 'months', 'custom'])
        .withMessage('Invalid unit'),

    body('targetDate')
        .isISO8601()
        .withMessage('Target date must be a valid date')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('Target date must be in the future');
            }
            return true;
        }),

    handleValidationErrors,
];

// Post validation rules
export const validatePost = [
    body('content')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Post content must be between 1 and 1000 characters'),

    body('workout')
        .optional()
        .isMongoId()
        .withMessage('Invalid workout ID'),

    body('images')
        .optional()
        .isArray()
        .withMessage('Images must be an array'),

    body('images.*')
        .optional()
        .isURL()
        .withMessage('Each image must be a valid URL'),

    handleValidationErrors,
];

// Comment validation rules
export const validateComment = [
    body('content')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Comment content must be between 1 and 500 characters'),

    handleValidationErrors,
];

// Parameter validation
export const validateObjectId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid ID format'),

    handleValidationErrors,
];

// Query validation
export const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    handleValidationErrors,
];