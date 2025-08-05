import {
  Injectable,
  NotFoundException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { SkillEntity } from '../skills/entities/skills.entity';
import { CategoryEntity } from '../categories/entities/categories.entity';
import { CreateUserDTO, LoginUserDTO } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { configuration } from '../config/configuration';
import { AppConfigType } from '../config/config.type';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

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

  async _generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

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
    //Ищем указанную категорию
    const category = await this.categotyRepository.findOne({
      where: {
        id: userData.skill.category,
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
    const { accessToken, refreshToken } = await this._generateTokens(
      user.id,
      user.email,
      user.role,
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

  async loginUser(
    userData: LoginUserDTO,
    res: Response,
  ): Promise<{ success: boolean; accessToken: string }> {
    const { email, password } = userData;
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.password != (await bcrypt.hash(password, 10))) {
      throw new UnauthorizedException('User not found');
    }
    const { accessToken, refreshToken } = await this._generateTokens(
      user.id,
      user.email,
      user.role,
    );
    await this.userRepository.update(user.id, {
      refreshToken,
    });
    res.cookie('refreshToken', user.refreshToken);
    return {
      success: true,
      accessToken: accessToken,
    };
  }

  async deleterefreshToken(token: string): Promise<UserEntity> {
    const { userId, email, role } = await this.jwtService.verifyAsync<{
      userId: string;
      email: string;
      role: UserRole;
    }>(token, {
      secret: this.config.jwt.jwtSecret,
    });
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        email: email,
        role: role,
        refreshToken: token,
      },
    });
    if (!user) {
      throw new NotFoundException('Invalid or expired refresh token');
    }
    await this.userRepository.update(user.id, {
      refreshToken: undefined,
    });
    return user;
  }

  async refreshToken(
    token: string,
    res: Response,
  ): Promise<{ success: boolean; accessToken: string }> {
    const user = await this.deleterefreshToken(token);
    const { accessToken, refreshToken } = await this._generateTokens(
      user.id,
      user.email,
      user.role,
    );
    await this.userRepository.update(user.id, {
      refreshToken,
    });
    res.cookie('refreshToken', user.refreshToken);
    return {
      success: true,
      accessToken: accessToken,
    };
  }

  async loguotUser(
    token: string,
    res: Response,
  ): Promise<{ success: boolean }> {
    await this.deleterefreshToken(token);
    res.cookie('refreshToken', '');
    return {
      success: true,
    };
  }
}
