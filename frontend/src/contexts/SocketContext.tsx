import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SocketNotification, WorkoutUpdate } from '@/types';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: SocketNotification[];
  joinWorkout: (workoutId: string) => void;
  leaveWorkout: (workoutId: string) => void;
  sendWorkoutUpdate: (update: WorkoutUpdate) => void;
  sendPostLiked: (postId: string, postOwnerId: string) => void;
  sendPostCommented: (postId: string, postOwnerId: string, comment: string) => void;
  sendUserFollowed: (followedUserId: string) => void;
  sendGoalCompleted: (goalId: string, goalTitle: string) => void;
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Get token for socket authentication
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        // Create socket connection
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
          auth: {
            token,
          },
          withCredentials: true,
        });

        // Connection event handlers
        newSocket.on('connect', () => {
          console.log('🔌 Connected to FitTrack real-time server');
          setIsConnected(true);
        });

        newSocket.on('connected', (data) => {
          console.log('✅ Socket authenticated:', data);
        });

        newSocket.on('disconnect', (reason) => {
          console.log('🔌 Disconnected from server:', reason);
          setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error);
          setIsConnected(false);
        });

        // Notification handlers
        newSocket.on('notification', (notification: SocketNotification) => {
          console.log('🔔 New notification:', notification);
          
          // Add to notifications list
          setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
          
          // Show toast notification
          switch (notification.type) {
            case 'like':
              toast.success(notification.message, {
                icon: '❤️',
              });
              break;
            case 'comment':
              toast.success(notification.message, {
                icon: '💬',
              });
              break;
            case 'follow':
              toast.success(notification.message, {
                icon: '👥',
              });
              break;
            case 'goal_achievement':
              toast.success(notification.message, {
                icon: '🎯',
                duration: 6000,
              });
              break;
            default:
              toast.success(notification.message);
          }
        });

        // Workout update handlers
        newSocket.on('workout-updated', (data) => {
          console.log('💪 Workout updated:', data);
          // This could be used for shared workouts or real-time collaboration
        });

        newSocket.on('workout-update-ack', (data) => {
          console.log('✅ Workout update acknowledged:', data);
        });

        // Error handler
        newSocket.on('error', (error) => {
          console.error('❌ Socket error:', error);
          toast.error(error.message || 'Real-time connection error');
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
          newSocket.close();
        };
      }
    } else {
      // Disconnect socket if not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  // Socket utility functions
  const joinWorkout = (workoutId: string) => {
    if (socket && isConnected) {
      socket.emit('join-workout', workoutId);
    }
  };

  const leaveWorkout = (workoutId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-workout', workoutId);
    }
  };

  const sendWorkoutUpdate = (update: WorkoutUpdate) => {
    if (socket && isConnected) {
      socket.emit('workout-update', update);
    }
  };

  const sendPostLiked = (postId: string, postOwnerId: string) => {
    if (socket && isConnected) {
      socket.emit('post-liked', { postId, postOwnerId });
    }
  };

  const sendPostCommented = (postId: string, postOwnerId: string, comment: string) => {
    if (socket && isConnected) {
      socket.emit('post-commented', { postId, postOwnerId, comment });
    }
  };

  const sendUserFollowed = (followedUserId: string) => {
    if (socket && isConnected) {
      socket.emit('user-followed', { followedUserId });
    }
  };

  const sendGoalCompleted = (goalId: string, goalTitle: string) => {
    if (socket && isConnected) {
      socket.emit('goal-completed', { goalId, goalTitle });
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    notifications,
    joinWorkout,
    leaveWorkout,
    sendWorkoutUpdate,
    sendPostLiked,
    sendPostCommented,
    sendUserFollowed,
    sendGoalCompleted,
    clearNotifications,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};