import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Post } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { Users, Plus, Heart, MessageCircle, Send, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SocialPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'feed' | 'discover'>('feed');
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['social', view],
    queryFn: async () => {
      const response = view === 'feed' 
        ? await socialAPI.getFeed()
        : await socialAPI.getDiscoverPosts();
      return response.data;
    },
  });

  const posts = (data as any)?.posts || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Social Feed</h1>
          <p className="text-gray-600 dark:text-gray-400">Share your fitness journey</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setView('feed')}
          className={`px-4 py-2 rounded-lg ${
            view === 'feed'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          My Feed
        </button>
        <button
          onClick={() => setView('discover')}
          className={`px-4 py-2 rounded-lg ${
            view === 'discover'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Discover
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 card">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {view === 'feed' 
              ? 'Follow users to see their posts here'
              : 'Be the first to share your fitness journey'}
          </p>
          <Button onClick={() => setIsModalOpen(true)}>Create Your First Post</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post: Post) => (
            <PostCard key={post._id} post={post} currentUserId={user?.id || ''} />
          ))}
        </div>
      )}

      {isModalOpen && <CreatePostModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

interface PostCardProps {
  post: Post;
  currentUserId: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();

  const user = typeof post.user === 'object' ? post.user : null;
  const isLiked = post.likes.some((like: any) => 
    typeof like === 'string' ? like === currentUserId : like._id === currentUserId
  );

  const likeMutation = useMutation({
    mutationFn: () => socialAPI.toggleLike(post._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social'] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => socialAPI.addComment(post._id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social'] });
      setCommentText('');
      toast.success('Comment added!');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const deletePostMutation = useMutation({
    mutationFn: () => socialAPI.deletePost(post._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social'] });
      toast.success('Post deleted!');
    },
    onError: () => toast.error('Failed to delete post'),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => socialAPI.deleteComment(post._id, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social'] });
      toast.success('Comment deleted!');
    },
    onError: () => toast.error('Failed to delete comment'),
  });

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      commentMutation.mutate(commentText);
    }
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{user?.username} · {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {user?._id === currentUserId && (
          <button
            onClick={() => deletePostMutation.mutate()}
            className="text-gray-400 hover:text-error-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="text-gray-900 dark:text-white mb-4 whitespace-pre-wrap">{post.content}</p>

      {post.images && post.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {post.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post image ${index + 1}`}
              className="rounded-lg w-full h-48 object-cover"
            />
          ))}
        </div>
      )}

      <div className="flex items-center space-x-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => likeMutation.mutate()}
          className={`flex items-center space-x-2 ${
            isLiked ? 'text-error-600' : 'text-gray-500 dark:text-gray-400'
          } hover:text-error-600 transition-colors`}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">{post.likes.length}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">{post.comments.length}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <form onSubmit={handleComment} className="flex space-x-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            />
            <Button type="submit" size="sm" disabled={!commentText.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <div className="space-y-3">
            {post.comments.map((comment: any) => {
              const commentUser = typeof comment.user === 'object' ? comment.user : null;
              return (
                <div key={comment._id} className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {commentUser?.firstName?.[0]}{commentUser?.lastName?.[0]}
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {commentUser?.firstName} {commentUser?.lastName}
                      </p>
                      {(commentUser?._id === currentUserId || user?._id === currentUserId) && (
                        <button
                          onClick={() => deleteCommentMutation.mutate(comment._id)}
                          className="text-gray-400 hover:text-error-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface CreatePostModalProps {
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose }) => {
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: { content: string; isPublic: boolean }) => socialAPI.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social'] });
      toast.success('Post created!');
      onClose();
    },
    onError: () => toast.error('Failed to create post'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createMutation.mutate({ content, isPublic });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your fitness journey..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              rows={6}
              required
            />
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Make post public</span>
          </label>

          <div className="flex space-x-3">
            <Button type="submit" className="flex-1" loading={createMutation.isPending}>
              Post
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SocialPage;
