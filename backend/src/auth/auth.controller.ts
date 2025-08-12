import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDTO, LoginUserDTO } from './dto/user.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { RefreshTokenPayload } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  createUser(@Body() userData: CreateUserDTO) {
    return this.authService.createUser(userData);
  }
  @Post('login')
  loginUser(@Body() userData: LoginUserDTO) {
    return this.authService.loginUser(userData);
  }
  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  logoutUser(@Req() request: Request) {
    const user = request.user as RefreshTokenPayload;
    const refreshToken = user.refreshToken;
    return this.authService.loguotUser(refreshToken);
  }
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refreshToken(@Req() request: Request) {
    const user = request.user as RefreshTokenPayload;
    const refreshToken = user.refreshToken;
    return this.authService.refreshToken(refreshToken);
  }
}
