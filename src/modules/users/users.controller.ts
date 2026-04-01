import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MyGroupBalanceResponseDto } from '../balances/dto/my-group-balance-response.dto';
import { BalancesService } from '../balances/balances.service';
import { ExpenseResponseDto } from '../expenses/dto/expense-response.dto';
import { ExpensesService } from '../expenses/expenses.service';
import { SettlementResponseDto } from '../settlements/dto/settlement-response.dto';
import { SettlementsService } from '../settlements/settlements.service';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { FilterDto } from 'src/common/dto/filter.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly expensesService: ExpensesService,
    private readonly settlementsService: SettlementsService,
    private readonly balancesService: BalancesService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'хэрэглэгчийн профайлыг авна',
  })
  @ApiOkResponse({ type: UserResponseDto })
  getMe(@CurrentUser() user: User): UserResponseDto {
    return UserResponseDto.fromEntity(user);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Нэвтэрсэн хэрэглэгчийн профайлыг шинэчилнэ',
  })
  @ApiBody({ type: UpdateMyProfileDto })
  @ApiOkResponse({ type: UserResponseDto })
  async updateMe(
    @CurrentUser() user: User,
    @Body() dto: UpdateMyProfileDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.updateMyProfile(user.id, dto);

    return UserResponseDto.fromEntity(updatedUser);
  }

  @Get('me/expenses')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Нэвтэрсэн хэрэглэгчийн оролцсон эсвэл төлсөн бүх expense-ийг авна',
  })
  @ApiOkResponse({ type: ExpenseResponseDto, isArray: true })
  async getMyExpenses(
    @CurrentUser() user: User,
  ): Promise<ExpenseResponseDto[]> {
    const expenses = await this.expensesService.listUserExpenses(user.id);
    return expenses.map((expense) => ExpenseResponseDto.fromEntity(expense));
  }

  @Get('me/settlements')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Нэвтэрсэн хэрэглэгчтэй холбоотой бүх settlement-ийг авна',
  })
  @ApiOkResponse({ type: SettlementResponseDto, isArray: true })
  async getMySettlements(
    @CurrentUser() user: User,
  ): Promise<SettlementResponseDto[]> {
    const settlements = await this.settlementsService.listUserSettlements(
      user.id,
    );
    return settlements.map((item) => SettlementResponseDto.fromEntity(item));
  }

  @Get('me/balances')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Нэвтэрсэн хэрэглэгчийн group бүр дээрх өөрийн balance мэдээллийг авна',
  })
  @ApiOkResponse({ type: MyGroupBalanceResponseDto, isArray: true })
  async getMyBalances(
    @CurrentUser() user: User,
  ): Promise<MyGroupBalanceResponseDto[]> {
    return this.balancesService.getMyBalances(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Дотоод user id-аар хэрэглэгчийн мэдээлэл авна',
  })
  @ApiParam({ name: 'id', description: 'Хэрэглэгчийн дотоод UUID' })
  @ApiOkResponse({ type: UserResponseDto })
  async getById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.getById(id);
    return UserResponseDto.fromEntity(user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Бүх хэрэглэгчийн мэдээллийг авна',
  })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  async listUsers(@Query() filter: FilterDto) {
    const data = await this.usersService.listUsers(filter);
    return data;
  }
}
