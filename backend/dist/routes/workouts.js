"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workoutController_1 = require("../controllers/workoutController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/public', auth_1.optionalAuth, validation_1.validatePagination, workoutController_1.getPublicWorkouts);
router.get('/stats', auth_1.authenticate, workoutController_1.getWorkoutStats);
router.get('/', auth_1.authenticate, validation_1.validatePagination, workoutController_1.getWorkouts);
router.post('/', auth_1.authenticate, validation_1.validateWorkout, workoutController_1.createWorkout);
router.get('/:id', auth_1.authenticate, validation_1.validateObjectId, workoutController_1.getWorkout);
router.put('/:id', auth_1.authenticate, validation_1.validateObjectId, workoutController_1.updateWorkout);
router.delete('/:id', auth_1.authenticate, validation_1.validateObjectId, workoutController_1.deleteWorkout);
router.post('/:id/duplicate', auth_1.authenticate, validation_1.validateObjectId, workoutController_1.duplicateWorkout);
exports.default = router;
//# sourceMappingURL=workouts.js.map