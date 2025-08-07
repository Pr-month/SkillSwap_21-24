import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
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
      throw new Error('User not found');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: createSkillDto.category },
    });
    if (!category) {
      throw new Error('Category not found');
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
}
