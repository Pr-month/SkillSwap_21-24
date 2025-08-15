import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReqWithUser } from '../auth/auth.types';

import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { ResponceUserDTO } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Получение всех пользователей
  @Get()
  async findAll(): Promise<ResponceUserDTO[]> {
    return this.usersService.findAll();
  }

  // Получение текущего пользователя
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(
    @Request() req: ReqWithUser,
  ): Promise<ResponceUserDTO | null> {
    return this.usersService.getCurrentUser(req.user.sub);
  }

  // Обновление текущего пользователя
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateCurrentUser(
    @Request() req: ReqWithUser,
    @Body() updateData: Partial<UserEntity>,
  ): Promise<ResponceUserDTO | null> {
    return this.usersService.updateCurrentUser(req.user.sub, updateData);
  }

  // Обновление пароля текущего пользователя
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async updatePassword(
    @Request() req: ReqWithUser,
    @Body() updateData: { password: string },
  ): Promise<ResponceUserDTO | null> {
    return this.usersService.updatePassword(req.user.sub, updateData.password);
  }
}
