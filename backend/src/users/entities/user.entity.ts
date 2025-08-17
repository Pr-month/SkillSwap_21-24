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
import * as bcrypt from 'bcrypt';
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

  @OneToMany(() => CategoryEntity, (category) => category.id)
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

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
