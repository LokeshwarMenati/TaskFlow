export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export interface TaskFormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateTaskForm = (data: {
  title: string;
  dateTime: Date | string;
  deadline: Date | string;
  priority?: string;
  category?: string;
}): TaskFormValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Task title is required';
  } else if (data.title.trim().length > 120) {
    errors.title = 'Title cannot exceed 120 characters';
  }

  const dateTimeMs = new Date(data.dateTime).getTime();
  if (isNaN(dateTimeMs)) {
    errors.dateTime = 'Valid scheduled date & time is required';
  }

  const deadlineMs = new Date(data.deadline).getTime();
  if (isNaN(deadlineMs)) {
    errors.deadline = 'Valid task deadline is required';
  }

  if (data.category && data.category.trim().length > 50) {
    errors.category = 'Category cannot exceed 50 characters';
  }

  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    errors.priority = 'Priority must be low, medium, or high';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
