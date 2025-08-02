import { Body, Controller, Get, Headers, Patch } from '@nestjs/common';

//import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; //TODO: Расскомментировать после реализации JWT

import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Получение всех пользователей
  @Get()
  async findAll(): Promise<UserEntity[]> {
    return this.usersService.findAll();
  }

  // Получение текущего пользователя
  //@UseGuards(JwtAuthGuard) //TODO: Расскомментировать после реализации JWT
  @Get('me')
  async getCurrentUser(
    @Headers('x-user-id') userId: string, //TODO: ЗАМЕНИТЬ НА JWT
  ): Promise<UserEntity | null> {
    return this.usersService.getCurrentUser(userId);
  }

  // Обновление текущего пользователя
  //@UseGuards(JwtAuthGuard) //TODO: Расскомментировать после реализации JWT
  @Patch('me')
  async updateCurrentUser(
    @Headers('x-user-id') userId: string, //TODO: ЗАМЕНИТЬ НА JWT
    @Body() updateData: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    return this.usersService.updateCurrentUser(userId, updateData);
  }
}
