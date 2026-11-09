import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../../database/prisma.service';
import { TransactionType } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: PrismaService;

  const mockTxClient = {
    transaction: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    account: {
      update: jest.fn(),
    },
  };

  const mockPrisma = {
    account: {
      findFirst: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockTxClient)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if account does not exist', async () => {
      mockPrisma.account.findFirst.mockResolvedValue(null);

      await expect(
        service.create('u1', {
          type: TransactionType.EXPENSE,
          amount: 500,
          description: 'Groceries',
          date: '2026-11-10T10:00:00.000Z',
          accountId: 'nonexistent',
          categoryId: 'cat-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject transfer when source and destination are identical', async () => {
      mockPrisma.account.findFirst.mockResolvedValue({ id: 'acc-1', userId: 'u1' });

      await expect(
        service.create('u1', {
          type: TransactionType.TRANSFER,
          amount: 1000,
          description: 'Self transfer',
          date: '2026-11-10T10:00:00.000Z',
          accountId: 'acc-1',
          toAccountId: 'acc-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create an expense and decrement account balance in a transaction', async () => {
      mockPrisma.account.findFirst.mockResolvedValue({ id: 'acc-1', userId: 'u1' });
      mockPrisma.category.findFirst.mockResolvedValue({ id: 'cat-1', userId: 'u1' });
      mockTxClient.transaction.create.mockResolvedValue({
        id: 'tx-1',
        amount: 500,
        type: TransactionType.EXPENSE,
      });
      mockTxClient.account.update.mockResolvedValue({});

      const result = await service.create('u1', {
        type: TransactionType.EXPENSE,
        amount: 500,
        description: 'Dinner',
        date: '2026-11-10T10:00:00.000Z',
        accountId: 'acc-1',
        categoryId: 'cat-1',
      });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockTxClient.transaction.create).toHaveBeenCalled();
      expect(mockTxClient.account.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'acc-1' },
          data: expect.objectContaining({
            balance: expect.objectContaining({
              decrement: expect.anything(),
            }),
          }),
        }),
      );
      expect(result.id).toBe('tx-1');
    });

    it('should create a transfer and update both account balances', async () => {
      mockPrisma.account.findFirst
        .mockResolvedValueOnce({ id: 'acc-1', userId: 'u1' }) // source
        .mockResolvedValueOnce({ id: 'acc-2', userId: 'u1' }); // dest

      mockTxClient.transaction.create.mockResolvedValue({
        id: 'tx-2',
        amount: 1500,
        type: TransactionType.TRANSFER,
      });

      await service.create('u1', {
        type: TransactionType.TRANSFER,
        amount: 1500,
        description: 'Savings transfer',
        date: '2026-11-10T10:00:00.000Z',
        accountId: 'acc-1',
        toAccountId: 'acc-2',
      });

      expect(mockTxClient.account.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('delete', () => {
    it('should revert account balance and delete transaction', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        userId: 'u1',
        type: TransactionType.EXPENSE,
        amount: 400,
        accountId: 'acc-1',
      });

      const result = await service.delete('u1', 'tx-1');
      expect(result.success).toBe(true);
      expect(mockTxClient.account.update).toHaveBeenCalled();
      expect(mockTxClient.transaction.delete).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
      });
    });
  });
});

