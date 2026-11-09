import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Currency } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of user' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'StrongP@ssw0rd', minLength: 6, description: 'User password' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ enum: Currency, default: Currency.BDT, description: 'Preferred currency' })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({ example: 'Dhaka, Bangladesh', description: 'User location' })
  @IsOptional()
  @IsString()
  location?: string;
}

