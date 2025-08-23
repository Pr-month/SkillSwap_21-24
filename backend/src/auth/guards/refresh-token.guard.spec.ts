import { RefreshTokenGuard } from './refresh-token.guard';
import { UnauthorizedException } from '@nestjs/common';

// Создаем тестовый класс
class TestableRefreshTokenGuard extends RefreshTokenGuard {
  public testHandleRequest<TUser>(err: unknown, user: TUser): TUser {
    return super.handleRequest(err, user);
  }
}

describe('RefreshTokenGuard', () => {
  let guard: TestableRefreshTokenGuard;

  beforeEach(() => {
    guard = new TestableRefreshTokenGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('handleRequest method', () => {
    interface RefreshUser {
      userId: number;
      email: string;
      refreshToken: string;
      roles: string[];
    }

    it('should return user when valid user is provided', () => {
      const mockUser: RefreshUser = {
        userId: 1,
        email: 'user@example.com',
        refreshToken: 'valid-refresh-token',
        roles: ['user'],
      };

      const result = guard.testHandleRequest(null, mockUser);

      expect(result).toEqual(mockUser);
      expect(result.userId).toBe(1);
      expect(result.email).toBe('user@example.com');
      expect(result.refreshToken).toBe('valid-refresh-token');
    });

    it('should throw UnauthorizedException when user is null', () => {
      expect(() => {
        guard.testHandleRequest(null, null);
      }).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is undefined', () => {
      expect(() => {
        guard.testHandleRequest(null, undefined);
      }).toThrow(UnauthorizedException);
    });

    it('should throw original error when error is provided', () => {
      const customError = new Error('Token has been revoked');
      const mockUser: RefreshUser = {
        userId: 1,
        email: 'user@example.com',
        refreshToken: 'refresh-token',
        roles: ['user'],
      };

      expect(() => {
        guard.testHandleRequest(customError, mockUser);
      }).toThrow(customError);
    });

    it('should throw original UnauthorizedException when provided', () => {
      const customUnauthorizedError = new UnauthorizedException(
        'Custom unauthorized message',
      );

      expect(() => {
        guard.testHandleRequest(customUnauthorizedError, null);
      }).toThrow(customUnauthorizedError);
    });

    it('should prioritize error over user when both are provided', () => {
      const mockUser: RefreshUser = {
        userId: 1,
        email: 'user@example.com',
        refreshToken: 'refresh-token',
        roles: ['user'],
      };

      const tokenError = new Error('Token malformed');

      expect(() => {
        guard.testHandleRequest(tokenError, mockUser);
      }).toThrow(tokenError);
    });

    it('should return user when no error and user exists', () => {
      const mockUser: RefreshUser = {
        userId: 1,
        email: 'user@example.com',
        refreshToken: 'refresh-token',
        roles: ['user'],
      };

      const result = guard.testHandleRequest(null, mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  // Тесты для проверки содержимого ошибки
  describe('error content validation', () => {
    it('should have correct error message for invalid refresh token', () => {
      try {
        guard.testHandleRequest(null, null);
        throw new Error('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should preserve original error instance', () => {
      const specificError = new Error('Specific token validation error');

      try {
        guard.testHandleRequest(specificError, null);
        throw new Error('Expected error to be thrown');
      } catch (error) {
        expect(error).toBe(specificError);
      }
    });
  });
});
