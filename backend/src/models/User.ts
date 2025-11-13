import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../types';

/**
 * User Schema with comprehensive validation and security features
 * Includes password hashing, JWT token generation, and social features
 */
const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false, // Don't include password in queries by default
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    dateOfBirth: {
        type: Date,
        validate: {
            validator: function (value: Date) {
                return !value || value < new Date();
            },
            message: 'Date of birth cannot be in the future',
        },
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
    },
    height: {
        type: Number,
        min: [50, 'Height must be at least 50 cm'],
        max: [300, 'Height cannot exceed 300 cm'],
    },
    weight: {
        type: Number,
        min: [20, 'Weight must be at least 20 kg'],
        max: [500, 'Weight cannot exceed 500 kg'],
    },
    activityLevel: {
        type: String,
        enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
        default: 'moderately_active',
    },
    profilePicture: {
        type: String,
        default: '',
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    refreshTokens: [{
        type: String,
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    // Streak tracking
    currentStreak: {
        type: Number,
        default: 0,
    },
    longestStreak: {
        type: Number,
        default: 0,
    },
    lastActivityDate: {
        type: Date,
    },
    totalWorkoutsCompleted: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete (ret as any).password;
            delete (ret as any).refreshTokens;
            return ret;
        },
    },
});

// Indexes for better query performance (unique indexes already defined in schema)
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12 (secure but not too slow)
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Instance method to generate JWT tokens
userSchema.methods.generateTokens = function (): { accessToken: string; refreshToken: string } {
    const payload = {
        id: this._id,
        email: this.email,
        username: this.username,
    };

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as SignOptions
    );

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as SignOptions
    );

    return { accessToken, refreshToken };
};

// Static method to find user by email or username
userSchema.statics.findByEmailOrUsername = function (identifier: string) {
    return this.findOne({
        $or: [
            { email: identifier.toLowerCase() },
            { username: identifier },
        ],
    }).select('+password');
};

export default mongoose.model<IUser>('User', userSchema);