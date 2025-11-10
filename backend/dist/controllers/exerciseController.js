"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEquipmentTypes = exports.getMuscleGroups = exports.getExerciseCategories = exports.deleteExercise = exports.updateExercise = exports.createExercise = exports.getExercise = exports.getExercises = void 0;
const Exercise_1 = __importDefault(require("../models/Exercise"));
const errorHandler_1 = require("../middleware/errorHandler");
exports.getExercises = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const muscleGroup = req.query.muscleGroup;
    const difficulty = req.query.difficulty;
    const search = req.query.search;
    const includeCustom = req.query.includeCustom === 'true';
    const query = {};
    if (category) {
        query.category = category;
    }
    if (muscleGroup) {
        query.muscleGroups = { $in: [muscleGroup] };
    }
    if (difficulty) {
        query.difficulty = difficulty;
    }
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }
    if (includeCustom && req.user) {
        query.$or = [
            { isCustom: false },
            { isCustom: true, createdBy: req.user.id },
        ];
    }
    else {
        query.isCustom = false;
    }
    const exercises = await Exercise_1.default.find(query)
        .populate('createdBy', 'username firstName lastName')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);
    const total = await Exercise_1.default.countDocuments(query);
    const response = {
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
exports.getExercise = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const exercise = await Exercise_1.default.findById(req.params.id)
        .populate('createdBy', 'username firstName lastName');
    if (!exercise) {
        throw new errorHandler_1.AppError('Exercise not found', 404);
    }
    if (exercise.isCustom && exercise.createdBy && req.user?.id !== exercise.createdBy._id.toString()) {
        throw new errorHandler_1.AppError('Access denied to this custom exercise', 403);
    }
    const response = {
        success: true,
        message: 'Exercise retrieved successfully',
        data: { exercise },
    };
    res.json(response);
});
exports.createExercise = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { name, category, muscleGroups, equipment, instructions, difficulty } = req.body;
    const existingExercise = await Exercise_1.default.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        $or: [
            { isCustom: false },
            { isCustom: true, createdBy: req.user.id },
        ],
    });
    if (existingExercise) {
        throw new errorHandler_1.AppError('Exercise with this name already exists', 400);
    }
    const exercise = await Exercise_1.default.create({
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
    const response = {
        success: true,
        message: 'Custom exercise created successfully',
        data: { exercise },
    };
    res.status(201).json(response);
});
exports.updateExercise = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const exercise = await Exercise_1.default.findOne({
        _id: req.params.id,
        isCustom: true,
        createdBy: req.user.id,
    });
    if (!exercise) {
        throw new errorHandler_1.AppError('Custom exercise not found or unauthorized', 404);
    }
    const { name, category, muscleGroups, equipment, instructions, difficulty } = req.body;
    if (name && name !== exercise.name) {
        const existingExercise = await Exercise_1.default.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            _id: { $ne: req.params.id },
            $or: [
                { isCustom: false },
                { isCustom: true, createdBy: req.user.id },
            ],
        });
        if (existingExercise) {
            throw new errorHandler_1.AppError('Exercise with this name already exists', 400);
        }
    }
    const updatedExercise = await Exercise_1.default.findByIdAndUpdate(req.params.id, {
        ...(name && { name }),
        ...(category && { category }),
        ...(muscleGroups && { muscleGroups }),
        ...(equipment !== undefined && { equipment }),
        ...(instructions !== undefined && { instructions }),
        ...(difficulty && { difficulty }),
    }, { new: true, runValidators: true }).populate('createdBy', 'username firstName lastName');
    const response = {
        success: true,
        message: 'Custom exercise updated successfully',
        data: { exercise: updatedExercise },
    };
    res.json(response);
});
exports.deleteExercise = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const exercise = await Exercise_1.default.findOne({
        _id: req.params.id,
        isCustom: true,
        createdBy: req.user.id,
    });
    if (!exercise) {
        throw new errorHandler_1.AppError('Custom exercise not found or unauthorized', 404);
    }
    await Exercise_1.default.findByIdAndDelete(req.params.id);
    const response = {
        success: true,
        message: 'Custom exercise deleted successfully',
    };
    res.json(response);
});
exports.getExerciseCategories = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const categories = await Exercise_1.default.distinct('category');
    const response = {
        success: true,
        message: 'Exercise categories retrieved successfully',
        data: { categories },
    };
    res.json(response);
});
exports.getMuscleGroups = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const muscleGroups = await Exercise_1.default.distinct('muscleGroups');
    const response = {
        success: true,
        message: 'Muscle groups retrieved successfully',
        data: { muscleGroups },
    };
    res.json(response);
});
exports.getEquipmentTypes = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const equipment = await Exercise_1.default.distinct('equipment');
    const response = {
        success: true,
        message: 'Equipment types retrieved successfully',
        data: { equipment },
    };
    res.json(response);
});
//# sourceMappingURL=exerciseController.js.map