import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CategoryEntity } from './entities/categories.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async findAll(): Promise<CategoryEntity[]> {
    return await this.categoriesRepository.find({
      where: { parent: IsNull() },
      relations: ['children'],
    });
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    const category = this.categoriesRepository.create(createCategoryDto);
    return await this.categoriesRepository.save(category);
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    // Проверяем существование категории перед обновлением
    const existingCategory = await this.categoriesRepository.findOne({
      where: { id: id },
    });

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    await this.categoriesRepository.update(id, updateCategoryDto);

    // Возвращаем обновленную категорию
    const updatedCategory = await this.categoriesRepository.findOne({
      where: { id: id },
      relations: ['children', 'parent'],
    });

    // Дополнительная проверка (на случай race condition)
    if (!updatedCategory) {
      throw new NotFoundException(
        `Category with ID ${id} not found after update`,
      );
    }

    return updatedCategory;
  }

  async remove(id: number): Promise<void> {
    // Проверяем существование категории перед удалением
    const existingCategory = await this.categoriesRepository.findOne({
      where: { id: id },
    });

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    await this.categoriesRepository.remove(existingCategory);
  }
}
