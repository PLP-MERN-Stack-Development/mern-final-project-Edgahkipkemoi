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
const goalSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            validator: function (value) {
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
goalSchema.index({ user: 1, createdAt: -1 });
goalSchema.index({ user: 1, isCompleted: 1 });
goalSchema.index({ user: 1, type: 1 });
goalSchema.index({ targetDate: 1 });
goalSchema.virtual('progressPercentage').get(function () {
    if (this.targetValue === 0)
        return 0;
    const progress = Math.min((this.currentValue / this.targetValue) * 100, 100);
    return Math.round(progress);
});
goalSchema.virtual('daysRemaining').get(function () {
    const now = new Date();
    const target = new Date(this.targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
});
goalSchema.virtual('isOverdue').get(function () {
    return !this.isCompleted && new Date() > new Date(this.targetDate);
});
goalSchema.pre('save', function (next) {
    if (this.isCompleted && !this.completedAt) {
        this.completedAt = new Date();
    }
    if (!this.isCompleted && this.completedAt) {
        this.completedAt = undefined;
    }
    next();
});
goalSchema.set('toJSON', { virtuals: true });
exports.default = mongoose_1.default.model('Goal', goalSchema);
//# sourceMappingURL=Goal.js.map