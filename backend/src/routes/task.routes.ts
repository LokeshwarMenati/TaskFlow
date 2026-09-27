import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { requireAuth } from '../middleware/auth.middleware';
import {
  createTaskValidationRules,
  updateTaskValidationRules,
  taskIdParamValidationRules,
  taskQueryValidationRules,
  validateRequest,
} from '../middleware/validation.middleware';

const router = Router();

// Protect all task endpoints with JWT authentication
router.use(requireAuth);

// GET /tasks
router.get('/', taskQueryValidationRules, validateRequest, TaskController.getTasks);

// GET /tasks/:id
router.get('/:id', taskIdParamValidationRules, validateRequest, TaskController.getTaskById);

// POST /tasks
router.post('/', createTaskValidationRules, validateRequest, TaskController.createTask);

// PATCH /tasks/:id
router.patch('/:id', updateTaskValidationRules, validateRequest, TaskController.updateTask);

// DELETE /tasks/:id
router.delete('/:id', taskIdParamValidationRules, validateRequest, TaskController.deleteTask);

export default router;
