import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health and database readiness check' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service is operational',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          status: 'ok',
          uptime: 12.34,
          timestamp: '2026-11-10T01:51:00.000Z',
          database: {
            connected: true,
            latencyMs: 4,
          },
        },
      },
    },
  })
  async check() {
    const start = Date.now();
    let dbConnected = false;
    let latencyMs = 0;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
      latencyMs = Date.now() - start;
    } catch {
      dbConnected = false;
      latencyMs = Date.now() - start;
    }

    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        latencyMs,
      },
    };
  }
}
