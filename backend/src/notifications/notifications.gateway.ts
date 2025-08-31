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

const NOTIFICATIONS_PORT = Number(process.env.PORT_NOTIFICATIONS) || 3001;

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
    await this.jwtGuard.verifyToken(client);
    if (!client.user) {
      client.disconnect(true);
      return;
    }
    const userId = client.user.sub;
    await client.join(userId.toString());
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    await this.jwtGuard.verifyToken(client);
    client.disconnect(true);
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
