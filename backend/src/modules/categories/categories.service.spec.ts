import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../../database/prisma.service';
import { CategoryType } from '@prisma/client';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: PrismaService;

  const mockPrisma = {
    category: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
    },
    budget: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if category name + type exists for user', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat-1' });

      await expect(
        service.create('u1', {
          name: 'Food',
          type: CategoryType.EXPENSE,
          icon: 'Utensils',
          color: '#ff0000',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create custom category', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      mockPrisma.category.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'cat-1', ...data }),
      );

      const result = await service.create('u1', {
        name: 'Food',
        type: CategoryType.EXPENSE,
        icon: 'Utensils',
        color: '#ff0000',
      });

      expect(result.name).toBe('Food');
      expect(result.isDefault).toBe(false);
    });
  });

  describe('delete', () => {
    it('should throw BadRequestException if category is used in transactions', async () => {
      mockPrisma.category.findFirst.mockResolvedValue({ id: 'c1', userId: 'u1' });
      mockPrisma.transaction.count.mockResolvedValue(5);
      mockPrisma.budget.count.mockResolvedValue(0);

      await expect(service.delete('u1', 'c1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

