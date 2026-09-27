import { Task } from '../types/task.types';

/**
 * Determines whether a task is overdue.
 *
 * CRITICAL RULE:
 * A task is overdue if:
 *   deadline < current time
 *   AND
 *   status !== 'completed'
 *
 * Completed tasks must NEVER be marked as overdue!
 */
export const isTaskOverdue = (task: Task | { deadline: string; status: string }): boolean => {
  if (task.status === 'completed') {
    return false;
  }
  const deadlineMs = new Date(task.deadline).getTime();
  if (isNaN(deadlineMs)) return false;
  return deadlineMs < Date.now();
};

/**
 * Formats an ISO date string into a user-friendly date format.
 * Example: "Oct 12, 2026"
 */
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Formats an ISO date string into a user-friendly time format.
 * Example: "2:30 PM"
 */
export const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Invalid Time';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formats an ISO date string into date + time format.
 * Example: "Oct 12, 2026 at 2:30 PM"
 */
export const formatDateTime = (isoString: string): string => {
  if (!isoString) return '';
  return `${formatDate(isoString)} at ${formatTime(isoString)}`;
};

/**
 * Returns a humanized relative countdown or past-due label.
 */
export const getRelativeDeadlineLabel = (deadlineIso: string, status: string): { text: string; isOverdue: boolean } => {
  if (status === 'completed') {
    return { text: 'Completed', isOverdue: false };
  }

  const deadlineMs = new Date(deadlineIso).getTime();
  const nowMs = Date.now();
  const diffMs = deadlineMs - nowMs;

  if (diffMs < 0) {
    const overdueHours = Math.abs(diffMs) / (1000 * 60 * 60);
    if (overdueHours < 1) {
      return { text: 'OVERDUE (Just now)', isOverdue: true };
    } else if (overdueHours < 24) {
      return { text: `OVERDUE (${Math.floor(overdueHours)}h ago)`, isOverdue: true };
    } else {
      const overdueDays = Math.floor(overdueHours / 24);
      return { text: `OVERDUE (${overdueDays}d ago)`, isOverdue: true };
    }
  }

  const hoursRemaining = diffMs / (1000 * 60 * 60);
  if (hoursRemaining < 1) {
    const minutesRemaining = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return { text: `Due in ${minutesRemaining}m`, isOverdue: false };
  } else if (hoursRemaining < 24) {
    return { text: `Due in ${Math.floor(hoursRemaining)}h`, isOverdue: false };
  } else if (hoursRemaining < 48) {
    return { text: 'Due tomorrow', isOverdue: false };
  } else {
    const daysRemaining = Math.floor(hoursRemaining / 24);
    return { text: `Due in ${daysRemaining} days`, isOverdue: false };
  }
};
