import { ApiProperty } from '@nestjs/swagger';
import { Settlement } from '../entities/settlement.entity';

export class SettlementResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  groupId: string;

  @ApiProperty({ nullable: true })
  groupName?: string | null;

  @ApiProperty()
  fromUserId: string;

  @ApiProperty()
  fromUserEmail: string;

  @ApiProperty()
  toUserId: string;

  @ApiProperty()
  toUserEmail: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  settledAt: Date;

  @ApiProperty({ nullable: true })
  note: string | null;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(settlement: Settlement): SettlementResponseDto {
    return {
      id: settlement.id,
      groupId: settlement.groupId,
      groupName: settlement.group?.name ?? null,
      fromUserId: settlement.fromUserId,
      fromUserEmail: settlement.fromUser?.email ?? '',
      toUserId: settlement.toUserId,
      toUserEmail: settlement.toUser?.email ?? '',
      amount: Number(settlement.amount),
      currency: settlement.currency,
      settledAt: settlement.settledAt,
      note: settlement.note,
      createdBy: settlement.createdBy,
      createdAt: settlement.createdAt,
    };
  }
}
