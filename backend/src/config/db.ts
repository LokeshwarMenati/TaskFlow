import mongoose from 'mongoose';
import { ENV } from './env';

export const connectDB = async (uri?: string): Promise<typeof mongoose> => {
  const mongoUri = uri || ENV.MONGODB_URI;
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${(error as Error).message}`);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB connection closed');
  } catch (error) {
    console.error(`[Database Error] Error during disconnection: ${(error as Error).message}`);
  }
};
