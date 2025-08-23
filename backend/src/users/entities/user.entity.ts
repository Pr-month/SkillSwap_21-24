import { CategoryEntity } from '../../categories/entities/categories.entity';
import { SkillEntity } from '../../skills/entities/skills.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeInsert,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { RequestEntity } from '../../requests/entities/request.entity';
import { hashPassword } from '../../common/hash-password';

import { Gender, UserRole } from '../enums';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column()
  avatar: string;

  @OneToMany(() => SkillEntity, (skill) => skill.owner)
  skills: SkillEntity[];

  @ManyToMany(() => CategoryEntity, { cascade: true })
  @JoinTable({
    name: 'user_want_to_learn',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  wantToLearn: CategoryEntity[];

  @ManyToMany(() => SkillEntity, { cascade: false })
  @JoinTable({
    name: 'user_favorite_skills',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skill_id', referencedColumnName: 'id' },
  })
  favoriteSkills: SkillEntity[];

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true, select: false })
  refreshToken: string;

  @OneToMany(() => RequestEntity, (request) => request.sender)
  sentRequests: RequestEntity[];

  @OneToMany(() => RequestEntity, (request) => request.receiver)
  receivedRequests: RequestEntity[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await hashPassword(this.password);
  }
}
