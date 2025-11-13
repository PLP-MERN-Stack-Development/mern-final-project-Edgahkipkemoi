import { Response } from 'express';
import Workout from '../models/Workout';
import Exercise from '../models/Exercise';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';

/**
 * Workout Controller
 * Handles CRUD operations for workouts and workout templates
 */

/**
 * @desc    Get all workouts for authenticated user
 * @route   GET /api/workouts
 * @access  Private
 */
export const getWorkouts = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const isTemplate = req.query.template === 'true';
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Build query
    const query: any = { user: req.user.id };

    if (typeof isTemplate === 'boolean') {
        query.isTemplate = isTemplate;
    }

    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    // Use Promise.all for parallel execution and lean() for better performance
    const [workouts, total] = await Promise.all([
        Workout.find(query)
            .populate('exercises.exercise', 'name category muscleGroups difficulty')
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Workout.countDocuments(query)
    ]);

    const response: ApiResponse = {
        success: true,
        message: 'Workouts retrieved successfully',
        data: { workouts },
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
 * @desc    Get single workout by ID
 * @route   GET /api/workouts/:id
 * @access  Private
 */
export const getWorkout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const workout = await Workout.findOne({
        _id: req.params.id,
        $or: [
            { user: req.user.id },
            { isPublic: true },
        ],
    }).populate('exercises.exercise', 'name category muscleGroups difficulty instructions equipment');

    if (!workout) {
        throw new AppError('Workout not found', 404);
    }

    const response: ApiResponse = {
        success: true,
        message: 'Workout retrieved successfully',
        data: { workout },
    };

    res.json(response);
});

/**
 * @desc    Create new workout
 * @route   POST /api/workouts
 * @access  Private
 */
export const createWorkout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const { name, description, exercises, duration, caloriesBurned, date, isTemplate, isPublic, tags } = req.body;

    // Validate that all exercises exist
    const exerciseIds = exercises.map((ex: any) => ex.exercise);
    const existingExercises = await Exercise.find({ _id: { $in: exerciseIds } });

    if (existingExercises.length !== exerciseIds.length) {
        throw new AppError('One or more exercises not found', 400);
    }

    const workout = await Workout.create({
        user: req.user.id,
        name,
        description,
        exercises,
        duration,
        caloriesBurned,
        date: date || new Date(),
        isTemplate: isTemplate || false,
        isPublic: isPublic || false,
        tags: tags || [],
    });

    await workout.populate('exercises.exercise', 'name category muscleGroups difficulty');

    // Update user's workout count and streak if not a template
    if (!isTemplate) {
        const user = await import('../models/User').then(m => m.default.findById(req.user!.id));
        if (user) {
            user.totalWorkoutsCompleted += 1;
            const { updateUserStreak } = await import('../utils/streakHelper');
            updateUserStreak(user);
            await user.save();
        }
    }

    const response: ApiResponse = {
        success: true,
        message: 'Workout created successfully',
        data: { workout },
    };

    res.status(201).json(response);
});

/**
 * @desc    Update workout
 * @route   PUT /api/workouts/:id
 * @access  Private
 */
export const updateWorkout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const workout = await Workout.findOne({
        _id: req.params.id,
        user: req.user.id,
    });

    if (!workout) {
        throw new AppError('Workout not found or unauthorized', 404);
    }

    const { name, description, exercises, duration, caloriesBurned, date, isTemplate, isPublic, tags } = req.body;

    // If exercises are being updated, validate they exist
    if (exercises) {
        const exerciseIds = exercises.map((ex: any) => ex.exercise);
        const existingExercises = await Exercise.find({ _id: { $in: exerciseIds } });

        if (existingExercises.length !== exerciseIds.length) {
            throw new AppError('One or more exercises not found', 400);
        }
    }

    // Update workout
    const updatedWorkout = await Workout.findByIdAndUpdate(
        req.params.id,
        {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(exercises && { exercises }),
            ...(duration !== undefined && { duration }),
            ...(caloriesBurned !== undefined && { caloriesBurned }),
            ...(date && { date }),
            ...(isTemplate !== undefined && { isTemplate }),
            ...(isPublic !== undefined && { isPublic }),
            ...(tags && { tags }),
        },
        { new: true, runValidators: true }
    ).populate('exercises.exercise', 'name category muscleGroups difficulty');

    const response: ApiResponse = {
        success: true,
        message: 'Workout updated successfully',
        data: { workout: updatedWorkout },
    };

    res.json(response);
});

