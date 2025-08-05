import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/user.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register') // а этот для запроса POST /films
  createUser(@Body() userData: CreateUserDTO) {
    return this.authService.createUser(userData);
  }
  @Post('login') // а этот для запроса POST /films
  loginUser(
    @Body() userData: CreateUserDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.loginUser(userData, res);
  }
  @Post('logout') // а этот для запроса POST /films
  logoutUser(@Body() userData: CreateUserDTO) {
    return this.authService.createUser(userData);
  }
}
