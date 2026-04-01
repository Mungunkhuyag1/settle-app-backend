import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupsService } from '../groups/groups.service';
import { UsersService } from '../users/users.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { Settlement } from './entities/settlement.entity';

@Injectable()
export class SettlementsService {
  constructor(
    @InjectRepository(Settlement)
    private readonly settlementsRepository: Repository<Settlement>,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
  ) {}

  async createSettlement(
    groupId: string,
    actorUserId: string,
    dto: CreateSettlementDto,
  ): Promise<Settlement> {
    await this.groupsService.ensureGroupMember(groupId, actorUserId);
    await this.groupsService.ensureGroupMember(groupId, dto.fromUserId);
    await this.groupsService.ensureGroupMember(groupId, dto.toUserId);

    if (dto.fromUserId === dto.toUserId) {
      throw new BadRequestException(
        'Settlement дээр fromUser болон toUser ижил байж болохгүй',
      );
    }

    const settlement = this.settlementsRepository.create({
      groupId,
      fromUserId: dto.fromUserId,
      toUserId: dto.toUserId,
      amount: dto.amount,
      currency: dto.currency ?? 'MNT',
      settledAt: new Date(dto.settledAt),
      note: dto.note ?? null,
      createdBy: actorUserId,
    });

    const savedSettlement = await this.settlementsRepository.save(settlement);

    // return this.getSettlementById(groupId, actorUserId, savedSettlement.id);
    return savedSettlement;
  }

  async listGroupSettlements(
    groupId: string,
    userId: string,
  ): Promise<Settlement[]> {
    await this.groupsService.ensureGroupMember(groupId, userId);

    return this.settlementsRepository.find({
      where: { groupId },
      relations: {
        fromUser: true,
        toUser: true,
      },
      order: {
        settledAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async getSettlementById(
    groupId: string,
    userId: string,
    settlementId: string,
  ): Promise<Settlement> {
    await this.groupsService.ensureGroupMember(groupId, userId);

    const settlement = await this.settlementsRepository.findOne({
      where: { id: settlementId, groupId },
      relations: {
        fromUser: true,
        toUser: true,
      },
    });

    if (!settlement) {
      throw new NotFoundException('Settlement олдсонгүй');
    }

    return settlement;
  }

  async listSettlementsRawByGroup(
    groupId: string,
    userId: string,
  ): Promise<Settlement[]> {
    return this.listGroupSettlements(groupId, userId);
  }

  async listUserSettlements(userId: string): Promise<Settlement[]> {
    await this.usersService.getById(userId);

    return this.settlementsRepository
      .createQueryBuilder('settlement')
      .leftJoinAndSelect('settlement.group', 'group')
      .leftJoinAndSelect('settlement.fromUser', 'fromUser')
      .leftJoinAndSelect('settlement.toUser', 'toUser')
      .where('settlement.fromUserId = :userId', { userId })
      .orWhere('settlement.toUserId = :userId', { userId })
      .orWhere('settlement.createdBy = :userId', { userId })
      .orderBy('settlement.settledAt', 'DESC')
      .addOrderBy('settlement.createdAt', 'DESC')
      .distinct(true)
      .getMany();
  }
}
