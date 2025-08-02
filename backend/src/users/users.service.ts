import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  // Получение всех пользователей
  async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  // Получение текущего пользователя
  async getCurrentUser(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  // Обновление текущего пользователя
  async updateCurrentUser(
    id: string,
    updateData: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    Object.assign(user, updateData);

    return this.usersRepository.save(user);
  }
}
