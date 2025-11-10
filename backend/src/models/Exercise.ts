import mongoose, { Schema } from 'mongoose';
import { IExercise } from '../types';

/**
 * Exercise Schema for storing exercise definitions
 * Supports both system-defined and user-created custom exercises
 */
const exerciseSchema = new Schema<IExercise>({
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
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: function (this: IExercise) {
            return this.isCustom;
        },
    },
}, {
    timestamps: true,
});

// Indexes for better query performance
exerciseSchema.index({ name: 1 });
exerciseSchema.index({ category: 1 });
exerciseSchema.index({ muscleGroups: 1 });
exerciseSchema.index({ difficulty: 1 });
exerciseSchema.index({ isCustom: 1, createdBy: 1 });

// Compound index for searching exercises
exerciseSchema.index({
    name: 'text',
    category: 1,
    muscleGroups: 1
});

export default mongoose.model<IExercise>('Exercise', exerciseSchema);