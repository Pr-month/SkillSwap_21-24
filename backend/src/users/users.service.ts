import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { SkillEntity } from '../skills/entities/skills.entity';
import { ResponceUserDTO } from './dto/user.dto';
import { UserEntity } from './entities/user.entity';

const toResponseUserDTO = (user: UserEntity): ResponceUserDTO => {
  return plainToInstance(ResponceUserDTO, user);
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(SkillEntity)
    private readonly skillsRepository: Repository<SkillEntity>,
  ) {}

  // Получение всех пользователей
  async findAll(): Promise<ResponceUserDTO[]> {
    const users = await this.usersRepository.find({
      relations: ['favoriteSkills'],
    });
    return users.map(toResponseUserDTO);
  }

  // Получение текущего пользователя
  async getCurrentUser(id: number): Promise<ResponceUserDTO | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['favoriteSkills'],
    });
    return user ? toResponseUserDTO(user) : null;
  }

  // Обновление текущего пользователя
  async updateCurrentUser(
    id: number,
    updateData: Partial<UserEntity>,
  ): Promise<ResponceUserDTO | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    Object.assign(user, updateData);
    const updatedUser = await this.usersRepository.save(user);
    return toResponseUserDTO(updatedUser);
  }

  // Обновление пароля текущего пользователя
  async updatePassword(
    id: number,
    password: string,
  ): Promise<ResponceUserDTO | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    user.password = await bcrypt.hash(password, 10);

    const updatedUser = await this.usersRepository.save(user);
    return toResponseUserDTO(updatedUser);
  }

  // Получение данных пользователя по ID
  async getUserById(id: number): Promise<ResponceUserDTO | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user ? toResponseUserDTO(user) : null;
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
