import { Request } from 'express';
import { Document, Types } from 'mongoose';

// User related types
export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    height?: number; // in cm
    weight?: number; // in kg
    activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
    profilePicture?: string;
    isEmailVerified: boolean;
    refreshTokens: string[];
    followers: Types.ObjectId[];
    following: Types.ObjectId[];
    currentStreak: number;
    longestStreak: number;
    lastActivityDate?: Date;
    totalWorkoutsCompleted: number;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateTokens(): { accessToken: string; refreshToken: string };
}

// Exercise related types
export interface IExercise extends Document {
    _id: Types.ObjectId;
    name: string;
    category: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';
    muscleGroups: string[];
    equipment?: string[];
    instructions?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    isCustom: boolean;
    createdBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Workout related types
export interface IWorkoutExercise {
    exercise: Types.ObjectId;
    sets: {
        reps?: number;
        weight?: number; // in kg
        duration?: number; // in seconds
        distance?: number; // in meters
        restTime?: number; // in seconds
        completed: boolean;
    }[];
    notes?: string;
}

export interface IWorkout extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    name: string;
    description?: string;
    exercises: IWorkoutExercise[];
    duration?: number; // in minutes
    caloriesBurned?: number;
    date: Date;
    isTemplate: boolean;
    isPublic: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Goal related types
export interface IGoal extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    title: string;
    description?: string;
    type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'strength' | 'custom';
    targetValue: number;
    currentValue: number;
    unit: string; // kg, lbs, minutes, reps, etc.
    targetDate: Date;
    isCompleted: boolean;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Social related types
export interface IPost extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    content: string;
    workout?: Types.ObjectId;
    images?: string[];
    likes: Types.ObjectId[];
    comments: {
        user: Types.ObjectId;
        content: string;
        createdAt: Date;
    }[];
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Request types with user authentication
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
    };
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// Socket.IO types
export interface SocketUser {
    userId: string;
    socketId: string;
    username: string;
}

export interface WorkoutUpdate {
    workoutId: string;
    userId: string;
    exerciseIndex: number;
    setIndex: number;
    setData: {
        reps?: number;
        weight?: number;
        duration?: number;
        distance?: number;
        completed: boolean;
    };
}

// Validation types
export interface ValidationError {
    field: string;
    message: string;
}

// Statistics types
export interface WorkoutStats {
    totalWorkouts: number;
    totalDuration: number;
    totalCalories: number;
    averageDuration: number;
    workoutsByCategory: Record<string, number>;
    weeklyProgress: {
        week: string;
        workouts: number;
        duration: number;
        calories: number;
    }[];
}

export interface UserStats {
    workoutStats: WorkoutStats;
    goalProgress: {
        total: number;
        completed: number;
        inProgress: number;
    };
    socialStats: {
        followers: number;
        following: number;
        posts: number;
        likes: number;
    };
}