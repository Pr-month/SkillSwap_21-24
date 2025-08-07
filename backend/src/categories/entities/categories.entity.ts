import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { SkillEntity } from '../../skills/entities/skills.entity';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  name: string;
  @OneToMany(() => SkillEntity, (skill) => skill.category)
  skills: SkillEntity[];
}
