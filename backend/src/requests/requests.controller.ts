import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDTO } from './dto/create-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReqWithUser } from '../auth/auth.types';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/enums';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async sendRequest(@Body() data: CreateRequestDTO, @Req() req: ReqWithUser) {
    const { sub: currentUserId } = req.user;

    return await this.requestsService.createRequest(data, currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('incoming')
  async incomingRequests(@Req() req: ReqWithUser) {
    const { sub: receiverId } = req.user;

    return await this.requestsService.getIncomingRequests(receiverId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('outgoing')
  async outgoingRequests(@Req() req: ReqWithUser) {
    const { sub: senderId } = req.user;

    return this.requestsService.getOutgoingRequests(senderId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Delete(':id')
  async deleteRequest(@Param('id') id: string, @Req() req: ReqWithUser) {
    const { sub: currentUserId, roles: currentUserRoles } = req.user;

    return this.requestsService.deleteRequest(
      id,
      currentUserId,
      currentUserRoles,
    );
  }
}
