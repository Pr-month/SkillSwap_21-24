import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from './ws-jwt.guard';
import { configuration } from '../../config/configuration';
import { AppConfigType } from '../../config/config.type';
import { AuthenticatedSocket, JwtPayload } from '../notification.types';

describe('WsJwtGuard', () => {
  let guard: WsJwtGuard;
  let jwtService: { verifyAsync: jest.Mock };

  const configMock: AppConfigType = {
    port: 3000,
    jwt: {
      jwtSecret: 'test-secret',
      jwtRefreshSecret: 'refresh-secret',
      accessExpiresIn: '1h',
      refreshExpiresIn: '7d',
    },

    db: {} as unknown as AppConfigType['db'],
  } as unknown as AppConfigType;

  beforeEach(async () => {
    jwtService = {
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WsJwtGuard,
        { provide: configuration.KEY, useValue: configMock },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    guard = module.get(WsJwtGuard);
  });

  const createClient = (token?: string) => {
    const client: Partial<AuthenticatedSocket> = {
      handshake: {
        query: token ? { token } : {},
      } as unknown as AuthenticatedSocket['handshake'],
    };
    return client as AuthenticatedSocket;
  };

  it('should verify token and attach user to client', async () => {
    const client = createClient('valid-token');
    const payload: JwtPayload = {
      sub: 123,
      email: 'user@example.com',
      roles: [],
    };
    jwtService.verifyAsync.mockResolvedValue(payload);

    const result = await guard.verifyToken(client);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
      secret: configMock.jwt.jwtSecret,
    });
    expect(client.user).toEqual(payload);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when token is not provided', async () => {
    const client = createClient();

    await expect(guard.verifyToken(client)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.verifyToken(client)).rejects.toThrow(
      'Token not provided',
    );
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when payload is invalid (null/undefined)', async () => {
    const client = createClient('invalid-token');
    jwtService.verifyAsync.mockResolvedValue(undefined);

    await expect(guard.verifyToken(client)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.verifyToken(client)).rejects.toThrow('Authentication failed');
  });

  it('should propagate error when jwtService.verifyAsync throws', async () => {
    const client = createClient('expired-token');
    const err = new Error('jwt expired');
    jwtService.verifyAsync.mockRejectedValue(err);

    await expect(guard.verifyToken(client)).rejects.toThrow(UnauthorizedException);
  });
});
