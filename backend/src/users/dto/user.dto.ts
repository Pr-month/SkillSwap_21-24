import { Exclude, Expose } from 'class-transformer';

import { SkillEntity } from '../../skills/entities/skills.entity';

import { Gender, UserRole } from '../enums';

@Exclude()
export class ResponceUserDTO {
  @Expose() id: number;
  @Expose() name: string;
  @Expose() role: UserRole;
  @Expose() email: string;
  @Expose() about: string;
  @Expose() birthdate: string;
  @Expose() city: string;
  @Expose() gender: Gender;
  @Expose() avatar: string;

  @Expose() favoriteSkills: SkillEntity[];
}
