import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';
import { ENV } from './config/env';

const startServer = async (): Promise<void> => {
  try {
    // Attempt database connection
    console.log(`[Server] Connecting to database at: ${ENV.MONGODB_URI}`);
    await connectDB();

    const app = createApp();

    const server = app.listen(ENV.PORT, '0.0.0.0', () => {
      console.log('====================================================');
      console.log(`  TaskFlow Backend Server running in [${ENV.NODE_ENV}] mode`);
      console.log(`  Local Address:            http://localhost:${ENV.PORT}`);
      console.log(`  Android Emulator Address: http://10.0.2.2:${ENV.PORT}`);
      console.log(`  Health Check:             http://localhost:${ENV.PORT}/health`);
      console.log('====================================================');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await disconnectDB();
        console.log('[Server] Process finished safely.');
        process.exit(0);
      });

      // Force exit after 10s if graceful shutdown hangs
      setTimeout(() => {
        console.error('[Server] Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('[Server Fatal] Failed to bootstrap application:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default startServer;
