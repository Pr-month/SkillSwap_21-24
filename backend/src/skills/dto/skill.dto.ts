import { IsString, IsUrl, IsArray } from 'class-validator';

export class CreateSkillDTO {
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsString()
  category: string;
  @IsArray()
  @IsUrl()
  images: string[];
}
