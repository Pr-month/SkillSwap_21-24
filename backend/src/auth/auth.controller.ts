import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDTO, LoginResponseDTO, LoginUserDTO } from './dto/user.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { RefreshTokenPayload } from './auth.types';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно создан',
    type: LoginResponseDTO,
  })
  @ApiResponse({ status: 404, description: 'Неверная категория навыка' })
  createUser(@Body() userData: CreateUserDTO): Promise<LoginResponseDTO> {
    return this.authService.createUser(userData);
  }
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход',
    type: LoginResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Неверный логин или пароль' })
  loginUser(@Body() userData: LoginUserDTO): Promise<LoginResponseDTO> {
    return this.authService.loginUser(userData);
  }
  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Выход пользователя и удаление refresh токена' })
  @ApiBearerAuth() // если используете Bearer JWT
  @ApiResponse({ status: 200, description: 'Пользователь вышел' })
  @ApiResponse({ status: 404, description: 'Неверный или истекший токен' })
  logoutUser(@Req() request: Request): Promise<{ success: boolean }> {
    const user = request.user as RefreshTokenPayload;
    const refreshToken = user.refreshToken;
    return this.authService.loguotUser(refreshToken);
  }
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Обновление access токена с помощью refresh токена',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Новый access токен',
    type: LoginResponseDTO,
  })
  @ApiResponse({ status: 404, description: 'Неверный или истекший токен' })
  refreshToken(@Req() request: Request): Promise<LoginResponseDTO> {
    const user = request.user as RefreshTokenPayload;
    const refreshToken = user.refreshToken;
    return this.authService.refreshToken(refreshToken);
  }
}
