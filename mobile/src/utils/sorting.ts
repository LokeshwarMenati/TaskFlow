import { Task, TaskSortOption } from '../types/task.types';

/**
 * Calculates a composite score for a task to determine urgency and priority ranking.
 *
 * WEIGHT EXPLANATION:
 * // Composite ranking balances deadline urgency, explicit task priority,
 * // and scheduled time. Deadline receives the strongest influence because
 * // overdue/near-deadline work requires more immediate attention, while
 * // priority and scheduled time resolve otherwise similar tasks.
 *
 * Weights breakdown:
 * - Deadline Urgency: 0.50 (50%) -> Imminent deadlines and overdue items demand highest focus
 * - Explicit Priority: 0.35 (35%) -> User-assigned intent (high/medium/low) remains a primary driver
 * - Scheduled Date/Time: 0.15 (15%) -> Serves as a tie-breaker; earlier scheduled items come first
 */
export const calculateCompositeScore = (task: Task, nowMs = Date.now()): number => {
  // If task is completed, it should be ranked at the bottom regardless of urgency
  if (task.status === 'completed') {
    return -1000 + (new Date(task.updatedAt || task.createdAt || 0).getTime() / 1e12);
  }

  // 1. Priority Score [0..1]
  let priorityVal = 2; // medium default
  const priority = String(task.priority || '').toLowerCase();
  if (priority === 'high') priorityVal = 3;
  else if (priority === 'low') priorityVal = 1;
  const priorityScore = priorityVal / 3; // normalized: low=0.333, med=0.667, high=1.000

  // 2. Deadline Urgency Score [0..2.0]
  const deadlineMs = new Date(task.deadline).getTime();
  const diffHours = (deadlineMs - nowMs) / (1000 * 60 * 60);

  let deadlineScore = 0;
  if (isNaN(deadlineMs)) {
    deadlineScore = 0.2;
  } else if (diffHours < 0) {
    // Overdue tasks: score from 1.2 to 2.0 depending on how long overdue
    const overdueHours = Math.abs(diffHours);
    deadlineScore = 1.2 + Math.min(0.8, overdueHours / 72); // max 2.0
  } else if (diffHours <= 24) {
    // Due within 24 hours: urgency 0.85 to 1.15
    deadlineScore = 0.85 + (1 - diffHours / 24) * 0.3;
  } else if (diffHours <= 72) {
    // Due within 3 days: urgency 0.60 to 0.85
    deadlineScore = 0.6 + (1 - (diffHours - 24) / 48) * 0.25;
  } else if (diffHours <= 168) {
    // Due within 7 days: urgency 0.35 to 0.60
    deadlineScore = 0.35 + (1 - (diffHours - 72) / 96) * 0.25;
  } else {
    // Beyond 7 days: smoothly decay down to ~0.05
    deadlineScore = Math.max(0.05, 0.35 / (1 + (diffHours - 168) / 168));
  }

  // 3. Scheduled Date/Time Urgency Score [0..1]
  const dateTimeMs = new Date(task.dateTime).getTime();
  let scheduledScore = 0.5;
  if (!isNaN(dateTimeMs)) {
    const scheduledDiffHours = (dateTimeMs - nowMs) / (1000 * 60 * 60);
    if (scheduledDiffHours <= 0) {
      scheduledScore = 1.0;
    } else if (scheduledDiffHours <= 24) {
      scheduledScore = 0.8;
    } else if (scheduledDiffHours <= 72) {
      scheduledScore = 0.6;
    } else {
      scheduledScore = Math.max(0.1, 0.5 / (1 + scheduledDiffHours / 168));
    }
  }

  // Weighted sum
  const DEADLINE_WEIGHT = 0.50;
  const PRIORITY_WEIGHT = 0.35;
  const SCHEDULED_WEIGHT = 0.15;

  return (
    deadlineScore * DEADLINE_WEIGHT +
    priorityScore * PRIORITY_WEIGHT +
    scheduledScore * SCHEDULED_WEIGHT
  );
};

/**
 * Pure function to sort tasks according to composite urgency ranking without mutating the input array.
 */
export const sortTasksComposite = (tasks: Task[]): Task[] => {
  if (!Array.isArray(tasks)) return [];
  const now = Date.now();
  return [...tasks].sort((a, b) => {
    const scoreA = calculateCompositeScore(a, now);
    const scoreB = calculateCompositeScore(b, now);
    return scoreB - scoreA;
  });
};

/**
 * General sort dispatcher respecting user selected criteria without array mutation.
 */
export const sortTasks = (tasks: Task[], option: TaskSortOption): Task[] => {
  if (!Array.isArray(tasks)) return [];

  const copy = [...tasks];

  switch (option) {
    case 'deadline':
      return copy.sort((a, b) => {
        // Pending first, completed last
        if (a.status !== b.status) return a.status === 'completed' ? 1 : -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });

    case 'priority': {
      const priorityMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
      return copy.sort((a, b) => {
        if (a.status !== b.status) return a.status === 'completed' ? 1 : -1;
        const diff = (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
        if (diff !== 0) return diff;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    }

    case 'dateTime':
      return copy.sort((a, b) => {
        if (a.status !== b.status) return a.status === 'completed' ? 1 : -1;
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      });

    case 'createdAt':
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case 'composite':
    default:
      return sortTasksComposite(copy);
  }
};
