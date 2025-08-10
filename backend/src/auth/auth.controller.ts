import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  createUser(@Body() userData: CreateUserDTO) {
    return this.authService.createUser(userData);
  }
  @Post('login')
  loginUser(@Body() userData: CreateUserDTO) {
    return this.authService.loginUser(userData);
  }
  @Post('logout')
  logoutUser(@Req() request: Request) {
    const cookies = request.cookies as { refreshToken?: string };
    const refreshToken = cookies.refreshToken;
    if (typeof refreshToken !== 'string') {
      throw new UnauthorizedException('Refresh token missing or malformed');
    }
    return this.authService.loguotUser(refreshToken);
  }
  @Post('refresh')
  refreshToken(@Req() request: Request) {
    const cookies = request.cookies as { refreshToken?: string };
    const refreshToken = cookies.refreshToken;
    if (typeof refreshToken !== 'string') {
      throw new UnauthorizedException('Refresh token missing or malformed');
    }
    return this.authService.refreshToken(refreshToken);
  }
}
