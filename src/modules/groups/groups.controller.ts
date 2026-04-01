import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupMemberResponseDto } from './dto/group-member-response.dto';
import { GroupResponseDto } from './dto/group-response.dto';
import { GroupMemberRole } from './enums/group-member-role.enum';
import { GroupsService } from './groups.service';

@ApiTags('Groups')
@ApiBearerAuth()
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Шинэ групп үүсгэнэ. Үүсгэсэн хэрэглэгч автоматаар owner болно',
  })
  @ApiBody({ type: CreateGroupDto })
  @ApiOkResponse({ type: GroupResponseDto })
  async createGroup(
    @CurrentUser() user: User,
    @Body() dto: CreateGroupDto,
  ): Promise<GroupResponseDto> {
    const group = await this.groupsService.createGroup(user.id, dto);
    return GroupResponseDto.fromEntity(group, GroupMemberRole.OWNER, 1);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Нэвтэрсэн хэрэглэгчийн owner эсвэл member байгаа бүх группийг авна',
  })
  @ApiOkResponse({ type: GroupResponseDto, isArray: true })
  async listMyGroups(@CurrentUser() user: User): Promise<GroupResponseDto[]> {
    const groups = await this.groupsService.listMyGroups(user.id);

    return groups.map((item) =>
      GroupResponseDto.fromEntity(item.group, item.myRole, item.memberCount),
    );
  }

  @Get(':groupId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Тухайн группийн member эсвэл owner хэрэглэгч группийн дэлгэрэнгүйг авна',
  })
  @ApiParam({ name: 'groupId', description: 'Группийн UUID' })
  @ApiOkResponse({ type: GroupResponseDto })
  async getGroup(
    @CurrentUser() user: User,
    @Param('groupId') groupId: string,
  ): Promise<GroupResponseDto> {
    const group = await this.groupsService.getGroupForUser(groupId, user.id);

    return GroupResponseDto.fromEntity(
      group.group,
      group.myRole,
      group.memberCount,
    );
  }

  @Get(':groupId/members')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Тухайн группийн гишүүдийн жагсаалтыг авна',
  })
  @ApiParam({ name: 'groupId', description: 'Группийн UUID' })
  @ApiOkResponse({ type: GroupMemberResponseDto, isArray: true })
  async listMembers(
    @CurrentUser() user: User,
    @Param('groupId') groupId: string,
  ): Promise<GroupMemberResponseDto[]> {
    const members = await this.groupsService.listMembers(groupId, user.id);

    return members.map((member) => GroupMemberResponseDto.fromEntity(member));
  }

  @Post(':groupId/members')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Группийн owner хэрэглэгч шинэ гишүүн нэмнэ',
  })
  @ApiParam({ name: 'groupId', description: 'Группийн UUID' })
  @ApiBody({ type: AddGroupMemberDto })
  @ApiOkResponse({ type: GroupMemberResponseDto })
  async addMember(
    @CurrentUser() user: User,
    @Param('groupId') groupId: string,
    @Body() dto: AddGroupMemberDto,
  ): Promise<GroupMemberResponseDto> {
    const member = await this.groupsService.addMember(groupId, user.id, dto);
    return GroupMemberResponseDto.fromEntity(member);
  }

  @Delete(':groupId/members/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Группийн owner хэрэглэгч гишүүнийг группээс хасна',
  })
  @ApiParam({ name: 'groupId', description: 'Группийн UUID' })
  @ApiParam({ name: 'userId', description: 'Хасагдах хэрэглэгчийн UUID' })
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        message: 'Гишүүнийг группээс амжилттай хаслаа',
      },
    },
  })
  async removeMember(
    @CurrentUser() user: User,
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.groupsService.removeMember(groupId, user.id, userId);

    return {
      success: true,
      message: 'Гишүүнийг группээс амжилттай хаслаа',
    };
  }
}
