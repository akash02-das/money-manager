import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TransactionType, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async adjustAccountBalances(
    tx: Prisma.TransactionClient,
    type: TransactionType,
    amount: number | Decimal,
    accountId: string,
    toAccountId?: string | null,
    reverse = false,
  ) {
    const numAmount = new Decimal(amount.toString());
    const factor = reverse ? -1 : 1;

    if (type === TransactionType.EXPENSE) {
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            decrement: numAmount.times(factor),
          },
        },
      });
    } else if (type === TransactionType.INCOME) {
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: numAmount.times(factor),
          },
        },
      });
    } else if (type === TransactionType.TRANSFER) {
      if (!toAccountId) {
        throw new BadRequestException('Transfer requires destination account');
      }

      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            decrement: numAmount.times(factor),
          },
        },
      });

      await tx.account.update({
        where: { id: toAccountId },
        data: {
          balance: {
            increment: numAmount.times(factor),
          },
        },
      });
    }
  }

  async findAll(userId: string, query: TransactionQueryDto) {
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(query.type && { type: query.type }),
      ...(query.accountId && {
        OR: [{ accountId: query.accountId }, { toAccountId: query.accountId }],
      }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.startDate || query.endDate
        ? {
            date: {
              ...(query.startDate && { gte: new Date(query.startDate) }),
              ...(query.endDate && { lte: new Date(query.endDate) }),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              {
                description: {
                  contains: query.search.trim(),
                  mode: 'insensitive',
                },
              },
              {
                notes: {
                  contains: query.search.trim(),
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          account: true,
          toAccount: true,
          category: true,
        },
        orderBy: { date: 'desc' },
        take: query.limit || 50,
        skip: query.offset || 0,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        account: true,
        toAccount: true,
        category: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID "${id}" not found.`);
    }

    return transaction;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    // Validate source account
    const sourceAccount = await this.prisma.account.findFirst({
      where: { id: dto.accountId, userId },
    });
    if (!sourceAccount) {
      throw new NotFoundException('Source account not found.');
    }

    // Validate transfer destination account
    if (dto.type === TransactionType.TRANSFER) {
      if (!dto.toAccountId) {
        throw new BadRequestException('Transfer requires a destination account.');
      }
      if (dto.toAccountId === dto.accountId) {
        throw new BadRequestException('Source and destination accounts must be different.');
      }
      const destAccount = await this.prisma.account.findFirst({
        where: { id: dto.toAccountId, userId },
      });
      if (!destAccount) {
        throw new NotFoundException('Destination account not found.');
      }
    }

    // Validate category
    if (dto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, userId },
      });
      if (!category) {
        throw new NotFoundException('Category not found.');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: dto.type,
          amount: dto.amount,
          description: dto.description.trim(),
          date: new Date(dto.date),
          accountId: dto.accountId,
          toAccountId: dto.type === TransactionType.TRANSFER ? dto.toAccountId : null,
          categoryId: dto.type !== TransactionType.TRANSFER ? dto.categoryId : null,
          notes: dto.notes?.trim(),
        },
        include: {
          account: true,
          toAccount: true,
          category: true,
        },
      });

      // 2. Adjust account balance(s)
      await this.adjustAccountBalances(
        tx,
        dto.type,
        dto.amount,
        dto.accountId,
        dto.toAccountId,
        false,
      );

      return transaction;
    });
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.findOne(userId, id);

    const targetType = dto.type || existing.type;
    const targetAccountId = dto.accountId || existing.accountId;
    const targetToAccountId =
      dto.toAccountId !== undefined ? dto.toAccountId : existing.toAccountId;
    const targetAmount = dto.amount !== undefined ? dto.amount : existing.amount;

    if (targetType === TransactionType.TRANSFER) {
      if (!targetToAccountId) {
        throw new BadRequestException('Transfer requires a destination account.');
      }
      if (targetToAccountId === targetAccountId) {
        throw new BadRequestException('Source and destination accounts must be different.');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Revert previous transaction effect on balances
      await this.adjustAccountBalances(
        tx,
        existing.type,
        existing.amount,
        existing.accountId,
        existing.toAccountId,
        true, // reverse = true
      );

      // 2. Update transaction
      const updated = await tx.transaction.update({
        where: { id },
        data: {
          ...(dto.type && { type: dto.type }),
          ...(dto.amount !== undefined && { amount: dto.amount }),
          ...(dto.description && { description: dto.description.trim() }),
          ...(dto.date && { date: new Date(dto.date) }),
          ...(dto.accountId && { accountId: dto.accountId }),
          ...(dto.toAccountId !== undefined && { toAccountId: dto.toAccountId }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          ...(dto.notes !== undefined && { notes: dto.notes?.trim() }),
        },
        include: {
          account: true,
          toAccount: true,
          category: true,
        },
      });

      // 3. Apply new transaction effect on balances
      await this.adjustAccountBalances(
        tx,
        targetType,
        targetAmount,
        targetAccountId,
        targetToAccountId,
        false,
      );

      return updated;
    });
  }

  async delete(userId: string, id: string) {
    const existing = await this.findOne(userId, id);

    await this.prisma.$transaction(async (tx) => {
      // 1. Revert effect on balances
      await this.adjustAccountBalances(
        tx,
        existing.type,
        existing.amount,
        existing.accountId,
        existing.toAccountId,
        true,
      );

      // 2. Delete transaction record
      await tx.transaction.delete({
        where: { id },
      });
    });

    return { success: true, message: 'Transaction deleted successfully.' };
  }
}

