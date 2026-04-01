import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { CurrentAuth } from './decorators/current-auth.decorator';
import { AuthMeResponseDto } from './dto/auth-me-response.dto';
import { AuthTokenResponseDto } from './dto/auth-token-response.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtAuthService } from './services/jwt-auth.service';
import type { AuthContext } from './types/authenticated-request.type';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly jwtAuthService: JwtAuthService) {}

  @Post('sign-up')
  @ApiOperation({
    summary: 'Шинэ хэрэглэгч бүртгээд JWT access token буцаана',
  })
  @ApiBody({ type: SignUpDto })
  @ApiOkResponse({ type: AuthTokenResponseDto })
  async signUp(@Body() dto: SignUpDto): Promise<AuthTokenResponseDto> {
    const result = await this.jwtAuthService.signUp(dto);

    return {
      accessToken: result.accessToken,
      tokenType: result.tokenType,
      expiresIn: result.expiresIn,
      user: UserResponseDto.fromEntity(result.user),
    };
  }

  @Post('sign-in')
  @ApiOperation({
    summary: 'Имэйл болон нууц үгээр нэвтэрч JWT access token авна',
  })
  @ApiBody({ type: SignInDto })
  @ApiOkResponse({ type: AuthTokenResponseDto })
  async signIn(@Body() dto: SignInDto): Promise<AuthTokenResponseDto> {
    const result = await this.jwtAuthService.signIn(dto);

    return {
      accessToken: result.accessToken,
      tokenType: result.tokenType,
      expiresIn: result.expiresIn,
      user: UserResponseDto.fromEntity(result.user),
    };
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'JWT bearer token-оор нэвтэрсэн хэрэглэгчийн мэдээллийг авна',
  })
  @ApiOkResponse({ type: AuthMeResponseDto })
  getMe(@CurrentAuth() auth: AuthContext): AuthMeResponseDto {
    return {
      user: UserResponseDto.fromEntity(auth.localUser),
    };
  }
}
