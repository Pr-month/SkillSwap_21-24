import { Gender, UserRole } from '../users/enums';

export const adminSeedData = {
  name: 'admin',
  email: 'admin@mail.ru',
  password: 'admin',
  about: 'administrator',
  birthdate: new Date('2000-01-01'),
  city: 'Moscow',
  gender: Gender.MALE,
  avatar: 'admin.png',
  role: UserRole.ADMIN,
  refreshToken: '',
};
