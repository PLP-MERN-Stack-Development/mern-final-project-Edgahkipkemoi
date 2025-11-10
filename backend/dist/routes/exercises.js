"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exerciseController_1 = require("../controllers/exerciseController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/categories', exerciseController_1.getExerciseCategories);
router.get('/muscle-groups', exerciseController_1.getMuscleGroups);
router.get('/equipment', exerciseController_1.getEquipmentTypes);
router.get('/', auth_1.optionalAuth, validation_1.validatePagination, exerciseController_1.getExercises);
router.post('/', auth_1.authenticate, validation_1.validateExercise, exerciseController_1.createExercise);
router.get('/:id', auth_1.optionalAuth, validation_1.validateObjectId, exerciseController_1.getExercise);
router.put('/:id', auth_1.authenticate, validation_1.validateObjectId, exerciseController_1.updateExercise);
router.delete('/:id', auth_1.authenticate, validation_1.validateObjectId, exerciseController_1.deleteExercise);
exports.default = router;
//# sourceMappingURL=exercises.js.map