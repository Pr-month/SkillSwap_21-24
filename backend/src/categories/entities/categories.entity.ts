import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
//для swagger
import { SkillEntity } from '../../skills/entities/skills.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  //для swagger
  @ApiProperty({
    description: 'Уникальный идентификатор категории',
  })

  id: number;

  @Column()
  //для swagger
  @ApiProperty({
    description: 'Название категории',
  })
  
  name: string;

  // Ссылка на родительскую категорию (основная категория)
  //для swagger
  @ApiPropertyOptional({
    description: 'Родительская категория',
  })

  @ManyToOne(() => CategoryEntity, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent: CategoryEntity | null;

  // Ссылка на дочерние категории (подкатегории)
  //для swagger
  @ApiPropertyOptional({
    description: 'Дочерние категории',
    type: () => [CategoryEntity],
  })

  @OneToMany(() => CategoryEntity, (category) => category.parent)
  children: CategoryEntity[];
  //для swagger
  @ApiPropertyOptional({
    description: 'Навыки в этой категории',
    type: () => [SkillEntity],
  })
  
  @OneToMany(() => SkillEntity, (skill) => skill.category)
  skills: SkillEntity[];
}
