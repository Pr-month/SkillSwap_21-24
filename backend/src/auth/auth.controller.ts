import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/user.dto';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  createUser(@Body() userData: CreateUserDTO) {
    return this.authService.createUser(userData);
  }
  @Post('login')
  loginUser(
    @Body() userData: CreateUserDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.loginUser(userData, res);
  }
  @Post('logout')
  logoutUser(@Body() userData: CreateUserDTO) {
    return this.authService.createUser(userData);
  }
  @Post('refresh')
  refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const cookies = request.cookies as { refreshToken?: string };
    const refreshToken = cookies.refreshToken;
    if (typeof refreshToken !== 'string') {
      throw new UnauthorizedException('Refresh token missing or malformed');
    }
    return this.authService.refreshToken(refreshToken, response);
  }
}
