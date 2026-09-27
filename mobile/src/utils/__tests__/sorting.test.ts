import { sortTasksComposite, calculateCompositeScore, sortTasks } from '../sorting';
import { Task } from '../../types/task.types';

describe('Mobile Sorting Utilities', () => {
  const baseTime = new Date('2026-10-01T12:00:00.000Z').getTime();

  const mockTasks: Task[] = [
    {
      _id: 'task-1',
      title: 'Low Priority Future',
      description: '',
      dateTime: '2026-10-05T09:00:00.000Z',
      deadline: '2026-10-06T18:00:00.000Z',
      priority: 'low',
      status: 'pending',
      category: 'General',
      userId: 'user-1',
      createdAt: '2026-09-25T10:00:00.000Z',
      updatedAt: '2026-09-25T10:00:00.000Z',
    },
    {
      _id: 'task-2',
      title: 'Overdue Urgent Work',
      description: '',
      dateTime: '2026-10-01T08:00:00.000Z',
      deadline: '2026-10-01T10:00:00.000Z', // 2 hours overdue
      priority: 'high',
      status: 'pending',
      category: 'Work',
      userId: 'user-1',
      createdAt: '2026-09-25T10:00:00.000Z',
      updatedAt: '2026-09-25T10:00:00.000Z',
    },
    {
      _id: 'task-3',
      title: 'Completed Task',
      description: '',
      dateTime: '2026-09-28T09:00:00.000Z',
      deadline: '2026-09-29T18:00:00.000Z',
      priority: 'high',
      status: 'completed',
      category: 'Personal',
      userId: 'user-1',
      createdAt: '2026-09-20T10:00:00.000Z',
      updatedAt: '2026-09-29T10:00:00.000Z',
    },
  ];

  it('should rank overdue task highest in composite score', () => {
    const overdueScore = calculateCompositeScore(mockTasks[1], baseTime);
    const futureScore = calculateCompositeScore(mockTasks[0], baseTime);
    expect(overdueScore).toBeGreaterThan(futureScore);
  });

  it('should place completed tasks at the bottom of the composite sort', () => {
    const sorted = sortTasksComposite(mockTasks);
    expect(sorted[0]._id).toBe('task-2'); // Overdue task
    expect(sorted[sorted.length - 1]._id).toBe('task-3'); // Completed task
  });

  it('should not mutate original input array', () => {
    const copy = JSON.stringify(mockTasks);
    sortTasksComposite(mockTasks);
    expect(JSON.stringify(mockTasks)).toBe(copy);
  });

  it('should correctly sort by deadline', () => {
    const sorted = sortTasks(mockTasks, 'deadline');
    // Pending tasks should come first, ordered by deadline ascending
    expect(sorted[0]._id).toBe('task-2');
    expect(sorted[1]._id).toBe('task-1');
    expect(sorted[2]._id).toBe('task-3'); // Completed is last
  });

  it('should correctly sort by priority', () => {
    const sorted = sortTasks(mockTasks, 'priority');
    expect(sorted[0]._id).toBe('task-2'); // High priority pending
    expect(sorted[1]._id).toBe('task-1'); // Low priority pending
  });
});
