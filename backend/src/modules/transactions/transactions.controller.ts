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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Transactions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Search and filter transactions with pagination' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: TransactionQueryDto,
  ) {
    return this.transactionsService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction details by ID' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.transactionsService.findOne(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a transaction and update account balance' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Transaction recorded' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction and adjust account balances accordingly' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction and restore balance to account' })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.transactionsService.delete(user.id, id);
  }
}

