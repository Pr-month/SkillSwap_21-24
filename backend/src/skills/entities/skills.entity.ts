import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToMany,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { CategoryEntity } from '../../categories/entities/categories.entity';
import { RequestEntity } from '../../requests/entities/request.entity';

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

  @OneToMany(() => RequestEntity, (request) => request.offeredSkill)
  offeredRequests: RequestEntity[];

  @OneToMany(() => RequestEntity, (request) => request.requestedSkill)
  requestedRequests: RequestEntity[];
}
