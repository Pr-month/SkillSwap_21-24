import { UserRole } from "src/users/entities/user.entity";

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