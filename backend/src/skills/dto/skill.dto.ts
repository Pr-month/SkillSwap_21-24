import {
  IsString,
  IsArray,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateSkillDTO {
  @ApiProperty({ example: 'React Basics' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'JSX, компоненты, состояние, эффекты, хуки' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  category: number;

  @ApiProperty({ example: ['react1.png', 'react2.png'] })
  @IsArray()
  @IsString({ each: true })
  images: string[];
}

export class UpdateSkillDTO extends PartialType(CreateSkillDTO) {}

export class SkillResponseDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 'React Basics' }) title: string;
  @ApiProperty({ example: 'Введение в JSX, компоненты, состояние' })
  description: string;
  @ApiProperty({ example: 1 }) categoryId: number;
  @ApiProperty({ example: 42 }) ownerId: number;
  @ApiProperty({ type: [String], example: ['react1.png', 'react2.png'] })
  images: string[];
}

export class SkillListResponseDto {
  @ApiProperty({ type: () => [SkillResponseDto] })
  data: SkillResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class PaginationQueryDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
