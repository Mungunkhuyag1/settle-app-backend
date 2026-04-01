import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../types/authenticated-request.type';

export const CurrentAuth = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.authContext) {
      throw new UnauthorizedException('Authentication context is missing');
    }

    return request.authContext;
  },
);
