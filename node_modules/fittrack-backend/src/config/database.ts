import mongoose from 'mongoose';

/**
 * Database connection configuration
 * Handles MongoDB connection with proper error handling and reconnection logic
 */
export const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.NODE_ENV === 'test'
            ? process.env.MONGODB_TEST_URI
            : process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(mongoURI, {
            // Connection options for better performance and reliability
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });

        console.log(`📦 MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('📦 MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('📦 MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

/**
 * Disconnect from MongoDB (useful for testing)
 */
export const disconnectDB = async (): Promise<void> => {
    try {
        await mongoose.connection.close();
        console.log('📦 MongoDB disconnected');
    } catch (error) {
        console.error('❌ Error disconnecting from MongoDB:', error);
    }
};