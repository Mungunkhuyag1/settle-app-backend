import { ApiProperty } from '@nestjs/swagger';
import {
  BalanceCounterpartyDto,
  GroupMemberBalanceDto,
} from './balance-summary-response.dto';

export class MyGroupBalanceResponseDto {
  @ApiProperty()
  groupId: string;

  @ApiProperty()
  groupName: string;

  @ApiProperty({ nullable: true })
  groupDescription: string | null;

  @ApiProperty()
  myRole: string;

  @ApiProperty()
  memberCount: number;

  @ApiProperty()
  netBalance: number;

  @ApiProperty({ type: BalanceCounterpartyDto, isArray: true })
  receivables: BalanceCounterpartyDto[];

  @ApiProperty({ type: BalanceCounterpartyDto, isArray: true })
  payables: BalanceCounterpartyDto[];

  static fromGroupBalance(params: {
    groupId: string;
    groupName: string;
    groupDescription: string | null;
    myRole: string;
    memberCount: number;
    balance: GroupMemberBalanceDto;
  }): MyGroupBalanceResponseDto {
    return {
      groupId: params.groupId,
      groupName: params.groupName,
      groupDescription: params.groupDescription,
      myRole: params.myRole,
      memberCount: params.memberCount,
      netBalance: params.balance.netBalance,
      receivables: params.balance.receivables,
      payables: params.balance.payables,
    };
  }
}
