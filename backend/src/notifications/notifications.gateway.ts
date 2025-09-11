import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { AuthenticatedSocket } from './notification.types';
import { RequestStatus } from '../common/constants';
import { SkillEntity } from '../skills/entities/skills.entity';
import { UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

const NOTIFICATIONS_PORT = Number(process.env.PORT_NOTIFICATIONS) || 4001;

@WebSocketGateway(NOTIFICATIONS_PORT, {
  cors: { origin: '*' },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly jwtGuard: WsJwtGuard) {}
  @WebSocketServer()
  server: Server;

  @UseGuards(WsJwtGuard)
  async handleConnection(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      await this.jwtGuard.verifyToken(client);
      if (!client.user) {
        client.disconnect(true);
        return;
      }
      const userId = client.user.sub;
      await client.join(userId.toString());
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      } else if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      } else {
        throw new UnauthorizedException('Authentication failed');
      }
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    try {
      await this.jwtGuard.verifyToken(client);
      client.disconnect(true);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      } else if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      } else {
        throw new UnauthorizedException('Authentication failed');
      }
    }
  }

  notifyUser(
    userId: number,
    payload: {
      type: RequestStatus;
      skill: SkillEntity;
      fromUser: number;
    },
  ) {
    this.server.to(userId.toString()).emit('notificateNewRequest', payload);
  }

  notifyNewRequest(skillOwnerId: number, skill: SkillEntity, fromUser: number) {
    this.notifyUser(skillOwnerId, {
      type: RequestStatus.PENDING,
      skill,
      fromUser,
    });
  }

  notifyRequestRejected(
    requestAuthorId: number,
    skill: SkillEntity,
    fromUser: number,
  ) {
    this.notifyUser(requestAuthorId, {
      type: RequestStatus.REJECTED,
      skill,
      fromUser,
    });
  }

  notifyRequestAccepted(
    requestAuthorId: number,
    skill: SkillEntity,
    fromUser: number,
  ) {
    this.notifyUser(requestAuthorId, {
      type: RequestStatus.ACCEPTED,
      skill,
      fromUser,
    });
  }
}
