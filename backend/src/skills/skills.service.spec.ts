import { ObjectLiteral, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { UserEntity } from '../users/entities/user.entity';
import { CategoryEntity } from '../categories/entities/categories.entity';
import { Gender, UserRole } from '../users/enums';

import { SkillsService } from './skills.service';
import { SkillEntity } from './entities/skills.entity';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

type MockRepo<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

function createMockRepo<T extends ObjectLiteral>(): MockRepo<T> {
  return {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };
}

describe('SkillsService', () => {
  let service: SkillsService;
  let skillRepo: MockRepo<SkillEntity>;
  let userRepo: MockRepo<UserEntity>;
  let categoryRepo: MockRepo<CategoryEntity>;

  const baseUser: UserEntity = {
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
  };
  const baseCategory: CategoryEntity[] = [
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

  const baseSkill: SkillEntity = {
    id: 1,
    title: 'React',
    description: 'JSX',
    images: ['react.png'],
    owner: baseUser,
    category: baseCategory[0],
    offeredRequests: [],
    requestedRequests: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: getRepositoryToken(SkillEntity),
          useValue: createMockRepo<SkillEntity>(),
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: createMockRepo<UserEntity>(),
        },
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: createMockRepo<CategoryEntity>(),
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
    skillRepo = module.get(getRepositoryToken(SkillEntity));
    userRepo = module.get(getRepositoryToken(UserEntity));
    categoryRepo = module.get(getRepositoryToken(CategoryEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===== findAll =====
  it('findAll: возвращает пагинированный список', async () => {
    const items = [baseSkill];
    skillRepo.findAndCount!.mockResolvedValue([items, 1]);
    const res = await service.findAll({ page: 1, limit: 20 });
    expect(res).toEqual({ data: items, page: 1, totalPages: 1 });
    expect(skillRepo.findAndCount).toHaveBeenCalledWith({
      take: 20,
      skip: 0,
      relations: ['owner', 'category'],
      order: { id: 'desc' },
    });
  });

  it('findAll: бросает NotFoundException если нет навыков', async () => {
    skillRepo.findAndCount!.mockResolvedValue([[], 0]);
    await expect(
      service.findAll({ page: 1, limit: 20 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findAll: бросает NotFoundException если page > totalPages', async () => {
    skillRepo.findAndCount!.mockResolvedValue([[], 1]);
    await expect(
      service.findAll({ page: 2, limit: 20 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  // ===== createSkill =====

  it('createSkill: успешно создаёт и сохраняет навык', async () => {
    userRepo.findOne!.mockResolvedValue(baseUser);
    categoryRepo.findOne!.mockResolvedValue(baseCategory[0]);
    skillRepo.create!.mockReturnValue(baseSkill);
    skillRepo.save!.mockResolvedValue({ ...baseSkill, id: 1 });

    const dto = {
      title: 'React',
      description: 'JSX',
      images: ['react.png'],
      category: baseCategory[0].id,
    };
    const res = await service.createSkill(dto, baseUser.id);

    expect(skillRepo.create).toHaveBeenCalledWith({
      title: dto.title,
      description: dto.description,
      images: dto.images,
      owner: baseUser,
      category: baseCategory[0],
    });
    expect(skillRepo.save).toHaveBeenCalled();
    expect(res.id).toBe(1);
  });

  it('createSkill: бросает NotFoundException если пользователь не найден', async () => {
    userRepo.findOne!.mockResolvedValue(null);
    await expect(
      service.createSkill(
        {
          title: 'React',
          description: 'JSX',
          images: ['react.png'],
          category: 1,
        },
        1,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('createSkill: бросает NotFoundException если категория не найдена', async () => {
    userRepo.findOne!.mockResolvedValue(baseUser);
    categoryRepo.findOne!.mockResolvedValue(null);
    await expect(
      service.createSkill(
        {
          title: 'React',
          description: 'JSX',
          images: ['react.png'],
          category: 1,
        },
        baseUser.id,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  // ===== updateSkill =====

  it('updateSkill: успешно обновляет поля и меняет категорию', async () => {
    const otherCategory = baseCategory[1];
    skillRepo.findOne!.mockResolvedValue(baseSkill);
    userRepo.findOne!.mockResolvedValue(baseUser);
    categoryRepo.findOne!.mockResolvedValue(otherCategory);
    const updateSkillDto = {
      title: 'UI',
      description: 'Figma',
      images: ['u.png'],
      category: otherCategory.id,
    };
    const expectedSaved: SkillEntity = {
      ...baseSkill,
      ...updateSkillDto,
      category: otherCategory,
    };
    skillRepo.save!.mockResolvedValue(expectedSaved);
    const res = await service.updateSkill(
      baseSkill.id,
      updateSkillDto,
      baseUser.id,
    );
    expect(categoryRepo.findOne).toHaveBeenCalledWith({
      where: { id: otherCategory.id },
    });
    expect(skillRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: baseSkill.id,
        title: 'UI',
        description: 'Figma',
        images: ['u.png'],
        category: otherCategory.id,
      }),
    );
    expect(res).toEqual(expectedSaved);
  });

  it('updateSkill: бросает NotFoundException если skill не найден', async () => {
    skillRepo.findOne!.mockResolvedValue(null);

    await expect(
      service.updateSkill(999, { title: 'X' }, baseUser.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updateSkill: бросает NotFoundException если пользователь не найден', async () => {
    skillRepo.findOne!.mockResolvedValue(baseSkill);
    userRepo.findOne!.mockResolvedValue(null);

    await expect(
      service.updateSkill(baseSkill.id, { title: 'X' }, baseUser.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updateSkill: бросает ForbiddenException если не владелец', async () => {
    const otherUser: UserEntity = {
      ...baseUser,
      id: 2,
      email: 'user2@mail.ru',
      hashPassword: function (): Promise<void> {
        throw new Error('Function not implemented.');
      },
    };
    const foreignSkill: SkillEntity = { ...baseSkill, owner: otherUser };

    skillRepo.findOne!.mockResolvedValue(foreignSkill);
    userRepo.findOne!.mockResolvedValue(baseUser);

    await expect(
      service.updateSkill(foreignSkill.id, { title: 'X' }, baseUser.id),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('updateSkill: бросает NotFoundException если новая категория не найдена', async () => {
    skillRepo.findOne!.mockResolvedValue(baseSkill);
    userRepo.findOne!.mockResolvedValue(baseUser);
    categoryRepo.findOne!.mockResolvedValue(null);

    await expect(
      service.updateSkill(baseSkill.id, { category: 999 }, baseUser.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  // ===== deleteSkill =====

  it('deleteSkill: успешно удаляет навык владельцем', async () => {
    skillRepo.findOne!.mockResolvedValue(baseSkill);
    userRepo.findOne!.mockResolvedValue(baseUser);
    skillRepo.remove!.mockResolvedValue(undefined);

    await expect(
      service.deleteSkill(baseSkill.id, baseUser.id),
    ).resolves.toBeUndefined();

    expect(skillRepo.remove).toHaveBeenCalledWith(baseSkill);
  });

  it('deleteSkill: бросает NotFoundException если skill не найден', async () => {
    skillRepo.findOne!.mockResolvedValue(null);

    await expect(service.deleteSkill(999, baseUser.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deleteSkill: бросает NotFoundException если пользователь не найден', async () => {
    skillRepo.findOne!.mockResolvedValue(baseSkill);
    userRepo.findOne!.mockResolvedValue(null);

    await expect(
      service.deleteSkill(baseSkill.id, baseUser.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deleteSkill: бросает ForbiddenException если не владелец', async () => {
    const otherUser: UserEntity = {
      ...baseUser,
      id: 2,
      email: 'user2@mail.ru',
      hashPassword: function (): Promise<void> {
        throw new Error('Function not implemented.');
      },
    };
    const foreignSkill: SkillEntity = { ...baseSkill, owner: otherUser };

    skillRepo.findOne!.mockResolvedValue(foreignSkill);
    userRepo.findOne!.mockResolvedValue(baseUser);

    await expect(
      service.deleteSkill(foreignSkill.id, baseUser.id),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  // ===== addSkillToFavorites =====

  it('addSkillToFavorites: добавляет и сохраняет', async () => {
    skillRepo.findOne!.mockResolvedValue(baseSkill);
    userRepo.findOne!.mockResolvedValue(baseUser);
    userRepo.save!.mockResolvedValue({
      ...baseUser,
      favoriteSkills: [baseSkill],
    });

    await expect(
      service.addSkillToFavorites(baseSkill.id, baseUser.id),
    ).resolves.toBeUndefined();

    expect(
      baseUser.favoriteSkills.find((skill) => skill.id === baseSkill.id),
    ).toBeTruthy();
    expect(userRepo.save).toHaveBeenCalledWith({
      ...baseUser,
      favoriteSkills: [baseSkill],
    });
  });

  it('addSkillToFavorites: бросает NotFoundException если skill не найден', async () => {
    skillRepo.findOne!.mockResolvedValue(null);
    await expect(
      service.addSkillToFavorites(999, baseUser.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('addSkillToFavorites: бросает NotFoundException если пользователь не найден', async () => {
    skillRepo.findOne!.mockResolvedValue(baseSkill);
    userRepo.findOne!.mockResolvedValue(null);
    await expect(
      service.addSkillToFavorites(baseSkill.id, baseUser.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('addSkillToFavorites: бросает ConflictException если уже в избранном', async () => {
    skillRepo.findOne!.mockResolvedValue(baseSkill);
    userRepo.findOne!.mockResolvedValue({
      ...baseUser,
      favoriteSkills: [baseSkill],
    });

    await expect(
      service.addSkillToFavorites(baseSkill.id, baseUser.id),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // ===== removeSkillFromFavorites =====

  it('removeSkillFromFavorites: удаляет и сохраняет', async () => {
    skillRepo.findOne!.mockResolvedValue(baseSkill);
    userRepo.findOne!.mockResolvedValue({
      ...baseUser,
      favoriteSkills: [baseSkill],
    });
    userRepo.save!.mockResolvedValue({
      ...baseUser,
      favoriteSkills: [],
    });

    await expect(
      service.removeSkillFromFavorites(baseSkill.id, baseUser.id),
    ).resolves.toBeUndefined();

    expect(userRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: baseUser.id },
        relations: ['favoriteSkills'],
      }),
    );

    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: baseUser.id,
        favoriteSkills: [],
      }),
    );
  });

  it('removeSkillFromFavorites: бросает NotFoundException если skill не найден', async () => {
    skillRepo.findOne!.mockResolvedValue(null);
    await expect(
      service.removeSkillFromFavorites(999, baseUser.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('removeSkillFromFavorites: бросает NotFoundException если пользователь не найден', async () => {
    skillRepo.findOne!.mockResolvedValue(baseSkill);
    userRepo.findOne!.mockResolvedValue(null);
    await expect(
      service.removeSkillFromFavorites(baseSkill.id, baseUser.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('removeSkillFromFavorites: бросает NotFoundException если навыка нет в избранном', async () => {
    skillRepo.findOne!.mockResolvedValue(baseSkill);
    userRepo.findOne!.mockResolvedValue({
      ...baseUser,
      favoriteSkills: [],
    });

    await expect(
      service.removeSkillFromFavorites(baseSkill.id, baseUser.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
