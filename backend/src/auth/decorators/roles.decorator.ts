import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/enums';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
