import { Test, TestingModule } from '@nestjs/testing';

import { ReqWithUser } from '../auth/auth.types';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Gender, UserRole } from './enums';

const usersDTO = [
  {
    id: 1,
    name: 'admin',
    email: 'admin@mail.ru',
    about: 'administrator',
    birthdate: '2000-01-01',
    city: 'Moscow',
    gender: Gender.MALE,
    avatar: 'admin.png',
    role: UserRole.ADMIN,
    favoriteSkills: [],
  },
  {
    id: 2,
    name: 'user',
    email: 'user@mail.ru',
    about: 'regular user',
    birthdate: '2000-01-01',
    city: 'Moscow',
    gender: Gender.MALE,
    avatar: 'user.png',
    role: UserRole.USER,
    favoriteSkills: [],
  },
];

const usersServiceMock = {
  findAll: jest.fn(),
  getCurrentUser: jest.fn(),
  updateCurrentUser: jest.fn(),
  updatePassword: jest.fn(),
  getUserById: jest.fn(),
  findUsersBySkillId: jest.fn(),
  addSkillToFavorites: jest.fn(),
  removeSkillFromFavorites: jest.fn(),
};

function makeReq(sub: number): ReqWithUser {
  return { user: { sub } } as unknown as ReqWithUser;
}

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('GET /users -> findAll', async () => {
    usersServiceMock.findAll.mockResolvedValue(usersDTO);
    const res = await controller.findAll();

    expect(res).toEqual(usersDTO);
    expect(usersServiceMock.findAll).toHaveBeenCalledTimes(1);
  });

  it('GET /users/me -> getCurrentUser', async () => {
    usersServiceMock.getCurrentUser.mockResolvedValue(usersDTO[0]);
    const req = makeReq(1);
    const res = await controller.getCurrentUser(req);
    expect(res).toEqual(usersDTO[0]);
    expect(usersServiceMock.getCurrentUser).toHaveBeenCalledWith(1);
    expect(usersServiceMock.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('PATCH /users/me -> updateCurrentUser', async () => {
    usersServiceMock.updateCurrentUser.mockResolvedValue(usersDTO[0]);
    const req = makeReq(1);
    const res = await controller.updateCurrentUser(req, { name: 'newname' });
    expect(res).toEqual(usersDTO[0]);
    expect(usersServiceMock.updateCurrentUser).toHaveBeenCalledWith(1, {
      name: 'newname',
    });
    expect(usersServiceMock.updateCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('PATCH /users/me/password -> updatePassword', async () => {
    usersServiceMock.updatePassword.mockResolvedValue(usersDTO[0]);
    const req = makeReq(1);
    const res = await controller.updatePassword(req, { password: 'newpass' });
    expect(res).toEqual(usersDTO[0]);
    expect(usersServiceMock.updatePassword).toHaveBeenCalledWith(1, 'newpass');
    expect(usersServiceMock.updatePassword).toHaveBeenCalledTimes(1);
  });

  it('GET /users/:id -> getUserById', async () => {
    usersServiceMock.getUserById.mockResolvedValue(usersDTO[1]);
    const res = await controller.getUserById(2);
    expect(res).toEqual(usersDTO[1]);
    expect(usersServiceMock.getUserById).toHaveBeenCalledWith(2);
    expect(usersServiceMock.getUserById).toHaveBeenCalledTimes(1);
  });

  it('GET /users/by-skill/:id -> findUsersBySkillId', async () => {
    usersServiceMock.findUsersBySkillId.mockResolvedValue(usersDTO);
    const res = await controller.findUsersBySkillId(10);
    expect(res).toEqual(usersDTO);
    expect(usersServiceMock.findUsersBySkillId).toHaveBeenCalledWith(10);
    expect(usersServiceMock.findUsersBySkillId).toHaveBeenCalledTimes(1);
  });

  it('POST /users/favorites/:skillId -> addSkillToFavorites', async () => {
    usersServiceMock.addSkillToFavorites.mockResolvedValue(undefined);
    const req = makeReq(1);
    const result = await controller.addSkillToFavorites(req, 55);
    expect(result).toBeUndefined();
    expect(usersServiceMock.addSkillToFavorites).toHaveBeenCalledWith(1, 55);
    expect(usersServiceMock.addSkillToFavorites).toHaveBeenCalledTimes(1);
  });

  it('DELETE /users/favorites/:skillId -> removeSkillFromFavorites', async () => {
    usersServiceMock.removeSkillFromFavorites.mockResolvedValue(undefined);
    const req = makeReq(1);
    const result = await controller.removeSkillFromFavorites(req, 55);
    expect(result).toBeUndefined();
    expect(usersServiceMock.removeSkillFromFavorites).toHaveBeenCalledWith(
      1,
      55,
    );
    expect(usersServiceMock.removeSkillFromFavorites).toHaveBeenCalledTimes(1);
  });
});
