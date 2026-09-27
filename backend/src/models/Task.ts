import mongoose, { Schema } from 'mongoose';
import { ITaskDocument } from '../types/task.types';

const TaskSchema: Schema<ITaskDocument> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    dateTime: {
      type: Date,
      required: [true, 'Scheduled date and time is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Task deadline is required'],
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority (low, medium, high)',
      },
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed'],
        message: '{VALUE} is not a valid status (pending, completed)',
      },
      default: 'pending',
      index: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: [50, 'Category cannot exceed 50 characters'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        ret._id = ret._id.toString();
        ret.userId = ret.userId.toString();
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        ret._id = ret._id.toString();
        ret.userId = ret.userId.toString();
        return ret;
      },
    },
  }
);

// Virtual property for overdue calculation
// A task is overdue ONLY if its deadline is in the past AND status !== 'completed'
TaskSchema.virtual('isOverdue').get(function (this: ITaskDocument) {
  if (this.status === 'completed') {
    return false;
  }
  return new Date(this.deadline).getTime() < Date.now();
});

// Compound indexes for user-scoped queries and performance
TaskSchema.index({ userId: 1, createdAt: -1 });
TaskSchema.index({ userId: 1, deadline: 1 });
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, priority: 1 });
TaskSchema.index({ userId: 1, category: 1 });

export const Task = mongoose.model<ITaskDocument>('Task', TaskSchema);
