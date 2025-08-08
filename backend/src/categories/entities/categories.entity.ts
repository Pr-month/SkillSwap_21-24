import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

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

  // Дополнительные поля для удобства работы
  @Column({ nullable: true })
  parentId: number | null;
}
