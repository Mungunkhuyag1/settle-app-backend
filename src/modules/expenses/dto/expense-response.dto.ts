import { ApiProperty } from '@nestjs/swagger';
import { Expense } from '../entities/expense.entity';

export class ExpenseParticipantItemDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  firstName: string | null;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty()
  shareAmount: number;
}

export class ExpenseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  groupId: string;

  @ApiProperty({ nullable: true })
  groupName?: string | null;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  paidByUserId: string;

  @ApiProperty()
  paidByEmail: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  expenseDate: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty({ type: ExpenseParticipantItemDto, isArray: true })
  participants: ExpenseParticipantItemDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(expense: Expense): ExpenseResponseDto {
    return {
      id: expense.id,
      groupId: expense.groupId,
      groupName: expense.group?.name ?? null,
      title: expense.title,
      description: expense.description,
      paidByUserId: expense.paidByUserId,
      paidByEmail: expense.paidBy?.email ?? '',
      totalAmount: Number(expense.totalAmount),
      currency: expense.currency,
      expenseDate: expense.expenseDate,
      createdBy: expense.createdBy,
      participants: (expense.participants ?? []).map((participant) => ({
        userId: participant.userId,
        email: participant.user?.email ?? '',
        firstName: participant.user?.firstName ?? null,
        lastName: participant.user?.lastName ?? null,
        shareAmount: Number(participant.shareAmount),
      })),
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }
}
