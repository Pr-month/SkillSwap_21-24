import { IsEmail, IsEnum, IsNumber, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from 'src/users/enums';

export class CreateUserDTO {
  @ApiProperty({ example: 'john', description: 'Имя пользователя' })
  @IsString()
  name: string;
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  email: string;
  @ApiProperty({
    example: 'strongPassword123',
    description: 'Пароль пользователя',
  })
  @ApiProperty({
    example: 'Люблю программирование',
    description: 'Информация о пользователе',
  })
  @IsString()
  about: string;

  @ApiProperty({
    example: '2000-01-01',
    description: 'Дата рождения в формате YYYY-MM-DD',
  })
  @IsString()
  birthdate: string;

  @ApiProperty({ example: 'Moscow', description: 'Город пользователя' })
  @IsString()
  city: string;

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: 'Пол пользователя',
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL аватара пользователя',
  })
  @IsUrl()
  avatar: string;

  @ApiProperty({ example: 1, description: 'ID категории пользователя' })
  @IsNumber()
  category: number;
  // @IsString()
  // subcategory: string;
  // @ValidateNested({ each: true })
  // @Type(() => CreateSkillDTO)
  // skill: CreateSkillDTO;
}

export class LoginUserDTO {
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  email: string;
  @ApiProperty({
    example: 'strongPassword123',
    description: 'Пароль пользователя',
  })
  @IsString()
  password: string;
}

export class LoginResponseDTO {
  @ApiProperty({ example: true, description: 'Статус успешного входа' })
  success: boolean;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
    description: 'Access токен',
  })
  accessToken: string;

  @ApiProperty({
    example: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4=',
    description: 'Refresh токен',
  })
  refreshToken: string;
}
