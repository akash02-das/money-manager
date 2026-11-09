import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({ example: 'akash@example.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

