import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, includeArchived = false) {
    return this.prisma.account.findMany({
      where: {
        userId,
        ...(!includeArchived && { isArchived: false }),
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID "${id}" not found.`);
    }

    return account;
  }

  async create(userId: string, dto: CreateAccountDto) {
    const existing = await this.prisma.account.findFirst({
      where: {
        userId,
        name: dto.name.trim(),
      },
    });

    if (existing) {
      throw new ConflictException(
        `An account with the name "${dto.name}" already exists.`,
      );
    }

    const initial = dto.initialBalance || 0;

    return this.prisma.account.create({
      data: {
        userId,
        name: dto.name.trim(),
        type: dto.type,
        initialBalance: initial,
        balance: initial,
        currency: dto.currency || 'BDT',
        institution: dto.institution?.trim(),
        accountNumberLast4: dto.accountNumberLast4?.trim(),
        color: dto.color || '#0284c7',
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateAccountDto) {
    await this.findOne(userId, id);

    if (dto.name) {
      const existing = await this.prisma.account.findFirst({
        where: {
          userId,
          name: dto.name.trim(),
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `An account with the name "${dto.name}" already exists.`,
        );
      }
    }

    return this.prisma.account.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.institution !== undefined && { institution: dto.institution?.trim() }),
        ...(dto.accountNumberLast4 !== undefined && {
          accountNumberLast4: dto.accountNumberLast4?.trim(),
        }),
        ...(dto.color && { color: dto.color }),
        ...(dto.isArchived !== undefined && { isArchived: dto.isArchived }),
      },
    });
  }

  async delete(userId: string, id: string) {
    await this.findOne(userId, id);

    const transactionCount = await this.prisma.transaction.count({
      where: {
        OR: [{ accountId: id }, { toAccountId: id }],
      },
    });

    if (transactionCount > 0) {
      throw new BadRequestException(
        `Cannot delete this account because it has ${transactionCount} linked transaction(s). Archive the account instead.`,
      );
    }

    await this.prisma.account.delete({
      where: { id },
    });

    return { success: true, message: 'Account deleted successfully.' };
  }
}

