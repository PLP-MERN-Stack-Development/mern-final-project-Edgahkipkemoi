"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = exports.getUserFollowing = exports.getUserFollowers = exports.unfollowUser = exports.followUser = exports.searchUsers = exports.getUser = exports.updateProfile = exports.getProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const Workout_1 = __importDefault(require("../models/Workout"));
const Goal_1 = __importDefault(require("../models/Goal"));
const errorHandler_1 = require("../middleware/errorHandler");
exports.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const user = await User_1.default.findById(req.user.id)
        .populate('followers', 'username firstName lastName profilePicture')
        .populate('following', 'username firstName lastName profilePicture');
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    const response = {
        success: true,
        message: 'User profile retrieved successfully',
        data: { user },
    };
    res.json(response);
});
exports.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { firstName, lastName, dateOfBirth, gender, height, weight, activityLevel, profilePicture, } = req.body;
    const updatedUser = await User_1.default.findByIdAndUpdate(req.user.id, {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(dateOfBirth !== undefined && { dateOfBirth }),
        ...(gender && { gender }),
        ...(height !== undefined && { height }),
        ...(weight !== undefined && { weight }),
        ...(activityLevel && { activityLevel }),
        ...(profilePicture !== undefined && { profilePicture }),
    }, { new: true, runValidators: true }).populate('followers', 'username firstName lastName profilePicture')
        .populate('following', 'username firstName lastName profilePicture');
    const response = {
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser },
    };
    res.json(response);
});
exports.getUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { identifier } = req.params;
    let user;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        user = await User_1.default.findById(identifier);
    }
    else {
        user = await User_1.default.findOne({ username: identifier });
    }
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
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
    const response = {
        success: true,
        message: 'User retrieved successfully',
        data: { user: publicUser },
    };
    res.json(response);
});
exports.searchUsers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    if (!q || typeof q !== 'string') {
        throw new errorHandler_1.AppError('Search query is required', 400);
    }
    const searchRegex = new RegExp(q, 'i');
    const users = await User_1.default.find({
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
    const total = await User_1.default.countDocuments({
        $or: [
            { username: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex },
        ],
    });
    const response = {
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
exports.followUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { id } = req.params;
    if (id === req.user.id) {
        throw new errorHandler_1.AppError('You cannot follow yourself', 400);
    }
    const userToFollow = await User_1.default.findById(id);
    if (!userToFollow) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    const currentUser = await User_1.default.findById(req.user.id);
    if (!currentUser) {
        throw new errorHandler_1.AppError('Current user not found', 404);
    }
    if (currentUser.following.includes(userToFollow._id)) {
        throw new errorHandler_1.AppError('You are already following this user', 400);
    }
    currentUser.following.push(userToFollow._id);
    await currentUser.save();
    userToFollow.followers.push(currentUser._id);
    await userToFollow.save();
    const response = {
        success: true,
        message: 'User followed successfully',
    };
    res.json(response);
});
exports.unfollowUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { id } = req.params;
    const userToUnfollow = await User_1.default.findById(id);
    if (!userToUnfollow) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    const currentUser = await User_1.default.findById(req.user.id);
    if (!currentUser) {
        throw new errorHandler_1.AppError('Current user not found', 404);
    }
    if (!currentUser.following.includes(userToUnfollow._id)) {
        throw new errorHandler_1.AppError('You are not following this user', 400);
    }
    currentUser.following = currentUser.following.filter((followingId) => followingId.toString() !== userToUnfollow._id.toString());
    await currentUser.save();
    userToUnfollow.followers = userToUnfollow.followers.filter((followerId) => followerId.toString() !== currentUser._id.toString());
    await userToUnfollow.save();
    const response = {
        success: true,
        message: 'User unfollowed successfully',
    };
    res.json(response);
});
exports.getUserFollowers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const user = await User_1.default.findById(id)
        .populate({
        path: 'followers',
        select: 'username firstName lastName profilePicture',
        options: {
            skip,
            limit,
        },
    });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    const total = user.followers.length;
    const response = {
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
exports.getUserFollowing = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const user = await User_1.default.findById(id)
        .populate({
        path: 'following',
        select: 'username firstName lastName profilePicture',
        options: {
            skip,
            limit,
        },
    });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    const total = user.following.length;
    const response = {
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
exports.getDashboard = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const userId = req.user.id;
    const totalWorkouts = await Workout_1.default.countDocuments({ user: userId, isTemplate: false });
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    const thisWeekWorkouts = await Workout_1.default.countDocuments({
        user: userId,
        isTemplate: false,
        date: { $gte: thisWeekStart },
    });
    const totalGoals = await Goal_1.default.countDocuments({ user: userId });
    const completedGoals = await Goal_1.default.countDocuments({ user: userId, isCompleted: true });
    const activeGoals = await Goal_1.default.countDocuments({
        user: userId,
        isCompleted: false,
        targetDate: { $gte: new Date() }
    });
    const recentWorkouts = await Workout_1.default.find({ user: userId, isTemplate: false })
        .populate('exercises.exercise', 'name category')
        .sort({ date: -1 })
        .limit(5);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const upcomingGoals = await Goal_1.default.find({
        user: userId,
        isCompleted: false,
        targetDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
    })
        .sort({ targetDate: 1 })
        .limit(5);
    const response = {
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: {
            workoutStats: {
                total: totalWorkouts,
                thisWeek: thisWeekWorkouts,
            },
            goalStats: {
                total: totalGoals,
                completed: completedGoals,
                active: activeGoals,
                completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
            },
            recentWorkouts,
            upcomingGoals,
        },
    };
    res.json(response);
});
//# sourceMappingURL=userController.js.map