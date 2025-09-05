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
  HttpCode,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
//import { UserRole } from 'src/users/entities/user.entity';
import { UserRole } from '../users/enums';
import { CategoryEntity } from './entities/categories.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // 📋 Публичный маршрут - список категорий для всех пользователей
  @Get()
  //для swagger
  @ApiOperation({ summary: 'Получить все категории' })
  @ApiResponse({
    status: 200,
    description: 'Список всех родительских категорий',
    type: [CategoryListResponseDto],
  })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async findAll(): Promise<CategoryListResponseDto[]> {
    const categories = await this.categoriesService.findAll();
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      children: category.children.map((child) => ({
        id: child.id,
        name: child.name,
        children: [],
      })),
    }));
  }

  // ➕ Защищенный маршрут - только для админов
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  //для swagger
  @ApiOperation({ summary: 'Создать новую категорию (только для админов)' })
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Данные для создания категории',
  })
  @ApiResponse({
    status: 201,
    description: 'Категория успешно создана',
    type: CategoryCreateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryCreateResponseDto> {
    const createdCategory =
      await this.categoriesService.create(createCategoryDto);
    return {
      id: createdCategory.id,
      name: createdCategory.name,
    };
  }

  // ✏️ Защищенный маршрут - только для админов
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @HttpCode(200)
  //для swagger
  @ApiOperation({ summary: 'Обновнить категорию (только для админов)' })
  @ApiBody({
    type: UpdateCategoryDto,
    description: 'Данные для обновления категории',
  })
  @ApiResponse({
    status: 200,
    description: 'Категория успешно обновлена',
    type: CategoryUpdateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryUpdateResponseDto> {
    const updatedEntity: CategoryEntity = await this.categoriesService.update(
      id,
      updateCategoryDto,
    );
    return updatedEntity as unknown as CategoryUpdateResponseDto;
  }

  // ❌ Защищенный маршрут - только для админов
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  //для swagger
  @ApiOperation({ summary: 'Удалить категорию (только для админов)' })
  @ApiResponse({
    status: 204,
    description: 'Категория успешно удалена',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.categoriesService.remove(id);
  }
}
