import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddGroupMemberDto {
  @ApiProperty({ example: '6a2f6c5f-6a2f-4a62-bf42-6f4bd3a63c21' })
  @IsUUID()
  userId: string;
}
