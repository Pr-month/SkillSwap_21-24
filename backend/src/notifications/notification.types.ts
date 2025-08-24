import { UserRole } from 'src/users/enums';
import { Socket } from 'socket.io';

export interface JwtPayload {
  sub: number;
  email: string;
  roles: UserRole[];
  iat?: number;
  exp?: number;
}

export interface AuthenticatedSocket extends Socket {
  user?: JwtPayload;
}
