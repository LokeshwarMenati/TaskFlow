import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';
import { sendError } from '../utils/response';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected internal server error occurred';
  let errors: any = undefined;

  // Handle Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account with that ${field} already exists.`;
  }

  // Handle Mongoose ValidationError
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error occurred';
    errors = Object.values(err.errors || {}).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
  }

  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired. Please log in again.';
  }

  // Log in development or non-test environment
  if (ENV.NODE_ENV !== 'test') {
    console.error(`[Error] ${statusCode} - ${message}`, err.stack || err);
  }

  sendError(res, message, statusCode, errors);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Cannot ${req.method} ${req.originalUrl} - Route not found`, 404);
};
