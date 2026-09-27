import { Request, Response, NextFunction } from 'express';
import { validationResult, body, param, query } from 'express-validator';
import mongoose from 'mongoose';
import { sendError } from '../utils/response';

// Middleware to check validation results and respond if errors exist
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: (err as any).path || (err as any).param,
      message: err.msg,
    }));

    sendError(res, 'Validation failed for one or more fields', 400, extractedErrors);
    return;
  }
  next();
};

// Auth Validation Rules
export const registerValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Task Validation Rules
export const createTaskValidationRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 1, max: 120 })
    .withMessage('Task title must be between 1 and 120 characters'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('dateTime')
    .notEmpty()
    .withMessage('Scheduled date and time is required')
    .isISO8601()
    .withMessage('dateTime must be a valid ISO 8601 date string'),
  body('deadline')
    .notEmpty()
    .withMessage('Task deadline is required')
    .isISO8601()
    .withMessage('deadline must be a valid ISO 8601 date string'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('status')
    .optional()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be one of: pending, completed'),
  body('category')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
];

export const updateTaskValidationRules = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid task ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ min: 1, max: 120 })
    .withMessage('Task title must be between 1 and 120 characters'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('dateTime')
    .optional()
    .isISO8601()
    .withMessage('dateTime must be a valid ISO 8601 date string'),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('deadline must be a valid ISO 8601 date string'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('status')
    .optional()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be one of: pending, completed'),
  body('category')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
];

export const taskIdParamValidationRules = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid task ID format'),
];

export const taskQueryValidationRules = [
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'all'])
    .withMessage('Status filter must be pending, completed, or all'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'all'])
    .withMessage('Priority filter must be low, medium, high, or all'),
  query('sort')
    .optional()
    .isIn(['composite', 'deadline', 'priority', 'createdAt', 'dateTime'])
    .withMessage('Sort option must be composite, deadline, priority, createdAt, or dateTime'),
];
