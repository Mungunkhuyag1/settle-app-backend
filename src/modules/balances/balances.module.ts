import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { GroupsModule } from '../groups/groups.module';
import { SettlementsModule } from '../settlements/settlements.module';
import { UsersModule } from '../users/users.module';
import { BalancesController } from './balances.controller';
import { BalancesService } from './balances.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    GroupsModule,
    forwardRef(() => UsersModule),
    forwardRef(() => ExpensesModule),
    forwardRef(() => SettlementsModule),
  ],
  controllers: [BalancesController],
  providers: [BalancesService],
  exports: [BalancesService],
})
export class BalancesModule {}