/**
 * @desc    Delete workout
 * @route   DELETE /api/workouts/:id
 * @access  Private
 */
export const deleteWorkout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const workout = await Workout.findOne({
        _id: req.params.id,
        user: req.user.id,
    });

    if (!workout) {
        throw new AppError('Workout not found or unauthorized', 404);
    }

    await Workout.findByIdAndDelete(req.params.id);

    const response: ApiResponse = {
        success: true,
        message: 'Workout deleted successfully',
    };

    res.json(response);
});

/**
 * @desc    Duplicate workout (create copy)
 * @route   POST /api/workouts/:id/duplicate
 * @access  Private
 */
export const duplicateWorkout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const originalWorkout = await Workout.findOne({
        _id: req.params.id,
        $or: [
            { user: req.user.id },
            { isPublic: true },
        ],
    });

    if (!originalWorkout) {
        throw new AppError('Workout not found', 404);
    }

    // Create a copy with reset sets (not completed)
    const duplicatedExercises = originalWorkout.exercises.map(exercise => ({
        exercise: exercise.exercise,
        sets: exercise.sets.map(set => ({
            reps: set.reps,
            weight: set.weight,
            duration: set.duration,
            distance: set.distance,
            restTime: set.restTime,
            completed: false,
        })),
        notes: exercise.notes,
    }));

    const duplicatedWorkout = await Workout.create({
        user: req.user.id,
        name: `${originalWorkout.name} (Copy)`,
        description: originalWorkout.description,
        exercises: duplicatedExercises,
        isTemplate: false,
        isPublic: false,
        tags: originalWorkout.tags,
        date: new Date(),
    });

    await duplicatedWorkout.populate('exercises.exercise', 'name category muscleGroups difficulty');

    const response: ApiResponse = {
        success: true,
        message: 'Workout duplicated successfully',
        data: { workout: duplicatedWorkout },
    };

    res.status(201).json(response);
});

/**
 * @desc    Get public workouts (for discovery)
 * @route   GET /api/workouts/public
 * @access  Public
 */
export const getPublicWorkouts = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const category = req.query.category as string;
    const search = req.query.search as string;

    // Build query
    const query: any = { isPublic: true };

    if (search) {
        query.$text = { $search: search };
    }

    const workouts = await Workout.find(query)
        .populate('user', 'username firstName lastName profilePicture')
        .populate('exercises.exercise', 'name category muscleGroups difficulty')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Workout.countDocuments(query);

    const response: ApiResponse = {
        success: true,
        message: 'Public workouts retrieved successfully',
        data: { workouts },
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
 * @desc    Get workout statistics for user
 * @route   GET /api/workouts/stats
 * @access  Private
 */
export const getWorkoutStats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const userId = req.user.id;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Build date filter
    const dateFilter: any = { user: userId, isTemplate: false };
    if (startDate || endDate) {
        dateFilter.date = {};
        if (startDate) dateFilter.date.$gte = new Date(startDate);
        if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Get basic stats
    const totalWorkouts = await Workout.countDocuments(dateFilter);

    const workoutAggregation = await Workout.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: null,
                totalDuration: { $sum: '$duration' },
                totalCalories: { $sum: '$caloriesBurned' },
                avgDuration: { $avg: '$duration' },
            },
        },
    ]);

    const stats = workoutAggregation[0] || {
        totalDuration: 0,
        totalCalories: 0,
        avgDuration: 0,
    };

    // Get weekly progress (last 8 weeks)
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const weeklyProgress = await Workout.aggregate([
        {
            $match: {
                user: userId,
                isTemplate: false,
                date: { $gte: eightWeeksAgo },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    week: { $week: '$date' },
                },
                workouts: { $sum: 1 },
                duration: { $sum: '$duration' },
                calories: { $sum: '$caloriesBurned' },
            },
        },
        { $sort: { '_id.year': 1, '_id.week': 1 } },
        {
            $project: {
                week: { $concat: [{ $toString: '$_id.year' }, '-W', { $toString: '$_id.week' }] },
                workouts: 1,
                duration: 1,
                calories: 1,
                _id: 0,
            },
        },
    ]);

    const response: ApiResponse = {
        success: true,
        message: 'Workout statistics retrieved successfully',
        data: {
            totalWorkouts,
            totalDuration: stats.totalDuration || 0,
            totalCalories: stats.totalCalories || 0,
            averageDuration: Math.round(stats.avgDuration || 0),
            weeklyProgress,
        },
    };

    res.json(response);
});