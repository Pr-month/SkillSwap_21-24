import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';
import { CategoryEntity } from './entities/categories.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategoryEntity: CategoryEntity = {
    id: 1,
    name: 'Test Category',
    parent: null,
    children: [],
    skills: [],
  };

  const mockCategoryArray: CategoryEntity[] = [
    {
      id: 1,
      name: 'Parent Category 1',
      parent: null,
      children: [
        {
          id: 3,
          name: 'Child Category 1',
          parent: null,
          children: [],
          skills: [],
        },
      ],
      skills: [],
    },
    {
      id: 2,
      name: 'Parent Category 2',
      parent: null,
      children: [],
      skills: [],
    },
  ];

  const mockRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    mockRepository.find.mockClear();
    mockRepository.create.mockClear();
    mockRepository.save.mockClear();
    mockRepository.findOne.mockClear();
    mockRepository.update.mockClear();
    mockRepository.remove.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of categories with children', async () => {
      mockRepository.find.mockResolvedValue(mockCategoryArray);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { parent: IsNull() },
        relations: ['children'],
      });
      expect(result).toEqual(mockCategoryArray);
    });

    it('should return empty array when no categories exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { parent: IsNull() },
        relations: ['children'],
      });
    });
  });

  describe('create', () => {
    it('should create and return a new category', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'New Category',
        parentId: undefined,
      };

      mockRepository.create.mockReturnValue(mockCategoryEntity);
      mockRepository.save.mockResolvedValue(mockCategoryEntity);

      const result = await service.create(createCategoryDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createCategoryDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCategoryEntity);
      expect(result).toEqual(mockCategoryEntity);
    });

    it('should create category with parentId', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Child Category',
        parentId: 1,
      };

      const expectedCategory = {
        ...mockCategoryEntity,
        name: 'Child Category',
      };

      mockRepository.create.mockReturnValue(expectedCategory);
      mockRepository.save.mockResolvedValue(expectedCategory);

      const result = await service.create(createCategoryDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createCategoryDto);
      expect(result.name).toBe('Child Category');
    });
  });

  describe('update', () => {
    it('should update and return the updated category', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Category Name',
      };

      const existingCategory = { ...mockCategoryEntity };
      const updatedCategory = {
        ...mockCategoryEntity,
        name: 'Updated Category Name',
      };

      mockRepository.findOne
        .mockResolvedValueOnce(existingCategory)
        .mockResolvedValueOnce(updatedCategory);

      const result = await service.update(1, updateCategoryDto);

      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: 1 },
      });
      expect(mockRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: 1 },
        relations: ['children', 'parent'],
      });
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateCategoryDto);
      expect(result).toEqual(updatedCategory);
      expect(result.name).toBe('Updated Category Name');
    });

    it('should throw NotFoundException when category does not exist', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Name',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateCategoryDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when category not found after update', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Name',
      };

      const existingCategory = { ...mockCategoryEntity };

      mockRepository.findOne
        .mockResolvedValueOnce(existingCategory)
        .mockResolvedValueOnce(null);

      await expect(service.update(1, updateCategoryDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateCategoryDto);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const existingCategory = { ...mockCategoryEntity };

      mockRepository.findOne.mockResolvedValue(existingCategory);

      await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.remove).toHaveBeenCalledWith(existingCategory);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });

    it('should handle remove with category that has children', async () => {
      const categoryWithChildren: CategoryEntity = {
        id: 5,
        name: 'Parent Category',
        parent: null,
        children: [
          {
            id: 6,
            name: 'Child Category',
            parent: null,
            children: [],
            skills: [],
          },
        ],
        skills: [],
      };

      mockRepository.findOne.mockResolvedValue(categoryWithChildren);

      await service.remove(5);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
      expect(mockRepository.remove).toHaveBeenCalledWith(categoryWithChildren);
    });
  });

  describe('error handling', () => {
    it('should handle database errors in findAll', async () => {
      const errorMessage = 'Database connection error';
      mockRepository.find.mockRejectedValue(new Error(errorMessage));

      await expect(service.findAll()).rejects.toThrow(errorMessage);
    });

    it('should handle database errors in create', async () => {
      const createCategoryDto: CreateCategoryDto = { name: 'Test' };
      mockRepository.create.mockReturnValue({ name: 'Test' });
      mockRepository.save.mockRejectedValue(new Error('Save failed'));

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        'Save failed',
      );
    });

    it('should handle database errors in update', async () => {
      const updateCategoryDto: UpdateCategoryDto = { name: 'Updated' };
      mockRepository.findOne.mockResolvedValue(mockCategoryEntity);
      mockRepository.update.mockRejectedValue(new Error('Update failed'));

      await expect(service.update(1, updateCategoryDto)).rejects.toThrow(
        'Update failed',
      );
    });

    it('should handle database errors in remove', async () => {
      mockRepository.findOne.mockResolvedValue(mockCategoryEntity);
      mockRepository.remove.mockRejectedValue(new Error('Remove failed'));

      await expect(service.remove(1)).rejects.toThrow('Remove failed');
    });
  });
});
