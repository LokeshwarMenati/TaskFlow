import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { sendSuccess } from '../utils/response';

export class TaskController {
  public static async getTasks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const tasks = await TaskService.getTasks(userId, req.query as any);
      sendSuccess(res, 'Tasks retrieved successfully', { tasks, count: tasks.length });
    } catch (error) {
      next(error);
    }
  }

  public static async getTaskById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const task = await TaskService.getTaskById(taskId, userId);
      sendSuccess(res, 'Task retrieved successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  public static async createTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const task = await TaskService.createTask(userId, req.body);
      sendSuccess(res, 'Task created successfully', { task }, 201);
    } catch (error) {
      next(error);
    }
  }

  public static async updateTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const task = await TaskService.updateTask(taskId, userId, req.body);
      sendSuccess(res, 'Task updated successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await TaskService.deleteTask(taskId, userId);
      sendSuccess(res, 'Task deleted successfully', null, 200);
    } catch (error) {
      next(error);
    }
  }
}
