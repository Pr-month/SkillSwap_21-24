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
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { SkillsService } from './skills.service';
import { SkillEntity } from './entities/skills.entity';
import { CreateSkillDTO, PaginationQueryDto } from './dto/skill.dto';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  // Получение всех навыков
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async getAllSkills(
    @Query() { page, limit }: PaginationQueryDto,
  ): Promise<SkillEntity[]> {
    return this.skillsService.findAll({ limit, page });
  }

  // Создание нового навыка
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createSkill(
    @Body() createSkillDto: CreateSkillDTO,
    @Req() req,
  ): Promise<SkillEntity> {
    return this.skillsService.createSkill(createSkillDto, req.user.userId);
  }

  // Изменение навыка
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateSkill(
    @Param('id') id: string,
    @Body() updateSkillDto: Partial<CreateSkillDTO>,
    @Req() req,
  ): Promise<SkillEntity> {
    return this.skillsService.updateSkill(id, updateSkillDto, req.user.userId);
  }

  // Удаление навыка
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSkill(@Param('id') id: string, @Req() req): Promise<void> {
    return this.skillsService.deleteSkill(id, req.user.userId);
  }
}
