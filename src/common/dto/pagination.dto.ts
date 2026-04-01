import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Хуудасны дугаар',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Хуудас бүрт харуулах тоо',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
}

export class PaginatedResponseDto<T> {
  @ApiPropertyOptional({ description: 'Өгөгдлийн жагсаалт' })
  data: T[];

  @ApiPropertyOptional({ description: 'Нийт тоо' })
  total: number;

  @ApiPropertyOptional({ description: 'Одоогийн хуудас' })
  page: number;

  @ApiPropertyOptional({ description: 'Хуудас бүрт харуулах тоо' })
  limit: number;

  @ApiPropertyOptional({ description: 'Нийт хуудасны тоо' })
  totalPages: number;

  @ApiPropertyOptional({ description: 'Дараагийн хуудас байгаа эсэх' })
  hasNextPage: boolean;

  @ApiPropertyOptional({ description: 'Өмнөх хуудас байгаа эсэх' })
  hasPrevPage: boolean;
}
