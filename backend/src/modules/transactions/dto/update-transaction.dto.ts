import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateTransactionDto {
  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({ example: 'Dinner with client' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  description?: string;

  @ApiPropertyOptional({ example: '2026-11-10T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'acc-uuid' })
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiPropertyOptional({ example: 'acc-to-uuid' })
  @IsOptional()
  @IsString()
  toAccountId?: string;

  @ApiPropertyOptional({ example: 'cat-uuid' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'Notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

