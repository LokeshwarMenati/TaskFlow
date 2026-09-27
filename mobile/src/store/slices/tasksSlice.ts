import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  TasksState,
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilterState,
  TaskSortOption,
} from '../../types/task.types';
import { taskService } from '../../services/taskService';
import { sortTasks } from '../../utils/sorting';

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  filters: {
    status: 'all',
    priority: 'all',
    category: 'all',
  },
  sort: 'composite',
};

// Async Thunk: Fetch Tasks
export const fetchTasks = createAsyncThunk<
  Task[],
  void,
  { state: { tasks: TasksState }; rejectValue: string }
>('tasks/fetchTasks', async (_, { getState, rejectWithValue }) => {
  try {
    const { filters, sort } = getState().tasks;
    const tasks = await taskService.fetchTasks(filters, sort);
    return sortTasks(tasks, sort);
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Failed to fetch tasks';
    return rejectWithValue(message);
  }
});

// Async Thunk: Create Task
export const createTask = createAsyncThunk<
  Task,
  CreateTaskPayload,
  { state: { tasks: TasksState }; rejectValue: string }
>('tasks/createTask', async (payload, { getState, rejectWithValue }) => {
  try {
    const task = await taskService.createTask(payload);
    return task;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Failed to create task';
    return rejectWithValue(message);
  }
});

// Async Thunk: Update Task
export const updateTask = createAsyncThunk<
  Task,
  { id: string; payload: UpdateTaskPayload },
  { state: { tasks: TasksState }; rejectValue: string }
>('tasks/updateTask', async ({ id, payload }, { getState, rejectWithValue }) => {
  try {
    const task = await taskService.updateTask(id, payload);
    return task;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Failed to update task';
    return rejectWithValue(message);
  }
});

// Async Thunk: Toggle Complete Status
export const completeTask = createAsyncThunk<
  Task,
  { id: string; currentStatus: string },
  { state: { tasks: TasksState }; rejectValue: string }
>('tasks/completeTask', async ({ id, currentStatus }, { getState, rejectWithValue }) => {
  try {
    const updated = await taskService.completeTask(id, currentStatus);
    return updated;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Failed to update task status';
    return rejectWithValue(message);
  }
});

// Async Thunk: Delete Task
export const deleteTask = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('tasks/deleteTask', async (taskId, { rejectWithValue }) => {
  try {
    await taskService.deleteTask(taskId);
    return taskId;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Failed to delete task';
    return rejectWithValue(message);
  }
});

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TaskFilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSort: (state, action: PayloadAction<TaskSortOption>) => {
      state.sort = action.payload;
      state.tasks = sortTasks(state.tasks, action.payload);
    },
    clearTaskError: (state) => {
      state.error = null;
    },
    resetTasksState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder.addCase(fetchTasks.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
      state.loading = false;
      state.tasks = sortTasks(action.payload, state.sort);
      state.error = null;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch tasks';
    });

    // Create Task
    builder.addCase(createTask.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
      state.loading = false;
      const updated = [action.payload, ...state.tasks];
      state.tasks = sortTasks(updated, state.sort);
      state.error = null;
    });
    builder.addCase(createTask.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to create task';
    });

    // Update Task
    builder.addCase(updateTask.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
      state.loading = false;
      const index = state.tasks.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
        state.tasks = sortTasks(state.tasks, state.sort);
      }
      state.error = null;
    });
    builder.addCase(updateTask.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to update task';
    });

    // Complete Task
    builder.addCase(completeTask.fulfilled, (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
        state.tasks = sortTasks(state.tasks, state.sort);
      }
    });

    // Delete Task
    builder.addCase(deleteTask.pending, (state) => {
      state.error = null;
    });
    builder.addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload);
      state.error = null;
    });
    builder.addCase(deleteTask.rejected, (state, action) => {
      state.error = action.payload || 'Failed to delete task';
    });
  },
});

export const { setFilters, setSort, clearTaskError, resetTasksState } = tasksSlice.actions;
export default tasksSlice.reducer;
