import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; //TODO: Расскомментировать после реализации JWT

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
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(
    @Request() req, // Получаем user из JWT
  ): Promise<UserEntity | null> {
    return this.usersService.getCurrentUser(req.user.id);
  }

  // Обновление текущего пользователя
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateCurrentUser(
    @Request() req,
    @Body() updateData: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    return this.usersService.updateCurrentUser(req.user.id, updateData);
  }

  // Обновление пароля текущего пользователя
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async updatePassword(
    @Request() req,
    @Body() updateData: { password: string },
  ): Promise<UserEntity | null> {
    return this.usersService.updatePassword(req.user.id, updateData.password);
  }
}
