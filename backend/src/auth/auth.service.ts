import {
  Injectable,
  NotFoundException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from '../categories/entities/categories.entity';
import { AppConfigType } from '../config/config.type';
import { configuration } from '../config/configuration';
import { SkillEntity } from '../skills/entities/skills.entity';
import { UserEntity } from '../users/entities/user.entity';
import { JwtPayload } from './auth.types';
import { UserRole } from '../users/enums';
import { Repository } from 'typeorm';
import { CreateUserDTO, LoginResponseDTO, LoginUserDTO } from './dto/user.dto';
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

  async _generateTokens({ sub, email, roles }: JwtPayload) {
    const payload = { sub, email, roles };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.jwt.jwtSecret,
      expiresIn: this.config.jwt.accessExpiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.jwt.jwtRefreshSecret,
      expiresIn: this.config.jwt.refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async createUser(userData: CreateUserDTO): Promise<LoginResponseDTO> {
    const category = await this.categotyRepository.findOne({
      where: {
        id: userData.category,
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    // Создаем пользователя
    const user = this.userRepository.create({
      ...userData,
      wantToLearn: [category],
      role: UserRole.USER,
    });
    await this.userRepository.save(user);
    // Генерим токены
    const { accessToken, refreshToken } = await this._generateTokens({
      sub: user.id,
      email: user.email,
      roles: [user.role],
    });
    // Сохраняем refresh токен в бд
    await this.userRepository.update(user.id, {
      refreshToken,
    });
    return {
      success: true,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async loginUser(userData: LoginUserDTO): Promise<LoginResponseDTO> {
    const { email, password } = userData;
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
      select: ['id', 'email', 'password', 'role'],
    });
    if (!user) {
      throw new UnauthorizedException('Incorrectly entered email address');
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Incorrectly entered password');
    }
    const { accessToken, refreshToken } = await this._generateTokens({
      sub: user.id,
      email: user.email,
      roles: [user.role],
    });
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

  async refreshToken(token: string): Promise<LoginResponseDTO> {
    const user = await this.deleteRefreshToken(token);
    const { accessToken, refreshToken } = await this._generateTokens({
      sub: user.id,
      email: user.email,
      roles: [user.role],
    });
    await this.userRepository.update(user.id, {
      refreshToken,
    });
    return {
      success: true,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async loguotUser(token: string): Promise<{ success: boolean }> {
    await this.deleteRefreshToken(token);
    return {
      success: true,
    };
  }
}
