import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CategoryType } from '@prisma/client';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Groceries & Market', description: 'Name of the category' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name!: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.EXPENSE, description: 'Type of category' })
  @IsEnum(CategoryType)
  type!: CategoryType;

  @ApiProperty({ example: 'ShoppingBag', description: 'Lucide icon identifier name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  icon!: string;

  @ApiProperty({ example: '#f59e0b', description: 'Hex color string' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  color!: string;
}

