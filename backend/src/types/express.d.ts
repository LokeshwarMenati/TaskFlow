import { IAuthPayload } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: IAuthPayload;
    }
  }
}
