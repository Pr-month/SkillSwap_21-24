import {
  Injectable,
  NotFoundException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/categories/entities/categories.entity';
import { AppConfigType } from 'src/config/config.type';
import { configuration } from 'src/config/configuration';
import { SkillEntity } from 'src/skills/entities/skills.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums';
import { Repository } from 'typeorm';
import { CreateUserDTO, LoginUserDTO } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

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

  async _generateTokens({ id, email, role }: UserEntity) {
    const payload = { sub: id, email, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.jwt.jwtSecret,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.jwt.jwtRefreshSecret,
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
    const { accessToken, refreshToken } = await this._generateTokens(user);
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
  ): Promise<{ success: boolean; accessToken: string; refreshToken: string }> {
    const { email, password } = userData;
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
      select: ['id', 'email', 'password'],
    });
    if (!user) {
      throw new UnauthorizedException('Incorrectly entered email address');
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Incorrectly entered password');
    }
    const { accessToken, refreshToken } = await this._generateTokens(user);
    await this.userRepository.update(user.id, {
      refreshToken,
    });
    return {
      success: true,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async deleteRefreshToken(token: string): Promise<UserEntity> {
    const { userId, email, role } = await this.jwtService.verifyAsync<{
      userId: number;
      email: string;
      role: UserRole;
    }>(token, {
      secret: this.config.jwt.jwtRefreshSecret,
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
      refreshToken: '',
    });
    return user;
  }

  async refreshToken(
    token: string,
  ): Promise<{ success: boolean; accessToken: string }> {
    const user = await this.deleteRefreshToken(token);
    const { accessToken, refreshToken } = await this._generateTokens(user);
    await this.userRepository.update(user.id, {
      refreshToken,
    });
    return {
      success: true,
      accessToken: accessToken,
    };
  }

  async loguotUser(token: string): Promise<{ success: boolean }> {
    await this.deleteRefreshToken(token);
    return {
      success: true,
    };
  }
}
