"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const goalController_1 = require("../controllers/goalController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.get('/stats', auth_1.authenticate, goalController_1.getGoalStats);
router.get('/', auth_1.authenticate, validation_1.validatePagination, goalController_1.getGoals);
router.post('/', auth_1.authenticate, validation_1.validateGoal, goalController_1.createGoal);
router.get('/:id', auth_1.authenticate, validation_1.validateObjectId, goalController_1.getGoal);
router.put('/:id', auth_1.authenticate, validation_1.validateObjectId, goalController_1.updateGoal);
router.patch('/:id/progress', auth_1.authenticate, validation_1.validateObjectId, [
    (0, express_validator_1.body)('currentValue')
        .isFloat({ min: 0 })
        .withMessage('Current value must be a non-negative number'),
    validation_1.handleValidationErrors,
], goalController_1.updateGoalProgress);
router.delete('/:id', auth_1.authenticate, validation_1.validateObjectId, goalController_1.deleteGoal);
exports.default = router;
//# sourceMappingURL=goals.js.map