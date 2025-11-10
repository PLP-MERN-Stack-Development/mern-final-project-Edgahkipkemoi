"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePagination = exports.validateObjectId = exports.validateComment = exports.validatePost = exports.validateGoal = exports.validateExercise = exports.validateWorkout = exports.validateUserUpdate = exports.validateUserLogin = exports.validateUserRegistration = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.type === 'field' ? error.path : 'unknown',
            message: error.msg,
            value: error.type === 'field' ? error.value : undefined,
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
exports.handleValidationErrors = handleValidationErrors;
exports.validateUserRegistration = [
    (0, express_validator_1.body)('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters'),
    exports.handleValidationErrors,
];
exports.validateUserLogin = [
    (0, express_validator_1.body)('identifier')
        .notEmpty()
        .withMessage('Email or username is required'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
    exports.handleValidationErrors,
];
exports.validateUserUpdate = [
    (0, express_validator_1.body)('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters'),
    (0, express_validator_1.body)('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Date of birth must be a valid date')
        .custom((value) => {
        if (new Date(value) >= new Date()) {
            throw new Error('Date of birth cannot be in the future');
        }
        return true;
    }),
    (0, express_validator_1.body)('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),
    (0, express_validator_1.body)('height')
        .optional()
        .isFloat({ min: 50, max: 300 })
        .withMessage('Height must be between 50 and 300 cm'),
    (0, express_validator_1.body)('weight')
        .optional()
        .isFloat({ min: 20, max: 500 })
        .withMessage('Weight must be between 20 and 500 kg'),
    (0, express_validator_1.body)('activityLevel')
        .optional()
        .isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'])
        .withMessage('Invalid activity level'),
    exports.handleValidationErrors,
];
exports.validateWorkout = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Workout name must be between 1 and 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    (0, express_validator_1.body)('exercises')
        .isArray({ min: 1 })
        .withMessage('At least one exercise is required'),
    (0, express_validator_1.body)('exercises.*.exercise')
        .isMongoId()
        .withMessage('Invalid exercise ID'),
    (0, express_validator_1.body)('exercises.*.sets')
        .isArray({ min: 1 })
        .withMessage('At least one set is required for each exercise'),
    (0, express_validator_1.body)('date')
        .optional()
        .isISO8601()
        .withMessage('Date must be a valid ISO date'),
    (0, express_validator_1.body)('duration')
        .optional()
        .isInt({ min: 0, max: 1440 })
        .withMessage('Duration must be between 0 and 1440 minutes'),
    (0, express_validator_1.body)('caloriesBurned')
        .optional()
        .isInt({ min: 0, max: 10000 })
        .withMessage('Calories burned must be between 0 and 10000'),
    exports.handleValidationErrors,
];
exports.validateExercise = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Exercise name must be between 1 and 100 characters'),
    (0, express_validator_1.body)('category')
        .isIn(['strength', 'cardio', 'flexibility', 'sports', 'other'])
        .withMessage('Invalid exercise category'),
    (0, express_validator_1.body)('muscleGroups')
        .isArray({ min: 1 })
        .withMessage('At least one muscle group is required'),
    (0, express_validator_1.body)('difficulty')
        .isIn(['beginner', 'intermediate', 'advanced'])
        .withMessage('Difficulty must be beginner, intermediate, or advanced'),
    (0, express_validator_1.body)('instructions')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Instructions cannot exceed 1000 characters'),
    exports.handleValidationErrors,
];
exports.validateGoal = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Goal title must be between 1 and 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    (0, express_validator_1.body)('type')
        .isIn(['weight_loss', 'weight_gain', 'muscle_gain', 'endurance', 'strength', 'custom'])
        .withMessage('Invalid goal type'),
    (0, express_validator_1.body)('targetValue')
        .isFloat({ min: 0 })
        .withMessage('Target value must be a positive number'),
    (0, express_validator_1.body)('unit')
        .isIn(['kg', 'lbs', 'minutes', 'hours', 'reps', 'sets', 'km', 'miles', 'calories', 'days', 'weeks', 'months', 'custom'])
        .withMessage('Invalid unit'),
    (0, express_validator_1.body)('targetDate')
        .isISO8601()
        .withMessage('Target date must be a valid date')
        .custom((value) => {
        if (new Date(value) <= new Date()) {
            throw new Error('Target date must be in the future');
        }
        return true;
    }),
    exports.handleValidationErrors,
];
exports.validatePost = [
    (0, express_validator_1.body)('content')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Post content must be between 1 and 1000 characters'),
    (0, express_validator_1.body)('workout')
        .optional()
        .isMongoId()
        .withMessage('Invalid workout ID'),
    (0, express_validator_1.body)('images')
        .optional()
        .isArray()
        .withMessage('Images must be an array'),
    (0, express_validator_1.body)('images.*')
        .optional()
        .isURL()
        .withMessage('Each image must be a valid URL'),
    exports.handleValidationErrors,
];
exports.validateComment = [
    (0, express_validator_1.body)('content')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Comment content must be between 1 and 500 characters'),
    exports.handleValidationErrors,
];
exports.validateObjectId = [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Invalid ID format'),
    exports.handleValidationErrors,
];
exports.validatePagination = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    exports.handleValidationErrors,
];
//# sourceMappingURL=validation.js.map