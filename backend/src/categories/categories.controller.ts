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
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // 📋 Публичный маршрут - список категорий для всех пользователей
  @Get()
  //для swagger
  @ApiOperation({ summary: 'Получить все категории' })
  @ApiResponse({
    status: 200,
    description: 'Список всех категорий',
    type: [CategoryEntity],
  })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })

  async findAll(): Promise<CategoryEntity[]> {
    return await this.categoriesService.findAll();
  }

  // ➕ Защищенный маршрут - только для админов
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  //для swagger
  @ApiOperation({ summary: 'Создать новую категорию (только для админов)' })
  @ApiBody({ // ← ДОБАВЛЕНО НОВАЯ ДЕКОРАТОР
    type: CreateCategoryDto,
    description: 'Данные для создания категории',
    examples: {
      example1: {
        value: {
          name: 'Игра на барабанах',
          category: 'Игра на музыкальных инструментах',
          subcategory: 'Барабаны',
          description: 'Игра на музыкальных инструментах',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Категория успешно создана',
    type: CategoryEntity,
  })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })

  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    return await this.categoriesService.create(createCategoryDto);
  }

  // ✏️ Защищенный маршрут - только для админов
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  //для swagger
  @ApiOperation({ summary: 'Обновнить категорию (только для админов)' })
  @ApiBody({ // ← ДОБАВЛЕНО НОВАЯ ДЕКОРАТОР
    type: UpdateCategoryDto,
    description: 'Данные для обновления категории',
    examples: {
      example1: {
        summary: 'Пример обновления названия',
        value: {
          name: 'Новое название категории',
        },
      },
      example2: {
        summary: 'Пример обновления описания',
        value: {
          description: 'Новое описание категории',
        },
      },
      example3: {
        summary: 'Пример обновления нескольких полей',
        value: {
          name: 'Обновленное название',
          description: 'Обновленное описание',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Категория успешно обновлена',
    type: CategoryEntity,
  })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })

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
  //для swagger
  @ApiOperation({ summary: 'Удалить категорию (только для админов)' })
  @ApiResponse({
    status: 201,
    description: 'Категория успешно удалена',
    type: CategoryEntity,
  })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })

  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.categoriesService.remove(id);
  }
}
