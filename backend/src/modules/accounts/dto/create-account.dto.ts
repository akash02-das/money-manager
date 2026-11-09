import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { AccountType, Currency } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateAccountDto {
  @ApiProperty({ example: 'BRAC Bank Salary A/C', description: 'Name of the account' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name!: string;

  @ApiProperty({ enum: AccountType, example: AccountType.BANK, description: 'Type of financial account' })
  @IsEnum(AccountType)
  type!: AccountType;

  @ApiPropertyOptional({ example: 50000, default: 0, description: 'Starting balance for this account' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  initialBalance?: number;

  @ApiPropertyOptional({ enum: Currency, default: Currency.BDT, description: 'Currency code' })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({ example: 'BRAC Bank PLC', description: 'Financial institution name' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  institution?: string;

  @ApiPropertyOptional({ example: '4821', description: 'Last 4 digits of account or card number' })
  @IsOptional()
  @IsString()
  @MaxLength(4)
  accountNumberLast4?: string;

  @ApiPropertyOptional({ example: '#0284c7', description: 'Color hex code' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;
}

