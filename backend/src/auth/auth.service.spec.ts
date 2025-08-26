import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserEntity } from '../users/entities/user.entity';
import { SkillEntity } from '../skills/entities/skills.entity';
import { CategoryEntity } from '../categories/entities/categories.entity';
import { CreateUserDTO } from '../users/dto/user.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRole, Gender } from '../users/enums';
import { configuration } from '../config/configuration';
import { AppConfigType } from '../config/config.type';
import { Repository } from 'typeorm';

interface LoginUserDTO {
  email: string;
  password: string;
}

// Mock данных с правильной типизацией
const mockUser: UserEntity = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword123',
  about: 'About me',
  birthdate: new Date('1990-01-01'),
  city: 'Moscow',
  gender: Gender.MALE,
  avatar: 'avatar.jpg',
  role: UserRole.USER,
  refreshToken: 'oldRefreshToken',
  skills: [],
  wantToLearn: [],
  favoriteSkills: [],
  sentRequests: [],
  receivedRequests: [],
  hashPassword: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
};

const mockCategory: CategoryEntity = {
  id: 1,
  name: 'Programming',
  parent: null,
  children: [],
  skills: [],
};

const mockConfig: AppConfigType = {
  jwt: {
    jwtSecret: 'test-secret',
    jwtRefreshSecret: 'test-refresh-secret',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  db: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'test',
    password: 'test',
    database: 'test',
    entities: [],
    synchronize: false,
    migrations: [],
  },
  port: 3000,
};

// Типизированные моки репозиториев
const mockUserRepository: Partial<
  Record<keyof Repository<UserEntity>, jest.Mock>
> = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

const mockSkillRepository: Partial<
  Record<keyof Repository<SkillEntity>, jest.Mock>
> = {
  findOne: jest.fn(),
};

const mockCategoryRepository: Partial<
  Record<keyof Repository<CategoryEntity>, jest.Mock>
> = {
  findOne: jest.fn(),
};

const mockJwtService: Partial<Record<keyof JwtService, jest.Mock>> = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

// Мок bcrypt с типизацией
jest.mock('bcrypt', () => ({
  compare: jest.fn() as jest.MockedFunction<typeof bcrypt.compare>,
  hash: jest.fn() as jest.MockedFunction<typeof bcrypt.hash>,
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(SkillEntity),
          useValue: mockSkillRepository,
        },
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: mockCategoryRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: configuration.KEY,
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('_generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        role: UserRole.USER,
      } as UserEntity;

      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      (mockJwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce(tokens.accessToken)
        .mockResolvedValueOnce(tokens.refreshToken);

      const result = await service['_generateTokens'](user);

      expect(result).toEqual(tokens);
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('createUser', () => {
    // Реальный DTO без поля category
    const createUserDto: CreateUserDTO = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      about: 'About me',
      birthdate: '1990-01-01',
      city: 'Moscow',
      gender: Gender.MALE,
      avatar: 'avatar.jpg',
      role: UserRole.USER,
    };

    it('should create user successfully', async () => {
      (mockCategoryRepository.findOne as jest.Mock).mockResolvedValue(
        mockCategory,
      );
      (mockUserRepository.create as jest.Mock).mockReturnValue(mockUser);
      (mockUserRepository.save as jest.Mock).mockResolvedValue(mockUser);
      (mockJwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      (mockUserRepository.update as jest.Mock).mockResolvedValue({} as any);

      // Передаем DTO и отдельно category ID (как в реальном сервисе)
      const result = await service.createUser({
        ...createUserDto,
        category: 1, // category передается отдельно
      });

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');

      // Проверяем что сервис передает правильные параметры в create
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        about: 'About me',
        birthdate: '1990-01-01',
        city: 'Moscow',
        gender: Gender.MALE,
        avatar: 'avatar.jpg',
        category: 1, // Сервис передает category в create
        wantToLearn: [mockCategory], // Сервис добавляет wantToLearn
        role: UserRole.USER, // Сервис устанавливает роль автоматически
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      (mockCategoryRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createUser({
          ...createUserDto,
          category: 999,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('loginUser', () => {
    const loginUserDto: LoginUserDTO = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      const userWithPassword = { ...mockUser, password: 'hashedPassword123' };

      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(
        userWithPassword,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      (mockUserRepository.update as jest.Mock).mockResolvedValue({} as any);

      const result = await service.loginUser(loginUserDto);

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.loginUser(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.loginUser(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('deleteRefreshToken', () => {
    it('should delete refresh token successfully', async () => {
      const token = 'valid-refresh-token';
      const jwtPayload = {
        userId: 1,
        email: 'test@example.com',
        role: UserRole.USER,
      };

      (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue(jwtPayload);
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (mockUserRepository.update as jest.Mock).mockResolvedValue({} as any);

      const result = await service.deleteRefreshToken(token);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        refreshToken: '',
      });
    });

    it('should throw original error when token verification fails', async () => {
      const jwtError = new Error('Invalid token');

      (mockJwtService.verifyAsync as jest.Mock).mockRejectedValue(jwtError);

      await expect(service.deleteRefreshToken('invalid-token')).rejects.toThrow(
        jwtError,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const jwtPayload = {
        userId: 1,
        email: 'test@example.com',
        role: UserRole.USER,
      };

      (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue(jwtPayload);
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteRefreshToken('valid-token')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const token = 'old-refresh-token';

      jest.spyOn(service, 'deleteRefreshToken').mockResolvedValue(mockUser);
      (mockJwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      (mockUserRepository.update as jest.Mock).mockResolvedValue({} as any);

      const result = await service.refreshToken(token);

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });
  });

  describe('loguotUser', () => {
    it('should logout user successfully', async () => {
      const token = 'refresh-token';

      jest.spyOn(service, 'deleteRefreshToken').mockResolvedValue(mockUser);

      const result = await service.loguotUser(token);

      expect(result.success).toBe(true);
    });

    it('should throw error if deleteRefreshToken fails', async () => {
      const token = 'invalid-token';

      jest
        .spyOn(service, 'deleteRefreshToken')
        .mockRejectedValue(new NotFoundException('Invalid token'));

      await expect(service.loguotUser(token)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
