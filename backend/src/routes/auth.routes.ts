import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import {
  registerValidationRules,
  loginValidationRules,
  validateRequest,
} from '../middleware/validation.middleware';

const router = Router();

// POST /auth/register
router.post(
  '/register',
  registerValidationRules,
  validateRequest,
  AuthController.register
);

// POST /auth/login
router.post(
  '/login',
  loginValidationRules,
  validateRequest,
  AuthController.login
);

// GET /auth/me (Protected)
router.get(
  '/me',
  requireAuth,
  AuthController.getMe
);

export default router;
