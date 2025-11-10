"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.post('/register', validation_1.validateUserRegistration, authController_1.register);
router.post('/login', validation_1.validateUserLogin, authController_1.login);
router.post('/refresh', auth_1.refreshToken);
router.post('/logout', auth_1.authenticate, authController_1.logout);
router.post('/logout-all', auth_1.authenticate, authController_1.logoutAll);
router.get('/me', auth_1.authenticate, authController_1.getMe);
router.put('/change-password', auth_1.authenticate, [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    validation_1.handleValidationErrors,
], authController_1.changePassword);
router.post('/verify-email', authController_1.verifyEmail);
router.post('/forgot-password', authController_1.forgotPassword);
exports.default = router;
//# sourceMappingURL=auth.js.map