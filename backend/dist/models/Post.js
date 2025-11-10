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
const postSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Workout',
    },
    images: [{
            type: String,
            validate: {
                validator: function (url) {
                    return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                },
                message: 'Invalid image URL format',
            },
        }],
    likes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        }],
    comments: [{
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
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
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ isPublic: 1, createdAt: -1 });
postSchema.index({ likes: 1 });
postSchema.index({ 'comments.user': 1 });
postSchema.index({ content: 'text' });
postSchema.virtual('likeCount').get(function () {
    return this.likes.length;
});
postSchema.virtual('commentCount').get(function () {
    return this.comments.length;
});
postSchema.methods.isLikedBy = function (userId) {
    return this.likes.some((like) => like.toString() === userId);
};
postSchema.set('toJSON', { virtuals: true });
exports.default = mongoose_1.default.model('Post', postSchema);
//# sourceMappingURL=Post.js.map