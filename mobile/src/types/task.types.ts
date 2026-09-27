export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';
export type TaskSortOption = 'composite' | 'deadline' | 'priority' | 'createdAt' | 'dateTime';

export interface Task {
  _id: string;
  title: string;
  description: string;
  dateTime: string;
  deadline: string;
  priority: Priority;
  status: TaskStatus;
  category: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
}

export interface TaskFilterState {
  status: 'all' | TaskStatus;
  priority: 'all' | Priority;
  category: string;
}

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: TaskFilterState;
  sort: TaskSortOption;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  dateTime: string;
  deadline: string;
  priority?: Priority;
  category?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  dateTime?: string;
  deadline?: string;
  priority?: Priority;
  status?: TaskStatus;
  category?: string;
}
