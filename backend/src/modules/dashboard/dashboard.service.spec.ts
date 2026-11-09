import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../database/prisma.service';
import { TransactionType } from '@prisma/client';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;

  const mockPrisma = {
    account: {
      findMany: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should compute total balance and month breakdown', async () => {
    mockPrisma.account.findMany.mockResolvedValue([
      { id: 'a1', balance: 10000 },
      { id: 'a2', balance: 5000 },
    ]);

    mockPrisma.transaction.findMany
      .mockResolvedValueOnce([
        {
          id: 't1',
          type: TransactionType.INCOME,
          amount: 8000,
          category: { name: 'Salary', color: '#00ff00' },
        },
        {
          id: 't2',
          type: TransactionType.EXPENSE,
          amount: 2500,
          categoryId: 'c1',
          category: { name: 'Food', color: '#ff0000' },
        },
      ])
      .mockResolvedValueOnce([]); // for recentTransactions

    mockPrisma.transaction.aggregate.mockResolvedValue({
      _sum: { amount: 0 },
    });

    const metrics = await service.getMetrics('u1', '2026-11');

    expect(metrics.totalBalance).toBe(15000);
    expect(metrics.monthlyIncome).toBe(8000);
    expect(metrics.monthlyExpense).toBe(2500);
    expect(metrics.netSavings).toBe(5500);
    expect(metrics.savingsRate).toBe(68.8);
    expect(metrics.categoryBreakdown).toHaveLength(1);
    expect(metrics.categoryBreakdown[0].categoryName).toBe('Food');
  });
});

