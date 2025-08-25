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
import { RequestStatus } from 'src/common/constants';
import { SkillEntity } from 'src/skills/entities/skills.entity';

@WebSocketGateway({ cors: true })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  @UseGuards(WsJwtGuard)
  async handleConnection(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.user) {
      client.disconnect(true);
      return;
    }

    const userId = client.user.sub;
    await client.join(userId.toString());
  }

  handleDisconnect(client: AuthenticatedSocket) {
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
