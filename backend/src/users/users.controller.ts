import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; //TODO: Расскомментировать после реализации JWT

import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { ReqWithUser } from 'src/auth/auth.types';

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
    @Request() req: ReqWithUser, // Получаем user из JWT
  ): Promise<UserEntity | null> {
    return this.usersService.getCurrentUser(req.user.sub);
  }

  // Обновление текущего пользователя
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateCurrentUser(
    @Request() req: ReqWithUser,
    @Body() updateData: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    return this.usersService.updateCurrentUser(req.user.sub, updateData);
  }

  // Обновление пароля текущего пользователя
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async updatePassword(
    @Request() req: ReqWithUser,
    @Body() updateData: { password: string },
  ): Promise<UserEntity | null> {
    return this.usersService.updatePassword(req.user.sub, updateData.password);
  }

  // Получение пользователей по ID навыка
  @Get('by-skill/:id')
  async findUsersBySkillId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserEntity[]> {
    return this.usersService.findUsersBySkillId(id);
  }

  // Добавление навыка в избранное
  @UseGuards(JwtAuthGuard)
  @Post('favorites/:skillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addSkillToFavorites(
    @Request() req: ReqWithUser,
    @Param('skillId', ParseIntPipe) skillId: number,
  ): Promise<void> {
    return this.usersService.addSkillToFavorites(req.user.sub, skillId);
  }

  // Удаление навыка из избранного
  @UseGuards(JwtAuthGuard)
  @Delete('favorites/:skillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSkillFromFavorites(
    @Request() req: ReqWithUser,
    @Param('skillId', ParseIntPipe) skillId: number,
  ): Promise<void> {
    return this.usersService.removeSkillFromFavorites(req.user.sub, skillId);
  }
}
