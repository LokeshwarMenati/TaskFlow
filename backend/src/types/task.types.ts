import { Document, Types } from 'mongoose';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';
export type TaskSortOption = 'composite' | 'deadline' | 'priority' | 'createdAt' | 'dateTime';

export interface ITask {
  title: string;
  description: string;
  dateTime: Date;
  deadline: Date;
  priority: TaskPriority;
  status: TaskStatus;
  category: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskDocument extends ITask, Document {
  _id: Types.ObjectId;
}

export interface ITaskResponse {
  _id: string;
  title: string;
  description: string;
  dateTime: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
}

export interface ICreateTaskDTO {
  title: string;
  description?: string;
  dateTime: string | Date;
  deadline: string | Date;
  priority?: TaskPriority;
  category?: string;
}

export interface IUpdateTaskDTO {
  title?: string;
  description?: string;
  dateTime?: string | Date;
  deadline?: string | Date;
  priority?: TaskPriority;
  status?: TaskStatus;
  category?: string;
}

export interface ITaskQueryParams {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  category?: string;
  sort?: TaskSortOption;
}
