import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupsService } from '../groups/groups.service';
import { UsersService } from '../users/users.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseParticipant } from './entities/expense-participant.entity';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
    @InjectRepository(ExpenseParticipant)
    private readonly expenseParticipantsRepository: Repository<ExpenseParticipant>,
    private readonly usersService: UsersService,
    private readonly groupsService: GroupsService,
  ) {}

  async createExpense(
    groupId: string,
    actorUserId: string,
    dto: CreateExpenseDto,
  ): Promise<Expense> {
    await this.groupsService.ensureGroupMember(groupId, actorUserId);
    await this.groupsService.ensureGroupMember(groupId, dto.paidByUserId);
    await this.validateParticipants(groupId, dto);

    const savedExpenseId = await this.expensesRepository.manager.transaction(
      async (manager) => {
        const expense = manager.create(Expense, {
          groupId,
          title: dto.title,
          description: dto.description ?? null,
          paidByUserId: dto.paidByUserId,
          totalAmount: dto.totalAmount,
          currency: dto.currency ?? 'MNT',
          expenseDate: dto.expenseDate,
          createdBy: actorUserId,
        });

        const savedExpense = await manager.save(Expense, expense);

        const participants = dto.participants.map((participant) =>
          manager.create(ExpenseParticipant, {
            expenseId: savedExpense.id,
            userId: participant.userId,
            shareAmount: participant.shareAmount,
          }),
        );

        await manager.save(ExpenseParticipant, participants);

        return savedExpense.id;
      },
    );

    return this.getExpenseByIdForGroup(savedExpenseId, groupId, actorUserId);
  }

  async listGroupExpenses(groupId: string, userId: string): Promise<Expense[]> {
    await this.groupsService.ensureGroupMember(groupId, userId);

    return this.expensesRepository.find({
      where: { groupId },
      relations: {
        paidBy: true,
        participants: { user: true },
      },
      order: {
        expenseDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async getExpenseByIdForGroup(
    expenseId: string,
    groupId: string,
    userId: string,
  ): Promise<Expense> {
    await this.groupsService.ensureGroupMember(groupId, userId);

    const expense = await this.expensesRepository.findOne({
      where: { id: expenseId, groupId },
      relations: {
        paidBy: true,
        participants: { user: true },
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense олдсонгүй');
    }

    return expense;
  }

  async listUserExpenses(userId: string): Promise<Expense[]> {
    await this.usersService.getById(userId);

    return this.expensesRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.group', 'group')
      .leftJoinAndSelect('expense.paidBy', 'paidBy')
      .leftJoinAndSelect('expense.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'participantUser')
      .where('expense.paidByUserId = :userId', { userId })
      .orWhere('expense.createdBy = :userId', { userId })
      .orWhere('participants.userId = :userId', { userId })
      .orderBy('expense.expenseDate', 'DESC')
      .addOrderBy('expense.createdAt', 'DESC')
      .distinct(true)
      .getMany();
  }

  // async listExpensesRawByGroup(
  //   groupId: string,
  //   userId: string,
  // ): Promise<Expense[]> {
  //   return this.listGroupExpenses(groupId, userId);
  // }

  private async validateParticipants(
    groupId: string,
    dto: CreateExpenseDto,
  ): Promise<void> {
    if (!dto.participants.length) {
      throw new BadRequestException(
        'Expense дор хаяж нэг оролцогчтой байх ёстой',
      );
    }

    const distinctUserIds = new Set(
      dto.participants.map((item) => item.userId),
    );

    if (distinctUserIds.size !== dto.participants.length) {
      throw new BadRequestException(
        'Нэг хэрэглэгч expense дээр давхар оролцогч байж болохгүй',
      );
    }

    const shareTotal = roundMoney(
      dto.participants.reduce(
        (sum, participant) => sum + participant.shareAmount,
        0,
      ),
    );

    if (shareTotal !== roundMoney(dto.totalAmount)) {
      throw new BadRequestException(
        'Оролцогчдын share amount-ийн нийлбэр totalAmount-тай тэнцүү байх ёстой',
      );
    }

    const members = await this.groupsService.listMembers(
      groupId,
      dto.paidByUserId,
    );
    const memberIds = new Set(members.map((member) => member.userId));

    for (const participant of dto.participants) {
      if (!memberIds.has(participant.userId)) {
        throw new BadRequestException(
          'Expense-ийн бүх оролцогч тухайн группийн гишүүн байх ёстой',
        );
      }
    }

    const users = await this.usersService.findManyByIds([...distinctUserIds]);

    if (users.length !== distinctUserIds.size) {
      throw new BadRequestException('Expense-ийн зарим хэрэглэгч олдсонгүй');
    }
  }
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
