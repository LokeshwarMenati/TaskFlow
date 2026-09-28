import { apiClient } from './api';
import { storageService } from './storageService';
import {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilterState,
  TaskSortOption,
} from '../types/task.types';
import { sortTasks } from '../utils/sorting';

const isNetworkFailure = (error: any): boolean => {
  return (
    !error?.response ||
    error?.isNetworkError === true ||
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNABORTED' ||
    String(error?.message || '').toLowerCase().includes('network error') ||
    String(error?.message || '').toLowerCase().includes('timeout')
  );
};

export const taskService = {
  async fetchTasks(
    filters?: Partial<TaskFilterState>,
    sort?: TaskSortOption
  ): Promise<Task[]> {
    try {
      const params: Record<string, string> = {};

      if (filters?.status && filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters?.priority && filters.priority !== 'all') {
        params.priority = filters.priority;
      }
      if (filters?.category && filters.category !== 'all' && filters.category.trim() !== '') {
        params.category = filters.category;
      }
      if (sort) {
        params.sort = sort;
      }

      const response = await apiClient.get('/tasks', { params });
      const serverTasks: Task[] = response.data.data.tasks;
      // Keep local storage in sync
      if (serverTasks && serverTasks.length > 0) {
        await storageService.saveLocalTasks(serverTasks);
      }
      return serverTasks;
    } catch (err: any) {
      if (isNetworkFailure(err)) {
        console.warn('[taskService] Server unreachable, serving tasks from local storage.');
        let tasks: Task[] = await storageService.getLocalTasks();

        // Apply filters locally
        if (filters?.status && filters.status !== 'all') {
          tasks = tasks.filter((t) => t.status === filters.status);
        }
        if (filters?.priority && filters.priority !== 'all') {
          tasks = tasks.filter((t) => t.priority === filters.priority);
        }
        if (filters?.category && filters.category !== 'all' && filters.category.trim() !== '') {
          tasks = tasks.filter(
            (t) => t.category.toLowerCase() === filters.category!.toLowerCase()
          );
        }

        // Apply sorting locally
        if (sort) {
          tasks = sortTasks(tasks, sort);
        }
        return tasks;
      }
      throw err;
    }
  },

  async getTaskById(taskId: string): Promise<Task> {
    try {
      const response = await apiClient.get(`/tasks/${taskId}`);
      return response.data.data.task;
    } catch (err: any) {
      if (isNetworkFailure(err)) {
        const tasks: Task[] = await storageService.getLocalTasks();
        const found = tasks.find((t) => t._id === taskId);
        if (found) return found;
      }
      throw err;
    }
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    try {
      const response = await apiClient.post('/tasks', payload);
      const newTask: Task = response.data.data.task;
      await storageService.addLocalTask(newTask);
      return newTask;
    } catch (err: any) {
      if (isNetworkFailure(err)) {
        console.warn('[taskService] Server unreachable, creating task locally.');
        const currentUser = await storageService.getUser();
        const now = new Date().toISOString();
        const localTask: Task = {
          _id: 'task_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
          title: payload.title.trim(),
          description: (payload.description || '').trim(),
          dateTime: payload.dateTime || now,
          deadline: payload.deadline || now,
          priority: payload.priority || 'medium',
          status: 'pending',
          category: (payload.category || 'General').trim(),
          userId: currentUser?.id || 'local_user',
          createdAt: now,
          updatedAt: now,
        };
        await storageService.addLocalTask(localTask);
        return localTask;
      }
      throw err;
    }
  },

  async updateTask(taskId: string, payload: UpdateTaskPayload): Promise<Task> {
    try {
      const response = await apiClient.patch(`/tasks/${taskId}`, payload);
      const updated: Task = response.data.data.task;
      await storageService.updateLocalTask(updated);
      return updated;
    } catch (err: any) {
      if (isNetworkFailure(err)) {
        console.warn('[taskService] Server unreachable, updating task locally.');
        const updated = await storageService.patchLocalTask(taskId, payload);
        if (updated) return updated as Task;
      }
      throw err;
    }
  },

  async completeTask(taskId: string, currentStatus: string): Promise<Task> {
    try {
      const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const response = await apiClient.patch(`/tasks/${taskId}`, { status: nextStatus });
      const updated: Task = response.data.data.task;
      await storageService.updateLocalTask(updated);
      return updated;
    } catch (err: any) {
      if (isNetworkFailure(err)) {
        console.warn('[taskService] Server unreachable, toggling status locally.');
        const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        const updated = await storageService.patchLocalTask(taskId, { status: nextStatus });
        if (updated) return updated as Task;
      }
      throw err;
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      await storageService.removeLocalTask(taskId);
    } catch (err: any) {
      if (isNetworkFailure(err)) {
        console.warn('[taskService] Server unreachable, deleting task locally.');
        await storageService.removeLocalTask(taskId);
        return;
      }
      throw err;
    }
  },
};

