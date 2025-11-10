import mongoose, { Schema } from 'mongoose';
import { IGoal } from '../types';

/**
 * Goal Schema for tracking user fitness goals
 * Supports various goal types with progress tracking
 */
const goalSchema = new Schema<IGoal>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
    },
    title: {
        type: String,
        required: [true, 'Goal title is required'],
        trim: true,
        maxlength: [100, 'Goal title cannot exceed 100 characters'],
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    type: {
        type: String,
        required: [true, 'Goal type is required'],
        enum: {
            values: ['weight_loss', 'weight_gain', 'muscle_gain', 'endurance', 'strength', 'custom'],
            message: 'Goal type must be one of: weight_loss, weight_gain, muscle_gain, endurance, strength, custom',
        },
    },
    targetValue: {
        type: Number,
        required: [true, 'Target value is required'],
        min: [0, 'Target value cannot be negative'],
    },
    currentValue: {
        type: Number,
        default: 0,
        min: [0, 'Current value cannot be negative'],
    },
    unit: {
        type: String,
        required: [true, 'Unit is required'],
        trim: true,
        maxlength: [20, 'Unit cannot exceed 20 characters'],
        enum: {
            values: ['kg', 'lbs', 'minutes', 'hours', 'reps', 'sets', 'km', 'miles', 'calories', 'days', 'weeks', 'months', 'custom'],
            message: 'Invalid unit type',
        },
    },
    targetDate: {
        type: Date,
        required: [true, 'Target date is required'],
        validate: {
            validator: function (value: Date) {
                return value > new Date();
            },
            message: 'Target date must be in the future',
        },
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    completedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Indexes for better query performance
goalSchema.index({ user: 1, createdAt: -1 });
goalSchema.index({ user: 1, isCompleted: 1 });
goalSchema.index({ user: 1, type: 1 });
goalSchema.index({ targetDate: 1 });

// Virtual for calculating progress percentage
goalSchema.virtual('progressPercentage').get(function () {
    if (this.targetValue === 0) return 0;
    const progress = Math.min((this.currentValue / this.targetValue) * 100, 100);
    return Math.round(progress);
});

// Virtual for calculating days remaining
goalSchema.virtual('daysRemaining').get(function () {
    const now = new Date();
    const target = new Date(this.targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
});

// Virtual for checking if goal is overdue
goalSchema.virtual('isOverdue').get(function () {
    return !this.isCompleted && new Date() > new Date(this.targetDate);
});

// Pre-save middleware to set completion date
goalSchema.pre('save', function (next) {
    // If goal is being marked as completed and wasn't completed before
    if (this.isCompleted && !this.completedAt) {
        this.completedAt = new Date();
    }

    // If goal is being marked as not completed, remove completion date
    if (!this.isCompleted && this.completedAt) {
        this.completedAt = undefined;
    }

    next();
});

// Ensure virtuals are included in JSON output
goalSchema.set('toJSON', { virtuals: true });

export default mongoose.model<IGoal>('Goal', goalSchema);