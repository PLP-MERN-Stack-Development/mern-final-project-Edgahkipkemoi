import { Response } from 'express';
import User from '../models/User';
import Workout from '../models/Workout';
import Goal from '../models/Goal';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';

/**
 * User Controller
 * Handles user profile management and user-related operations
 */

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const user = await User.findById(req.user.id)
        .populate('followers', 'username firstName lastName profilePicture')
        .populate('following', 'username firstName lastName profilePicture');

    if (!user) {
        throw new AppError('User not found', 404);
    }

    const response: ApiResponse = {
        success: true,
        message: 'User profile retrieved successfully',
        data: { user },
    };

    res.json(response);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        height,
        weight,
        activityLevel,
        profilePicture,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(dateOfBirth !== undefined && { dateOfBirth }),
            ...(gender && { gender }),
            ...(height !== undefined && { height }),
            ...(weight !== undefined && { weight }),
            ...(activityLevel && { activityLevel }),
            ...(profilePicture !== undefined && { profilePicture }),
        },
        { new: true, runValidators: true }
    ).populate('followers', 'username firstName lastName profilePicture')
        .populate('following', 'username firstName lastName profilePicture');

    const response: ApiResponse = {
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser },
    };

    res.json(response);
});

/**
 * @desc    Get user by ID or username
 * @route   GET /api/users/:identifier
 * @access  Public
 */
export const getUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { identifier } = req.params;

    // Try to find by ID first, then by username
    let user;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        // It's a valid ObjectId
        user = await User.findById(identifier);
    } else {
        // It's a username
        user = await User.findOne({ username: identifier });
    }

    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Get public user data (exclude sensitive information)
    const publicUser = {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        followers: user.followers.length,
        following: user.following.length,
    };

    const response: ApiResponse = {
        success: true,
        message: 'User retrieved successfully',
        data: { user: publicUser },
    };

    res.json(response);
});

/**
 * @desc    Search users
 * @route   GET /api/users/search
 * @access  Public
 */
export const searchUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { q } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!q || typeof q !== 'string') {
        throw new AppError('Search query is required', 400);
    }

    const searchRegex = new RegExp(q, 'i');

    const users = await User.find({
        $or: [
            { username: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex },
        ],
    })
        .select('username firstName lastName profilePicture createdAt')
        .sort({ username: 1 })
        .skip(skip)
        .limit(limit);

    const total = await User.countDocuments({
        $or: [
            { username: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex },
        ],
    });

    const response: ApiResponse = {
        success: true,
        message: 'Users found successfully',
        data: { users },
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
 * @desc    Follow a user
 * @route   POST /api/users/:id/follow
 * @access  Private
 */
export const followUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;

    if (id === req.user.id) {
        throw new AppError('You cannot follow yourself', 400);
    }

    const userToFollow = await User.findById(id);
    if (!userToFollow) {
        throw new AppError('User not found', 404);
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
        throw new AppError('Current user not found', 404);
    }

    // Check if already following
    if (currentUser.following.includes(userToFollow._id)) {
        throw new AppError('You are already following this user', 400);
    }

    // Add to following list
    currentUser.following.push(userToFollow._id);
    await currentUser.save();

    // Add to followers list
    userToFollow.followers.push(currentUser._id);
    await userToFollow.save();

    const response: ApiResponse = {
        success: true,
        message: 'User followed successfully',
    };

    res.json(response);
});

/**
 * @desc    Unfollow a user
 * @route   DELETE /api/users/:id/follow
 * @access  Private
 */
export const unfollowUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;

    const userToUnfollow = await User.findById(id);
    if (!userToUnfollow) {
        throw new AppError('User not found', 404);
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
        throw new AppError('Current user not found', 404);
    }

    // Check if actually following
    if (!currentUser.following.includes(userToUnfollow._id)) {
        throw new AppError('You are not following this user', 400);
    }

    // Remove from following list
    currentUser.following = currentUser.following.filter(
        (followingId) => followingId.toString() !== userToUnfollow._id.toString()
    );
    await currentUser.save();

    // Remove from followers list
    userToUnfollow.followers = userToUnfollow.followers.filter(
        (followerId) => followerId.toString() !== currentUser._id.toString()
    );
    await userToUnfollow.save();

    const response: ApiResponse = {
        success: true,
        message: 'User unfollowed successfully',
    };

    res.json(response);
});

