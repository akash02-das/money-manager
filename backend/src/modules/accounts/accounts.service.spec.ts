import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../../database/prisma.service';
import { AccountType, Currency } from '@prisma/client';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('AccountsService', () => {
  let service: AccountsService;
  let prisma: PrismaService;

  const mockPrisma = {
    account: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all active accounts for user', async () => {
      const mockAccounts = [
        { id: '1', name: 'Cash', isArchived: false, userId: 'u1' },
      ];
      mockPrisma.account.findMany.mockResolvedValue(mockAccounts);

      const result = await service.findAll('u1');
      expect(result).toEqual(mockAccounts);
      expect(mockPrisma.account.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1', isArchived: false },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should prevent creating account with duplicate name', async () => {
      mockPrisma.account.findFirst.mockResolvedValue({ id: '1', name: 'BRAC' });

      await expect(
        service.create('u1', {
          name: 'BRAC',
          type: AccountType.BANK,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create account with initial balance', async () => {
      mockPrisma.account.findFirst.mockResolvedValue(null);
      mockPrisma.account.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'acc-1', ...data }),
      );

      const result = await service.create('u1', {
        name: 'BRAC Bank',
        type: AccountType.BANK,
        initialBalance: 5000,
        currency: Currency.BDT,
      });

      expect(result.balance).toBe(5000);
      expect(result.initialBalance).toBe(5000);
      expect(mockPrisma.account.create).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should reject deletion if account has transactions', async () => {
      mockPrisma.account.findFirst.mockResolvedValue({ id: 'acc-1', userId: 'u1' });
      mockPrisma.transaction.count.mockResolvedValue(3);

      await expect(service.delete('u1', 'acc-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should delete account if no transactions exist', async () => {
      mockPrisma.account.findFirst.mockResolvedValue({ id: 'acc-1', userId: 'u1' });
      mockPrisma.transaction.count.mockResolvedValue(0);
      mockPrisma.account.delete.mockResolvedValue({ id: 'acc-1' });

      const result = await service.delete('u1', 'acc-1');
      expect(result.success).toBe(true);
      expect(mockPrisma.account.delete).toHaveBeenCalledWith({
        where: { id: 'acc-1' },
      });
    });
  });
});

