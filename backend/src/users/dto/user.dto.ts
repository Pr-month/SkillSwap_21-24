import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsEnum, IsString, IsUrl } from 'class-validator';

import { SkillEntity } from '../../skills/entities/skills.entity';

import { Gender, UserRole } from '../enums';

export class CreateUserDTO {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsEnum(UserRole) role: UserRole;
  @IsString() password: string;
  @IsString() about: string;
  @IsString() birthdate: string;
  @IsString() city: string;
  @IsEnum(Gender) gender: Gender;
  @IsUrl() avatar: string;
}

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
