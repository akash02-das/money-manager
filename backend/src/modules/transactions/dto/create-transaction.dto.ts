import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE, description: 'Type of transaction' })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({ example: 450.5, description: 'Transaction amount (strictly positive number)' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @ApiProperty({ example: 'Dinner with team', description: 'Short summary or payee' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  description!: string;

  @ApiProperty({ example: '2026-11-10T12:00:00.000Z', description: 'ISO 8601 transaction date' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: 'acc-uuid', description: 'Source account ID' })
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @ApiPropertyOptional({ example: 'acc-to-uuid', description: 'Destination account ID (required for TRANSFER)' })
  @ValidateIf((o) => o.type === TransactionType.TRANSFER)
  @IsString()
  @IsNotEmpty({ message: 'toAccountId is required for transfer transactions' })
  toAccountId?: string;

  @ApiPropertyOptional({ example: 'cat-uuid', description: 'Category ID (required for INCOME and EXPENSE)' })
  @ValidateIf((o) => o.type !== TransactionType.TRANSFER)
  @IsString()
  @IsNotEmpty({ message: 'categoryId is required for income and expense transactions' })
  categoryId?: string;

  @ApiPropertyOptional({ example: 'Team celebration after product launch', description: 'Optional extra notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

