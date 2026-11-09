import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBudgetDto {
  @ApiProperty({ example: 'cat-uuid', description: 'Category ID to budget for' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({ example: '2026-11', description: 'Budget target month in YYYY-MM format' })
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month must be in YYYY-MM format (e.g. 2026-11)',
  })
  month!: string;

  @ApiProperty({ example: 15000, description: 'Budget limit amount' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  limit!: number;
}

