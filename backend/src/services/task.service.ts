import { Types } from 'mongoose';
import { Task } from '../models/Task';
import {
  ICreateTaskDTO,
  IUpdateTaskDTO,
  ITaskQueryParams,
  ITaskResponse,
} from '../types/task.types';
import { AppError } from '../middleware/error.middleware';
import { sortTasksComposite } from '../utils/compositeSort';

export class TaskService {
  /**
   * Transforms a Mongoose task document into a clean, typed task response with overdue calculation.
   */
  private static formatTask(doc: any): ITaskResponse {
    const isCompleted = doc.status === 'completed';
    const isOverdue = !isCompleted && new Date(doc.deadline).getTime() < Date.now();

    return {
      _id: doc._id.toString(),
      title: doc.title,
      description: doc.description || '',
      dateTime: new Date(doc.dateTime).toISOString(),
      deadline: new Date(doc.deadline).toISOString(),
      priority: doc.priority,
      status: doc.status,
      category: doc.category || 'General',
      userId: doc.userId.toString(),
      createdAt: new Date(doc.createdAt).toISOString(),
      updatedAt: new Date(doc.updatedAt).toISOString(),
      isOverdue,
    };
  }

  /**
   * Retrieves all tasks strictly scoped to the authenticated user with optional filtering and sorting.
   */
  public static async getTasks(
    userId: string,
    params: ITaskQueryParams
  ): Promise<ITaskResponse[]> {
    // SECURITY: strictly scope query to the authenticated user's ID
    const query: Record<string, any> = {
      userId: new Types.ObjectId(userId),
    };

    if (params.status && params.status !== 'all') {
      query.status = params.status;
    }

    if (params.priority && params.priority !== 'all') {
      query.priority = params.priority;
    }

    if (params.category && params.category.trim() !== '' && params.category !== 'all') {
      query.category = { $regex: new RegExp(`^${params.category.trim()}$`, 'i') };
    }

    // Determine sorting criteria
    let sortQuery: Record<string, any> = { createdAt: -1 }; // default fallback
    const sort = params.sort || 'composite';

    if (sort === 'deadline') {
      sortQuery = { deadline: 1, createdAt: -1 };
    } else if (sort === 'createdAt') {
      sortQuery = { createdAt: -1 };
    } else if (sort === 'dateTime') {
      sortQuery = { dateTime: 1, createdAt: -1 };
    }

    const tasks = await Task.find(query).sort(sortQuery);
    let formattedTasks = tasks.map((t) => this.formatTask(t));

    // Handle in-memory sorting for priority and composite
    if (sort === 'priority') {
      const priorityWeights: Record<string, number> = { high: 3, medium: 2, low: 1 };
      formattedTasks.sort((a, b) => {
        const weightDiff = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
        if (weightDiff !== 0) return weightDiff;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    } else if (sort === 'composite') {
      formattedTasks = sortTasksComposite(formattedTasks);
    }

    return formattedTasks;
  }

  /**
   * Retrieves a single task ensuring user ownership.
   */
  public static async getTaskById(taskId: string, userId: string): Promise<ITaskResponse> {
    const task = await Task.findOne({
      _id: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
    });

    if (!task) {
      throw new AppError('Task not found or access denied', 404);
    }

    return this.formatTask(task);
  }

  /**
   * Creates a new task bound exclusively to the authenticated user.
   */
  public static async createTask(userId: string, data: ICreateTaskDTO): Promise<ITaskResponse> {
    const task = await Task.create({
      title: data.title.trim(),
      description: (data.description || '').trim(),
      dateTime: new Date(data.dateTime),
      deadline: new Date(data.deadline),
      priority: data.priority || 'medium',
      status: 'pending',
      category: (data.category || 'General').trim(),
      userId: new Types.ObjectId(userId),
    });

    return this.formatTask(task);
  }

  /**
   * Updates an existing task, strictly enforcing ownership verification.
   */
  public static async updateTask(
    taskId: string,
    userId: string,
    data: IUpdateTaskDTO
  ): Promise<ITaskResponse> {
    const task = await Task.findOne({
      _id: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
    });

    if (!task) {
      throw new AppError('Task not found or access denied', 404);
    }

    if (data.title !== undefined) task.title = data.title.trim();
    if (data.description !== undefined) task.description = data.description.trim();
    if (data.dateTime !== undefined) task.dateTime = new Date(data.dateTime);
    if (data.deadline !== undefined) task.deadline = new Date(data.deadline);
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.status !== undefined) task.status = data.status;
    if (data.category !== undefined) task.category = data.category.trim();

    await task.save();
    return this.formatTask(task);
  }

  /**
   * Deletes a task, strictly enforcing ownership verification.
   */
  public static async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await Task.findOneAndDelete({
      _id: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
    });

    if (!task) {
      throw new AppError('Task not found or access denied', 404);
    }
  }
}
