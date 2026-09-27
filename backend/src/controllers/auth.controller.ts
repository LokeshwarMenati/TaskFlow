import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';

export class AuthController {
  public static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      sendSuccess(res, 'User registered successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  public static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      sendSuccess(res, 'Login successful', result, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getMe(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await AuthService.getMe(userId);
      sendSuccess(res, 'User profile retrieved successfully', { user }, 200);
    } catch (error) {
      next(error);
    }
  }
}
