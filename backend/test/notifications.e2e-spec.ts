import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NotificationsGateway } from '../src/notifications/notifications.gateway';
import { WsJwtGuard } from '../src/notifications/guards/ws-jwt.guard';
import { AuthenticatedSocket } from '../src/notifications/notification.types';
import { Server } from 'socket.io';
import { RequestStatus } from '../src/common/constants';
import { SkillEntity } from '../src/skills/entities/skills.entity';
import { configuration } from '../src/config/configuration';
import { AppConfigType } from '../src/config/config.type';
import { JwtService } from '@nestjs/jwt';

describe('Notifications (e2e)', () => {
  let app: INestApplication;
  let gateway: NotificationsGateway;
  const jwtGuardMock: { verifyToken: jest.Mock } = {
    verifyToken: jest.fn().mockResolvedValue(true),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: WsJwtGuard, useValue: jwtGuardMock },
        {
          provide: configuration.KEY,
          useValue: { jwt: { jwtSecret: 'test' } } as unknown as AppConfigType,
        },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    gateway = app.get(NotificationsGateway);

    // Подменяем socket.io сервер типобезопасным мок-объектом
    type RoomEmitter = { emit: jest.Mock };
    type ServerMock = Pick<Server, 'to'> & {
      to: jest.Mock<RoomEmitter, [room: string]>;
    };
    const roomEmitter: RoomEmitter = { emit: jest.fn() };
    const serverMock: ServerMock = {
      to: jest.fn().mockReturnValue(roomEmitter),
    } as unknown as ServerMock;
    (gateway as unknown as { server: Server }).server =
      serverMock as unknown as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  const createClient = (token?: string, withUser = true) => {
    const client: Partial<AuthenticatedSocket> = {
      handshake: {
        query: token ? { token } : {},
      } as unknown as AuthenticatedSocket['handshake'],
      user: withUser
        ? ({
            sub: 77,
            email: 'e2e@example.com',
            roles: [],
          } as AuthenticatedSocket['user'])
        : undefined,
      join: jest.fn(),
      disconnect: jest.fn(),
    };
    return client as AuthenticatedSocket;
  };

  it('handleConnection joins user room on valid token', async () => {
    const client = createClient('token', true);

    const joinSpy = jest.spyOn(client, 'join');
    const disconnectSpy = jest.spyOn(client, 'disconnect');

    await gateway.handleConnection(client);

    expect(jwtGuardMock.verifyToken).toHaveBeenCalledWith(client);
    expect(joinSpy).toHaveBeenCalledWith('77');
    expect(disconnectSpy).not.toHaveBeenCalled();
  });

  it('handleConnection disconnects when user missing', async () => {
    const client = createClient('token', false);

    const joinSpy = jest.spyOn(client, 'join');
    const disconnectSpy = jest.spyOn(client, 'disconnect');

    await gateway.handleConnection(client);

    expect(jwtGuardMock.verifyToken).toHaveBeenCalledWith(client);
    expect(disconnectSpy).toHaveBeenCalledWith(true);
    expect(joinSpy).not.toHaveBeenCalled();
  });

  it('notifyUser emits to user room with correct payload', () => {
    const serverObj = (gateway as unknown as { server: Server })
      .server as unknown as {
      to: jest.Mock;
    };

    const payload = {
      type: RequestStatus.PENDING,
      skill: { id: 123 } as SkillEntity,
      fromUser: 999,
    };

    // Захватываем emitter, который вернёт server.to(room)
    const roomEmitter = { emit: jest.fn() } as { emit: jest.Mock };
    serverObj.to.mockReturnValue(roomEmitter);

    gateway.notifyUser(77, payload);

    expect(serverObj.to).toHaveBeenCalledWith('77');
    expect(roomEmitter.emit).toHaveBeenCalledWith(
      'notificateNewRequest',
      payload,
    );
  });
});
