import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { sign, verify, type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';
import { SignInDto } from '../dto/sign-in.dto';
import { SignUpDto } from '../dto/sign-up.dto';
import { AuthContext } from '../types/authenticated-request.type';

type AccessTokenClaims = JwtPayload & {
  sub: string;
  email: string;
};

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async signUp(dto: SignUpDto) {
    const user = await this.usersService.createUser(dto);
    return this.createAuthResponse(user);
  }

  async signIn(dto: SignInDto) {
    const user = await this.usersService.validateCredentials(
      dto.email,
      dto.password,
    );
    return this.createAuthResponse(user);
  }

  async authenticate(request: Request): Promise<AuthContext> {
    const token = this.extractBearerToken(request.headers.authorization);

    let claims: AccessTokenClaims;

    try {
      claims = verify(token, this.getJwtSecret()) as AccessTokenClaims;
    } catch {
      throw new UnauthorizedException(
        'JWT токен хүчингүй эсвэл хугацаа дууссан байна',
      );
    }

    if (!claims.sub || !claims.email) {
      throw new UnauthorizedException('JWT токены мэдээлэл дутуу байна');
    }

    const localUser = await this.usersService.getById(claims.sub);

    return {
      userId: localUser.id,
      email: localUser.email,
      localUser,
      claims: {
        sub: claims.sub,
        email: claims.email,
        iat: claims.iat,
        exp: claims.exp,
      },
    };
  }

  private createAuthResponse(user: User) {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') ?? '7d';
    const accessToken = sign(
      {
        sub: user.id,
        email: user.email,
      },
      this.getJwtSecret(),
      { expiresIn } as SignOptions,
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user,
    };
  }

  private getJwtSecret(): string {
    const secret = this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new InternalServerErrorException(
        'JWT_SECRET тохируулагдаагүй байна',
      );
    }

    return secret;
  }

  private extractBearerToken(authorization?: string): string {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header алга байна');
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Bearer token хэлбэр буруу байна');
    }

    return token;
  }
}
