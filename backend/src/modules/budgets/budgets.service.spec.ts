import { Test, TestingModule } from '@nestjs/testing';
import { BudgetsService } from './budgets.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('BudgetsService', () => {
  let service: BudgetsService;
  let prisma: PrismaService;

  const mockPrisma = {
    budget: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
    },
    transaction: {
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<BudgetsService>(BudgetsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should calculate dynamic spending from transactions', async () => {
      mockPrisma.budget.findMany.mockResolvedValue([
        {
          id: 'b1',
          userId: 'u1',
          categoryId: 'c1',
          year: 2026,
          month: 11,
          amount: 5000,
          category: { name: 'Food' },
        },
      ]);
      mockPrisma.transaction.aggregate.mockResolvedValue({
        _sum: { amount: 1200 },
      });

      const result = await service.findAll('u1', '2026-11');
      expect(result).toHaveLength(1);
      expect(result[0].limit).toBe(5000);
      expect(result[0].spent).toBe(1200);
      expect(result[0].month).toBe('2026-11');
    });
  });

  describe('create', () => {
    it('should throw NotFoundException if category does not exist', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.create('u1', {
          categoryId: 'invalid',
          month: '2026-11',
          limit: 3000,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

