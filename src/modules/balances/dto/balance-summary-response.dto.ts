import { ApiProperty } from '@nestjs/swagger';

export class BalanceCounterpartyDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  firstName: string | null;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty()
  amount: number;
}

export class GroupMemberBalanceDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  firstName: string | null;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty()
  netBalance: number;

  @ApiProperty({ type: BalanceCounterpartyDto, isArray: true })
  receivables: BalanceCounterpartyDto[];

  @ApiProperty({ type: BalanceCounterpartyDto, isArray: true })
  payables: BalanceCounterpartyDto[];
}

export class PairwiseSettlementDto {
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
}

export class BalanceSummaryResponseDto {
  @ApiProperty({ type: GroupMemberBalanceDto, isArray: true })
  members: GroupMemberBalanceDto[];

  @ApiProperty({ type: PairwiseSettlementDto, isArray: true })
  pairwiseSettlements: PairwiseSettlementDto[];
}
