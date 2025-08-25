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
import { CreateSkillDTO, PaginationQueryDto } from './dto/skill.dto';

export type Paginated<T> = { data: T[]; page: number; totalPages: number };

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  // Получение всех навыков
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async getAllSkills(
    @Query() { page, limit }: PaginationQueryDto,
  ): Promise<Paginated<SkillEntity>> {
    return this.skillsService.findAll({ limit, page });
  }

  // Создание нового навыка
  @Post()
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSkillFromFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: ReqWithUser,
  ): Promise<void> {
    return this.skillsService.removeSkillFromFavorites(id, req.user.sub);
  }
}
