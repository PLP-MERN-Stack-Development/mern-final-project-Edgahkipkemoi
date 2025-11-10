import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { SocketUser, WorkoutUpdate } from '../types';

// Store connected users
const connectedUsers = new Map<string, SocketUser>();

/**
 * Socket.IO Authentication Middleware
 * Verifies JWT token from socket handshake
 */
const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // Attach user info to socket
        socket.data.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
        };

        next();
    } catch (error) {
        next(new Error('Invalid authentication token'));
    }
};

/**
 * Setup Socket.IO event handlers
 * Handles real-time features like workout updates, notifications, etc.
 */
export const setupSocketIO = (io: Server): void => {
    // Apply authentication middleware
    io.use(authenticateSocket);

    io.on('connection', (socket: Socket) => {
        const user = socket.data.user;

        if (!user) {
            socket.disconnect();
            return;
        }

        console.log(`🔌 User ${user.username} connected (${socket.id})`);

        // Store connected user
        connectedUsers.set(user.id, {
            userId: user.id,
            socketId: socket.id,
            username: user.username,
        });

        // Join user to their personal room
        socket.join(`user:${user.id}`);

        // Send welcome message
        socket.emit('connected', {
            message: 'Connected to FitTrack real-time server',
            userId: user.id,
        });

        /**
         * Workout Real-time Updates
         */

        // Join workout room for real-time workout tracking
        socket.on('join-workout', (workoutId: string) => {
            socket.join(`workout:${workoutId}`);
            socket.emit('joined-workout', { workoutId });
            console.log(`👤 ${user.username} joined workout room: ${workoutId}`);
        });

        // Leave workout room
        socket.on('leave-workout', (workoutId: string) => {
            socket.leave(`workout:${workoutId}`);
            socket.emit('left-workout', { workoutId });
            console.log(`👤 ${user.username} left workout room: ${workoutId}`);
        });

        // Handle workout set completion updates
        socket.on('workout-update', (data: WorkoutUpdate) => {
            // Validate the update data
            if (!data.workoutId || !data.userId || data.exerciseIndex < 0 || data.setIndex < 0) {
                socket.emit('error', { message: 'Invalid workout update data' });
                return;
            }

            // Only allow users to update their own workouts
            if (data.userId !== user.id) {
                socket.emit('error', { message: 'Unauthorized workout update' });
                return;
            }

            // Broadcast update to workout room (for potential future features like shared workouts)
            socket.to(`workout:${data.workoutId}`).emit('workout-updated', {
                workoutId: data.workoutId,
                userId: data.userId,
                username: user.username,
                exerciseIndex: data.exerciseIndex,
                setIndex: data.setIndex,
                setData: data.setData,
                timestamp: new Date(),
            });

            // Acknowledge the update
            socket.emit('workout-update-ack', {
                workoutId: data.workoutId,
                exerciseIndex: data.exerciseIndex,
                setIndex: data.setIndex,
            });

            console.log(`💪 Workout update from ${user.username}: ${data.workoutId}`);
        });

        /**
         * Social Features Real-time Updates
         */

        // Handle new post notifications
        socket.on('new-post', (postData: { postId: string; content: string }) => {
            // Broadcast to followers (this would require getting follower list)
            // For now, we'll just acknowledge the post creation
            socket.emit('post-created', {
                postId: postData.postId,
                message: 'Post created successfully',
            });

            console.log(`📝 New post from ${user.username}: ${postData.postId}`);
        });

        // Handle like notifications
        socket.on('post-liked', (data: { postId: string; postOwnerId: string }) => {
            // Notify post owner if they're online
            const postOwner = Array.from(connectedUsers.values()).find(u => u.userId === data.postOwnerId);
            if (postOwner && postOwner.userId !== user.id) {
                io.to(postOwner.socketId).emit('notification', {
                    type: 'like',
                    message: `${user.username} liked your post`,
                    postId: data.postId,
                    from: {
                        id: user.id,
                        username: user.username,
                    },
                    timestamp: new Date(),
                });
            }

            console.log(`❤️ ${user.username} liked post: ${data.postId}`);
        });

        // Handle comment notifications
        socket.on('post-commented', (data: { postId: string; postOwnerId: string; comment: string }) => {
            // Notify post owner if they're online
            const postOwner = Array.from(connectedUsers.values()).find(u => u.userId === data.postOwnerId);
            if (postOwner && postOwner.userId !== user.id) {
                io.to(postOwner.socketId).emit('notification', {
                    type: 'comment',
                    message: `${user.username} commented on your post`,
                    postId: data.postId,
                    comment: data.comment,
                    from: {
                        id: user.id,
                        username: user.username,
                    },
                    timestamp: new Date(),
                });
            }

            console.log(`💬 ${user.username} commented on post: ${data.postId}`);
        });

        // Handle follow notifications
        socket.on('user-followed', (data: { followedUserId: string }) => {
            // Notify followed user if they're online
            const followedUser = Array.from(connectedUsers.values()).find(u => u.userId === data.followedUserId);
            if (followedUser) {
                io.to(followedUser.socketId).emit('notification', {
                    type: 'follow',
                    message: `${user.username} started following you`,
                    from: {
                        id: user.id,
                        username: user.username,
                    },
                    timestamp: new Date(),
                });
            }

            console.log(`👥 ${user.username} followed user: ${data.followedUserId}`);
        });

        /**
         * Goal Achievement Notifications
         */
        socket.on('goal-completed', (data: { goalId: string; goalTitle: string }) => {
            // Send congratulations message
            socket.emit('notification', {
                type: 'goal_achievement',
                message: `Congratulations! You completed your goal: ${data.goalTitle}`,
                goalId: data.goalId,
                timestamp: new Date(),
            });

            console.log(`🎯 ${user.username} completed goal: ${data.goalTitle}`);
        });

        /**
         * General Messaging
         */

        // Handle typing indicators (for future chat features)
        socket.on('typing', (data: { room: string }) => {
            socket.to(data.room).emit('user-typing', {
                userId: user.id,
                username: user.username,
            });
        });

        socket.on('stop-typing', (data: { room: string }) => {
            socket.to(data.room).emit('user-stopped-typing', {
                userId: user.id,
                username: user.username,
            });
        });

        /**
         * Connection Management
         */

        // Handle manual disconnect
        socket.on('disconnect-user', () => {
            socket.disconnect();
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            console.log(`🔌 User ${user.username} disconnected (${reason})`);

            // Remove from connected users
            connectedUsers.delete(user.id);

            // Leave all rooms
            socket.rooms.forEach(room => {
                if (room !== socket.id) {
                    socket.leave(room);
                }
            });
        });

        // Handle connection errors
        socket.on('error', (error) => {
            console.error(`❌ Socket error for user ${user.username}:`, error);
        });
    });

    // Handle server-level errors
    io.on('error', (error) => {
        console.error('❌ Socket.IO server error:', error);
    });

    console.log('🚀 Socket.IO server initialized');
};

/**
 * Utility function to send notification to specific user
 */
export const sendNotificationToUser = (io: Server, userId: string, notification: any): void => {
    io.to(`user:${userId}`).emit('notification', notification);
};

/**
 * Utility function to broadcast to all connected users
 */
export const broadcastToAll = (io: Server, event: string, data: any): void => {
    io.emit(event, data);
};

/**
 * Get connected users count
 */
export const getConnectedUsersCount = (): number => {
    return connectedUsers.size;
};

/**
 * Check if user is online
 */
export const isUserOnline = (userId: string): boolean => {
    return connectedUsers.has(userId);
};