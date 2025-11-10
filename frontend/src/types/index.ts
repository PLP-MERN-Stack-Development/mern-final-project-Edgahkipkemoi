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

// User types
export interface User {
    _id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    height?: number;
    weight?: number;
    activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
    profilePicture?: string;
    isEmailVerified: boolean;
    followers: string[] | User[];
    following: string[] | User[];
    createdAt: string;
    updatedAt: string;
}

// Auth types
export interface AuthUser {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isEmailVerified: boolean;
    profilePicture?: string;
}

export interface LoginCredentials {
    identifier: string; // email or username
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

// Exercise types
export interface Exercise {
    _id: string;
    name: string;
    category: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';
    muscleGroups: string[];
    equipment?: string[];
    instructions?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    isCustom: boolean;
    createdBy?: string | User;
    createdAt: string;
    updatedAt: string;
}

// Workout types
export interface WorkoutSet {
    reps?: number;
    weight?: number;
    duration?: number;
    distance?: number;
    restTime?: number;
    completed: boolean;
}

export interface WorkoutExercise {
    exercise: string | Exercise;
    sets: WorkoutSet[];
    notes?: string;
}

export interface Workout {
    _id: string;
    user: string | User;
    name: string;
    description?: string;
    exercises: WorkoutExercise[];
    duration?: number;
    caloriesBurned?: number;
    date: string;
    isTemplate: boolean;
    isPublic: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    totalSets?: number;
    completedSets?: number;
    completionPercentage?: number;
}

// Goal types
export interface Goal {
    _id: string;
    user: string | User;
    title: string;
    description?: string;
    type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'strength' | 'custom';
    targetValue: number;
    currentValue: number;
    unit: string;
    targetDate: string;
    isCompleted: boolean;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    progressPercentage?: number;
    daysRemaining?: number;
    isOverdue?: boolean;
}

// Social types
export interface Comment {
    _id: string;
    user: string | User;
    content: string;
    createdAt: string;
}

export interface Post {
    _id: string;
    user: string | User;
    content: string;
    workout?: string | Workout;
    images?: string[];
    likes: string[] | User[];
    comments: Comment[];
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    likeCount?: number;
    commentCount?: number;
}

// Statistics types
export interface WorkoutStats {
    totalWorkouts: number;
    totalDuration: number;
    totalCalories: number;
    averageDuration: number;
    thisWeek: number;
}

export interface GoalStats {
    total: number;
    completed: number;
    active: number;
    completionRate: number;
}

export interface DashboardData {
    workoutStats: WorkoutStats;
    goalStats: GoalStats;
    recentWorkouts: Workout[];
    upcomingGoals: Goal[];
}

// Form types
export interface WorkoutFormData {
    name: string;
    description?: string;
    exercises: {
        exercise: string;
        sets: Omit<WorkoutSet, 'completed'>[];
        notes?: string;
    }[];
    duration?: number;
    caloriesBurned?: number;
    date?: string;
    isTemplate?: boolean;
    isPublic?: boolean;
    tags?: string[];
}

export interface GoalFormData {
    title: string;
    description?: string;
    type: Goal['type'];
    targetValue: number;
    unit: string;
    targetDate: string;
}

export interface ExerciseFormData {
    name: string;
    category: Exercise['category'];
    muscleGroups: string[];
    equipment?: string[];
    instructions?: string;
    difficulty: Exercise['difficulty'];
}

// Socket.IO types
export interface SocketNotification {
    type: 'like' | 'comment' | 'follow' | 'goal_achievement' | 'workout_update';
    message: string;
    postId?: string;
    goalId?: string;
    workoutId?: string;
    from?: {
        id: string;
        username: string;
    };
    timestamp: string;
}

export interface WorkoutUpdate {
    workoutId: string;
    userId: string;
    exerciseIndex: number;
    setIndex: number;
    setData: WorkoutSet;
}

// Chart data types
export interface ChartDataPoint {
    name: string;
    value: number;
    date?: string;
}

export interface WeeklyProgressData {
    week: string;
    workouts: number;
    duration: number;
    calories: number;
}

// Filter and search types
export interface WorkoutFilters {
    startDate?: string;
    endDate?: string;
    template?: boolean;
    page?: number;
    limit?: number;
}

export interface ExerciseFilters {
    category?: string;
    muscleGroup?: string;
    difficulty?: string;
    search?: string;
    includeCustom?: boolean;
    page?: number;
    limit?: number;
}

export interface GoalFilters {
    type?: string;
    status?: 'completed' | 'active' | 'overdue';
    page?: number;
    limit?: number;
}

// Error types
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

export interface ApiError {
    success: false;
    message: string;
    error?: string;
    errors?: ValidationError[];
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

// Component prop types
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
}

export interface ButtonProps extends BaseComponentProps {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
}