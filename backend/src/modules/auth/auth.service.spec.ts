import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService (Email Verification & Access Control)', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let configService: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      category: {
        createMany: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      emailVerification: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callbackOrPromises) => {
        if (typeof callbackOrPromises === 'function') {
          return callbackOrPromises(prisma);
        }
        return Promise.all(callbackOrPromises);
      }),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    configService = {
      get: jest.fn((key: string, defaultVal: any) => defaultVal || 'mock-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create an UNVERIFIED user and dispatch an email verification code', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const createdUser = {
        id: 'usr-123',
        name: 'Akash Das',
        email: 'akash@example.com',
        passwordHash: 'hashed-pass',
        currency: 'BDT',
        isEmailVerified: false,
      };
      prisma.user.create.mockResolvedValue(createdUser);
      prisma.emailVerification.updateMany.mockResolvedValue({ count: 0 });
      prisma.emailVerification.create.mockImplementation((args: any) =>
        Promise.resolve({
          id: 'ver-123',
          userId: 'usr-123',
          code: args.data.code,
          token: args.data.token,
          expiresAt: args.data.expiresAt,
          isUsed: false,
        }),
      );

      const result = await service.register({
        name: 'Akash Das',
        email: 'akash@example.com',
        password: 'Vault-Secure-88#',
        currency: 'BDT' as any,
      });

      expect(result.success).toBe(true);
      expect(result.isEmailVerified).toBe(false);
      expect(result.verificationPreview).toBeDefined();
      expect(result.verificationPreview.code).toHaveLength(6);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isEmailVerified: false,
          }),
        }),
      );
    });

    it('should reject disposable emails', async () => {
      await expect(
        service.register({
          name: 'Fake User',
          email: 'burner@tempmail.com',
          password: 'Vault-Secure-88#',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should block unverified registered accounts with ForbiddenException (EMAIL_NOT_VERIFIED)', async () => {
      const passwordHash = await bcrypt.hash('Vault-Secure-88#', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'usr-123',
        email: 'akash@example.com',
        passwordHash,
        isEmailVerified: false,
      });
      prisma.emailVerification.updateMany.mockResolvedValue({ count: 0 });
      prisma.emailVerification.create.mockImplementation((args: any) =>
        Promise.resolve({
          id: 'ver-123',
          userId: 'usr-123',
          code: '654321',
          token: 'mock-token',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          isUsed: false,
        }),
      );

      await expect(
        service.login({
          email: 'akash@example.com',
          password: 'Vault-Secure-88#',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should successfully issue tokens if account is email verified', async () => {
      const passwordHash = await bcrypt.hash('Vault-Secure-88#', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'usr-123',
        email: 'akash@example.com',
        passwordHash,
        isEmailVerified: true,
      });
      prisma.refreshToken.create.mockResolvedValue({ id: 'rt-1' });

      const result = await service.login({
        email: 'akash@example.com',
        password: 'Vault-Secure-88#',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('akash@example.com');
    });
  });

  describe('verifyEmail', () => {
    it('should verify user and issue JWT tokens when code is valid and active', async () => {
      const user = {
        id: 'usr-123',
        email: 'akash@example.com',
        isEmailVerified: false,
      };
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.emailVerification.findFirst.mockResolvedValue({
        id: 'ver-123',
        userId: 'usr-123',
        code: '123456',
        token: 'token-uuid',
        isUsed: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins in future
        user,
      });

      prisma.emailVerification.update.mockResolvedValue({ id: 'ver-123', isUsed: true });
      prisma.user.update.mockResolvedValue({ ...user, isEmailVerified: true });
      prisma.refreshToken.create.mockResolvedValue({ id: 'rt-1' });

      const result = await service.verifyEmail({
        email: 'akash@example.com',
        code: '123456',
      });

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isEmailVerified: true },
        }),
      );
    });

    it('should reject already-used verification codes', async () => {
      const user = { id: 'usr-123', email: 'akash@example.com' };
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.emailVerification.findFirst.mockResolvedValue({
        id: 'ver-123',
        isUsed: true, // ALREADY USED
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      await expect(
        service.verifyEmail({
          email: 'akash@example.com',
          code: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject expired verification codes', async () => {
      const user = { id: 'usr-123', email: 'akash@example.com' };
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.emailVerification.findFirst.mockResolvedValue({
        id: 'ver-123',
        isUsed: false,
        expiresAt: new Date(Date.now() - 5 * 60 * 1000), // EXPIRED 5 mins ago
      });

      await expect(
        service.verifyEmail({
          email: 'akash@example.com',
          code: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resendVerification', () => {
    it('should dispatch fresh code for unverified user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'usr-123',
        email: 'akash@example.com',
        isEmailVerified: false,
      });
      prisma.emailVerification.updateMany.mockResolvedValue({ count: 1 });
      prisma.emailVerification.create.mockImplementation((args: any) =>
        Promise.resolve({
          id: 'ver-new',
          userId: 'usr-123',
          code: '789123',
          token: 'new-token',
          expiresAt: args.data.expiresAt,
          isUsed: false,
        }),
      );

      const result = await service.resendVerification({
        email: 'akash@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.verificationPreview).toBeDefined();
    });

    it('should reject resend if email is already verified', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'usr-123',
        email: 'akash@example.com',
        isEmailVerified: true, // ALREADY VERIFIED
      });

      await expect(
        service.resendVerification({
          email: 'akash@example.com',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

