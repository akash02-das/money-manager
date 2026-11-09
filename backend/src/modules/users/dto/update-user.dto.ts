import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Currency } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'User full name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: Currency, example: Currency.BDT, description: 'Default currency' })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({ example: 'Dhaka, Bangladesh', description: 'Location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 15000, description: 'Monthly savings target amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlySavingsTarget?: number;
}

