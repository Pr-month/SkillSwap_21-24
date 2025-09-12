import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  Req,
  ValidationPipe,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ReqWithUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { SkillsService } from './skills.service';
import { SkillEntity } from './entities/skills.entity';
import {
  CreateSkillDTO,
  UpdateSkillDTO,
  SkillResponseDto,
  PaginationQueryDto,
  SkillListResponseDto,
} from './dto/skill.dto';

export type Paginated<T> = { data: T[]; page: number; totalPages: number };
@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  // Получение всех навыков
  @Get()
  @ApiOperation({ summary: 'Список скиллов (с пагинацией)' })
  @ApiOkResponse({
    type: SkillListResponseDto,
    description: 'Пагинированный список скиллов',
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async getAllSkills(
    @Query() { page, limit }: PaginationQueryDto,
  ): Promise<Paginated<SkillEntity>> {
    return this.skillsService.findAll({ limit, page });
  }

  // Создание нового навыка
  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Создать скилл' })
  @ApiBody({ type: CreateSkillDTO })
  @ApiCreatedResponse({ type: SkillResponseDto, description: 'Скилл создан' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createSkill(
    @Body() createSkillDto: CreateSkillDTO,
    @Req() req: ReqWithUser,
  ): Promise<SkillEntity> {
    return this.skillsService.createSkill(createSkillDto, req.user.sub);
  }

  // Изменение навыка
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Обновить скилл' })
  @ApiBody({ type: UpdateSkillDTO })
  @ApiOkResponse({ type: SkillResponseDto, description: 'Скилл обновлён' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiForbiddenResponse({ description: 'Нет прав на изменение' })
  @ApiNotFoundResponse({ description: 'Скилл не найден' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateSkill(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSkillDto: Partial<CreateSkillDTO>,
    @Req() req: ReqWithUser,
  ): Promise<SkillEntity> {
    return this.skillsService.updateSkill(id, updateSkillDto, req.user.sub);
  }

  // Удаление навыка
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Удалить скилл' })
  @ApiNoContentResponse({ description: 'Скилл удалён' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiForbiddenResponse({ description: 'Нет прав на удаление' })
  @ApiNotFoundResponse({ description: 'Скилл не найден' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSkill(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: ReqWithUser,
  ): Promise<void> {
    return this.skillsService.deleteSkill(id, req.user.sub);
  }

  // Добавление навыка в избранное
  @Post(':id/favorite')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Добавить скилл в избранное' })
  @ApiOkResponse({ description: 'Добавлен' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiNotFoundResponse({ description: 'Скилл или пользователь не найден' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async addSkillToFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: ReqWithUser,
  ): Promise<void> {
    return this.skillsService.addSkillToFavorites(id, req.user.sub);
  }

  // Удаление навыка из избранного
  @Delete(':id/favorite')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Удалить скилл из избранного' })
  @ApiNoContentResponse({ description: 'Удалён из избранного' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiNotFoundResponse({ description: 'Скилл не в избранном' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSkillFromFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: ReqWithUser,
  ): Promise<void> {
    return this.skillsService.removeSkillFromFavorites(id, req.user.sub);
  }
}
