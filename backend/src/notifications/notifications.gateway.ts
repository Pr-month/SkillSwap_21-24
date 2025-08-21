import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class NotificationsGateway {
  @SubscribeMessage('notification')
  handleSendNotification(client: any, payload: any): string {
    return 'Hello world!';
  }
}
