import { Gender, UserRole } from '../users/enums';

export const usersSeedData = [
  {
    name: 'Ivan Ivanov',
    email: 'ivan@mail.ru',
    password: 'password123',
    about: 'Frontend developer with 3 years of experience',
    birthdate: new Date('2000-01-01'),
    city: 'Moscow',
    gender: Gender.MALE,
    avatar: 'ivan.png',
    role: UserRole.USER,
    refreshToken: '',
  },
  {
    name: 'Vasya Pupkin',
    email: 'vasya@mail.ru',
    password: 'password123',
    about: 'Backend developer and system administrator',
    birthdate: new Date('1995-05-15'),
    city: 'Saint Petersburg',
    gender: Gender.MALE,
    avatar: 'vasya.png',
    role: UserRole.USER,
    refreshToken: '',
  },
];
