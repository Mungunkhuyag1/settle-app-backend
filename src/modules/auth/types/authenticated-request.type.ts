import type { Request } from 'express';
import type { User } from '../../users/entities/user.entity';

export interface AuthContext {
  userId: string;
  email: string;
  localUser: User;
  claims: {
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
  };
}

export type AuthenticatedRequest = Request & {
  authContext?: AuthContext;
};
