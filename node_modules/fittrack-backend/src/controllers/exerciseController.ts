import { Response } from 'express';
import Exercise from '../models/Exercise';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';

/**
 * Exercise Controller
 * Handles CRUD operations for exercises (both system and custom)
 */

/**
 * @desc    Get all exercises
 * @route   GET /api/exercises
 * @access  Public
 */
export const getExercises = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const category = req.query.category as string;
    const muscleGroup = req.query.muscleGroup as string;
    const difficulty = req.query.difficulty as string;
    const search = req.query.search as string;
    const includeCustom = req.query.includeCustom === 'true';

    // Build query
    const query: any = {};

    // Filter by category
    if (category) {
        query.category = category;
    }

    // Filter by muscle group
    if (muscleGroup) {
        query.muscleGroups = { $in: [muscleGroup] };
    }

    // Filter by difficulty
    if (difficulty) {
        query.difficulty = difficulty;
    }

    // Search by name
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    // Handle custom exercises
    if (includeCustom && req.user) {
        // Include system exercises and user's custom exercises
        query.$or = [
            { isCustom: false },
            { isCustom: true, createdBy: req.user.id },
        ];
    } else {
        // Only system exercises
        query.isCustom = false;
    }

    const exercises = await Exercise.find(query)
        .populate('createdBy', 'username firstName lastName')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);

    const total = await Exercise.countDocuments(query);

    const response: ApiResponse = {
        success: true,
        message: 'Exercises retrieved successfully',
        data: { exercises },
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };

    res.json(response);
});

/**
 * @desc    Get single exercise by ID
 * @route   GET /api/exercises/:id
 * @access  Public
 */
export const getExercise = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const exercise = await Exercise.findById(req.params.id)
        .populate('createdBy', 'username firstName lastName');

    if (!exercise) {
        throw new AppError('Exercise not found', 404);
    }

    // Check if user can access custom exercise
    if (exercise.isCustom && exercise.createdBy && req.user?.id !== exercise.createdBy._id.toString()) {
        throw new AppError('Access denied to this custom exercise', 403);
    }

    const response: ApiResponse = {
        success: true,
        message: 'Exercise retrieved successfully',
        data: { exercise },
    };

    res.json(response);
});

/**
 * @desc    Create custom exercise
 * @route   POST /api/exercises
 * @access  Private
 */
export const createExercise = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const { name, category, muscleGroups, equipment, instructions, difficulty } = req.body;

    // Check if exercise with same name already exists for this user
    const existingExercise = await Exercise.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        $or: [
            { isCustom: false },
            { isCustom: true, createdBy: req.user.id },
        ],
    });

    if (existingExercise) {
        throw new AppError('Exercise with this name already exists', 400);
    }

    const exercise = await Exercise.create({
        name,
        category,
        muscleGroups,
        equipment: equipment || [],
        instructions,
        difficulty,
        isCustom: true,
        createdBy: req.user.id,
    });

    await exercise.populate('createdBy', 'username firstName lastName');

    const response: ApiResponse = {
        success: true,
        message: 'Custom exercise created successfully',
        data: { exercise },
    };

    res.status(201).json(response);
});

/**
 * @desc    Update custom exercise
 * @route   PUT /api/exercises/:id
 * @access  Private
 */
export const updateExercise = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const exercise = await Exercise.findOne({
        _id: req.params.id,
        isCustom: true,
        createdBy: req.user.id,
    });

    if (!exercise) {
        throw new AppError('Custom exercise not found or unauthorized', 404);
    }

    const { name, category, muscleGroups, equipment, instructions, difficulty } = req.body;

    // Check if new name conflicts with existing exercises
    if (name && name !== exercise.name) {
        const existingExercise = await Exercise.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            _id: { $ne: req.params.id },
            $or: [
                { isCustom: false },
                { isCustom: true, createdBy: req.user.id },
            ],
        });

        if (existingExercise) {
            throw new AppError('Exercise with this name already exists', 400);
        }
    }

    const updatedExercise = await Exercise.findByIdAndUpdate(
        req.params.id,
        {
            ...(name && { name }),
            ...(category && { category }),
            ...(muscleGroups && { muscleGroups }),
            ...(equipment !== undefined && { equipment }),
            ...(instructions !== undefined && { instructions }),
            ...(difficulty && { difficulty }),
        },
        { new: true, runValidators: true }
    ).populate('createdBy', 'username firstName lastName');

    const response: ApiResponse = {
        success: true,
        message: 'Custom exercise updated successfully',
        data: { exercise: updatedExercise },
    };

    res.json(response);
});

/**
 * @desc    Delete custom exercise
 * @route   DELETE /api/exercises/:id
 * @access  Private
 */
export const deleteExercise = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const exercise = await Exercise.findOne({
        _id: req.params.id,
        isCustom: true,
        createdBy: req.user.id,
    });

    if (!exercise) {
        throw new AppError('Custom exercise not found or unauthorized', 404);
    }

    await Exercise.findByIdAndDelete(req.params.id);

    const response: ApiResponse = {
        success: true,
        message: 'Custom exercise deleted successfully',
    };

    res.json(response);
});

/**
 * @desc    Get exercise categories
 * @route   GET /api/exercises/categories
 * @access  Public
 */
export const getExerciseCategories = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const categories = await Exercise.distinct('category');

    const response: ApiResponse = {
        success: true,
        message: 'Exercise categories retrieved successfully',
        data: { categories },
    };

    res.json(response);
});

/**
 * @desc    Get muscle groups
 * @route   GET /api/exercises/muscle-groups
 * @access  Public
 */
export const getMuscleGroups = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const muscleGroups = await Exercise.distinct('muscleGroups');

    const response: ApiResponse = {
        success: true,
        message: 'Muscle groups retrieved successfully',
        data: { muscleGroups },
    };

    res.json(response);
});

/**
 * @desc    Get equipment types
 * @route   GET /api/exercises/equipment
 * @access  Public
 */
export const getEquipmentTypes = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const equipment = await Exercise.distinct('equipment');

    const response: ApiResponse = {
        success: true,
        message: 'Equipment types retrieved successfully',
        data: { equipment },
    };

    res.json(response);
});