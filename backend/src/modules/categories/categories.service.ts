import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryType } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, type?: CategoryType, includeArchived = false) {
    return this.prisma.category.findMany({
      where: {
        userId,
        ...(type && { type }),
        ...(!includeArchived && { isArchived: false }),
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }

    return category;
  }

  async create(userId: string, dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: {
        userId_name_type: {
          userId,
          name: dto.name.trim(),
          type: dto.type,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `A ${dto.type.toLowerCase()} category with the name "${dto.name}" already exists.`,
      );
    }

    return this.prisma.category.create({
      data: {
        userId,
        name: dto.name.trim(),
        type: dto.type,
        icon: dto.icon.trim(),
        color: dto.color.trim(),
        isDefault: false,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    await this.findOne(userId, id);

    if (dto.name) {
      const existing = await this.prisma.category.findFirst({
        where: {
          userId,
          name: dto.name.trim(),
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `A category with the name "${dto.name}" already exists.`,
        );
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.icon && { icon: dto.icon.trim() }),
        ...(dto.color && { color: dto.color.trim() }),
        ...(dto.isArchived !== undefined && { isArchived: dto.isArchived }),
      },
    });
  }

  async delete(userId: string, id: string) {
    await this.findOne(userId, id);

    const [transactionCount, budgetCount] = await Promise.all([
      this.prisma.transaction.count({ where: { categoryId: id } }),
      this.prisma.budget.count({ where: { categoryId: id } }),
    ]);

    if (transactionCount > 0 || budgetCount > 0) {
      throw new BadRequestException(
        `Cannot delete this category because it is linked to ${transactionCount} transaction(s) and ${budgetCount} budget(s). Archive it instead.`,
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { success: true, message: 'Category deleted successfully.' };
  }
}

