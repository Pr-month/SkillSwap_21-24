import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { SkillEntity } from '../skills/entities/skills.entity';
import { CategoryEntity } from '../categories/entities/categories.entity';
import { CreateUserDTO } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(SkillEntity)
    private readonly skillRepository: Repository<SkillEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categotyRepository: Repository<CategoryEntity>,

    private readonly jwtService: JwtService,
  ) {}

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async createUser(
    userData: CreateUserDTO,
  ): Promise<{ success: boolean; accessToken: string }> {
    //Ищем указанную категорию
    const category = await this.categotyRepository.findOne({
      where: {
        name: userData.skill.categoryName,
      },
    });
    // Если ее нет кидаем исключение
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    // Создаем скилл указанный при регистрации и привязываем к нему категорию
    const skill = this.skillRepository.create({
      ...userData.skill,
      category: category,
    });
    await this.skillRepository.save(skill);
    // Создаем пользователя
    const user = this.userRepository.create({
      ...userData,
      role: UserRole.USER,
    });
    await this.userRepository.save(user);
    // Привязываем создателя скила к пользователю
    await this.skillRepository.update(skill.id, {
      owner: user,
    });
    // Генерим токены
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
    );
    // Сохраняем refresh токен в бд
    await this.userRepository.update(user.id, {
      refreshToken,
    });
    return {
      success: true,
      accessToken: accessToken,
    };
  }
}
