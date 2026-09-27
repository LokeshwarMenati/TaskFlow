import { sortTasksComposite, calculateCompositeScore } from '../utils/compositeSort';

describe('Composite Sort Algorithm', () => {
  const baseTime = new Date('2026-10-01T12:00:00.000Z').getTime();

  it('should rank overdue tasks higher than non-overdue tasks', () => {
    const overdueTask = {
      _id: '1',
      title: 'Overdue Task',
      deadline: new Date('2026-10-01T10:00:00.000Z').toISOString(), // 2 hours overdue
      dateTime: new Date('2026-10-01T09:00:00.000Z').toISOString(),
      priority: 'medium',
      status: 'pending',
    };

    const futureTask = {
      _id: '2',
      title: 'Future Task',
      deadline: new Date('2026-10-05T12:00:00.000Z').toISOString(), // 4 days away
      dateTime: new Date('2026-10-04T12:00:00.000Z').toISOString(),
      priority: 'medium',
      status: 'pending',
    };

    const overdueScore = calculateCompositeScore(overdueTask, baseTime);
    const futureScore = calculateCompositeScore(futureTask, baseTime);

    expect(overdueScore).toBeGreaterThan(futureScore);
  });

  it('should give higher weight to high priority when deadlines are identical', () => {
    const highPriorityTask = {
      _id: '1',
      title: 'High Priority',
      deadline: new Date('2026-10-02T12:00:00.000Z').toISOString(),
      dateTime: new Date('2026-10-01T15:00:00.000Z').toISOString(),
      priority: 'high',
      status: 'pending',
    };

    const lowPriorityTask = {
      _id: '2',
      title: 'Low Priority',
      deadline: new Date('2026-10-02T12:00:00.000Z').toISOString(),
      dateTime: new Date('2026-10-01T15:00:00.000Z').toISOString(),
      priority: 'low',
      status: 'pending',
    };

    const highScore = calculateCompositeScore(highPriorityTask, baseTime);
    const lowScore = calculateCompositeScore(lowPriorityTask, baseTime);

    expect(highScore).toBeGreaterThan(lowScore);
  });

  it('should rank completed tasks at the bottom', () => {
    const pendingTask = {
      _id: '1',
      title: 'Pending Normal',
      deadline: new Date('2026-10-10T12:00:00.000Z').toISOString(),
      dateTime: new Date('2026-10-09T12:00:00.000Z').toISOString(),
      priority: 'low',
      status: 'pending',
    };

    const completedTask = {
      _id: '2',
      title: 'Completed Task',
      deadline: new Date('2026-09-30T12:00:00.000Z').toISOString(), // Past deadline
      dateTime: new Date('2026-09-30T10:00:00.000Z').toISOString(),
      priority: 'high',
      status: 'completed',
    };

    const pendingScore = calculateCompositeScore(pendingTask, baseTime);
    const completedScore = calculateCompositeScore(completedTask, baseTime);

    expect(pendingScore).toBeGreaterThan(completedScore);
  });

  it('should not mutate the original array when sorting', () => {
    const tasks = [
      { _id: '1', title: 'Task A', deadline: '2026-10-05T00:00:00.000Z', dateTime: '2026-10-04T00:00:00.000Z', priority: 'low', status: 'pending' },
      { _id: '2', title: 'Task B', deadline: '2026-10-01T00:00:00.000Z', dateTime: '2026-10-01T00:00:00.000Z', priority: 'high', status: 'pending' },
    ];

    const copyBefore = JSON.stringify(tasks);
    const sorted = sortTasksComposite(tasks as any);

    expect(JSON.stringify(tasks)).toBe(copyBefore);
    expect(sorted[0]._id).toBe('2'); // Task B should rank first
  });
});
