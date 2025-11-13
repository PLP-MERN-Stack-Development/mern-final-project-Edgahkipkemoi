import { IUser } from '../types';

/**
 * Update user's streak based on last activity date
 * @param user - User document
 * @returns Updated streak information
 */
export const updateUserStreak = (user: IUser): { currentStreak: number; longestStreak: number } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!user.lastActivityDate) {
        // First activity ever
        user.currentStreak = 1;
        user.longestStreak = Math.max(user.longestStreak, 1);
        user.lastActivityDate = today;
        return { currentStreak: 1, longestStreak: user.longestStreak };
    }

    const lastActivity = new Date(user.lastActivityDate);
    const lastActivityDay = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());

    const daysDifference = Math.floor((today.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference === 0) {
        // Same day - no change to streak
        return { currentStreak: user.currentStreak, longestStreak: user.longestStreak };
    } else if (daysDifference === 1) {
        // Consecutive day - increment streak
        user.currentStreak += 1;
        user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
        user.lastActivityDate = today;
        return { currentStreak: user.currentStreak, longestStreak: user.longestStreak };
    } else {
        // Streak broken - reset to 1
        user.currentStreak = 1;
        user.lastActivityDate = today;
        return { currentStreak: 1, longestStreak: user.longestStreak };
    }
};

/**
 * Check if user's streak should be reset (missed a day)
 * @param user - User document
 * @returns Whether streak was reset
 */
export const checkAndResetStreak = (user: IUser): boolean => {
    if (!user.lastActivityDate) {
        return false;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActivity = new Date(user.lastActivityDate);
    const lastActivityDay = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());

    const daysDifference = Math.floor((today.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference > 1) {
        // Streak broken
        user.currentStreak = 0;
        return true;
    }

    return false;
};
