import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
        location: true,
        monthlySavingsTarget: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.location !== undefined && { location: dto.location.trim() }),
        ...(dto.monthlySavingsTarget !== undefined && {
          monthlySavingsTarget: dto.monthlySavingsTarget,
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
        location: true,
        monthlySavingsTarget: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}

