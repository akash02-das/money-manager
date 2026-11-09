import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'BRAC Bank Salary A/C' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  name?: string;

  @ApiPropertyOptional({ example: 'BRAC Bank PLC' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  institution?: string;

  @ApiPropertyOptional({ example: '4821' })
  @IsOptional()
  @IsString()
  @MaxLength(4)
  accountNumberLast4?: string;

  @ApiPropertyOptional({ example: '#0284c7' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}

