import { IsString, IsArray } from 'class-validator';

export class CreateSkillDTO {
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsString()
  category: string;
  @IsArray()
  images: string[];
  @IsString()
  owner: string;
}
