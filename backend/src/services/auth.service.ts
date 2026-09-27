import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';
import { ISafeUser, IRegisterRequest, ILoginRequest } from '../types/auth.types';

export class AuthService {
  /**
   * Registers a new user with hashed password and generates a JWT.
   */
  public static async register(data: IRegisterRequest): Promise<{ user: ISafeUser; token: string }> {
    const existingUser = await User.findOne({ email: data.email.toLowerCase().trim() });
    if (existingUser) {
      throw new AppError('Email is already registered. Please log in instead.', 409);
    }

    const newUser = await User.create({
      email: data.email.toLowerCase().trim(),
      password: data.password,
    });

    const token = generateToken({
      id: newUser._id.toString(),
      email: newUser.email,
    });

    const safeUser: ISafeUser = {
      id: newUser._id.toString(),
      email: newUser.email,
      createdAt: newUser.createdAt.toISOString(),
      updatedAt: newUser.updatedAt.toISOString(),
    };

    return { user: safeUser, token };
  }

  /**
   * Validates credentials, compares bcrypt password, and returns a JWT with safe user info.
   */
  public static async login(data: ILoginRequest): Promise<{ user: ISafeUser; token: string }> {
    const user = await User.findOne({ email: data.email.toLowerCase().trim() }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
    });

    const safeUser: ISafeUser = {
      id: user._id.toString(),
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return { user: safeUser, token };
  }

  /**
   * Returns safe details for the currently authenticated user.
   */
  public static async getMe(userId: string): Promise<ISafeUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found or account deactivated', 404);
    }

    return {
      id: user._id.toString(),
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
