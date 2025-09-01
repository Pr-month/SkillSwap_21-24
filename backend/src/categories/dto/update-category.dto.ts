import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  //для swagger
  @ApiPropertyOptional({
    description: 'Название категории',
    example: 'Обновленное название',
  })

  name?: string;
  //для swagger
  @ApiPropertyOptional({
    description: 'ID родительской категории',
  })
  
  parentId?: number;
}
