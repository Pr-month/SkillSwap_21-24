import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: string;
}
