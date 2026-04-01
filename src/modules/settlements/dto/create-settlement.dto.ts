import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSettlementDto {
  @ApiProperty({ example: '6a2f6c5f-6a2f-4a62-bf42-6f4bd3a63c21' })
  @IsUUID()
  fromUserId: string;

  @ApiProperty({ example: '7d2f6c5f-6a2f-4a62-bf42-6f4bd3a63c22' })
  @IsUUID()
  toUserId: string;

  @ApiProperty({ example: 15000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: 'MNT', default: 'MNT' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiProperty({ example: '2026-04-01T12:30:00.000Z' })
  @IsDateString()
  settledAt: string;

  @ApiPropertyOptional({ example: 'Сарын эцсийн тооцоо' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
