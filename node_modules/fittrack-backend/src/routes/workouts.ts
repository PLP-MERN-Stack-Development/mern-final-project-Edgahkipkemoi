import { Router } from 'express';
import {
    getWorkouts,
    getWorkout,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    duplicateWorkout,
    getPublicWorkouts,
    getWorkoutStats,
} from '../controllers/workoutController';
import { authenticate, optionalAuth } from '../middleware/auth';
import {
    validateWorkout,
    validateObjectId,
    validatePagination,
} from '../middleware/validation';

const router = Router();

/**
 * Workout Routes
 * Handles workout CRUD operations, templates, and statistics
 */

// @route   GET /api/workouts/public
// @desc    Get public workouts for discovery
// @access  Public
router.get('/public', optionalAuth, validatePagination, getPublicWorkouts);

// @route   GET /api/workouts/stats
// @desc    Get workout statistics for authenticated user
// @access  Private
router.get('/stats', authenticate, getWorkoutStats);

// @route   GET /api/workouts
// @desc    Get all workouts for authenticated user
// @access  Private
router.get('/', authenticate, validatePagination, getWorkouts);

// @route   POST /api/workouts
// @desc    Create new workout
// @access  Private
router.post('/', authenticate, validateWorkout, createWorkout);

// @route   GET /api/workouts/:id
// @desc    Get single workout by ID
// @access  Private
router.get('/:id', authenticate, validateObjectId, getWorkout);

// @route   PUT /api/workouts/:id
// @desc    Update workout
// @access  Private
router.put('/:id', authenticate, validateObjectId, updateWorkout);

// @route   DELETE /api/workouts/:id
// @desc    Delete workout
// @access  Private
router.delete('/:id', authenticate, validateObjectId, deleteWorkout);

// @route   POST /api/workouts/:id/duplicate
// @desc    Duplicate workout (create copy)
// @access  Private
router.post('/:id/duplicate', authenticate, validateObjectId, duplicateWorkout);

export default router;