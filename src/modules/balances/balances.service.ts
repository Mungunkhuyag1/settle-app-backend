import { Injectable } from '@nestjs/common';
import { GroupsService } from '../groups/groups.service';
import { ExpensesService } from '../expenses/expenses.service';
import { SettlementsService } from '../settlements/settlements.service';
import {
  BalanceSummaryResponseDto,
  GroupMemberBalanceDto,
  PairwiseSettlementDto,
} from './dto/balance-summary-response.dto';
import { MyGroupBalanceResponseDto } from './dto/my-group-balance-response.dto';

@Injectable()
export class BalancesService {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly expensesService: ExpensesService,
    private readonly settlementsService: SettlementsService,
  ) {}

  async getGroupBalances(
    groupId: string,
    userId: string,
  ): Promise<BalanceSummaryResponseDto> {
    const members = await this.groupsService.listMembers(groupId, userId);
    const expenses = await this.expensesService.listGroupExpenses(
      groupId,
      userId,
    );
    const settlements = await this.settlementsService.listSettlementsRawByGroup(
      groupId,
      userId,
    );

    const balanceMap = new Map<string, number>();
    const pairDebtMap = new Map<string, number>();

    for (const member of members) {
      balanceMap.set(member.userId, 0);
    }

    for (const expense of expenses) {
      balanceMap.set(
        expense.paidByUserId,
        roundMoney(
          (balanceMap.get(expense.paidByUserId) ?? 0) +
            Number(expense.totalAmount),
        ),
      );

      for (const participant of expense.participants ?? []) {
        if (participant.userId !== expense.paidByUserId) {
          addPairDebt(
            pairDebtMap,
            participant.userId,
            expense.paidByUserId,
            Number(participant.shareAmount),
          );
        }

        balanceMap.set(
          participant.userId,
          roundMoney(
            (balanceMap.get(participant.userId) ?? 0) -
              Number(participant.shareAmount),
          ),
        );
      }
    }

    for (const settlement of settlements) {
      addPairDebt(
        pairDebtMap,
        settlement.fromUserId,
        settlement.toUserId,
        -Number(settlement.amount),
      );

      balanceMap.set(
        settlement.fromUserId,
        roundMoney(
          (balanceMap.get(settlement.fromUserId) ?? 0) +
            Number(settlement.amount),
        ),
      );

      balanceMap.set(
        settlement.toUserId,
        roundMoney(
          (balanceMap.get(settlement.toUserId) ?? 0) -
            Number(settlement.amount),
        ),
      );
    }

    const membersWithBalance: GroupMemberBalanceDto[] = members.map(
      (member) => ({
        userId: member.userId,
        email: member.user.email,
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        netBalance: roundMoney(balanceMap.get(member.userId) ?? 0),
        receivables: [],
        payables: [],
      }),
    );

    const pairwiseSettlements = buildPairwiseSettlements(
      pairDebtMap,
      membersWithBalance,
    );

    const memberMap = new Map(
      membersWithBalance.map((member) => [member.userId, member]),
    );

    for (const settlement of pairwiseSettlements) {
      const payer = memberMap.get(settlement.fromUserId);
      const receiver = memberMap.get(settlement.toUserId);

      if (payer) {
        payer.payables.push({
          userId: settlement.toUserId,
          email: settlement.toUserEmail,
          firstName: receiver?.firstName ?? null,
          lastName: receiver?.lastName ?? null,
          amount: settlement.amount,
        });
      }

      if (receiver) {
        receiver.receivables.push({
          userId: settlement.fromUserId,
          email: settlement.fromUserEmail,
          firstName: payer?.firstName ?? null,
          lastName: payer?.lastName ?? null,
          amount: settlement.amount,
        });
      }
    }

    return {
      members: membersWithBalance,
      pairwiseSettlements,
    };
  }

  async getMyBalances(userId: string): Promise<MyGroupBalanceResponseDto[]> {
    const groups = await this.groupsService.listMyGroups(userId);
    const results: MyGroupBalanceResponseDto[] = [];

    for (const item of groups) {
      const summary = await this.getGroupBalances(item.group.id, userId);
      const myBalance = summary.members.find(
        (member) => member.userId === userId,
      );

      if (!myBalance) {
        continue;
      }

      results.push(
        MyGroupBalanceResponseDto.fromGroupBalance({
          groupId: item.group.id,
          groupName: item.group.name,
          groupDescription: item.group.description,
          myRole: item.myRole,
          memberCount: item.memberCount,
          balance: myBalance,
        }),
      );
    }

    return results;
  }
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function addPairDebt(
  pairDebtMap: Map<string, number>,
  fromUserId: string,
  toUserId: string,
  amount: number,
): void {
  const key = `${fromUserId}:${toUserId}`;
  pairDebtMap.set(key, roundMoney((pairDebtMap.get(key) ?? 0) + amount));
}

function buildPairwiseSettlements(
  pairDebtMap: Map<string, number>,
  members: GroupMemberBalanceDto[],
): PairwiseSettlementDto[] {
  const settlements: PairwiseSettlementDto[] = [];
  const memberMap = new Map(members.map((member) => [member.userId, member]));
  const processedPairs = new Set<string>();

  for (const key of pairDebtMap.keys()) {
    const [leftUserId, rightUserId] = key.split(':');
    const canonicalKey = [leftUserId, rightUserId].sort().join(':');

    if (processedPairs.has(canonicalKey)) {
      continue;
    }

    processedPairs.add(canonicalKey);

    const leftToRight = pairDebtMap.get(`${leftUserId}:${rightUserId}`) ?? 0;
    const rightToLeft = pairDebtMap.get(`${rightUserId}:${leftUserId}`) ?? 0;
    const net = roundMoney(leftToRight - rightToLeft);

    if (net === 0) {
      continue;
    }

    if (net > 0) {
      settlements.push({
        fromUserId: leftUserId,
        fromUserEmail: memberMap.get(leftUserId)?.email ?? '',
        toUserId: rightUserId,
        toUserEmail: memberMap.get(rightUserId)?.email ?? '',
        amount: net,
      });
      continue;
    }

    settlements.push({
      fromUserId: rightUserId,
      fromUserEmail: memberMap.get(rightUserId)?.email ?? '',
      toUserId: leftUserId,
      toUserEmail: memberMap.get(leftUserId)?.email ?? '',
      amount: Math.abs(net),
    });
  }

  return settlements.sort((a, b) => {
    if (a.fromUserEmail === b.fromUserEmail) {
      return a.toUserEmail.localeCompare(b.toUserEmail);
    }

    return a.fromUserEmail.localeCompare(b.fromUserEmail);
  });
}
