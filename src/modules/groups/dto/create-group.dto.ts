import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'Lunch Team' })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ example: 'Мезорны өдрийн хоолны групп' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
