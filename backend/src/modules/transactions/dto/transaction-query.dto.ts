import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';

export class TransactionQueryDto {
  @ApiPropertyOptional({ example: '2026-11-01', description: 'Filter from start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-11-30', description: 'Filter up to end date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'acc-uuid', description: 'Filter by account ID' })
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiPropertyOptional({ example: 'cat-uuid', description: 'Filter by category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: TransactionType, description: 'Filter by transaction type' })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ example: 'dinner', description: 'Search query in description or notes' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 50, default: 50, description: 'Limit number of results' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @ApiPropertyOptional({ example: 0, default: 0, description: 'Offset pagination' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

