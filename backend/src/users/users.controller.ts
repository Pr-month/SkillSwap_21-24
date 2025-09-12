import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Delete,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReqWithUser } from '../auth/auth.types';

import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import {
  ResponceUserDTO,
  UpdatePasswordDTO,
  UpdateUserDTO,
} from './dto/user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Получение всех пользователей
  @Get()
  @ApiOperation({ summary: 'Получить список пользователей' })
  @ApiOkResponse({
    type: [ResponceUserDTO],
    description: 'Список пользователей',
  })
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ResponceUserDTO[]> {
    return this.usersService.findAll();
  }

  // Получение текущего пользователя
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Профиль текущего пользователя' })
  @ApiOkResponse({ type: ResponceUserDTO })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(
    @Request() req: ReqWithUser,
  ): Promise<ResponceUserDTO | null> {
    return this.usersService.getCurrentUser(req.user.sub);
  }

  // Обновление текущего пользователя
  @Patch('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Обновить профиль текущего пользователя' })
  @ApiBody({ type: UpdateUserDTO })
  @ApiOkResponse({ type: ResponceUserDTO, description: 'Профиль обновлён' })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateCurrentUser(
    @Request() req: ReqWithUser,
    @Body() updateData: Partial<UserEntity>,
  ): Promise<ResponceUserDTO | null> {
    return this.usersService.updateCurrentUser(req.user.sub, updateData);
  }

  // Обновление пароля текущего пользователя
  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Изменить пароль текущего пользователя' })
  @ApiBody({ type: UpdatePasswordDTO })
  @ApiOkResponse({ type: ResponceUserDTO, description: 'Пароль изменён' })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Request() req: ReqWithUser,
    @Body() updateData: UpdatePasswordDTO,
  ): Promise<ResponceUserDTO | null> {
    return this.usersService.updatePassword(req.user.sub, updateData.password);
  }

  // Получение данных пользователя по ID
  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiOkResponse({ type: ResponceUserDTO })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') id: number): Promise<ResponceUserDTO | null> {
    return this.usersService.getUserById(id);
  }
  // Получение пользователей по ID навыка
  @Get('by-skill/:id')
  @ApiOperation({ summary: 'Найти пользователей, связанных со скиллом' })
  @ApiOkResponse({ type: [UserEntity], description: 'Подходящие пользователи' })
  async findUsersBySkillId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserEntity[]> {
    return this.usersService.findUsersBySkillId(id);
  }

  // Добавление навыка в избранное
  @Post('favorites/:skillId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Добавить скилл в избранное' })
  @ApiNoContentResponse({ description: 'Добавлено' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiNotFoundResponse({ description: 'Скилл/пользователь не найден' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async addSkillToFavorites(
    @Request() req: ReqWithUser,
    @Param('skillId', ParseIntPipe) skillId: number,
  ): Promise<void> {
    return this.usersService.addSkillToFavorites(req.user.sub, skillId);
  }

  // Удаление навыка из избранного
  @Delete('favorites/:skillId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Удалить скилл из избранного' })
  @ApiNoContentResponse({ description: 'Удалено' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiNotFoundResponse({ description: 'Скилл не найден в избранном' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSkillFromFavorites(
    @Request() req: ReqWithUser,
    @Param('skillId', ParseIntPipe) skillId: number,
  ): Promise<void> {
    return this.usersService.removeSkillFromFavorites(req.user.sub, skillId);
  }
}
