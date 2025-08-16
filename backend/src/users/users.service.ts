import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { ResponceUserDTO } from './dto/user.dto';

const toResponseUserDTO = (user: UserEntity): ResponceUserDTO => {
  return plainToInstance(ResponceUserDTO, user);
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  // Получение всех пользователей
  async findAll(): Promise<ResponceUserDTO[]> {
    const users = await this.usersRepository.find();
    return users.map(toResponseUserDTO);
  }

  // Получение текущего пользователя
  async getCurrentUser(id: number): Promise<ResponceUserDTO | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user ? toResponseUserDTO(user) : null;
  }

  // Обновление текущего пользователя
  async updateCurrentUser(
    id: number,
    updateData: Partial<UserEntity>,
  ): Promise<ResponceUserDTO | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    Object.assign(user, updateData);
    const updatedUser = await this.usersRepository.save(user);
    return toResponseUserDTO(updatedUser);
  }

  // Обновление пароля текущего пользователя
  async updatePassword(
    id: number,
    password: string,
  ): Promise<ResponceUserDTO | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    user.password = await bcrypt.hash(password, 10);

    const updatedUser = await this.usersRepository.save(user);
    return toResponseUserDTO(updatedUser);
  }

  // Получение данных пользователя по ID
  async getUserById(id: number): Promise<ResponceUserDTO | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user ? toResponseUserDTO(user) : null;
  }
}
