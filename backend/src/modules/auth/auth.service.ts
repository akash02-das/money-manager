import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { CategoryType } from '@prisma/client';

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'sharklasers.com',
  'trashmail.com',
  'trashmail.net',
  'dispostable.com',
  'fakeinbox.com',
  'generator.email',
  'burnermail.io',
  'mohmal.com',
  'crazymailing.com',
  'mytemp.email',
  'inboxkitten.com',
  'dropmail.me',
]);

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
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generates a 6-digit OTP code and secure UUID token for email verification.
   * Expires in 15 minutes.
   */
  private async generateVerificationCodeAndToken(userId: string, email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Invalidate prior unused codes for this user
    await this.prisma.emailVerification.updateMany({
      where: { userId, isUsed: false },
      data: { isUsed: true },
    });

    const verification = await this.prisma.emailVerification.create({
      data: {
        userId,
        code,
        token,
        expiresAt,
      },
    });

    this.logger.log(
      `📬 [EMAIL VERIFICATION DISPATCH] To: ${email} | Code: ${code} | Link: http://localhost:3000/verify-email?token=${token}`,
    );

    return verification;
  }

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const domain = normalizedEmail.split('@')[1];
    if (domain && DISPOSABLE_DOMAINS.has(domain)) {
      throw new BadRequestException(
        'Disposable or temporary email addresses are not allowed. Please use your permanent email.',
      );
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
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
          email: normalizedEmail,
          passwordHash,
          currency: dto.currency || 'BDT',
          location: dto.location,
          isEmailVerified: false,
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

    const verification = await this.generateVerificationCodeAndToken(user.id, user.email);

    const { passwordHash: _, ...userSafe } = user;
    return {
      success: true,
      message:
        'Account created! A verification code has been dispatched to your email address. Please verify to access your dashboard.',
      email: user.email,
      isEmailVerified: false,
      user: userSafe,
      verificationPreview: {
        code: verification.code,
        token: verification.token,
        expiresAt: verification.expiresAt,
      },
    };
  }

  async login(dto: LoginDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    let user;
    try {
      user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (err: any) {
      this.logger.error(
        `Database lookup error during login for ${normalizedEmail}: ${err?.message}`,
        err?.stack,
      );
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'AUTH_DATABASE_UNAVAILABLE',
        message:
          'Unable to reach the authentication service. Please check your connection or explore with Instant Demo.',
      });
    }

    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'ACCOUNT_NOT_FOUND',
        message:
          'No account found with this email address. Please check your spelling or sign up for a new account.',
      });
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'INVALID_CREDENTIALS',
        message:
          'The password you entered is incorrect. Please verify your password and try again.',
      });
    }

    // Strict access control: Unverified accounts MUST NOT access the dashboard
    if (!user.isEmailVerified) {
      const verification = await this.generateVerificationCodeAndToken(user.id, user.email);

      throw new ForbiddenException({
        statusCode: 403,
        error: 'EMAIL_NOT_VERIFIED',
        message:
          'Your email address has not been verified. Please enter the verification code sent to your inbox to unlock your dashboard.',
        email: user.email,
        isEmailVerified: false,
        verificationPreview: {
          code: verification.code,
          token: verification.token,
          expiresAt: verification.expiresAt,
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, ...userSafe } = user;
    return {
      user: userSafe,
      ...tokens,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    let verification: any = null;

    if (dto.token) {
      verification = await this.prisma.emailVerification.findUnique({
        where: { token: dto.token.trim() },
        include: { user: true },
      });
    } else if (dto.email && dto.code) {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase().trim() },
      });

      if (user) {
        verification = await this.prisma.emailVerification.findFirst({
          where: {
            userId: user.id,
            code: dto.code.trim(),
          },
          orderBy: { createdAt: 'desc' },
          include: { user: true },
        });
      }
    } else {
      throw new BadRequestException(
        'Please provide your email and 6-digit verification code, or a valid verification token.',
      );
    }

    if (!verification) {
      throw new BadRequestException('Invalid or unknown verification code. Please check and try again.');
    }

    if (verification.isUsed) {
      throw new BadRequestException('This verification link or code has already been used.');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException(
        'This verification code or link has expired. Please request a fresh verification code.',
      );
    }

    // Mark code as consumed and mark user as verified
    await this.prisma.$transaction([
      this.prisma.emailVerification.update({
        where: { id: verification.id },
        data: { isUsed: true },
      }),
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { isEmailVerified: true },
      }),
    ]);

    const verifiedUser = await this.prisma.user.findUnique({
      where: { id: verification.userId },
    });

    if (!verifiedUser) {
      throw new NotFoundException('User account not found.');
    }

    const tokens = await this.generateTokens(verifiedUser.id, verifiedUser.email);
    await this.saveRefreshToken(verifiedUser.id, tokens.refreshToken);

    const { passwordHash: _, ...userSafe } = verifiedUser;

    return {
      success: true,
      message: 'Email successfully verified! Welcome to your financial dashboard.',
      user: userSafe,
      ...tokens,
    };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new NotFoundException('No account found with this email address.');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('This email is already verified. You can log in directly.');
    }

    const verification = await this.generateVerificationCodeAndToken(user.id, user.email);

    return {
      success: true,
      message: 'A fresh verification code has been dispatched to your email address.',
      email: user.email,
      verificationPreview: {
        code: verification.code,
        token: verification.token,
        expiresAt: verification.expiresAt,
      },
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
