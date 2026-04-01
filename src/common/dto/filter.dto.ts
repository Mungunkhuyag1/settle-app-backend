import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, Matches } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Эрэмбэлэх талбар',
    example: 'createdAt',
  })
  @IsString()
  @Matches(/^[a-zA-Z_]+$/, {
    message: 'sortBy must contain only letters and underscores',
  })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Эрэмбэлэх чиглэл',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Хайх утга (email, username гэх мэт)',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
