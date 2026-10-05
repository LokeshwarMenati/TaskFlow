import mongoose from 'mongoose';
import { ENV } from './env';

let cachedPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (uri?: string): Promise<typeof mongoose> => {
  // If already connected, reuse existing connection (crucial for serverless environments)
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If connection is in progress, reuse existing promise
  if (mongoose.connection.readyState === 2 && cachedPromise) {
    return cachedPromise;
  }

  const mongoUri = uri || ENV.MONGODB_URI;
  try {
    cachedPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    const conn = await cachedPromise;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    cachedPromise = null;
    console.error(`[Database Error] Failed to connect to MongoDB: ${(error as Error).message}`);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    cachedPromise = null;
    console.log('[Database] MongoDB connection closed');
  } catch (error) {
    console.error(`[Database Error] Error during disconnection: ${(error as Error).message}`);
  }
};

