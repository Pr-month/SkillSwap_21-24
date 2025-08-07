import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../categories/entities/categories.entity';
import { AppConfigType } from '../config/config.type';
import { configuration } from '../config/configuration';
import { SkillEntity } from '../skills/entities/skills.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CreateUserDTO } from '../users/dto/user.dto';
import { UserRole } from 'src/users/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(SkillEntity)
    private readonly skillRepository: Repository<SkillEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categotyRepository: Repository<CategoryEntity>,
    @Inject(configuration.KEY)
    private readonly config: AppConfigType,

    private readonly jwtService: JwtService,
  ) {}

  async _generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.jwt.jwtSecret,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async createUser(
    userData: CreateUserDTO,
  ): Promise<{ success: boolean; accessToken: string }> {
    // Создаем пользователя
    const user = this.userRepository.create({
      ...userData,
      role: UserRole.USER,
    });
    await this.userRepository.save(user);
    // Генерим токены
    const { accessToken, refreshToken } = await this._generateTokens(
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
