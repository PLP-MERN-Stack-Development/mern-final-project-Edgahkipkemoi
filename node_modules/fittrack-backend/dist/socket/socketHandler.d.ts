import { Server } from 'socket.io';
export declare const setupSocketIO: (io: Server) => void;
export declare const sendNotificationToUser: (io: Server, userId: string, notification: any) => void;
export declare const broadcastToAll: (io: Server, event: string, data: any) => void;
export declare const getConnectedUsersCount: () => number;
export declare const isUserOnline: (userId: string) => boolean;
//# sourceMappingURL=socketHandler.d.ts.map