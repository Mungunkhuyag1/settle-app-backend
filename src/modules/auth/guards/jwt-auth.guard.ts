import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthService } from '../services/jwt-auth.service';
import {
  AuthContext,
  AuthenticatedRequest,
} from '../types/authenticated-request.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtAuthService: JwtAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authContext: AuthContext =
      await this.jwtAuthService.authenticate(request);

    request.authContext = authContext;

    return true;
  }
}
