import { isTaskOverdue, formatDate, formatTime, getRelativeDeadlineLabel } from '../dateUtils';
import { Task } from '../../types/task.types';

describe('Mobile Date Utilities & Overdue Logic', () => {
  it('should identify a past deadline pending task as overdue', () => {
    const pastTask: Partial<Task> = {
      deadline: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      status: 'pending',
    };
    expect(isTaskOverdue(pastTask as Task)).toBe(true);
  });

  it('CRITICAL: should NEVER mark a completed task as overdue', () => {
    const pastCompletedTask: Partial<Task> = {
      deadline: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      status: 'completed',
    };
    expect(isTaskOverdue(pastCompletedTask as Task)).toBe(false);
  });

  it('should not mark a future deadline task as overdue', () => {
    const futureTask: Partial<Task> = {
      deadline: new Date(Date.now() + 86400000).toISOString(), // 1 day in future
      status: 'pending',
    };
    expect(isTaskOverdue(futureTask as Task)).toBe(false);
  });

  it('should format date strings properly', () => {
    const formatted = formatDate('2026-10-15T12:00:00.000Z');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Oct');
  });

  it('should return appropriate relative deadline label', () => {
    const overdueLabel = getRelativeDeadlineLabel(
      new Date(Date.now() - 7200000).toISOString(),
      'pending'
    );
    expect(overdueLabel.isOverdue).toBe(true);
    expect(overdueLabel.text).toContain('OVERDUE');

    const completedLabel = getRelativeDeadlineLabel(
      new Date(Date.now() - 7200000).toISOString(),
      'completed'
    );
    expect(completedLabel.isOverdue).toBe(false);
    expect(completedLabel.text).toBe('Completed');
  });
});
