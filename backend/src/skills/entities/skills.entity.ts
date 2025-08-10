import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { CategoryEntity } from '../../categories/entities/categories.entity';

@Entity('skills')
export class SkillEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => CategoryEntity, (category) => category.skills)
  category: CategoryEntity;

  @Column({ array: true, type: 'text' })
  images: string[];

  @ManyToOne(() => UserEntity, (user) => user.skills)
  owner: UserEntity;
}
