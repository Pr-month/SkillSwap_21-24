import {
  IsEmail,
  IsEnum,
  IsString,
  IsUrl
} from 'class-validator';

import { Gender } from 'src/users/enums';

export class CreateUserDTO {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  password: string;
  @IsString()
  about: string;
  @IsString()
  birthdate: string;
  @IsString()
  city: string;
  @IsEnum(Gender)
  gender: Gender;
  @IsUrl()
  avatar: string;
  // @IsString()
  // category: string;
  // @IsString()
  // subcategory: string;
  // @ValidateNested({ each: true })
  // @Type(() => CreateSkillDTO)
  // skill: CreateSkillDTO;
}

export class LoginUserDTO {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}
