import { Request, Response } from 'express';
import { createApp } from '../src/app';
import { connectDB } from '../src/config/db';

const app = createApp();

export default async function handler(req: Request, res: Response) {
  try {
    await connectDB();
  } catch (error) {
    console.error('[Vercel Serverless] MongoDB connection error:', (error as Error).message);
  }
  return app(req, res);
}
