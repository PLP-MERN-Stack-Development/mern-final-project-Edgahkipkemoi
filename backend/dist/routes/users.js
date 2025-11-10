"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/search', validation_1.validatePagination, userController_1.searchUsers);
router.get('/profile', auth_1.authenticate, userController_1.getProfile);
router.put('/profile', auth_1.authenticate, validation_1.validateUserUpdate, userController_1.updateProfile);
router.get('/dashboard', auth_1.authenticate, userController_1.getDashboard);
router.get('/:identifier', userController_1.getUser);
router.post('/:id/follow', auth_1.authenticate, validation_1.validateObjectId, userController_1.followUser);
router.delete('/:id/follow', auth_1.authenticate, validation_1.validateObjectId, userController_1.unfollowUser);
router.get('/:id/followers', validation_1.validateObjectId, validation_1.validatePagination, userController_1.getUserFollowers);
router.get('/:id/following', validation_1.validateObjectId, validation_1.validatePagination, userController_1.getUserFollowing);
exports.default = router;
//# sourceMappingURL=users.js.map