import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtAuthService } from './services/jwt-auth.service';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [AuthController],
  providers: [JwtAuthService, JwtAuthGuard],
  exports: [JwtAuthService, JwtAuthGuard],
})
export class AuthModule {}
