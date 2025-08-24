import { IsEmail, IsEnum, IsNumber, IsString, IsUrl } from 'class-validator';

import { Gender } from 'src/users/enums';

export class CreateUserDTO {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsString() password: string;
  @IsString() about: string;
  @IsString() birthdate: string;
  @IsString() city: string;
  @IsEnum(Gender) gender: Gender;
  @IsUrl() avatar: string;
  @IsNumber() category: number;
}

export class LoginUserDTO {
  @IsEmail() email: string;
  @IsString() password: string;
}
