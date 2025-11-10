"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const exerciseSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Exercise name is required'],
        trim: true,
        maxlength: [100, 'Exercise name cannot exceed 100 characters'],
    },
    category: {
        type: String,
        required: [true, 'Exercise category is required'],
        enum: {
            values: ['strength', 'cardio', 'flexibility', 'sports', 'other'],
            message: 'Category must be one of: strength, cardio, flexibility, sports, other',
        },
    },
    muscleGroups: [{
            type: String,
            required: true,
            trim: true,
            enum: {
                values: [
                    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
                    'abs', 'obliques', 'lower_back', 'quadriceps', 'hamstrings',
                    'glutes', 'calves', 'full_body', 'cardio'
                ],
                message: 'Invalid muscle group',
            },
        }],
    equipment: [{
            type: String,
            trim: true,
            enum: {
                values: [
                    'bodyweight', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands',
                    'pull_up_bar', 'bench', 'cable_machine', 'treadmill', 'stationary_bike',
                    'rowing_machine', 'elliptical', 'medicine_ball', 'foam_roller', 'other'
                ],
                message: 'Invalid equipment type',
            },
        }],
    instructions: {
        type: String,
        maxlength: [1000, 'Instructions cannot exceed 1000 characters'],
    },
    difficulty: {
        type: String,
        required: [true, 'Difficulty level is required'],
        enum: {
            values: ['beginner', 'intermediate', 'advanced'],
            message: 'Difficulty must be beginner, intermediate, or advanced',
        },
    },
    isCustom: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: function () {
            return this.isCustom;
        },
    },
}, {
    timestamps: true,
});
exerciseSchema.index({ name: 1 });
exerciseSchema.index({ category: 1 });
exerciseSchema.index({ muscleGroups: 1 });
exerciseSchema.index({ difficulty: 1 });
exerciseSchema.index({ isCustom: 1, createdBy: 1 });
exerciseSchema.index({
    name: 'text',
    category: 1,
    muscleGroups: 1
});
exports.default = mongoose_1.default.model('Exercise', exerciseSchema);
//# sourceMappingURL=Exercise.js.map