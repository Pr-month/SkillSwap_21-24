import { ObjectLiteral, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { SkillEntity } from '../skills/entities/skills.entity';
import { CategoryEntity } from '../categories/entities/categories.entity';

import { UsersService, toResponseUserDTO } from './users.service';
import { UserEntity } from './entities/user.entity';
import { Gender, UserRole } from './enums';
import { NotFoundException } from '@nestjs/common';

type MockRepo<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

function createMockRepo<T extends ObjectLiteral>(): MockRepo<T> {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
}

describe('UsersService', () => {
  let service: UsersService;

  let userRepo: MockRepo<UserEntity>;
  let skillRepo: MockRepo<SkillEntity>;

  const baseUsers: UserEntity[] = [
    {
      id: 1,
      name: 'admin',
      email: 'admin@mail.ru',
      password: 'admin',
      about: 'administrator',
      birthdate: new Date('2000-01-01'),
      city: 'Moscow',
      gender: Gender.MALE,
      avatar: 'admin.png',
      role: UserRole.ADMIN,
      refreshToken: '',
      skills: [],
      wantToLearn: [],
      favoriteSkills: [],
      sentRequests: [],
      receivedRequests: [],
      hashPassword: function (): Promise<void> {
        throw new Error('Function not implemented.');
      },
    },
    {
      id: 2,
      name: 'user',
      email: 'user@mail.ru',
      password: 'user',
      about: 'regular user',
      birthdate: new Date('2000-01-01'),
      city: 'Moscow',
      gender: Gender.MALE,
      avatar: 'user.png',
      role: UserRole.USER,
      refreshToken: '',
      skills: [],
      wantToLearn: [],
      favoriteSkills: [],
      sentRequests: [],
      receivedRequests: [],
      hashPassword: function (): Promise<void> {
        throw new Error('Function not implemented.');
      },
    },
  ];

  const baseCategories: CategoryEntity[] = [
    {
      id: 1,
      name: 'Programming',
      parent: null,
      children: [],
      skills: [],
    },
    {
      id: 2,
      name: 'Design',
      parent: null,
      children: [],
      skills: [],
    },
  ];

  const baseSkills: SkillEntity[] = [
    {
      id: 1,
      title: 'React',
      description: 'JSX',
      images: ['react.png'],
      owner: baseUsers[0],
      category: baseCategories[0],
      offeredRequests: [],
      requestedRequests: [],
    },
    {
      id: 2,
      title: 'Photoshop',
      description: 'Graphic design software',
      images: ['photoshop.png'],
      owner: baseUsers[1],
      category: baseCategories[1],
      offeredRequests: [],
      requestedRequests: [],
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: createMockRepo<UserEntity>(),
        },
        {
          provide: getRepositoryToken(SkillEntity),
          useValue: createMockRepo<SkillEntity>(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    skillRepo = module.get(getRepositoryToken(SkillEntity));
    userRepo = module.get(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===== findAll =====
  it('findAll: возвращает список пользователей', async () => {
    userRepo.find!.mockResolvedValue(baseUsers);
    const users = await service.findAll();
    expect(userRepo.find).toHaveBeenCalledWith({
      relations: ['favoriteSkills'],
    });
    expect(users.length).toBe(2);
    expect(users).toMatchObject(baseUsers.map(toResponseUserDTO));
  });

  // ===== getCurrentUser =====
  it('getCurrentUser: возвращает текущего пользователя', async () => {
    const user = baseUsers[0];
    userRepo.findOne!.mockResolvedValue(user);
    const result = await service.getCurrentUser(user.id);
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { id: user.id },
      relations: ['favoriteSkills'],
    });
    expect(result).toMatchObject(toResponseUserDTO(user));
  });

  // ===== updateCurrentUser =====
  it('updateCurrentUser: обновляет текущего пользователя', async () => {
    const user = baseUsers[0];
    userRepo.findOne!.mockResolvedValue(user);
    userRepo.save!.mockResolvedValue(user);
    const result = await service.updateCurrentUser(user.id, {
      name: 'updated name',
    });
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { id: user.id },
    });
    expect(userRepo.save).toHaveBeenCalledWith({
      ...user,
      name: 'updated name',
    });
    expect(result).toMatchObject(
      toResponseUserDTO({
        ...user,
        name: 'updated name',
        hashPassword: function (): Promise<void> {
          throw new Error('Function not implemented.');
        },
      }),
    );
  });

  // ===== updatePassword =====
  it('updatePassword: обновляет пароль текущего пользователя', async () => {
    const user = baseUsers[0];
    userRepo.findOne!.mockResolvedValue(user);
    userRepo.save!.mockResolvedValue(user);
    const result = await service.updatePassword(user.id, 'new-password');
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { id: user.id },
    });
    expect(userRepo.save).toHaveBeenCalledWith(user);
    expect(result).toMatchObject(toResponseUserDTO(user));
  });

  // ===== getUserById =====
  it('getUserById: возвращает пользователя по ID', async () => {
    const user = baseUsers[1];
    userRepo.findOne!.mockResolvedValue(user);
    const result = await service.getUserById(user.id);
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { id: user.id },
    });
    expect(result).toMatchObject(toResponseUserDTO(user));
  });

  // ===== addSkillToFavorites =====
  it('addSkillToFavorites: добавляет навык в избранное', async () => {
    const user = { ...baseUsers[0], favoriteSkills: [] };
    const skill = { ...baseSkills[0], owner: baseUsers[1] };
    userRepo.findOne!.mockResolvedValue(user);
    skillRepo.findOne!.mockResolvedValue(skill);
    userRepo.save!.mockResolvedValue({ ...user, favoriteSkills: [skill] });
    await expect(
      service.addSkillToFavorites(user.id, skill.id),
    ).resolves.toBeUndefined();
    expect(userRepo.save).toHaveBeenCalledWith({
      ...user,
      favoriteSkills: [skill],
    });
  });

  it('addSkillToFavorites: выбрасывает NotFoundException, если пользователь не найден', async () => {
    const skill = { ...baseSkills[0], owner: baseUsers[0] };
    userRepo.findOne!.mockResolvedValue(null);
    skillRepo.findOne!.mockResolvedValue(skill);
    await expect(service.addSkillToFavorites(999, skill.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('addSkillToFavorites: выбрасывает NotFoundException, если навык не найден', async () => {
    const user = { ...baseUsers[0], favoriteSkills: [] };
    userRepo.findOne!.mockResolvedValue(user);
    skillRepo.findOne!.mockResolvedValue(null);
    await expect(service.addSkillToFavorites(user.id, 0)).rejects.toThrow(
      NotFoundException,
    );
  });

  // ===== removeSkillFromFavorites =====
  it('removeSkillFromFavorites: удаляет навык из избранного', async () => {
    const user = { ...baseUsers[0], favoriteSkills: [baseSkills[0]] };
    const skill = { ...baseSkills[0], owner: baseUsers[0] };
    userRepo.findOne!.mockResolvedValue(user);
    skillRepo.findOne!.mockResolvedValue(skill);
    userRepo.save!.mockResolvedValue({ ...user, favoriteSkills: [] });
    await expect(
      service.removeSkillFromFavorites(user.id, skill.id),
    ).resolves.toBeUndefined();
    expect(userRepo.save).toHaveBeenCalledWith({
      ...user,
      favoriteSkills: [],
    });
  });

  it('removeSkillFromFavorites: выбрасывает NotFoundException, если пользователь не найден', async () => {
    const skill = { ...baseSkills[0], owner: baseUsers[0] };
    userRepo.findOne!.mockResolvedValue(null);
    skillRepo.findOne!.mockResolvedValue(skill);
    await expect(
      service.removeSkillFromFavorites(999, skill.id),
    ).rejects.toThrow(NotFoundException);
  });

  it('removeSkillFromFavorites: выбрасывает NotFoundException, если навык не найден', async () => {
    const user = { ...baseUsers[0], favoriteSkills: [baseSkills[0]] };
    userRepo.findOne!.mockResolvedValue(user);
    skillRepo.findOne!.mockResolvedValue(null);
    await expect(service.removeSkillFromFavorites(user.id, 0)).rejects.toThrow(
      NotFoundException,
    );
  });

  // ===== findUsersBySkillId =====
  it('findUsersBySkillId: находит пользователей по ID навыка', async () => {
    const skill = { ...baseSkills[0], owner: baseUsers[0] };
    skillRepo.findOne!.mockResolvedValue(skill);
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([baseUsers[1]]),
    };
    (userRepo.createQueryBuilder as any) = jest.fn().mockReturnValue(qb);

    const result = await service.findUsersBySkillId(skill.id);

    expect(skillRepo.findOne).toHaveBeenCalledWith({
      where: { id: skill.id },
      relations: ['category', 'owner'],
    });
    expect(userRepo.createQueryBuilder).toHaveBeenCalled();
    expect(qb.getMany).toHaveBeenCalled();
    expect(result).toEqual([baseUsers[1]]);
  });

  it('findUsersBySkillId: отдаёт [] если нет скила', async () => {
    skillRepo.findOne!.mockResolvedValue(null);
    const result = await service.findUsersBySkillId(0);
    expect(skillRepo.findOne).toHaveBeenCalledWith({
      where: { id: 0 },
      relations: ['category', 'owner'],
    });
    expect(result).toEqual([]);
  });
});
