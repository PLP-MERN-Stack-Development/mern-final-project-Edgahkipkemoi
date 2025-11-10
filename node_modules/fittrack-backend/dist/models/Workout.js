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
const workoutExerciseSchema = new mongoose_1.Schema({
    exercise: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: [true, 'Exercise reference is required'],
    },
    sets: [{
            reps: {
                type: Number,
                min: [0, 'Reps cannot be negative'],
                max: [1000, 'Reps cannot exceed 1000'],
            },
            weight: {
                type: Number,
                min: [0, 'Weight cannot be negative'],
                max: [1000, 'Weight cannot exceed 1000 kg'],
            },
            duration: {
                type: Number,
                min: [0, 'Duration cannot be negative'],
                max: [86400, 'Duration cannot exceed 24 hours'],
            },
            distance: {
                type: Number,
                min: [0, 'Distance cannot be negative'],
                max: [1000000, 'Distance cannot exceed 1,000 km'],
            },
            restTime: {
                type: Number,
                min: [0, 'Rest time cannot be negative'],
                max: [3600, 'Rest time cannot exceed 1 hour'],
            },
            completed: {
                type: Boolean,
                default: false,
            },
        }],
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
}, { _id: false });
const workoutSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
    },
    name: {
        type: String,
        required: [true, 'Workout name is required'],
        trim: true,
        maxlength: [100, 'Workout name cannot exceed 100 characters'],
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    exercises: [workoutExerciseSchema],
    duration: {
        type: Number,
        min: [0, 'Duration cannot be negative'],
        max: [1440, 'Duration cannot exceed 24 hours'],
    },
    caloriesBurned: {
        type: Number,
        min: [0, 'Calories burned cannot be negative'],
        max: [10000, 'Calories burned seems unrealistic'],
    },
    date: {
        type: Date,
        required: [true, 'Workout date is required'],
        default: Date.now,
    },
    isTemplate: {
        type: Boolean,
        default: false,
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
    tags: [{
            type: String,
            trim: true,
            maxlength: [30, 'Tag cannot exceed 30 characters'],
        }],
}, {
    timestamps: true,
});
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ user: 1, isTemplate: 1 });
workoutSchema.index({ isPublic: 1, createdAt: -1 });
workoutSchema.index({ tags: 1 });
workoutSchema.index({ name: 'text', description: 'text' });
workoutSchema.virtual('totalSets').get(function () {
    return this.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
});
workoutSchema.virtual('completedSets').get(function () {
    return this.exercises.reduce((total, exercise) => {
        return total + exercise.sets.filter(set => set.completed).length;
    }, 0);
});
workoutSchema.virtual('completionPercentage').get(function () {
    const totalSets = this.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
    if (totalSets === 0)
        return 0;
    const completedSets = this.exercises.reduce((total, exercise) => {
        return total + exercise.sets.filter(set => set.completed).length;
    }, 0);
    return Math.round((completedSets / totalSets) * 100);
});
workoutSchema.set('toJSON', { virtuals: true });
exports.default = mongoose_1.default.model('Workout', workoutSchema);
//# sourceMappingURL=Workout.js.map