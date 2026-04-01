import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getTypeOrmConfig } from './common/config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { BalancesModule } from './modules/balances/balances.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { GroupsModule } from './modules/groups/groups.module';
import { SettlementsModule } from './modules/settlements/settlements.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    GroupsModule,
    ExpensesModule,
    SettlementsModule,
    BalancesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
