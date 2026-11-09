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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CategoryType } from '@prisma/client';

@ApiTags('Categories')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories for user' })
  @ApiQuery({ name: 'type', enum: CategoryType, required: false })
  @ApiQuery({ name: 'includeArchived', type: Boolean, required: false })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('type') type?: CategoryType,
    @Query('includeArchived') includeArchived?: string,
  ) {
    return this.categoriesService.findAll(
      user.id,
      type,
      includeArchived === 'true',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.categoriesService.findOne(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new custom category' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Category created' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing category' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category (only if unused)' })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.categoriesService.delete(user.id, id);
  }
}

