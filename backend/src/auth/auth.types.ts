import { UserRole } from 'src/users/enums';
import { Request } from 'express';

export interface JwtPayload {
  sub: number;
  email: string;
  roles: UserRole[];
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: number;
  email: string;
  roles: UserRole[];
  refreshToken: string;
  iat?: number;
  exp?: number;
}

export interface RefreshUser {
  userId: number;
  email: string;
  roles: UserRole[];
  refreshToken: string;
}

export interface ReqWithUser extends Request {
  user: JwtPayload;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface RegisterUser {
  name: string;
  email: string;
  password: string;
  about: string;
  birthdate: string;
  city: string;
  gender: string;
  avatar: string;
  category: number;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
}
