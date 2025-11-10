"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoalStats = exports.deleteGoal = exports.updateGoalProgress = exports.updateGoal = exports.createGoal = exports.getGoal = exports.getGoals = void 0;
const Goal_1 = __importDefault(require("../models/Goal"));
const errorHandler_1 = require("../middleware/errorHandler");
exports.getGoals = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const type = req.query.type;
    const status = req.query.status;
    const query = { user: req.user.id };
    if (type) {
        query.type = type;
    }
    if (status) {
        const now = new Date();
        switch (status) {
            case 'completed':
                query.isCompleted = true;
                break;
            case 'active':
                query.isCompleted = false;
                query.targetDate = { $gte: now };
                break;
            case 'overdue':
                query.isCompleted = false;
                query.targetDate = { $lt: now };
                break;
        }
    }
    const goals = await Goal_1.default.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Goal_1.default.countDocuments(query);
    const response = {
        success: true,
        message: 'Goals retrieved successfully',
        data: { goals },
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
    res.json(response);
});
exports.getGoal = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const goal = await Goal_1.default.findOne({
        _id: req.params.id,
        user: req.user.id,
    });
    if (!goal) {
        throw new errorHandler_1.AppError('Goal not found', 404);
    }
    const response = {
        success: true,
        message: 'Goal retrieved successfully',
        data: { goal },
    };
    res.json(response);
});
exports.createGoal = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { title, description, type, targetValue, unit, targetDate } = req.body;
    const goal = await Goal_1.default.create({
        user: req.user.id,
        title,
        description,
        type,
        targetValue,
        currentValue: 0,
        unit,
        targetDate,
    });
    const response = {
        success: true,
        message: 'Goal created successfully',
        data: { goal },
    };
    res.status(201).json(response);
});
exports.updateGoal = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const goal = await Goal_1.default.findOne({
        _id: req.params.id,
        user: req.user.id,
    });
    if (!goal) {
        throw new errorHandler_1.AppError('Goal not found', 404);
    }
    const { title, description, type, targetValue, currentValue, unit, targetDate, isCompleted } = req.body;
    const updatedGoal = await Goal_1.default.findByIdAndUpdate(req.params.id, {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(targetValue !== undefined && { targetValue }),
        ...(currentValue !== undefined && { currentValue }),
        ...(unit && { unit }),
        ...(targetDate && { targetDate }),
        ...(isCompleted !== undefined && { isCompleted }),
    }, { new: true, runValidators: true });
    const response = {
        success: true,
        message: 'Goal updated successfully',
        data: { goal: updatedGoal },
    };
    res.json(response);
});
exports.updateGoalProgress = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { currentValue } = req.body;
    if (typeof currentValue !== 'number' || currentValue < 0) {
        throw new errorHandler_1.AppError('Current value must be a non-negative number', 400);
    }
    const goal = await Goal_1.default.findOne({
        _id: req.params.id,
        user: req.user.id,
    });
    if (!goal) {
        throw new errorHandler_1.AppError('Goal not found', 404);
    }
    goal.currentValue = currentValue;
    if (currentValue >= goal.targetValue && !goal.isCompleted) {
        goal.isCompleted = true;
        goal.completedAt = new Date();
    }
    await goal.save();
    const response = {
        success: true,
        message: 'Goal progress updated successfully',
        data: { goal },
    };
    res.json(response);
});
exports.deleteGoal = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const goal = await Goal_1.default.findOne({
        _id: req.params.id,
        user: req.user.id,
    });
    if (!goal) {
        throw new errorHandler_1.AppError('Goal not found', 404);
    }
    await Goal_1.default.findByIdAndDelete(req.params.id);
    const response = {
        success: true,
        message: 'Goal deleted successfully',
    };
    res.json(response);
});
exports.getGoalStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const userId = req.user.id;
    const totalGoals = await Goal_1.default.countDocuments({ user: userId });
    const completedGoals = await Goal_1.default.countDocuments({ user: userId, isCompleted: true });
    const activeGoals = await Goal_1.default.countDocuments({
        user: userId,
        isCompleted: false,
        targetDate: { $gte: new Date() }
    });
    const overdueGoals = await Goal_1.default.countDocuments({
        user: userId,
        isCompleted: false,
        targetDate: { $lt: new Date() }
    });
    const goalsByType = await Goal_1.default.aggregate([
        { $match: { user: userId } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                completed: { $sum: { $cond: ['$isCompleted', 1, 0] } },
            },
        },
    ]);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCompletions = await Goal_1.default.countDocuments({
        user: userId,
        isCompleted: true,
        completedAt: { $gte: thirtyDaysAgo },
    });
    const response = {
        success: true,
        message: 'Goal statistics retrieved successfully',
        data: {
            totalGoals,
            completedGoals,
            activeGoals,
            overdueGoals,
            completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
            goalsByType,
            recentCompletions,
        },
    };
    res.json(response);
});
//# sourceMappingURL=goalController.js.map