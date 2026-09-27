import { apiClient } from './api';
import {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilterState,
  TaskSortOption,
} from '../types/task.types';

export const taskService = {
  async fetchTasks(
    filters?: Partial<TaskFilterState>,
    sort?: TaskSortOption
  ): Promise<Task[]> {
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
    return response.data.data.tasks;
  },

  async getTaskById(taskId: string): Promise<Task> {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return response.data.data.task;
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const response = await apiClient.post('/tasks', payload);
    return response.data.data.task;
  },

  async updateTask(taskId: string, payload: UpdateTaskPayload): Promise<Task> {
    const response = await apiClient.patch(`/tasks/${taskId}`, payload);
    return response.data.data.task;
  },

  async completeTask(taskId: string, currentStatus: string): Promise<Task> {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const response = await apiClient.patch(`/tasks/${taskId}`, { status: nextStatus });
    return response.data.data.task;
  },

  async deleteTask(taskId: string): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}`);
  },
};
