import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { AuthenticatedSocket } from './notification.types';
import { Server } from 'socket.io';
import { RequestStatus } from '../common/constants';
import { SkillEntity } from '../skills/entities/skills.entity';
import { JwtService } from '@nestjs/jwt';
import { configuration } from '../config/configuration';
import { AppConfigType } from '../config/config.type';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let jwtGuard: { verifyToken: jest.Mock };

  const createClient = (token?: string, withUser = true) => {
    const client: Partial<AuthenticatedSocket> = {
      handshake: {
        query: token ? { token } : {},
      } as unknown as AuthenticatedSocket['handshake'],
      join: jest.fn(),
      disconnect: jest.fn(),
      user: withUser
        ? ({
            sub: 42,
            email: 'u@example.com',
            roles: [],
          } as AuthenticatedSocket['user'])
        : undefined,
    };
    return client as AuthenticatedSocket;
  };

  beforeEach(async () => {
    jwtGuard = {
      verifyToken: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: WsJwtGuard, useValue: jwtGuard },
        {
          provide: configuration.KEY,
          useValue: { jwt: { jwtSecret: 'test' } } as unknown as AppConfigType,
        },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);

    // mock socket.io Server with strong types
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

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('verifies token and joins user room when user is present', async () => {
      const client = createClient('token', true);

      const joinSpy = jest.spyOn(client, 'join');
      const disconnectSpy = jest.spyOn(client, 'disconnect');

      await gateway.handleConnection(client);

      expect(jwtGuard.verifyToken).toHaveBeenCalledWith(client);
      expect(joinSpy).toHaveBeenCalledWith('42');
      expect(disconnectSpy).not.toHaveBeenCalled();
    });

    it('disconnects if user is missing after verification', async () => {
      const client = createClient('token', false);

      const joinSpy = jest.spyOn(client, 'join');
      const disconnectSpy = jest.spyOn(client, 'disconnect');

      await gateway.handleConnection(client);

      expect(jwtGuard.verifyToken).toHaveBeenCalledWith(client);
      expect(disconnectSpy).toHaveBeenCalledWith(true);
      expect(joinSpy).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('verifies token and disconnects', async () => {
      const client = createClient('token', true);

      const disconnectSpy = jest.spyOn(client, 'disconnect');

      await gateway.handleDisconnect(client);

      expect(jwtGuard.verifyToken).toHaveBeenCalledWith(client);
      expect(disconnectSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('notify methods', () => {
    it('notifyUser emits to user room', () => {
      const serverObj = (gateway as unknown as { server: Server })
        .server as unknown as {
        to: jest.Mock;
      };
      const roomEmitter = { emit: jest.fn() } as { emit: jest.Mock };
      serverObj.to.mockReturnValue(roomEmitter);

      const payload = {
        type: RequestStatus.PENDING,
        skill: { id: 1 } as SkillEntity,
        fromUser: 7,
      };
      gateway.notifyUser(13, payload);

      expect(serverObj.to).toHaveBeenCalledWith('13');

      const returnedEmitter = serverObj.to.mock.results[0].value as {
        emit: jest.Mock;
      };
      expect(returnedEmitter.emit).toHaveBeenCalledWith(
        'notificateNewRequest',
        payload,
      );
    });

    it('notifyNewRequest delegates to notifyUser with PENDING', () => {
      const spy = jest.spyOn(gateway, 'notifyUser');
      const skill = { id: 2 } as SkillEntity;
      gateway.notifyNewRequest(5, skill, 9);
      expect(spy).toHaveBeenCalledWith(5, {
        type: RequestStatus.PENDING,
        skill,
        fromUser: 9,
      });
    });

    it('notifyRequestRejected delegates to notifyUser with REJECTED', () => {
      const spy = jest.spyOn(gateway, 'notifyUser');
      const skill = { id: 3 } as SkillEntity;
      gateway.notifyRequestRejected(6, skill, 10);
      expect(spy).toHaveBeenCalledWith(6, {
        type: RequestStatus.REJECTED,
        skill,
        fromUser: 10,
      });
    });

    it('notifyRequestAccepted delegates to notifyUser with ACCEPTED', () => {
      const spy = jest.spyOn(gateway, 'notifyUser');
      const skill = { id: 4 } as SkillEntity;
      gateway.notifyRequestAccepted(7, skill, 11);
      expect(spy).toHaveBeenCalledWith(7, {
        type: RequestStatus.ACCEPTED,
        skill,
        fromUser: 11,
      });
    });
  });
});
