"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkoutStats = exports.getPublicWorkouts = exports.duplicateWorkout = exports.deleteWorkout = exports.updateWorkout = exports.createWorkout = exports.getWorkout = exports.getWorkouts = void 0;
const Workout_1 = __importDefault(require("../models/Workout"));
const Exercise_1 = __importDefault(require("../models/Exercise"));
const errorHandler_1 = require("../middleware/errorHandler");
exports.getWorkouts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const isTemplate = req.query.template === 'true';
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const query = { user: req.user.id };
    if (typeof isTemplate === 'boolean') {
        query.isTemplate = isTemplate;
    }
    if (startDate || endDate) {
        query.date = {};
        if (startDate)
            query.date.$gte = new Date(startDate);
        if (endDate)
            query.date.$lte = new Date(endDate);
    }
    const workouts = await Workout_1.default.find(query)
        .populate('exercises.exercise', 'name category muscleGroups difficulty')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Workout_1.default.countDocuments(query);
    const response = {
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
exports.getWorkout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const workout = await Workout_1.default.findOne({
        _id: req.params.id,
        $or: [
            { user: req.user.id },
            { isPublic: true },
        ],
    }).populate('exercises.exercise', 'name category muscleGroups difficulty instructions equipment');
    if (!workout) {
        throw new errorHandler_1.AppError('Workout not found', 404);
    }
    const response = {
        success: true,
        message: 'Workout retrieved successfully',
        data: { workout },
    };
    res.json(response);
});
exports.createWorkout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { name, description, exercises, duration, caloriesBurned, date, isTemplate, isPublic, tags } = req.body;
    const exerciseIds = exercises.map((ex) => ex.exercise);
    const existingExercises = await Exercise_1.default.find({ _id: { $in: exerciseIds } });
    if (existingExercises.length !== exerciseIds.length) {
        throw new errorHandler_1.AppError('One or more exercises not found', 400);
    }
    const workout = await Workout_1.default.create({
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
    const response = {
        success: true,
        message: 'Workout created successfully',
        data: { workout },
    };
    res.status(201).json(response);
});
exports.updateWorkout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const workout = await Workout_1.default.findOne({
        _id: req.params.id,
        user: req.user.id,
    });
    if (!workout) {
        throw new errorHandler_1.AppError('Workout not found or unauthorized', 404);
    }
    const { name, description, exercises, duration, caloriesBurned, date, isTemplate, isPublic, tags } = req.body;
    if (exercises) {
        const exerciseIds = exercises.map((ex) => ex.exercise);
        const existingExercises = await Exercise_1.default.find({ _id: { $in: exerciseIds } });
        if (existingExercises.length !== exerciseIds.length) {
            throw new errorHandler_1.AppError('One or more exercises not found', 400);
        }
    }
    const updatedWorkout = await Workout_1.default.findByIdAndUpdate(req.params.id, {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(exercises && { exercises }),
        ...(duration !== undefined && { duration }),
        ...(caloriesBurned !== undefined && { caloriesBurned }),
        ...(date && { date }),
        ...(isTemplate !== undefined && { isTemplate }),
        ...(isPublic !== undefined && { isPublic }),
        ...(tags && { tags }),
    }, { new: true, runValidators: true }).populate('exercises.exercise', 'name category muscleGroups difficulty');
    const response = {
        success: true,
        message: 'Workout updated successfully',
        data: { workout: updatedWorkout },
    };
    res.json(response);
});
exports.deleteWorkout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const workout = await Workout_1.default.findOne({
        _id: req.params.id,
        user: req.user.id,
    });
    if (!workout) {
        throw new errorHandler_1.AppError('Workout not found or unauthorized', 404);
    }
    await Workout_1.default.findByIdAndDelete(req.params.id);
    const response = {
        success: true,
        message: 'Workout deleted successfully',
    };
    res.json(response);
});
exports.duplicateWorkout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const originalWorkout = await Workout_1.default.findOne({
        _id: req.params.id,
        $or: [
            { user: req.user.id },
            { isPublic: true },
        ],
    });
    if (!originalWorkout) {
        throw new errorHandler_1.AppError('Workout not found', 404);
    }
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
    const duplicatedWorkout = await Workout_1.default.create({
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
    const response = {
        success: true,
        message: 'Workout duplicated successfully',
        data: { workout: duplicatedWorkout },
    };
    res.status(201).json(response);
});
exports.getPublicWorkouts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;
    const query = { isPublic: true };
    if (search) {
        query.$text = { $search: search };
    }
    const workouts = await Workout_1.default.find(query)
        .populate('user', 'username firstName lastName profilePicture')
        .populate('exercises.exercise', 'name category muscleGroups difficulty')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Workout_1.default.countDocuments(query);
    const response = {
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
exports.getWorkoutStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const userId = req.user.id;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const dateFilter = { user: userId, isTemplate: false };
    if (startDate || endDate) {
        dateFilter.date = {};
        if (startDate)
            dateFilter.date.$gte = new Date(startDate);
        if (endDate)
            dateFilter.date.$lte = new Date(endDate);
    }
    const totalWorkouts = await Workout_1.default.countDocuments(dateFilter);
    const workoutAggregation = await Workout_1.default.aggregate([
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
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    const weeklyProgress = await Workout_1.default.aggregate([
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
    const response = {
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
//# sourceMappingURL=workoutController.js.map