/**
 * @desc    Get user's followers
 * @route   GET /api/users/:id/followers
 * @access  Public
 */
export const getUserFollowers = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(id)
        .populate({
            path: 'followers',
            select: 'username firstName lastName profilePicture',
            options: {
                skip,
                limit,
            },
        });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    const total = user.followers.length;

    const response: ApiResponse = {
        success: true,
        message: 'Followers retrieved successfully',
        data: { followers: user.followers },
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
 * @desc    Get user's following
 * @route   GET /api/users/:id/following
 * @access  Public
 */
export const getUserFollowing = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(id)
        .populate({
            path: 'following',
            select: 'username firstName lastName profilePicture',
            options: {
                skip,
                limit,
            },
        });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    const total = user.following.length;

    const response: ApiResponse = {
        success: true,
        message: 'Following retrieved successfully',
        data: { following: user.following },
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
 * @desc    Get dashboard data with streak tracking
 * @route   GET /api/users/dashboard
 * @access  Private
 */
export const getDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const userId = req.user.id;

    // Get user with streak info
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Calculate date ranges
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get workout stats with parallel queries
    const [
        totalWorkouts,
        thisWeekWorkouts,
        thisMonthWorkouts,
        totalGoals,
        completedGoals,
        activeGoals,
        recentWorkouts,
        upcomingGoals,
        weeklyWorkoutData
    ] = await Promise.all([
        Workout.countDocuments({ user: userId, isTemplate: false }),
        Workout.countDocuments({ user: userId, isTemplate: false, date: { $gte: startOfWeek } }),
        Workout.countDocuments({ user: userId, isTemplate: false, date: { $gte: startOfMonth } }),
        Goal.countDocuments({ user: userId }),
        Goal.countDocuments({ user: userId, isCompleted: true }),
        Goal.countDocuments({ user: userId, isCompleted: false }),
        Workout.find({ user: userId, isTemplate: false })
            .sort({ date: -1 })
            .limit(5)
            .select('name date duration caloriesBurned')
            .lean(),
        Goal.find({
            user: userId,
            isCompleted: false,
            targetDate: { $gte: now }
        })
            .sort({ targetDate: 1 })
            .limit(5)
            .select('title targetDate currentValue targetValue unit')
            .lean(),
        // Get workouts for the last 7 days
        Workout.aggregate([
            {
                $match: {
                    user: user._id,
                    isTemplate: false,
                    date: { $gte: startOfWeek }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: '$date' },
                    count: { $sum: 1 },
                    totalDuration: { $sum: '$duration' },
                    totalCalories: { $sum: '$caloriesBurned' }
                }
            }
        ])
    ]);

    // Format weekly data for chart
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = weekDays.map((day, index) => {
        const dayData = weeklyWorkoutData.find((d: any) => d._id === index + 1);
        return {
            day,
            workouts: dayData?.count || 0,
            duration: dayData?.totalDuration || 0,
            calories: dayData?.totalCalories || 0
        };
    });

    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    const response: ApiResponse = {
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: {
            workoutStats: {
                total: totalWorkouts,
                thisWeek: thisWeekWorkouts,
                thisMonth: thisMonthWorkouts
            },
            goalStats: {
                total: totalGoals,
                completed: completedGoals,
                active: activeGoals,
                completionRate
            },
            streakStats: {
                current: user.currentStreak,
                longest: user.longestStreak,
                totalWorkouts: user.totalWorkoutsCompleted
            },
            recentWorkouts,
            upcomingGoals,
            weeklyData
        }
    };

    res.json(response);
});
