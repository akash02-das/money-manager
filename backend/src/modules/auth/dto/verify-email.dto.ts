import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @ApiPropertyOptional({ example: 'akash@example.com', description: 'User email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '123456', description: '6-digit verification code' })
  @IsOptional()
  @IsString()
  @Length(6, 6, { message: 'Verification code must be exactly 6 digits' })
  code?: string;

  @ApiPropertyOptional({ example: 'b3f54d12-881b-426b-801b-9a9971bcba59', description: 'Verification link token' })
  @IsOptional()
  @IsString()
  token?: string;
}

