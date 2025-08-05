import {
  IsString,
  IsEmail,
  IsDate,
  IsEnum,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../users/entities/user.entity';
import { CreateSkillDTO } from '../../skills/dto/skill.dto';

export class CreateUserDTO {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  password: string;
  @IsString()
  about: string;
  @IsDate()
  birthdate: string;
  @IsString()
  city: string;
  @IsEnum(Gender)
  gender: Gender;
  @IsUrl()
  avatar: string;
  @IsString()
  category: string;
  @IsString()
  subcategory: string;
  @ValidateNested({ each: true })
  @Type(() => CreateSkillDTO)
  skill: CreateSkillDTO;
}
