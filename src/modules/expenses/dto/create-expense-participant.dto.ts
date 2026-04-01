import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateExpenseParticipantDto {
  @ApiProperty({ example: '6a2f6c5f-6a2f-4a62-bf42-6f4bd3a63c21' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 12000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  shareAmount: number;
}
