import { Response } from 'express';
import Post from '../models/Post';
import User from '../models/User';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';

/**
 * Social Controller
 * Handles social features like posts, likes, and comments
 */

/**
 * @desc    Get feed posts (from followed users)
 * @route   GET /api/social/feed
 * @access  Private
 */
export const getFeed = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get current user's following list
    const currentUser = await User.findById(req.user.id).select('following');
    if (!currentUser) {
        throw new AppError('User not found', 404);
    }

    // Include user's own posts and posts from followed users
    const userIds = [...currentUser.following, currentUser._id];

    const posts = await Post.find({
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

    const total = await Post.countDocuments({
        user: { $in: userIds },
        isPublic: true,
    });

    const response: ApiResponse = {
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

/**
 * @desc    Get public posts (discover)
 * @route   GET /api/social/discover
 * @access  Public
 */
export const getDiscoverPosts = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isPublic: true })
        .populate('user', 'username firstName lastName profilePicture')
        .populate('workout', 'name exercises duration caloriesBurned')
        .populate('likes', 'username firstName lastName')
        .populate('comments.user', 'username firstName lastName profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Post.countDocuments({ isPublic: true });

    const response: ApiResponse = {
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

/**
 * @desc    Get user's posts
 * @route   GET /api/social/users/:id/posts
 * @access  Public
 */
export const getUserPosts = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // If viewing own posts, show all; otherwise, only public posts
    const query: any = { user: id };
    if (!req.user || req.user.id !== id) {
        query.isPublic = true;
    }

    const posts = await Post.find(query)
        .populate('user', 'username firstName lastName profilePicture')
        .populate('workout', 'name exercises duration caloriesBurned')
        .populate('likes', 'username firstName lastName')
        .populate('comments.user', 'username firstName lastName profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Post.countDocuments(query);

    const response: ApiResponse = {
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

/**
 * @desc    Create new post
 * @route   POST /api/social/posts
 * @access  Private
 */
export const createPost = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const { content, workout, images, isPublic } = req.body;

    const post = await Post.create({
        user: req.user.id,
        content,
        workout: workout || undefined,
        images: images || [],
        isPublic: isPublic !== false, // Default to true
    });

    await post.populate([
        { path: 'user', select: 'username firstName lastName profilePicture' },
        { path: 'workout', select: 'name exercises duration caloriesBurned' },
    ]);

    const response: ApiResponse = {
        success: true,
        message: 'Post created successfully',
        data: { post },
    };

    res.status(201).json(response);
});

/**
 * @desc    Get single post
 * @route   GET /api/social/posts/:id
 * @access  Public
 */
export const getPost = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const post = await Post.findById(req.params.id)
        .populate('user', 'username firstName lastName profilePicture')
        .populate('workout', 'name exercises duration caloriesBurned')
        .populate('likes', 'username firstName lastName')
        .populate('comments.user', 'username firstName lastName profilePicture');

    if (!post) {
        throw new AppError('Post not found', 404);
    }

    // Check if user can view this post
    if (!post.isPublic && (!req.user || req.user.id !== post.user._id.toString())) {
        throw new AppError('Access denied to this post', 403);
    }

    const response: ApiResponse = {
        success: true,
        message: 'Post retrieved successfully',
        data: { post },
    };

    res.json(response);
});

/**
 * @desc    Update post
 * @route   PUT /api/social/posts/:id
 * @access  Private
 */
export const updatePost = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const post = await Post.findOne({
        _id: req.params.id,
        user: req.user.id,
    });

    if (!post) {
        throw new AppError('Post not found or unauthorized', 404);
    }

    const { content, images, isPublic } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        {
            ...(content && { content }),
            ...(images !== undefined && { images }),
            ...(isPublic !== undefined && { isPublic }),
        },
        { new: true, runValidators: true }
    ).populate([
        { path: 'user', select: 'username firstName lastName profilePicture' },
        { path: 'workout', select: 'name exercises duration caloriesBurned' },
        { path: 'likes', select: 'username firstName lastName' },
        { path: 'comments.user', select: 'username firstName lastName profilePicture' },
    ]);

    const response: ApiResponse = {
        success: true,
        message: 'Post updated successfully',
        data: { post: updatedPost },
    };

    res.json(response);
});

/**
 * @desc    Delete post
 * @route   DELETE /api/social/posts/:id
 * @access  Private
 */
export const deletePost = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const post = await Post.findOne({
        _id: req.params.id,
        user: req.user.id,
    });

    if (!post) {
        throw new AppError('Post not found or unauthorized', 404);
    }

    await Post.findByIdAndDelete(req.params.id);

    const response: ApiResponse = {
        success: true,
        message: 'Post deleted successfully',
    };

    res.json(response);
});

/**
 * @desc    Like/Unlike post
 * @route   POST /api/social/posts/:id/like
 * @access  Private
 */
export const toggleLike = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
        throw new AppError('Post not found', 404);
    }

    const userId = req.user.id;
    const isLiked = post.likes.includes(userId as any);

    if (isLiked) {
        // Unlike
        post.likes = post.likes.filter(like => like.toString() !== userId);
    } else {
        // Like
        post.likes.push(userId as any);
    }

    await post.save();

    const response: ApiResponse = {
        success: true,
        message: isLiked ? 'Post unliked successfully' : 'Post liked successfully',
        data: {
            liked: !isLiked,
            likeCount: post.likes.length,
        },
    };

    res.json(response);
});

/**
 * @desc    Add comment to post
 * @route   POST /api/social/posts/:id/comments
 * @access  Private
 */
export const addComment = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const { content } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
        throw new AppError('Post not found', 404);
    }

    const comment = {
        user: req.user.id as any,
        content,
        createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    // Populate the new comment
    await post.populate('comments.user', 'username firstName lastName profilePicture');

    const newComment = post.comments[post.comments.length - 1];

    const response: ApiResponse = {
        success: true,
        message: 'Comment added successfully',
        data: { comment: newComment },
    };

    res.status(201).json(response);
});

/**
 * @desc    Delete comment from post
 * @route   DELETE /api/social/posts/:id/comments/:commentId
 * @access  Private
 */
export const deleteComment = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        throw new AppError('User not authenticated', 401);
    }

    const { id, commentId } = req.params;

    const post = await Post.findById(id);

    if (!post) {
        throw new AppError('Post not found', 404);
    }

    const commentIndex = post.comments.findIndex(c => (c as any)._id?.toString() === commentId);

    if (commentIndex === -1) {
        throw new AppError('Comment not found', 404);
    }

    const comment = post.comments[commentIndex];

    // Check if user owns the comment or the post
    if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
        throw new AppError('Unauthorized to delete this comment', 403);
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    const response: ApiResponse = {
        success: true,
        message: 'Comment deleted successfully',
    };

    res.json(response);
});