import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
    @Req() req: Request & { user: { id: string } },
  ): Promise<UserEntity | null> {
    return this.usersService.getCurrentUser(req.user.id);
  }
}
