import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { SkillEntity } from '../../skills/entities/skills.entity';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Ссылка на родительскую категорию (основная категория)
  @ManyToOne(() => CategoryEntity, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent: CategoryEntity | null;

  // Ссылка на дочерние категории (подкатегории)
  @OneToMany(() => CategoryEntity, (category) => category.parent)
  children: CategoryEntity[];

  @OneToMany(() => SkillEntity, (skill) => skill.category)
  skills: SkillEntity[];
}
