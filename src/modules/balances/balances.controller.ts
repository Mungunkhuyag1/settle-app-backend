import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { BalancesService } from './balances.service';
import { BalanceSummaryResponseDto } from './dto/balance-summary-response.dto';

@ApiTags('Balances')
@ApiBearerAuth()
@Controller('groups/:groupId/balances')
@UseGuards(JwtAuthGuard)
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Get()
  @ApiOperation({
    summary:
      'Тухайн группийн хэрэглэгч бүрийн net balance болон 2 хүний хоорондын цэвэр өр авлагын жагсаалтыг авна',
  })
  @ApiParam({ name: 'groupId', description: 'Группийн UUID' })
  @ApiOkResponse({ type: BalanceSummaryResponseDto })
  async getBalances(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
  ): Promise<BalanceSummaryResponseDto> {
    return this.balancesService.getGroupBalances(groupId, user.id);
  }
}
