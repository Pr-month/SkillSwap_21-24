import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  name: string;
}
