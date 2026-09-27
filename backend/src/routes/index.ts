import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';

const router = Router();

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
