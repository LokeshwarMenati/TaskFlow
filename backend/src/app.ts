import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { ENV } from './config/env';

export const createApp = (): Application => {
  const app: Application = express();

  // Security headers
  app.use(helmet());

  // Cross-Origin Resource Sharing
  app.use(
    cors({
      origin: ENV.CORS_ORIGIN === '*' ? true : ENV.CORS_ORIGIN,
      credentials: true,
    })
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP Request Logging
  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // API Routes (mounted at root and /api for convenience)
  app.use('/', routes);
  app.use('/api', routes);

  // 404 Not Found Middleware
  app.use(notFoundHandler);

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};

export default createApp();
