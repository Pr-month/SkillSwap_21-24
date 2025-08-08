import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
//import { UserRole } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums';
import { CategoryEntity } from './entities/categories.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // 📋 Публичный маршрут - список категорий для всех пользователей
  @Get()
  async findAll(): Promise<CategoryEntity[]> {
    return await this.categoriesService.findAll();
  }

  // 📋 Публичный маршрут - получение конкретной категории
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CategoryEntity> {
    return await this.categoriesService.findOne(id);
  }

  // ➕ Защищенный маршрут - только для админов
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    return await this.categoriesService.create(createCategoryDto);
  }

  // ✏️ Защищенный маршрут - только для админов
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    return await this.categoriesService.update(id, updateCategoryDto);
  }

  // ❌ Защищенный маршрут - только для админов
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.categoriesService.remove(id);
  }
}
