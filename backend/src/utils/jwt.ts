import jwt, { SignOptions } from 'jsonwebtoken';
import { ENV } from '../config/env';
import { IAuthPayload } from '../types/auth.types';

export const generateToken = (payload: IAuthPayload): string => {
  const options: SignOptions = {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  };
  return jwt.sign(payload, ENV.JWT_SECRET, options);
};

export const verifyToken = (token: string): IAuthPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as IAuthPayload;
};
