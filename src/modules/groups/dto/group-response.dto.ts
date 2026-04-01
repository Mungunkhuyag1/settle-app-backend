import { ApiProperty } from '@nestjs/swagger';
import { Group } from '../entities/group.entity';
import { GroupMemberRole } from '../enums/group-member-role.enum';

export class GroupResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ enum: GroupMemberRole })
  myRole: GroupMemberRole;

  @ApiProperty()
  memberCount: number;

  static fromEntity(
    group: Group,
    myRole: GroupMemberRole,
    memberCount: number,
  ): GroupResponseDto {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      createdBy: group.createdBy,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      myRole,
      memberCount,
    };
  }
}
