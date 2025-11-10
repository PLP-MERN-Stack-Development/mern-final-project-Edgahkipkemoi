import { Router } from 'express';
import {
    getGoals,
    getGoal,
    createGoal,
    updateGoal,
    updateGoalProgress,
    deleteGoal,
    getGoalStats,
} from '../controllers/goalController';
import { authenticate } from '../middleware/auth';
import {
    validateGoal,
    validateObjectId,
    validatePagination,
    handleValidationErrors,
} from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

/**
 * Goal Routes
 * Handles goal CRUD operations and progress tracking
 */

// @route   GET /api/goals/stats
// @desc    Get goal statistics for authenticated user
// @access  Private
router.get('/stats', authenticate, getGoalStats);

// @route   GET /api/goals
// @desc    Get all goals for authenticated user
// @access  Private
router.get('/', authenticate, validatePagination, getGoals);

// @route   POST /api/goals
// @desc    Create new goal
// @access  Private
router.post('/', authenticate, validateGoal, createGoal);

// @route   GET /api/goals/:id
// @desc    Get single goal by ID
// @access  Private
router.get('/:id', authenticate, validateObjectId, getGoal);

// @route   PUT /api/goals/:id
// @desc    Update goal
// @access  Private
router.put('/:id', authenticate, validateObjectId, updateGoal);

// @route   PATCH /api/goals/:id/progress
// @desc    Update goal progress
// @access  Private
router.patch(
    '/:id/progress',
    authenticate,
    validateObjectId,
    [
        body('currentValue')
            .isFloat({ min: 0 })
            .withMessage('Current value must be a non-negative number'),
        handleValidationErrors,
    ],
    updateGoalProgress
);

// @route   DELETE /api/goals/:id
// @desc    Delete goal
// @access  Private
router.delete('/:id', authenticate, validateObjectId, deleteGoal);

export default router;