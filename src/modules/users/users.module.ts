import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BalancesModule } from '../balances/balances.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { SettlementsModule } from '../settlements/settlements.module';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    forwardRef(() => ExpensesModule),
    forwardRef(() => SettlementsModule),
    forwardRef(() => BalancesModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
