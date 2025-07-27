import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('skills')
export class SkillEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.skills)
  owner: UserEntity;
}
