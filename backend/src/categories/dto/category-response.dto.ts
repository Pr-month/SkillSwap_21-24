import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ description: 'Уникальный идентификатор категории' })
  id: number;

  @ApiProperty({ description: 'Название категории' })
  name: string;

  @ApiPropertyOptional({ description: 'Родительская категория' })
  parent: CategoryResponseDto | null;

  @ApiPropertyOptional({
    description: 'Дочерние категории',
    type: () => [CategoryResponseDto],
  })
  children: CategoryResponseDto[];
  // НЕТ поля skills
}
