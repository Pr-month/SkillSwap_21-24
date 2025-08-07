import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from '../users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register') // а этот для запроса POST /films
  createOrder(@Body() userData: CreateUserDTO) {
    return this.authService.createUser(userData);
  }
}
