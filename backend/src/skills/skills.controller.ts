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
  HttpStatus
} from '@nestjs/common';


import { SkillsService } from './skills.service';
import { SkillEntity } from './entities/skills.entity';
import { CreateSkillDTO } from './dto/skill.dto';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  // Получение всех навыков
  @Get()
  async getAllSkills(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<SkillEntity[]> {
    const limitNumber = limit ? parseInt(limit) : 20;
    const offsetNumber = offset ? parseInt(offset) : 0;

    return this.skillsService.findAll(limitNumber, offsetNumber);
  }

  // Создание нового навыка
  @Post()
  async createSkill(
    @Body() createSkillDto: CreateSkillDTO,
  ): Promise<SkillEntity> {
    return this.skillsService.createSkill(createSkillDto);
  }

  // Изменение навыка
  @Patch(':id')
  async updateSkill(
    @Param('id') id: string,
    @Body() updateSkillDto: Partial<CreateSkillDTO>,
  ): Promise<SkillEntity> {
    return this.skillsService.updateSkill(id, updateSkillDto);
  }

  // Удаление навыка
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSkill(@Param('id') id: string): Promise<void> {
    return this.skillsService.deleteSkill(id);
  }
}
