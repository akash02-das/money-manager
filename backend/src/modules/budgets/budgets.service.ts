import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { TransactionType } from '@prisma/client';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  private parseYearMonth(ymString: string): { year: number; month: number } {
    const [yearStr, monthStr] = ymString.split('-');
    return {
      year: parseInt(yearStr, 10),
      month: parseInt(monthStr, 10),
    };
  }

  private getDateRange(year: number, month: number) {
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    return { start, end };
  }

  async findAll(userId: string, monthParam?: string) {
    let year: number | undefined;
    let month: number | undefined;

    if (monthParam) {
      const parsed = this.parseYearMonth(monthParam);
      year = parsed.year;
      month = parsed.month;
    }

    const budgets = await this.prisma.budget.findMany({
      where: {
        userId,
        ...(year && { year }),
        ...(month && { month }),
      },
      include: {
        category: true,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    if (budgets.length === 0) {
      return [];
    }

    // Calculate actual spending for each budget
    return Promise.all(
      budgets.map(async (b) => {
        const { start, end } = this.getDateRange(b.year, b.month);

        const aggregate = await this.prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: b.categoryId,
            type: TransactionType.EXPENSE,
            date: {
              gte: start,
              lt: end,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const spent = Number(aggregate._sum.amount || 0);

        return {
          id: b.id,
          categoryId: b.categoryId,
          category: b.category,
          month: `${b.year}-${String(b.month).padStart(2, '0')}`,
          limit: Number(b.amount),
          spent,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
        };
      }),
    );
  }

  async findOne(userId: string, id: string) {
    const b = await this.prisma.budget.findFirst({
      where: { id, userId },
      include: { category: true },
    });

    if (!b) {
      throw new NotFoundException(`Budget with ID "${id}" not found.`);
    }

    const { start, end } = this.getDateRange(b.year, b.month);
    const aggregate = await this.prisma.transaction.aggregate({
      where: {
        userId,
        categoryId: b.categoryId,
        type: TransactionType.EXPENSE,
        date: {
          gte: start,
          lt: end,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const spent = Number(aggregate._sum.amount || 0);

    return {
      id: b.id,
      categoryId: b.categoryId,
      category: b.category,
      month: `${b.year}-${String(b.month).padStart(2, '0')}`,
      limit: Number(b.amount),
      spent,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    };
  }

  async create(userId: string, dto: CreateBudgetDto) {
    const { year, month } = this.parseYearMonth(dto.month);

    // Verify category exists
    const category = await this.prisma.category.findFirst({
      where: { id: dto.categoryId, userId },
    });
    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    // Upsert budget: if already defined for this category and month, update the limit
    const budget = await this.prisma.budget.upsert({
      where: {
        userId_categoryId_year_month: {
          userId,
          categoryId: dto.categoryId,
          year,
          month,
        },
      },
      update: {
        amount: dto.limit,
      },
      create: {
        userId,
        categoryId: dto.categoryId,
        year,
        month,
        amount: dto.limit,
      },
      include: {
        category: true,
      },
    });

    return this.findOne(userId, budget.id);
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto) {
    const existing = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException(`Budget with ID "${id}" not found.`);
    }

    await this.prisma.budget.update({
      where: { id },
      data: {
        ...(dto.limit !== undefined && { amount: dto.limit }),
      },
    });

    return this.findOne(userId, id);
  }

  async delete(userId: string, id: string) {
    const existing = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException(`Budget with ID "${id}" not found.`);
    }

    await this.prisma.budget.delete({
      where: { id },
    });

    return { success: true, message: 'Budget deleted successfully.' };
  }
}

