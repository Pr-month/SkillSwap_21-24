import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { SkillEntity } from '../skills/entities/skills.entity';
import { CategoryEntity } from '../categories/entities/categories.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(SkillEntity)
    private readonly skillsRepository: Repository<SkillEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  // Получение всех пользователей
  async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  // Получение текущего пользователя
  async getCurrentUser(id: number): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  // Обновление текущего пользователя
  async updateCurrentUser(
    id: number,
    updateData: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    Object.assign(user, updateData);

    return this.usersRepository.save(user);
  }

  // Обновление пароля текущего пользователя
  async updatePassword(
    id: number,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    user.password = await bcrypt.hash(password, 10);

    return this.usersRepository.save(user);
  }

  // Добавление навыка в избранное
  async addSkillToFavorites(userId: number, skillId: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['favoriteSkills'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skill = await this.skillsRepository.findOneOrFail({
      where: { id: skillId },
    });

    // Проверяем, не добавлен ли уже навык в избранное
    if (!user.favoriteSkills.some((favSkill) => favSkill.id === skillId)) {
      user.favoriteSkills.push(skill);
      await this.usersRepository.save(user);
    }
  }

  // Удаление навыка из избранного
  async removeSkillFromFavorites(
    userId: number,
    skillId: number,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['favoriteSkills'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверяем, существует ли навык
    await this.skillsRepository.findOneOrFail({
      where: { id: skillId },
    });

    // Фильтруем массив favoriteSkills, исключая навык с указанным ID
    user.favoriteSkills = user.favoriteSkills.filter(
      (favSkill) => favSkill.id !== skillId,
    );
    await this.usersRepository.save(user);
  }

  // Получение пользователей по ID навыка
  async findUsersBySkillId(skillId: number): Promise<UserEntity[]> {
    // Найти навык по ID
    const skill = await this.skillsRepository.findOne({
      where: { id: skillId },
      relations: ['category', 'owner'],
    });

    if (!skill) {
      return [];
    }

    // Получить ID категории навыка
    const skillCategoryId = skill.category.id;

    // Найти пользователей, у которых wantToLearn содержит категорию навыка
    // или которые владеют навыками из той же категории
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.wantToLearn', 'wantToLearn')
      .leftJoinAndSelect('user.skills', 'skills')
      .leftJoinAndSelect('skills.category', 'skillsCategory')
      .where('wantToLearn.id = :categoryId', {
        categoryId: skillCategoryId,
      })
      .orWhere('skillsCategory.id = :categoryId', {
        categoryId: skillCategoryId,
      })
      .andWhere('user.id != :ownerId', {
        ownerId: skill.owner.id,
      })
      .limit(10)
      .getMany();

    return users;
  }
}
