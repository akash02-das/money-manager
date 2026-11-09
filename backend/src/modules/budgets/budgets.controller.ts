import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Budgets')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'List user budgets with dynamic spending calculation' })
  @ApiQuery({ name: 'month', required: false, example: '2026-11' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('month') month?: string,
  ) {
    return this.budgetsService.findAll(user.id, month);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get budget by ID' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.budgetsService.findOne(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create or update budget limit for category and month' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Budget created or updated' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBudgetDto,
  ) {
    return this.budgetsService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update budget limit' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget cap' })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.budgetsService.delete(user.id, id);
  }
}

