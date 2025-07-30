import {
  IsString,
  IsEmail,
  IsDate,
  IsEnum,
  IsUrl,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../users/entities/user.entity';

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

export class CreateSkillDTO {
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsString()
  categoryName: string;
  @IsString()
  subcategoryName: string;
  @IsArray()
  @IsUrl()
  images: string[];
}
