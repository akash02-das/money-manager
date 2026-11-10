import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly isConfigured: boolean = false;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const secure = this.configService.get<boolean>('SMTP_SECURE', false);

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Boolean(secure),
        auth: { user, pass },
      });
      this.isConfigured = true;
      this.logger.log(`SMTP Mail Transport configured for host: ${host}`);
    } else {
      this.logger.warn(
        'SMTP credentials not detected in .env. Verification emails will be logged to server terminal console.',
      );
    }
  }

  async sendVerificationEmail(
    to: string,
    code: string,
    token: string,
  ): Promise<boolean> {
    const verifyUrl = `${this.frontendUrl}/verify-email?token=${encodeURIComponent(
      token,
    )}&email=${encodeURIComponent(to)}`;
    const from =
      this.configService.get<string>('SMTP_FROM') ||
      '"Money Manager" <no-reply@moneymanager.local>';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0;">🪙 Money Manager</h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Precision Personal Finance</p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; border: 1px solid #f1f5f9;">
          <p style="color: #334155; font-size: 15px; margin: 0 0 16px 0; font-weight: 500;">
            Verify your email to unlock your financial vault:
          </p>
          <div style="display: inline-block; background: #0f172a; color: #ffffff; font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; padding: 12px 28px; border-radius: 8px;">
            ${code}
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0 0;">
            This security code expires in 15 minutes.
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${verifyUrl}" style="display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">
            Verify Email Instantly
          </a>
        </div>

        <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 0 0 16px 0;">
          If you did not create a Money Manager account using this email address, you can safely disregard this message.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
          Money Manager • Bank-Grade Financial Sovereignty
        </p>
      </div>
    `;

    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject: '🔐 Your 6-Digit Money Manager Verification Code',
          text: `Your Money Manager verification code is: ${code}\nOr verify instantly at: ${verifyUrl}\nThis code expires in 15 minutes.`,
          html: htmlContent,
        });
        this.logger.log(`📧 Real verification email successfully sent to ${to}`);
        return true;
      } catch (err: any) {
        this.logger.error(
          `Failed to send email via SMTP to ${to}: ${err?.message}`,
        );
        this.logToConsole(to, code, verifyUrl);
        return false;
      }
    } else {
      this.logToConsole(to, code, verifyUrl);
      return true;
    }
  }

  private logToConsole(to: string, code: string, verifyUrl: string) {
    this.logger.log(
      `\n======================================================\n` +
      `📬 [EMAIL DISPATCH TO: ${to}]\n` +
      `🔐 6-DIGIT VERIFICATION CODE: ${code}\n` +
      `🔗 ONE-CLICK VERIFICATION LINK: ${verifyUrl}\n` +
      `⏳ VALID FOR: 15 minutes\n` +
      `======================================================\n`,
    );
  }
}

