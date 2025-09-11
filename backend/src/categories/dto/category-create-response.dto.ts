import { ApiProperty } from '@nestjs/swagger';

export class CategoryCreateResponseDto {
  @ApiProperty({ description: 'Уникальный идентификатор созданной категории' })
  id: number;

  @ApiProperty({ description: 'Название созданной категории' })
  name: string;
}
