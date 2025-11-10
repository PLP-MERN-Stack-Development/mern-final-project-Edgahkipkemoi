import { Router } from 'express';
import {
    getProfile,
    updateProfile,
    getUser,
    searchUsers,
    followUser,
    unfollowUser,
    getUserFollowers,
    getUserFollowing,
    getDashboard,
} from '../controllers/userController';
import { authenticate, optionalAuth } from '../middleware/auth';
import {
    validateUserUpdate,
    validateObjectId,
    validatePagination,
} from '../middleware/validation';

const router = Router();

/**
 * User Routes
 * Handles user profile management and social features
 */

// @route   GET /api/users/search
// @desc    Search users by username or name
// @access  Public
router.get('/search', validatePagination, searchUsers);

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', authenticate, getProfile);

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', authenticate, validateUserUpdate, updateProfile);

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', authenticate, getDashboard);

// @route   GET /api/users/:identifier
// @desc    Get user by ID or username
// @access  Public
router.get('/:identifier', getUser);

// @route   POST /api/users/:id/follow
// @desc    Follow a user
// @access  Private
router.post('/:id/follow', authenticate, validateObjectId, followUser);

// @route   DELETE /api/users/:id/follow
// @desc    Unfollow a user
// @access  Private
router.delete('/:id/follow', authenticate, validateObjectId, unfollowUser);

// @route   GET /api/users/:id/followers
// @desc    Get user's followers
// @access  Public
router.get('/:id/followers', validateObjectId, validatePagination, getUserFollowers);

// @route   GET /api/users/:id/following
// @desc    Get user's following
// @access  Public
router.get('/:id/following', validateObjectId, validatePagination, getUserFollowing);

export default router;