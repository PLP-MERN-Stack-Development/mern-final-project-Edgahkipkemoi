import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

/**
 * API Client Configuration
 * Handles HTTP requests with authentication and error handling
 */

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage (fallback if cookies don't work)
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshResponse = await axios.post('/api/auth/refresh', {}, {
                    withCredentials: true,
                });

                if (refreshResponse.data.success) {
                    const newToken = refreshResponse.data.data.accessToken;
                    localStorage.setItem('accessToken', newToken);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// API helper functions
export const apiClient = {
    // Generic GET request
    get: async <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
        const response = await api.get(url, { params });
        return response.data;
    },

    // Generic POST request
    post: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
        const response = await api.post(url, data);
        return response.data;
    },

    // Generic PUT request
    put: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
        const response = await api.put(url, data);
        return response.data;
    },

    // Generic PATCH request
    patch: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
        const response = await api.patch(url, data);
        return response.data;
    },

    // Generic DELETE request
    delete: async <T>(url: string): Promise<ApiResponse<T>> => {
        const response = await api.delete(url);
        return response.data;
    },
};

// Authentication API
export const authAPI = {
    register: (data: any) => apiClient.post('/auth/register', data),
    login: (data: any) => apiClient.post('/auth/login', data),
    logout: () => apiClient.post('/auth/logout'),
    logoutAll: () => apiClient.post('/auth/logout-all'),
    getMe: () => apiClient.get('/auth/me'),
    changePassword: (data: any) => apiClient.put('/auth/change-password', data),
    refreshToken: () => apiClient.post('/auth/refresh'),
};

// User API
export const userAPI = {
    getProfile: () => apiClient.get('/users/profile'),
    updateProfile: (data: any) => apiClient.put('/users/profile', data),
    getDashboard: () => apiClient.get('/users/dashboard'),
    getUser: (identifier: string) => apiClient.get(`/users/${identifier}`),
    searchUsers: (query: string, params?: any) => apiClient.get('/users/search', { q: query, ...params }),
    followUser: (userId: string) => apiClient.post(`/users/${userId}/follow`),
    unfollowUser: (userId: string) => apiClient.delete(`/users/${userId}/follow`),
    getFollowers: (userId: string, params?: any) => apiClient.get(`/users/${userId}/followers`, params),
    getFollowing: (userId: string, params?: any) => apiClient.get(`/users/${userId}/following`, params),
    getDashboard: () => apiClient.get('/users/dashboard'),
};

// Exercise API
export const exerciseAPI = {
    getExercises: (params?: any) => apiClient.get('/exercises', params),
    getExercise: (id: string) => apiClient.get(`/exercises/${id}`),
    createExercise: (data: any) => apiClient.post('/exercises', data),
    updateExercise: (id: string, data: any) => apiClient.put(`/exercises/${id}`, data),
    deleteExercise: (id: string) => apiClient.delete(`/exercises/${id}`),
    getCategories: () => apiClient.get('/exercises/categories'),
    getMuscleGroups: () => apiClient.get('/exercises/muscle-groups'),
    getEquipment: () => apiClient.get('/exercises/equipment'),
};

// Workout API
export const workoutAPI = {
    getWorkouts: (params?: any) => apiClient.get('/workouts', params),
    getWorkout: (id: string) => apiClient.get(`/workouts/${id}`),
    createWorkout: (data: any) => apiClient.post('/workouts', data),
    updateWorkout: (id: string, data: any) => apiClient.put(`/workouts/${id}`, data),
    deleteWorkout: (id: string) => apiClient.delete(`/workouts/${id}`),
    duplicateWorkout: (id: string) => apiClient.post(`/workouts/${id}/duplicate`),
    getPublicWorkouts: (params?: any) => apiClient.get('/workouts/public', params),
    getWorkoutStats: (params?: any) => apiClient.get('/workouts/stats', params),
};

// Goal API
export const goalAPI = {
    getGoals: (params?: any) => apiClient.get('/goals', params),
    getGoal: (id: string) => apiClient.get(`/goals/${id}`),
    createGoal: (data: any) => apiClient.post('/goals', data),
    updateGoal: (id: string, data: any) => apiClient.put(`/goals/${id}`, data),
    updateGoalProgress: (id: string, currentValue: number) =>
        apiClient.patch(`/goals/${id}/progress`, { currentValue }),
    deleteGoal: (id: string) => apiClient.delete(`/goals/${id}`),
    getGoalStats: () => apiClient.get('/goals/stats'),
};

// Social API
export const socialAPI = {
    getFeed: (params?: any) => apiClient.get('/social/feed', params),
    getDiscoverPosts: (params?: any) => apiClient.get('/social/discover', params),
    getUserPosts: (userId: string, params?: any) => apiClient.get(`/social/users/${userId}/posts`, params),
    createPost: (data: any) => apiClient.post('/social/posts', data),
    getPost: (id: string) => apiClient.get(`/social/posts/${id}`),
    updatePost: (id: string, data: any) => apiClient.put(`/social/posts/${id}`, data),
    deletePost: (id: string) => apiClient.delete(`/social/posts/${id}`),
    toggleLike: (postId: string) => apiClient.post(`/social/posts/${postId}/like`),
    addComment: (postId: string, content: string) =>
        apiClient.post(`/social/posts/${postId}/comments`, { content }),
    deleteComment: (postId: string, commentId: string) =>
        apiClient.delete(`/social/posts/${postId}/comments/${commentId}`),
};

export default api;