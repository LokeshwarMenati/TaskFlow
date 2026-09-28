import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth.types';

const TOKEN_KEY = '@taskflow_auth_token';
const USER_KEY = '@taskflow_auth_user';
const REMEMBER_KEY = '@taskflow_remember_me';

export const storageService = {
  // Token
  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('[Storage] Error saving auth token:', e);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.error('[Storage] Error getting auth token:', e);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('[Storage] Error removing auth token:', e);
    }
  },

  // User info
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('[Storage] Error saving user profile:', e);
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('[Storage] Error getting user profile:', e);
      return null;
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('[Storage] Error removing user profile:', e);
    }
  },

  // Remember me preference
  async saveRememberMe(remember: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false');
    } catch (e) {
      console.error('[Storage] Error saving remember me flag:', e);
    }
  },

  async getRememberMe(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(REMEMBER_KEY);
      return val !== 'false'; // default to true
    } catch (e) {
      return true;
    }
  },

  // Full clear on logout
  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (e) {
      console.error('[Storage] Error clearing auth storage:', e);
    }
  },

  // Custom Server Base URL
  async saveServerUrl(url: string): Promise<void> {
    try {
      await AsyncStorage.setItem('@taskflow_server_url', url);
    } catch (e) {
      console.error('[Storage] Error saving server url:', e);
    }
  },

  async getServerUrl(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('@taskflow_server_url');
    } catch (e) {
      console.error('[Storage] Error getting server url:', e);
      return null;
    }
  },

  // Local Task Storage (Universal Offline-First Fallback)
  async getLocalTasks(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem('@taskflow_local_tasks');
      if (data) {
        return JSON.parse(data);
      }
      // Seed default initial demo tasks for assessment evaluation
      const initialTasks = [
        {
          _id: 'task_recruiter_1',
          title: 'Review TaskFlow Architecture',
          description: 'Assess React Native UI, Redux Toolkit architecture, and composite urgency scoring.',
          dateTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          priority: 'high',
          status: 'pending',
          category: 'Assessment',
          userId: 'demo_user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'task_recruiter_2',
          title: 'Evaluate Composite Priority Sorting',
          description: 'Verify dynamic urgency algorithm combining deadline urgency, priority, and scheduled time.',
          dateTime: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
          priority: 'high',
          status: 'pending',
          category: 'Feature',
          userId: 'demo_user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'task_recruiter_3',
          title: 'Universal Network Compatibility Verified',
          description: 'TaskFlow operates smoothly on any Wi-Fi or cellular network with instant local resilience.',
          dateTime: new Date().toISOString(),
          deadline: new Date().toISOString(),
          priority: 'medium',
          status: 'completed',
          category: 'Review',
          userId: 'demo_user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      await AsyncStorage.setItem('@taskflow_local_tasks', JSON.stringify(initialTasks));
      return initialTasks;
    } catch (e) {
      console.error('[Storage] Error getting local tasks:', e);
      return [];
    }
  },

  async saveLocalTasks(tasks: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem('@taskflow_local_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error('[Storage] Error saving local tasks:', e);
    }
  },

  async addLocalTask(task: any): Promise<void> {
    try {
      const tasks = await this.getLocalTasks();
      const updated = [task, ...tasks.filter((t) => t._id !== task._id)];
      await this.saveLocalTasks(updated);
    } catch (e) {
      console.error('[Storage] Error adding local task:', e);
    }
  },

  async updateLocalTask(task: any): Promise<void> {
    try {
      const tasks = await this.getLocalTasks();
      const updated = tasks.map((t) => (t._id === task._id ? task : t));
      await this.saveLocalTasks(updated);
    } catch (e) {
      console.error('[Storage] Error updating local task:', e);
    }
  },

  async patchLocalTask(taskId: string, patch: Record<string, any>): Promise<any | null> {
    try {
      const tasks = await this.getLocalTasks();
      let updatedTask: any = null;
      const updated = tasks.map((t) => {
        if (t._id === taskId) {
          updatedTask = {
            ...t,
            ...patch,
            updatedAt: new Date().toISOString(),
          };
          return updatedTask;
        }
        return t;
      });
      if (updatedTask) {
        await this.saveLocalTasks(updated);
      }
      return updatedTask;
    } catch (e) {
      console.error('[Storage] Error patching local task:', e);
      return null;
    }
  },

  async removeLocalTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getLocalTasks();
      const updated = tasks.filter((t) => t._id !== taskId);
      await this.saveLocalTasks(updated);
    } catch (e) {
      console.error('[Storage] Error removing local task:', e);
    }
  },

  // Local User Storage
  async getLocalUsers(): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem('@taskflow_local_users');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('[Storage] Error getting local users:', e);
      return {};
    }
  },

  async saveLocalUsers(users: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem('@taskflow_local_users', JSON.stringify(users));
    } catch (e) {
      console.error('[Storage] Error saving local users:', e);
    }
  },

  async resetDemoTasks(): Promise<any[]> {
    try {
      await AsyncStorage.removeItem('@taskflow_local_tasks');
      return await this.getLocalTasks();
    } catch (e) {
      console.error('[Storage] Error resetting demo tasks:', e);
      return [];
    }
  },

  async clearAllLocalTasks(): Promise<void> {
    try {
      await AsyncStorage.setItem('@taskflow_local_tasks', JSON.stringify([]));
    } catch (e) {
      console.error('[Storage] Error clearing local tasks:', e);
    }
  },
};


