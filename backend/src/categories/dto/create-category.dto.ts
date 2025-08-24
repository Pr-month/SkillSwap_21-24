import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  //для swagger
  @ApiProperty({
    description: 'Название категории',
    example: 'Программирование',
  })

  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    //для swagger
    description: 'ID родительской категории (опционально)',
  })

  @IsOptional()
  @IsNumber()
  parentId?: number;
}
