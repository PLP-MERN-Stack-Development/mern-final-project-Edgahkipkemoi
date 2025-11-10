"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserOnline = exports.getConnectedUsersCount = exports.broadcastToAll = exports.sendNotificationToUser = exports.setupSocketIO = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connectedUsers = new Map();
const authenticateSocket = (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return next(new Error('Authentication token required'));
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        socket.data.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
        };
        next();
    }
    catch (error) {
        next(new Error('Invalid authentication token'));
    }
};
const setupSocketIO = (io) => {
    io.use(authenticateSocket);
    io.on('connection', (socket) => {
        const user = socket.data.user;
        if (!user) {
            socket.disconnect();
            return;
        }
        console.log(`🔌 User ${user.username} connected (${socket.id})`);
        connectedUsers.set(user.id, {
            userId: user.id,
            socketId: socket.id,
            username: user.username,
        });
        socket.join(`user:${user.id}`);
        socket.emit('connected', {
            message: 'Connected to FitTrack real-time server',
            userId: user.id,
        });
        socket.on('join-workout', (workoutId) => {
            socket.join(`workout:${workoutId}`);
            socket.emit('joined-workout', { workoutId });
            console.log(`👤 ${user.username} joined workout room: ${workoutId}`);
        });
        socket.on('leave-workout', (workoutId) => {
            socket.leave(`workout:${workoutId}`);
            socket.emit('left-workout', { workoutId });
            console.log(`👤 ${user.username} left workout room: ${workoutId}`);
        });
        socket.on('workout-update', (data) => {
            if (!data.workoutId || !data.userId || data.exerciseIndex < 0 || data.setIndex < 0) {
                socket.emit('error', { message: 'Invalid workout update data' });
                return;
            }
            if (data.userId !== user.id) {
                socket.emit('error', { message: 'Unauthorized workout update' });
                return;
            }
            socket.to(`workout:${data.workoutId}`).emit('workout-updated', {
                workoutId: data.workoutId,
                userId: data.userId,
                username: user.username,
                exerciseIndex: data.exerciseIndex,
                setIndex: data.setIndex,
                setData: data.setData,
                timestamp: new Date(),
            });
            socket.emit('workout-update-ack', {
                workoutId: data.workoutId,
                exerciseIndex: data.exerciseIndex,
                setIndex: data.setIndex,
            });
            console.log(`💪 Workout update from ${user.username}: ${data.workoutId}`);
        });
        socket.on('new-post', (postData) => {
            socket.emit('post-created', {
                postId: postData.postId,
                message: 'Post created successfully',
            });
            console.log(`📝 New post from ${user.username}: ${postData.postId}`);
        });
        socket.on('post-liked', (data) => {
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
        socket.on('post-commented', (data) => {
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
        socket.on('user-followed', (data) => {
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
        socket.on('goal-completed', (data) => {
            socket.emit('notification', {
                type: 'goal_achievement',
                message: `Congratulations! You completed your goal: ${data.goalTitle}`,
                goalId: data.goalId,
                timestamp: new Date(),
            });
            console.log(`🎯 ${user.username} completed goal: ${data.goalTitle}`);
        });
        socket.on('typing', (data) => {
            socket.to(data.room).emit('user-typing', {
                userId: user.id,
                username: user.username,
            });
        });
        socket.on('stop-typing', (data) => {
            socket.to(data.room).emit('user-stopped-typing', {
                userId: user.id,
                username: user.username,
            });
        });
        socket.on('disconnect-user', () => {
            socket.disconnect();
        });
        socket.on('disconnect', (reason) => {
            console.log(`🔌 User ${user.username} disconnected (${reason})`);
            connectedUsers.delete(user.id);
            socket.rooms.forEach(room => {
                if (room !== socket.id) {
                    socket.leave(room);
                }
            });
        });
        socket.on('error', (error) => {
            console.error(`❌ Socket error for user ${user.username}:`, error);
        });
    });
    io.on('error', (error) => {
        console.error('❌ Socket.IO server error:', error);
    });
    console.log('🚀 Socket.IO server initialized');
};
exports.setupSocketIO = setupSocketIO;
const sendNotificationToUser = (io, userId, notification) => {
    io.to(`user:${userId}`).emit('notification', notification);
};
exports.sendNotificationToUser = sendNotificationToUser;
const broadcastToAll = (io, event, data) => {
    io.emit(event, data);
};
exports.broadcastToAll = broadcastToAll;
const getConnectedUsersCount = () => {
    return connectedUsers.size;
};
exports.getConnectedUsersCount = getConnectedUsersCount;
const isUserOnline = (userId) => {
    return connectedUsers.has(userId);
};
exports.isUserOnline = isUserOnline;
//# sourceMappingURL=socketHandler.js.map