import { CategoryEntity } from '../../categories/entities/categories.entity';
import { SkillEntity } from '../../skills/entities/skills.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  about: string;

  @Column({ type: 'date' })
  birthdate: Date;

  @Column()
  city: string;

  @Column()
  gender: string;

  @Column()
  avatar: string;

  @OneToMany(() => SkillEntity, (skill) => skill.owner)
  skills: SkillEntity[];

  @OneToMany(() => CategoryEntity, (category) => category.id)
  wantToLearn: CategoryEntity[];

  @OneToMany(() => SkillEntity, (skill) => skill.id)
  favoriteSkills: SkillEntity[];

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column()
  refreshToken: string;
}
