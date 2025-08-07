import { Body, Controller, Post } from '@nestjs/common';

import { SkillsService } from './skills.service';
import { SkillEntity } from './entities/skills.entity';
import { CreateSkillDTO } from './dto/skill.dto';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  async createSkill(
    @Body() createSkillDto: CreateSkillDTO,
  ): Promise<SkillEntity> {
    return this.skillsService.createSkill(createSkillDto);
  }
}
