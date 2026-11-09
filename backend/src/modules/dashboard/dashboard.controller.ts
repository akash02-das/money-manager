import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get unified dashboard metrics and monthly analytics' })
  @ApiQuery({ name: 'month', required: false, example: '2026-11' })
  async getMetrics(
    @CurrentUser() user: AuthenticatedUser,
    @Query('month') month?: string,
  ) {
    return this.dashboardService.getMetrics(user.id, month);
  }
}

