import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateExpenseParticipantDto } from './create-expense-participant.dto';

export class CreateExpenseDto {
  @ApiProperty({ example: 'KFC lunch' })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({ example: '4 хүн хамт хооллосон' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: '6a2f6c5f-6a2f-4a62-bf42-6f4bd3a63c21' })
  @IsUUID()
  paidByUserId: string;

  @ApiProperty({ example: 42000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  totalAmount: number;

  @ApiProperty({ example: 'MNT', default: 'MNT' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiProperty({ example: '2026-04-01' })
  @IsDateString()
  expenseDate: string;

  @ApiProperty({ type: CreateExpenseParticipantDto, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseParticipantDto)
  participants: CreateExpenseParticipantDto[];
}
