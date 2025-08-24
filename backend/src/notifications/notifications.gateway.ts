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
    userId: string,
    payload: {
      type: string;
      skill: string;
      fromUser: string;
    },
  ) {
    this.server.to(userId).emit('notificateNewRequest', payload);
  }
}
