import { Router } from 'express';
import {
    getFeed,
    getDiscoverPosts,
    getUserPosts,
    createPost,
    getPost,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment,
} from '../controllers/socialController';
import { authenticate, optionalAuth } from '../middleware/auth';
import {
    validatePost,
    validateComment,
    validateObjectId,
    validatePagination,
} from '../middleware/validation';

const router = Router();

/**
 * Social Routes
 * Handles social features like posts, likes, and comments
 */

// @route   GET /api/social/feed
// @desc    Get feed posts from followed users
// @access  Private
router.get('/feed', authenticate, validatePagination, getFeed);

// @route   GET /api/social/discover
// @desc    Get public posts for discovery
// @access  Public
router.get('/discover', optionalAuth, validatePagination, getDiscoverPosts);

// @route   GET /api/social/users/:id/posts
// @desc    Get posts by specific user
// @access  Public
router.get('/users/:id/posts', optionalAuth, validateObjectId, validatePagination, getUserPosts);

// @route   POST /api/social/posts
// @desc    Create new post
// @access  Private
router.post('/posts', authenticate, validatePost, createPost);

// @route   GET /api/social/posts/:id
// @desc    Get single post by ID
// @access  Public
router.get('/posts/:id', optionalAuth, validateObjectId, getPost);

// @route   PUT /api/social/posts/:id
// @desc    Update post
// @access  Private
router.put('/posts/:id', authenticate, validateObjectId, updatePost);

// @route   DELETE /api/social/posts/:id
// @desc    Delete post
// @access  Private
router.delete('/posts/:id', authenticate, validateObjectId, deletePost);

// @route   POST /api/social/posts/:id/like
// @desc    Like/Unlike post
// @access  Private
router.post('/posts/:id/like', authenticate, validateObjectId, toggleLike);

// @route   POST /api/social/posts/:id/comments
// @desc    Add comment to post
// @access  Private
router.post('/posts/:id/comments', authenticate, validateObjectId, validateComment, addComment);

// @route   DELETE /api/social/posts/:id/comments/:commentId
// @desc    Delete comment from post
// @access  Private
router.delete('/posts/:id/comments/:commentId', authenticate, validateObjectId, deleteComment);

export default router;