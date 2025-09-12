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

import { ReqWithUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { SkillsService } from './skills.service';
import { SkillEntity } from './entities/skills.entity';
import {
  CreateSkillDTO,
  UpdateSkillDTO,
  SkillResponseDto,
  PaginationQueryDto,
} from './dto/skill.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export type Paginated<T> = { data: T[]; page: number; totalPages: number };
@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  // Получение всех навыков
  @Get()
  @ApiOperation({ summary: 'Список скиллов (с пагинацией)' })
  @ApiOkResponse({
    type: [SkillResponseDto],
    description: 'Получение всех скиллов',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async getAllSkills(
    @Query() { page, limit }: PaginationQueryDto,
  ): Promise<Paginated<SkillEntity>> {
    return this.skillsService.findAll({ limit, page });
  }

  // Создание нового навыка
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать скилл' })
  @ApiCreatedResponse({ type: SkillResponseDto, description: 'Скилл создан' })
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить скилл' })
  @ApiBody({ type: UpdateSkillDTO })
  @ApiOkResponse({ type: SkillResponseDto, description: 'Скилл обновлен' })
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить скилл' })
  @ApiResponse({ status: 204, description: 'Скилл удален' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSkill(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: ReqWithUser,
  ): Promise<void> {
    return this.skillsService.deleteSkill(id, req.user.sub);
  }

  // Добавление навыка в избранное
  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Добавить скилл в избранное' })
  @ApiOkResponse({ description: 'Навык добавлен в избранное' })
  @HttpCode(HttpStatus.OK)
  async addSkillToFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: ReqWithUser,
  ): Promise<void> {
    return this.skillsService.addSkillToFavorites(id, req.user.sub);
  }

  // Удаление навыка из избранного
  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить скилл из избранного' })
  @ApiResponse({ status: 204, description: 'Скилл удален из избранного' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSkillFromFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: ReqWithUser,
  ): Promise<void> {
    return this.skillsService.removeSkillFromFavorites(id, req.user.sub);
  }
}
