import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupMember } from './entities/group-member.entity';
import { Group } from './entities/group.entity';
import { GroupMemberRole } from './enums/group-member-role.enum';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMembersRepository: Repository<GroupMember>,
    private readonly usersService: UsersService,
  ) {}

  async createGroup(ownerUserId: string, dto: CreateGroupDto): Promise<Group> {
    await this.usersService.getById(ownerUserId);

    const group = this.groupsRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      createdBy: ownerUserId,
    });

    const savedGroup = await this.groupsRepository.save(group);

    const ownerMembership = this.groupMembersRepository.create({
      groupId: savedGroup.id,
      userId: ownerUserId,
      role: GroupMemberRole.OWNER,
    });

    await this.groupMembersRepository.save(ownerMembership);

    return savedGroup;
  }

  async listMyGroups(userId: string): Promise<GroupResponseView[]> {
    const memberships = await this.groupMembersRepository.find({
      where: { userId },
      relations: { group: true },
      order: { joinedAt: 'DESC' },
    });

    if (!memberships.length) {
      return [];
    }

    const memberCounts = await this.getMemberCountMap(
      memberships.map((membership) => membership.groupId),
    );

    return memberships.map((membership) => ({
      group: membership.group,
      myRole: membership.role,
      memberCount: memberCounts.get(membership.groupId) ?? 0,
    }));
  }

  async getGroupForUser(
    groupId: string,
    userId: string,
  ): Promise<GroupResponseView> {
    const membership = await this.groupMembersRepository.findOne({
      where: { groupId, userId },
      relations: { group: true },
    });

    if (!membership) {
      throw new ForbiddenException(
        'Та энэ группийн мэдээллийг харах эрхгүй байна',
      );
    }

    const memberCounts = await this.getMemberCountMap([groupId]);

    return {
      group: membership.group,
      myRole: membership.role,
      memberCount: memberCounts.get(groupId) ?? 0,
    };
  }

  async listMembers(groupId: string, userId: string): Promise<GroupMember[]> {
    await this.ensureGroupMember(groupId, userId);

    return this.groupMembersRepository.find({
      where: { groupId },
      relations: { user: true },
      order: { joinedAt: 'ASC' },
    });
  }

  async addMember(
    groupId: string,
    actorUserId: string,
    dto: AddGroupMemberDto,
  ): Promise<GroupMember> {
    await this.ensureGroupOwner(groupId, actorUserId);
    await this.ensureGroupExists(groupId);
    await this.usersService.getById(dto.userId);

    const existingMembership = await this.groupMembersRepository.findOne({
      where: { groupId, userId: dto.userId },
    });

    if (existingMembership) {
      throw new ConflictException(
        'Энэ хэрэглэгч аль хэдийн группт нэмэгдсэн байна',
      );
    }

    const membership = this.groupMembersRepository.create({
      groupId,
      userId: dto.userId,
      role: GroupMemberRole.MEMBER,
    });

    const savedMembership = await this.groupMembersRepository.save(membership);

    return this.groupMembersRepository.findOneOrFail({
      where: { id: savedMembership.id },
      relations: { user: true },
    });
  }

  async removeMember(
    groupId: string,
    actorUserId: string,
    targetUserId: string,
  ): Promise<void> {
    await this.ensureGroupOwner(groupId, actorUserId);

    const membership = await this.groupMembersRepository.findOne({
      where: { groupId, userId: targetUserId },
    });

    if (!membership) {
      throw new NotFoundException('Энэ хэрэглэгч тухайн группт байхгүй байна');
    }

    if (membership.role === GroupMemberRole.OWNER) {
      throw new BadRequestException(
        'Группийн owner-г группээс хасах боломжгүй',
      );
    }

    await this.groupMembersRepository.remove(membership);
  }

  async ensureGroupExists(groupId: string): Promise<Group> {
    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Групп олдсонгүй');
    }

    return group;
  }

  async ensureGroupMember(
    groupId: string,
    userId: string,
  ): Promise<GroupMember> {
    const membership = await this.groupMembersRepository.findOne({
      where: { groupId, userId },
    });

    if (!membership) {
      throw new ForbiddenException('Та энэ группийн гишүүн биш байна');
    }

    return membership;
  }

  async ensureGroupOwner(
    groupId: string,
    userId: string,
  ): Promise<GroupMember> {
    const membership = await this.ensureGroupMember(groupId, userId);

    if (membership.role !== GroupMemberRole.OWNER) {
      throw new ForbiddenException(
        'Зөвхөн групп үүсгэсэн owner хэрэглэгч гишүүн нэмэх эсвэл хасах боломжтой',
      );
    }

    return membership;
  }

  private async getMemberCountMap(
    groupIds: string[],
  ): Promise<Map<string, number>> {
    if (!groupIds.length) {
      return new Map();
    }

    const rows = await this.groupMembersRepository
      .createQueryBuilder('groupMember')
      .select('groupMember.groupId', 'groupId')
      .addSelect('COUNT(groupMember.id)', 'memberCount')
      .where('groupMember.groupId IN (:...groupIds)', { groupIds })
      .groupBy('groupMember.groupId')
      .getRawMany<{ groupId: string; memberCount: string }>();

    return new Map(rows.map((row) => [row.groupId, Number(row.memberCount)]));
  }
}

export interface GroupResponseView {
  group: Group;
  myRole: GroupMemberRole;
  memberCount: number;
}
