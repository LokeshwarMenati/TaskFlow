import { Document, Types } from 'mongoose';

export interface IUser {
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ISafeUser {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthPayload {
  id: string;
  email: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: ISafeUser;
    token: string;
  };
}
