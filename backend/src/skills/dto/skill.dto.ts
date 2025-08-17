import {
  IsString,
  IsArray,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSkillDTO {
  @IsString() title: string;
  @IsString() description: string;
  @Type(() => Number) @IsInt() @Min(1) category: number;
  @IsArray() images: string[];
}

export class PaginationQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit: number =
    20;
}
