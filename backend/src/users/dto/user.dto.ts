import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { SkillEntity } from '../../skills/entities/skills.entity';

import { Gender, UserRole } from '../enums';

@Exclude()
export class ResponceUserDTO {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;
  @Expose()
  @ApiProperty({ example: 'Ivan Ivanov' })
  name: string;
  @Expose()
  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;
  @Expose()
  @ApiProperty({ example: 'ivan@mail.ru' })
  email: string;
  @Expose()
  @ApiProperty({ example: 'Frontend developer' })
  about: string;
  @Expose()
  @ApiProperty({ example: '2000-01-01', description: 'YYYY-MM-DD' })
  birthdate: string;
  @Expose()
  @ApiProperty({ example: 'Moscow' })
  city: string;
  @Expose()
  @ApiProperty({ enum: Gender, example: Gender.MALE })
  gender: Gender;
  @Expose()
  @ApiProperty({ example: 'ivan.png' })
  avatar: string;

  @Expose()
  @ApiProperty({
    type: () => [SkillEntity],
    description: 'Избранные навыки пользователя',
  })
  favoriteSkills: SkillEntity[];
}

export class UpdateUserDTO {
  @ApiPropertyOptional({ example: 'Ivan Ivanov' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Frontend developer' })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({ example: '2000-01-01', description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @ApiPropertyOptional({ example: 'Moscow' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: Gender, example: Gender.NOTSTATED })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: 'avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdatePasswordDTO {
  @ApiProperty({ example: 'StrongPassword123', minLength: 6 })
  @MinLength(6)
  @IsString()
  password: string;
}
