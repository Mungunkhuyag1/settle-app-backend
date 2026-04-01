import { ApiProperty } from '@nestjs/swagger';
import { GroupMember } from '../entities/group-member.entity';

export class GroupMemberResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  groupId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  joinedAt: Date;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  firstName: string | null;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  static fromEntity(member: GroupMember): GroupMemberResponseDto {
    return {
      id: member.id,
      groupId: member.groupId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      email: member.user.email,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
    };
  }
}
