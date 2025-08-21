import { JwtAuthGuard } from './jwt-auth.guard';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

// Создаем тестовый класс для доступа к protected методам
class TestJwtAuthGuard extends JwtAuthGuard {
  public testHandleRequest(
    err: unknown,
    user: unknown,
    info: unknown,
    context: ExecutionContext,
    status?: unknown,
  ): unknown {
    return this.handleRequest(err, user, info, context, status);
  }
}

// Интерфейс для мока пользователя
interface MockUser {
  id: number;
  email: string;
  roles?: string[];
}

const mockExecutionContext: ExecutionContext = {
  switchToHttp: jest.fn().mockReturnValue({
    getRequest: jest.fn(),
    getResponse: jest.fn(),
    getNext: jest.fn(),
  }),
  getClass: jest.fn(),
  getHandler: jest.fn(),
  getArgs: jest.fn(),
  getArgByIndex: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
  getType: jest.fn(),
} as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
  let guard: TestJwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestJwtAuthGuard],
    }).compile();

    guard = module.get<TestJwtAuthGuard>(TestJwtAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('handleRequest', () => {
    it('should return user when no error and user exists', () => {
      const mockUser: MockUser = { id: 1, email: 'test@example.com' };

      const result = guard.testHandleRequest(
        null,
        mockUser,
        null,
        mockExecutionContext,
      );

      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when no user', () => {
      expect(() => {
        guard.testHandleRequest(null, null, null, mockExecutionContext);
      }).toThrow(UnauthorizedException);
    });

    it('should throw the original error when error exists', () => {
      const testError = new Error('Test error');

      expect(() => {
        guard.testHandleRequest(testError, null, null, mockExecutionContext);
      }).toThrow(testError);
    });

    it('should throw UnauthorizedException for expired token info', () => {
      const expiredTokenInfo = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
        expiredAt: new Date('2023-01-01T00:00:00Z'),
      };

      expect(() => {
        guard.testHandleRequest(
          null,
          null,
          expiredTokenInfo,
          mockExecutionContext,
        );
      }).toThrow(UnauthorizedException);
    });
  });
});
