import mongoose, { Schema } from 'mongoose';
import { IWorkout, IWorkoutExercise } from '../types';

/**
 * Workout Exercise Sub-schema
 * Represents an exercise within a workout with sets and performance data
 */
const workoutExerciseSchema = new Schema<IWorkoutExercise>({
    exercise: {
        type: Schema.Types.ObjectId,
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

/**
 * Workout Schema for storing workout sessions
 * Supports both completed workouts and workout templates
 */
const workoutSchema = new Schema<IWorkout>({
    user: {
        type: Schema.Types.ObjectId,
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

// Indexes for better query performance
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ user: 1, isTemplate: 1 });
workoutSchema.index({ isPublic: 1, createdAt: -1 });
workoutSchema.index({ tags: 1 });
workoutSchema.index({ name: 'text', description: 'text' });

// Virtual for calculating total sets
workoutSchema.virtual('totalSets').get(function () {
    return this.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
});

// Virtual for calculating completed sets
workoutSchema.virtual('completedSets').get(function () {
    return this.exercises.reduce((total, exercise) => {
        return total + exercise.sets.filter(set => set.completed).length;
    }, 0);
});

// Virtual for calculating workout completion percentage
workoutSchema.virtual('completionPercentage').get(function () {
    const totalSets = this.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
    if (totalSets === 0) return 0;
    const completedSets = this.exercises.reduce((total, exercise) => {
        return total + exercise.sets.filter(set => set.completed).length;
    }, 0);
    return Math.round((completedSets / totalSets) * 100);
});

// Ensure virtuals are included in JSON output
workoutSchema.set('toJSON', { virtuals: true });

export default mongoose.model<IWorkout>('Workout', workoutSchema);