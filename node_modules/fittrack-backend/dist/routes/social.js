"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const socialController_1 = require("../controllers/socialController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/feed', auth_1.authenticate, validation_1.validatePagination, socialController_1.getFeed);
router.get('/discover', auth_1.optionalAuth, validation_1.validatePagination, socialController_1.getDiscoverPosts);
router.get('/users/:id/posts', auth_1.optionalAuth, validation_1.validateObjectId, validation_1.validatePagination, socialController_1.getUserPosts);
router.post('/posts', auth_1.authenticate, validation_1.validatePost, socialController_1.createPost);
router.get('/posts/:id', auth_1.optionalAuth, validation_1.validateObjectId, socialController_1.getPost);
router.put('/posts/:id', auth_1.authenticate, validation_1.validateObjectId, socialController_1.updatePost);
router.delete('/posts/:id', auth_1.authenticate, validation_1.validateObjectId, socialController_1.deletePost);
router.post('/posts/:id/like', auth_1.authenticate, validation_1.validateObjectId, socialController_1.toggleLike);
router.post('/posts/:id/comments', auth_1.authenticate, validation_1.validateObjectId, validation_1.validateComment, socialController_1.addComment);
router.delete('/posts/:id/comments/:commentId', auth_1.authenticate, validation_1.validateObjectId, socialController_1.deleteComment);
exports.default = router;
//# sourceMappingURL=social.js.map