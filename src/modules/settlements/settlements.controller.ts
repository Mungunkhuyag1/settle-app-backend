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
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { SettlementResponseDto } from './dto/settlement-response.dto';
import { SettlementsService } from './settlements.service';

@ApiTags('Settlements')
@ApiBearerAuth()
@Controller('groups/:groupId/settlements')
@UseGuards(JwtAuthGuard)
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Post()
  @ApiOperation({
    summary: 'Групп дотор settlement бүртгэнэ',
  })
  @ApiParam({ name: 'groupId', description: 'Группийн UUID' })
  @ApiBody({ type: CreateSettlementDto })
  @ApiOkResponse({ type: SettlementResponseDto })
  async createSettlement(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateSettlementDto,
  ): Promise<SettlementResponseDto> {
    const settlement = await this.settlementsService.createSettlement(
      groupId,
      user.id,
      dto,
    );

    return SettlementResponseDto.fromEntity(settlement);
  }

  @Get()
  @ApiOperation({
    summary: 'Тухайн группийн settlement-үүдийн жагсаалтыг авна',
  })
  @ApiParam({ name: 'groupId', description: 'Группийн UUID' })
  @ApiOkResponse({ type: SettlementResponseDto, isArray: true })
  async listSettlements(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
  ): Promise<SettlementResponseDto[]> {
    const settlements = await this.settlementsService.listGroupSettlements(
      groupId,
      user.id,
    );

    return settlements.map((item) => SettlementResponseDto.fromEntity(item));
  }
}
