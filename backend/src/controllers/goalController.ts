import { Response } from 'express';
import Goal from '../models/Goal';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';

/**
 * Goal Controller
 * Handles CRUD operations for user fitness goals
 */

/**
 * @desc    Get all goals for authenticated user
 * @route   GET /api/goals
 * @access  Private
 */
export const getGoals = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const type = req.query.type as string;
    const status = req.query.status as string; // 'completed', 'active', 'overdue'

    // Build query
    const query: any = { user: req.user.id };

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

    const goals = await Goal.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Goal.countDocuments(query);

    const response: ApiResponse = {
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

/**
 * @desc    Get single goal by ID
 * @route   GET /api/goals/:id
 * @access  Private
 */
export const getGoal = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const goal = await Goal.findOne({
        _id: req.params.id,
        user: req.user.id,
    });

    if (!goal) {
        throw new AppError('Goal not found', 404);
    }

    const response: ApiResponse = {
        success: true,
        message: 'Goal retrieved successfully',
        data: { goal },
    };

    res.json(response);
});

/**
 * @desc    Create new goal
 * @route   POST /api/goals
 * @access  Private
 */
export const createGoal = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const { title, description, type, targetValue, unit, targetDate } = req.body;

    const goal = await Goal.create({
        user: req.user.id,
        title,
        description,
        type,
        targetValue,
        currentValue: 0,
        unit,
        targetDate,
    });

    const response: ApiResponse = {
        success: true,
        message: 'Goal created successfully',
        data: { goal },
    };

    res.status(201).json(response);
});

/**
 * @desc    Update goal
 * @route   PUT /api/goals/:id
 * @access  Private
 */
export const updateGoal = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const goal = await Goal.findOne({
        _id: req.params.id,
        user: req.user.id,
    });

    if (!goal) {
        throw new AppError('Goal not found', 404);
    }

    const { title, description, type, targetValue, currentValue, unit, targetDate, isCompleted } = req.body;

    const updatedGoal = await Goal.findByIdAndUpdate(
        req.params.id,
        {
            ...(title && { title }),
            ...(description !== undefined && { description }),
            ...(type && { type }),
            ...(targetValue !== undefined && { targetValue }),
            ...(currentValue !== undefined && { currentValue }),
            ...(unit && { unit }),
            ...(targetDate && { targetDate }),
            ...(isCompleted !== undefined && { isCompleted }),
        },
        { new: true, runValidators: true }
    );

    const response: ApiResponse = {
        success: true,
        message: 'Goal updated successfully',
        data: { goal: updatedGoal },
    };

    res.json(response);
});

/**
 * @desc    Update goal progress
 * @route   PATCH /api/goals/:id/progress
 * @access  Private
 */
export const updateGoalProgress = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const { currentValue } = req.body;

    if (typeof currentValue !== 'number' || currentValue < 0) {
        throw new AppError('Current value must be a non-negative number', 400);
    }

    const goal = await Goal.findOne({
        _id: req.params.id,
        user: req.user.id,
    });

    if (!goal) {
        throw new AppError('Goal not found', 404);
    }

    // Update current value
    goal.currentValue = currentValue;

    // Auto-complete goal if target is reached
    if (currentValue >= goal.targetValue && !goal.isCompleted) {
        goal.isCompleted = true;
        goal.completedAt = new Date();
    }

    await goal.save();

    const response: ApiResponse = {
        success: true,
        message: 'Goal progress updated successfully',
        data: { goal },
    };

    res.json(response);
});

/**
 * @desc    Delete goal
 * @route   DELETE /api/goals/:id
 * @access  Private
 */
export const deleteGoal = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const goal = await Goal.findOne({
        _id: req.params.id,
        user: req.user.id,
    });

    if (!goal) {
        throw new AppError('Goal not found', 404);
    }

    await Goal.findByIdAndDelete(req.params.id);

    const response: ApiResponse = {
        success: true,
        message: 'Goal deleted successfully',
    };

    res.json(response);
});

/**
 * @desc    Get goal statistics
 * @route   GET /api/goals/stats
 * @access  Private
 */
export const getGoalStats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const userId = req.user.id;

    // Get goal counts by status
    const totalGoals = await Goal.countDocuments({ user: userId });
    const completedGoals = await Goal.countDocuments({ user: userId, isCompleted: true });
    const activeGoals = await Goal.countDocuments({
        user: userId,
        isCompleted: false,
        targetDate: { $gte: new Date() }
    });
    const overdueGoals = await Goal.countDocuments({
        user: userId,
        isCompleted: false,
        targetDate: { $lt: new Date() }
    });

    // Get goals by type
    const goalsByType = await Goal.aggregate([
        { $match: { user: userId } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                completed: { $sum: { $cond: ['$isCompleted', 1, 0] } },
            },
        },
    ]);

    // Get recent completions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCompletions = await Goal.countDocuments({
        user: userId,
        isCompleted: true,
        completedAt: { $gte: thirtyDaysAgo },
    });

    const response: ApiResponse = {
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