import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryUpdateResponseDto {
  @ApiProperty({ description: 'Уникальный идентификатор категории' })
  id: number;

  @ApiProperty({ description: 'Название категории' })
  name: string;

  @ApiPropertyOptional({ description: 'Родительская категория' })
  parent: CategoryUpdateResponseDto | null;

  @ApiPropertyOptional({
    description: 'Дочерние категории',
    type: () => [CategoryUpdateResponseDto],
  })
  children: CategoryUpdateResponseDto[];
  // НЕТ поля skills
}
