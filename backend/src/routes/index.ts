import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';

const router = Router();

// Root welcome & API info endpoint
router.get('/', (_req, res) => {
  res.status(200).json({
    name: 'TaskFlow REST API',
    status: 'online',
    version: '1.0.0',
    documentation: '/health',
    endpoints: {
      health: '/health',
      auth: '/auth',
      tasks: '/tasks',
    },
  });
});

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

export default router;
