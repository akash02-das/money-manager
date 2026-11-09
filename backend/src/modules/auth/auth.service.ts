import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CategoryType } from '@prisma/client';

const DEFAULT_CATEGORIES = [
  // Income
  {
    name: 'Salary & Employment',
    type: CategoryType.INCOME,
    icon: 'Briefcase',
    color: '#10b981',
    isDefault: true,
  },
  {
    name: 'Software Consulting',
    type: CategoryType.INCOME,
    icon: 'Laptop',
    color: '#06b6d4',
    isDefault: true,
  },
  // Expense
  {
    name: 'Housing & Rent',
    type: CategoryType.EXPENSE,
    icon: 'Home',
    color: '#6366f1',
    isDefault: true,
  },
  {
    name: 'Groceries & Market',
    type: CategoryType.EXPENSE,
    icon: 'ShoppingBag',
    color: '#f59e0b',
    isDefault: true,
  },
  {
    name: 'Utilities & Internet',
    type: CategoryType.EXPENSE,
    icon: 'Zap',
    color: '#ec4899',
    isDefault: true,
  },
  {
    name: 'Dining & Cafes',
    type: CategoryType.EXPENSE,
    icon: 'UtensilsCrossed',
    color: '#f97316',
    isDefault: true,
  },
  {
    name: 'Transportation',
    type: CategoryType.EXPENSE,
    icon: 'Car',
    color: '#8b5cf6',
    isDefault: true,
  },
  {
    name: 'Health & Wellness',
    type: CategoryType.EXPENSE,
    icon: 'Activity',
    color: '#14b8a6',
    isDefault: true,
  },
];

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          currency: dto.currency || 'BDT',
          location: dto.location,
        },
      });

      // Seed default categories for the new user
      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          userId: createdUser.id,
        })),
      });

      return createdUser;
    });

    const tokens = await this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, ...userSafe } = user;
    return {
      user: userSafe,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, ...userSafe } = user;
    return {
      user: userSafe,
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required.');
    }

    try {
      const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
      const payload = this.jwtService.verify(refreshToken, { secret });
      const tokenHash = this.hashToken(refreshToken);

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
      });

      if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token.');
      }

      // Token rotation: revoke current token
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new NotFoundException('User account not found.');
      }

      const tokens = await this.generateTokens(user.id, user.email);
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      const { passwordHash: _, ...userSafe } = user;
      return {
        user: userSafe,
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return { success: true };

    try {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    } catch {
      // Ignore if token doesn't exist
    }

    return { success: true, message: 'Logged out successfully.' };
  }

  private async generateTokens(userId: string, email: string) {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const accessExpiration = this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m');
    const refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: accessSecret, expiresIn: accessExpiration as any },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: refreshSecret, expiresIn: refreshExpiration as any },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const tokenHash = this.hashToken(token);
    // Expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }
}
