import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { ExpensesService } from './expenses.service';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('groups/:groupId/expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({
    summary: 'Групп дотор шинэ expense бүртгэнэ',
  })
  @ApiParam({ name: 'groupId', description: 'Группийн UUID' })
  @ApiBody({ type: CreateExpenseDto })
  @ApiOkResponse({ type: ExpenseResponseDto })
  async createExpense(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    const expense = await this.expensesService.createExpense(
      groupId,
      user.id,
      dto,
    );
    return ExpenseResponseDto.fromEntity(expense);
  }

  @Get()
  @ApiOperation({
    summary: 'Тухайн группийн expense-үүдийн жагсаалтыг авна',
  })
  @ApiParam({ name: 'groupId', description: 'Группийн UUID' })
  @ApiOkResponse({ type: ExpenseResponseDto, isArray: true })
  async listExpenses(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
  ): Promise<ExpenseResponseDto[]> {
    const expenses = await this.expensesService.listGroupExpenses(
      groupId,
      user.id,
    );
    return expenses.map((expense) => ExpenseResponseDto.fromEntity(expense));
  }
}
