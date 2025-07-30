import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToOne,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { CategoryEntity } from '../../categories/entities/categories.entity';

@Entity('skills')
export class SkillEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  title: string;
  @Column()
  description: string;
  @OneToOne(() => CategoryEntity, (categoty) => categoty.id)
  category: CategoryEntity;
  @Column({ array: true })
  images: string[];
  @ManyToOne(() => UserEntity, (user) => user.skills)
  owner: UserEntity;
}
