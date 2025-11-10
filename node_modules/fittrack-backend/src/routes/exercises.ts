import { Router } from 'express';
import {
    getExercises,
    getExercise,
    createExercise,
    updateExercise,
    deleteExercise,
    getExerciseCategories,
    getMuscleGroups,
    getEquipmentTypes,
} from '../controllers/exerciseController';
import { authenticate, optionalAuth } from '../middleware/auth';
import {
    validateExercise,
    validateObjectId,
    validatePagination,
} from '../middleware/validation';

const router = Router();

/**
 * Exercise Routes
 * Handles exercise CRUD operations and metadata
 */

// @route   GET /api/exercises/categories
// @desc    Get all exercise categories
// @access  Public
router.get('/categories', getExerciseCategories);

// @route   GET /api/exercises/muscle-groups
// @desc    Get all muscle groups
// @access  Public
router.get('/muscle-groups', getMuscleGroups);

// @route   GET /api/exercises/equipment
// @desc    Get all equipment types
// @access  Public
router.get('/equipment', getEquipmentTypes);

// @route   GET /api/exercises
// @desc    Get all exercises (with optional filters)
// @access  Public (but custom exercises require auth)
router.get('/', optionalAuth, validatePagination, getExercises);

// @route   POST /api/exercises
// @desc    Create custom exercise
// @access  Private
router.post('/', authenticate, validateExercise, createExercise);

// @route   GET /api/exercises/:id
// @desc    Get single exercise by ID
// @access  Public (but custom exercises require auth)
router.get('/:id', optionalAuth, validateObjectId, getExercise);

// @route   PUT /api/exercises/:id
// @desc    Update custom exercise
// @access  Private
router.put('/:id', authenticate, validateObjectId, updateExercise);

// @route   DELETE /api/exercises/:id
// @desc    Delete custom exercise
// @access  Private
router.delete('/:id', authenticate, validateObjectId, deleteExercise);

export default router;