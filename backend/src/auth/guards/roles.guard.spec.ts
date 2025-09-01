import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../users/enums';
import { JwtPayload } from '../auth.types';

// Тестируем RolesGuard - гарду для проверки ролей пользователя
describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  // Создаем мок для Reflector (сервис для получения метаданных)
  const mockReflector = {
    getAllAndOverride: jest.fn(), // Мок метода получения ролей из декораторов
  };

  // Функция для создания мокового контекста выполнения
  const createMockContext = (user?: JwtPayload): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user, // Пользователь из запроса
        }),
      }),
      getHandler: jest.fn(), // Мок метода обработчика
      getClass: jest.fn(), // Мок метода класса
    } as unknown as ExecutionContext;
  };

  // Перед каждым тестом инициализируем guard с моковым reflector
  beforeEach(() => {
    reflector = mockReflector as unknown as Reflector;
    guard = new RolesGuard(reflector);
  });

  // После каждого теста очищаем все моки
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Базовый тест - проверяем что guard существует
  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  // Тестируем основной метод canActivate
  describe('canActivate', () => {
    // Тест 1: Нет требуемых ролей - доступ разрешен
    it('should return true when no roles are required', () => {
      mockReflector.getAllAndOverride.mockReturnValue(null); // Роли не требуются
      const context = createMockContext(); // Контекст без пользователя

      const result = guard.canActivate(context);

      expect(result).toBe(true); // Доступ разрешен
      // Проверяем что метод вызывался с правильными параметрами
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    // Тест 2: Пустой массив ролей - доступ разрешен
    it('should return true when empty roles array is required', () => {
      mockReflector.getAllAndOverride.mockReturnValue([]); // Пустой массив ролей
      const context = createMockContext();

      const result = guard.canActivate(context);

      expect(result).toBe(true); // Доступ разрешен
    });

    // Тест 3: Пользователь отсутствует в запросе - доступ запрещен
    it('should return false when user is not in request', () => {
      const requiredRoles: UserRole[] = [UserRole.ADMIN];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles); // Требуется ADMIN
      const context = createMockContext(undefined); // Нет пользователя

      const result = guard.canActivate(context);

      expect(result).toBe(false); // Доступ запрещен
    });

    // Тест 4: Роли пользователя - не массив - доступ запрещен
    it('should return false when user roles is not an array', () => {
      const requiredRoles: UserRole[] = [UserRole.ADMIN];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

      // Пользователь с roles в виде строки вместо массива
      const userWithInvalidRoles = {
        sub: 1,
        email: 'test@example.com',
        roles: 'admin', // Ошибка: должна быть массивом
      } as unknown as JwtPayload;

      const context = createMockContext(userWithInvalidRoles);

      const result = guard.canActivate(context);

      expect(result).toBe(false); // Доступ запрещен
    });

    // Тест 5: Пользователь имеет требуемую роль - доступ разрешен
    it('should return true when user has required role (single role)', () => {
      const requiredRoles: UserRole[] = [UserRole.ADMIN];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

      // Пользователь с ролью ADMIN
      const user: JwtPayload = {
        sub: 1,
        email: 'admin@example.com',
        roles: [UserRole.ADMIN, UserRole.USER], // Есть требуемая роль
      };

      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(true); // Доступ разрешен
    });

    // Тест 6: Пользователь имеет одну из требуемых ролей - доступ разрешен
    it('should return true when user has required role (multiple roles)', () => {
      const requiredRoles: UserRole[] = [UserRole.ADMIN, UserRole.USER];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

      // Пользователь с ролью USER (есть в требуемых)
      const user: JwtPayload = {
        sub: 1,
        email: 'user@example.com',
        roles: [UserRole.USER],
      };

      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(true); // Доступ разрешен
    });

    // Тест 7: Пользователь не имеет требуемой роли - доступ запрещен
    it('should return false when user does not have required role', () => {
      const requiredRoles: UserRole[] = [UserRole.ADMIN];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

      // Пользователь только с USER ролью
      const user: JwtPayload = {
        sub: 1,
        email: 'user@example.com',
        roles: [UserRole.USER], // Нет ADMIN роли
      };

      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(false); // Доступ запрещен
    });

    // Тест 8: Пустой массив ролей у пользователя - доступ запрещен
    it('should return false when user has empty roles array', () => {
      const requiredRoles: UserRole[] = [UserRole.ADMIN];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

      // Пользователь без ролей
      const user: JwtPayload = {
        sub: 1,
        email: 'user@example.com',
        roles: [], // Пустой массив ролей
      };

      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(false); // Доступ запрещен
    });

    // Тест 9: Частичное совпадение ролей - доступ разрешен
    it('should handle multiple required roles with partial match', () => {
      const requiredRoles: UserRole[] = [UserRole.ADMIN, UserRole.USER];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

      // Пользователь имеет только ADMIN из требуемых
      const user: JwtPayload = {
        sub: 1,
        email: 'admin@example.com',
        roles: [UserRole.ADMIN], // Есть ADMIN, нет USER
      };

      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(true); // Доступ разрешен (достаточно одной роли)
    });

    // Тест 10: JWT с дополнительными полями - корректная обработка
    it('should handle case with JWT payload including iat and exp', () => {
      const requiredRoles: UserRole[] = [UserRole.USER];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

      // Пользователь с полным JWT payload
      const user: JwtPayload = {
        sub: 1,
        email: 'user@example.com',
        roles: [UserRole.USER],
        iat: 1234567890, // Время выпуска токена
        exp: 1234567999, // Время истечения токена
      };

      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(true); // Доступ разрешен
    });
  });

  // Тестируем граничные случаи
  describe('edge cases', () => {
    // Тест 11: Роли пользователя undefined - доступ запрещен
    it('should handle undefined user roles', () => {
      const requiredRoles: UserRole[] = [UserRole.ADMIN];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

      // Пользователь без поля roles
      const user = {
        sub: 1,
        email: 'user@example.com',
        // roles is undefined
      } as unknown as JwtPayload;

      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(false); // Доступ запрещен
    });

    // Тест 12: Роли пользователя null - доступ запрещен
    it('should handle null user roles', () => {
      const requiredRoles: UserRole[] = [UserRole.ADMIN];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

      // Пользователь с roles = null
      const user = {
        sub: 1,
        email: 'user@example.com',
        roles: null,
      } as unknown as JwtPayload;

      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(false); // Доступ запрещен
    });

    // Тест 13: Роли пользователя - строка - доступ запрещен
    it('should handle non-array user roles', () => {
      const requiredRoles: UserRole[] = [UserRole.ADMIN];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

      // Роли в виде строки вместо массива
      const user = {
        sub: 1,
        email: 'user@example.com',
        roles: 'admin', // Неправильный формат
      } as unknown as JwtPayload;

      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(false); // Доступ запрещен
    });

    // Тест 14: Роли пользователя - объект - доступ запрещен
    it('should handle object user roles', () => {
      const requiredRoles: UserRole[] = [UserRole.ADMIN];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

      // Роли в виде объекта вместо массива
      const user = {
        sub: 1,
        email: 'user@example.com',
        roles: { role: 'admin' }, // Неправильный формат
      } as unknown as JwtPayload;

      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(false); // Доступ запрещен
    });
  });

  // Тестируем различные комбинации ролей
  describe('role combinations', () => {
    // Тест 15: Требуется ADMIN, пользователь имеет ADMIN и USER - доступ разрешен
    it('should allow ADMIN when required [ADMIN] and user has [ADMIN, USER]', () => {
      const requiredRoles: UserRole[] = [UserRole.ADMIN];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

      const user: JwtPayload = {
        sub: 1,
        email: 'admin@example.com',
        roles: [UserRole.ADMIN, UserRole.USER], // Есть требуемая роль
      };

      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(true); // Доступ разрешен
    });

    // Тест 16: Требуется USER, пользователь имеет USER - доступ разрешен
    it('should allow USER when required [USER] and user has [USER]', () => {
      const requiredRoles: UserRole[] = [UserRole.USER];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

      const user: JwtPayload = {
        sub: 1,
        email: 'user@example.com',
        roles: [UserRole.USER], // Есть требуемая роль
      };

      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(true); // Доступ разрешен
    });

    // Тест 17: Требуется ADMIN, пользователь имеет только USER - доступ запрещен
    it('should deny when required [ADMIN] and user has only [USER]', () => {
      const requiredRoles: UserRole[] = [UserRole.ADMIN];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

      const user: JwtPayload = {
        sub: 1,
        email: 'user@example.com',
        roles: [UserRole.USER], // Нет требуемой роли
      };

      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(false); // Доступ запрещен
    });

    // Тест 18: Требуются [ADMIN, USER], пользователь имеет ADMIN - доступ разрешен
    it('should allow when required [ADMIN, USER] and user has [ADMIN]', () => {
      const requiredRoles: UserRole[] = [UserRole.ADMIN, UserRole.USER];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

      const user: JwtPayload = {
        sub: 1,
        email: 'admin@example.com',
        roles: [UserRole.ADMIN], // Есть одна из требуемых ролей
      };

      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(true); // Доступ разрешен
    });

    // Тест 19: Требуются [ADMIN, USER], пользователь имеет USER - доступ разрешен
    it('should allow when required [ADMIN, USER] and user has [USER]', () => {
      const requiredRoles: UserRole[] = [UserRole.ADMIN, UserRole.USER];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

      const user: JwtPayload = {
        sub: 1,
        email: 'user@example.com',
        roles: [UserRole.USER], // Есть одна из требуемых ролей
      };

      const context = createMockContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(true); // Доступ разрешен
    });
  });
});
