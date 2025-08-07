import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from '../users/entities/user.entity';
import { CategoryEntity } from '../categories/entities/categories.entity';

import { SkillEntity } from './entities/skills.entity';
import { CreateSkillDTO } from './dto/skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(SkillEntity)
    private readonly skillRepository: Repository<SkillEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  // Получение всех навыков
  async findAll(
    limitNumber: number,
    offsetNumber: number,
  ): Promise<SkillEntity[]> {
    return this.skillRepository.find({
      take: limitNumber,
      skip: offsetNumber,
      relations: ['owner', 'category'],
      order: { id: 'desc' },
    });
  }

  // Создание нового навыка
  async createSkill(createSkillDto: CreateSkillDTO) {
    const user = await this.userRepository.findOne({
      where: { id: createSkillDto.owner },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: createSkillDto.category },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const skill = this.skillRepository.create({
      title: createSkillDto.title,
      description: createSkillDto.description,
      images: createSkillDto.images,
      owner: user,
      category: category,
    });

    return this.skillRepository.save(skill);
  }

  // Изменение навыка
  async updateSkill(
    skillId: string,
    updateSkillDto: Partial<CreateSkillDTO>,
  ): Promise<SkillEntity> {
    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
      relations: ['owner', 'category'],
    });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    if (updateSkillDto.owner) {
      const user = await this.userRepository.findOne({
        where: { id: updateSkillDto.owner },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      skill.owner = user;
    }

    if (updateSkillDto.category) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateSkillDto.category },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      skill.category = category;
    }

    Object.assign(skill, updateSkillDto);

    return this.skillRepository.save(skill);
  }

  // Удаление навыка
  async deleteSkill(skillId: string): Promise<void> {
    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
    });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    await this.skillRepository.remove(skill);
  }
}
