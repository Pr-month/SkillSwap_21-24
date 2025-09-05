import { ApiProperty } from '@nestjs/swagger';

export class CategoryListResponseDto {
  @ApiProperty({ description: 'Уникальный идентификатор категории' })
  id: number;

  @ApiProperty({ description: 'Название категории' })
  name: string;

  @ApiProperty({
    description: 'Дочерние категории',
    type: () => [CategoryListResponseDto],
  })
  children: CategoryListResponseDto[];
}
