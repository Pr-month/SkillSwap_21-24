import { Test, TestingModule } from '@nestjs/testing';

import { ReqWithUser } from '../auth/auth.types';

import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

type SkillDTO = {
  id: number;
  title: string;
  description: string;
  images: string[];
  category: number;
  owner: number;
};

const skills: SkillDTO[] = [
  {
    id: 1,
    title: 'React',
    description: 'JSX',
    images: ['react.png'],
    category: 1,
    owner: 1,
  },
  {
    id: 2,
    title: 'Node.js',
    description: 'Runtime',
    images: ['node.png'],
    category: 2,
    owner: 2,
  },
];

const paginatedResponse = { data: skills, page: 1, totalPages: 1 };

const skillsServiceMock = {
  findAll: jest.fn(),
  createSkill: jest.fn(),
  updateSkill: jest.fn(),
  deleteSkill: jest.fn(),
  addSkillToFavorites: jest.fn(),
  removeSkillFromFavorites: jest.fn(),
};

function makeReq(sub: number): ReqWithUser {
  return { user: { sub } } as unknown as ReqWithUser;
}

describe('SkillsController', () => {
  let controller: SkillsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [{ provide: SkillsService, useValue: skillsServiceMock }],
    }).compile();

    controller = module.get<SkillsController>(SkillsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('GET /skills -> findAll', async () => {
    skillsServiceMock.findAll.mockResolvedValue(paginatedResponse);
    const result = await controller.getAllSkills({ page: 1, limit: 10 });
    expect(result).toEqual(paginatedResponse);
    expect(skillsServiceMock.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
    expect(skillsServiceMock.findAll).toHaveBeenCalledTimes(1);
  });

  it('POST /skills -> createSkill', async () => {
    const newSkill = {
      title: 'Angular',
      description: 'Framework',
      images: ['angular.png'],
      category: 1,
    };
    skillsServiceMock.createSkill.mockResolvedValue({ id: 3, ...newSkill });
    const req = makeReq(1);
    const result = await controller.createSkill(newSkill, req);
    expect(result).toEqual({ id: 3, ...newSkill });
    expect(skillsServiceMock.createSkill).toHaveBeenCalledWith(newSkill, 1);
    expect(skillsServiceMock.createSkill).toHaveBeenCalledTimes(1);
  });

  it('PATCH /skills/:id -> updateSkill', async () => {
    const updatedSkill = {
      title: 'Angular',
      description: 'Framework',
      images: ['angular.png'],
      category: 1,
    };
    skillsServiceMock.updateSkill.mockResolvedValue({ id: 3, ...updatedSkill });
    const req = makeReq(1);
    const result = await controller.updateSkill(3, updatedSkill, req);
    expect(result).toEqual({ id: 3, ...updatedSkill });
    expect(skillsServiceMock.updateSkill).toHaveBeenCalledWith(
      3,
      updatedSkill,
      1,
    );
    expect(skillsServiceMock.updateSkill).toHaveBeenCalledTimes(1);
  });

  it('DELETE /skills/:id -> deleteSkill', async () => {
    skillsServiceMock.deleteSkill.mockResolvedValue(undefined);
    const req = makeReq(1);
    const res = await controller.deleteSkill(3, req);
    expect(res).toBeUndefined();
    expect(skillsServiceMock.deleteSkill).toHaveBeenCalledWith(3, 1);
    expect(skillsServiceMock.deleteSkill).toHaveBeenCalledTimes(1);
  });

  it('POST /skills/:id/favorite -> addSkillToFavorites', async () => {
    skillsServiceMock.addSkillToFavorites.mockResolvedValue(undefined);
    const req = makeReq(1);
    const res = await controller.addSkillToFavorites(3, req);
    expect(res).toBeUndefined();
    expect(skillsServiceMock.addSkillToFavorites).toHaveBeenCalledWith(3, 1);
    expect(skillsServiceMock.addSkillToFavorites).toHaveBeenCalledTimes(1);
  });

  it('DELETE /skills/:id/favorite -> removeSkillFromFavorites', async () => {
    skillsServiceMock.removeSkillFromFavorites.mockResolvedValue(undefined);
    const req = makeReq(1);
    const res = await controller.removeSkillFromFavorites(3, req);
    expect(res).toBeUndefined();
    expect(skillsServiceMock.removeSkillFromFavorites).toHaveBeenCalledWith(
      3,
      1,
    );
    expect(skillsServiceMock.removeSkillFromFavorites).toHaveBeenCalledTimes(1);
  });
});
