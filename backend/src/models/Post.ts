import mongoose, { Schema } from 'mongoose';
import { IPost } from '../types';

/**
 * Post Schema for social features
 * Allows users to share workouts, progress, and interact with others
 */
const postSchema = new Schema<IPost>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
    },
    content: {
        type: String,
        required: [true, 'Post content is required'],
        trim: true,
        maxlength: [1000, 'Post content cannot exceed 1000 characters'],
    },
    workout: {
        type: Schema.Types.ObjectId,
        ref: 'Workout',
    },
    images: [{
        type: String,
        validate: {
            validator: function (url: string) {
                return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
            },
            message: 'Invalid image URL format',
        },
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: [true, 'Comment content is required'],
            trim: true,
            maxlength: [500, 'Comment cannot exceed 500 characters'],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
    isPublic: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Indexes for better query performance
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ isPublic: 1, createdAt: -1 });
postSchema.index({ likes: 1 });
postSchema.index({ 'comments.user': 1 });
postSchema.index({ content: 'text' });

// Virtual for like count
postSchema.virtual('likeCount').get(function () {
    return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function () {
    return this.comments.length;
});

// Method to check if user has liked the post
postSchema.methods.isLikedBy = function (userId: string) {
    return this.likes.some((like: any) => like.toString() === userId);
};

// Ensure virtuals are included in JSON output
postSchema.set('toJSON', { virtuals: true });

export default mongoose.model<IPost>('Post', postSchema);