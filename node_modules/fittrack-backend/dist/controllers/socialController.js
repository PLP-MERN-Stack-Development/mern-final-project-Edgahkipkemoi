"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.addComment = exports.toggleLike = exports.deletePost = exports.updatePost = exports.getPost = exports.createPost = exports.getUserPosts = exports.getDiscoverPosts = exports.getFeed = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("../middleware/errorHandler");
exports.getFeed = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const currentUser = await User_1.default.findById(req.user.id).select('following');
    if (!currentUser) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    const userIds = [...currentUser.following, currentUser._id];
    const posts = await Post_1.default.find({
        user: { $in: userIds },
        isPublic: true,
    })
        .populate('user', 'username firstName lastName profilePicture')
        .populate('workout', 'name exercises duration caloriesBurned')
        .populate('likes', 'username firstName lastName')
        .populate('comments.user', 'username firstName lastName profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Post_1.default.countDocuments({
        user: { $in: userIds },
        isPublic: true,
    });
    const response = {
        success: true,
        message: 'Feed retrieved successfully',
        data: { posts },
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
    res.json(response);
});
exports.getDiscoverPosts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const posts = await Post_1.default.find({ isPublic: true })
        .populate('user', 'username firstName lastName profilePicture')
        .populate('workout', 'name exercises duration caloriesBurned')
        .populate('likes', 'username firstName lastName')
        .populate('comments.user', 'username firstName lastName profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Post_1.default.countDocuments({ isPublic: true });
    const response = {
        success: true,
        message: 'Discover posts retrieved successfully',
        data: { posts },
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
    res.json(response);
});
exports.getUserPosts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const user = await User_1.default.findById(id);
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    const query = { user: id };
    if (!req.user || req.user.id !== id) {
        query.isPublic = true;
    }
    const posts = await Post_1.default.find(query)
        .populate('user', 'username firstName lastName profilePicture')
        .populate('workout', 'name exercises duration caloriesBurned')
        .populate('likes', 'username firstName lastName')
        .populate('comments.user', 'username firstName lastName profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Post_1.default.countDocuments(query);
    const response = {
        success: true,
        message: 'User posts retrieved successfully',
        data: { posts },
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
    res.json(response);
});
exports.createPost = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { content, workout, images, isPublic } = req.body;
    const post = await Post_1.default.create({
        user: req.user.id,
        content,
        workout: workout || undefined,
        images: images || [],
        isPublic: isPublic !== false,
    });
    await post.populate([
        { path: 'user', select: 'username firstName lastName profilePicture' },
        { path: 'workout', select: 'name exercises duration caloriesBurned' },
    ]);
    const response = {
        success: true,
        message: 'Post created successfully',
        data: { post },
    };
    res.status(201).json(response);
});
exports.getPost = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const post = await Post_1.default.findById(req.params.id)
        .populate('user', 'username firstName lastName profilePicture')
        .populate('workout', 'name exercises duration caloriesBurned')
        .populate('likes', 'username firstName lastName')
        .populate('comments.user', 'username firstName lastName profilePicture');
    if (!post) {
        throw new errorHandler_1.AppError('Post not found', 404);
    }
    if (!post.isPublic && (!req.user || req.user.id !== post.user._id.toString())) {
        throw new errorHandler_1.AppError('Access denied to this post', 403);
    }
    const response = {
        success: true,
        message: 'Post retrieved successfully',
        data: { post },
    };
    res.json(response);
});
exports.updatePost = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const post = await Post_1.default.findOne({
        _id: req.params.id,
        user: req.user.id,
    });
    if (!post) {
        throw new errorHandler_1.AppError('Post not found or unauthorized', 404);
    }
    const { content, images, isPublic } = req.body;
    const updatedPost = await Post_1.default.findByIdAndUpdate(req.params.id, {
        ...(content && { content }),
        ...(images !== undefined && { images }),
        ...(isPublic !== undefined && { isPublic }),
    }, { new: true, runValidators: true }).populate([
        { path: 'user', select: 'username firstName lastName profilePicture' },
        { path: 'workout', select: 'name exercises duration caloriesBurned' },
        { path: 'likes', select: 'username firstName lastName' },
        { path: 'comments.user', select: 'username firstName lastName profilePicture' },
    ]);
    const response = {
        success: true,
        message: 'Post updated successfully',
        data: { post: updatedPost },
    };
    res.json(response);
});
exports.deletePost = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const post = await Post_1.default.findOne({
        _id: req.params.id,
        user: req.user.id,
    });
    if (!post) {
        throw new errorHandler_1.AppError('Post not found or unauthorized', 404);
    }
    await Post_1.default.findByIdAndDelete(req.params.id);
    const response = {
        success: true,
        message: 'Post deleted successfully',
    };
    res.json(response);
});
exports.toggleLike = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const post = await Post_1.default.findById(req.params.id);
    if (!post) {
        throw new errorHandler_1.AppError('Post not found', 404);
    }
    const userId = req.user.id;
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
        post.likes = post.likes.filter(like => like.toString() !== userId);
    }
    else {
        post.likes.push(userId);
    }
    await post.save();
    const response = {
        success: true,
        message: isLiked ? 'Post unliked successfully' : 'Post liked successfully',
        data: {
            liked: !isLiked,
            likeCount: post.likes.length,
        },
    };
    res.json(response);
});
exports.addComment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { content } = req.body;
    const post = await Post_1.default.findById(req.params.id);
    if (!post) {
        throw new errorHandler_1.AppError('Post not found', 404);
    }
    const comment = {
        user: req.user.id,
        content,
        createdAt: new Date(),
    };
    post.comments.push(comment);
    await post.save();
    await post.populate('comments.user', 'username firstName lastName profilePicture');
    const newComment = post.comments[post.comments.length - 1];
    const response = {
        success: true,
        message: 'Comment added successfully',
        data: { comment: newComment },
    };
    res.status(201).json(response);
});
exports.deleteComment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { id, commentId } = req.params;
    const post = await Post_1.default.findById(id);
    if (!post) {
        throw new errorHandler_1.AppError('Post not found', 404);
    }
    const commentIndex = post.comments.findIndex(c => c._id?.toString() === commentId);
    if (commentIndex === -1) {
        throw new errorHandler_1.AppError('Comment not found', 404);
    }
    const comment = post.comments[commentIndex];
    if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
        throw new errorHandler_1.AppError('Unauthorized to delete this comment', 403);
    }
    post.comments.splice(commentIndex, 1);
    await post.save();
    const response = {
        success: true,
        message: 'Comment deleted successfully',
    };
    res.json(response);
});
//# sourceMappingURL=socialController.js.map