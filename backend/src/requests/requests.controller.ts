import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { CreateRequestDTO } from './dto/create-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReqWithUser } from '../auth/auth.types';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/enums';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequestEntity } from './entities/request.entity';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создание новой заявки' })
  @ApiCreatedResponse({
    description: 'Успешная отправка заявки',
    type: RequestEntity,
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  @ApiConflictResponse({ description: 'Такая заявка уже существует' })
  @ApiNotFoundResponse({
    description: 'Невозможно найти указанный объект (пользователь/свойство)',
  })
  @ApiBadRequestResponse({ description: 'Некорректные данные запроса' })
  @ApiInternalServerErrorResponse({
    description: 'Возникла внутренняя ошибка сервера',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  async sendRequest(@Body() data: CreateRequestDTO, @Req() req: ReqWithUser) {
    const { sub: currentUserId } = req.user;

    return await this.requestsService.createRequest(data, currentUserId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение списка входящих заявок' })
  @ApiOkResponse({
    description:
      'Список полученных заявок, отсортированных по датам создания (по убыванию)',
    type: RequestEntity,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  @ApiNoContentResponse({ description: 'Нет активных заявок' })
  @ApiInternalServerErrorResponse({
    description: 'Возникла внутренняя ошибка сервера',
  })
  @UseGuards(JwtAuthGuard)
  @Get('incoming')
  async incomingRequests(@Req() req: ReqWithUser) {
    const { sub: receiverId } = req.user;

    return await this.requestsService.getIncomingRequests(receiverId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение списка исходящих заявок' })
  @ApiOkResponse({
    description:
      'Список отправленных заявок, отсортированный по дате создания (по убыванию)',
    type: RequestEntity,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  @ApiNoContentResponse({ description: 'У пользователя нет исходящих заявок' })
  @ApiInternalServerErrorResponse({
    description: 'Возникла внутренняя ошибка сервера',
  })
  @UseGuards(JwtAuthGuard)
  @Get('outgoing')
  async outgoingRequests(@Req() req: ReqWithUser) {
    const { sub: senderId } = req.user;

    return this.requestsService.getOutgoingRequests(senderId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Прочитать заявку' })
  @ApiOkResponse({
    description:
      'Заявка успешно отмечена как прочитанная. Флаг `isRead` установлен в значение `true`',
    type: RequestEntity,
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  @ApiForbiddenResponse({
    description:
      'Доступ запрещен. Пользователь не является участником указанной заявки и не обладает правами администратора',
  })
  @ApiNotFoundResponse({ description: 'Запрашиваемая заявка не найдена' })
  @ApiInternalServerErrorResponse({
    description: 'Возникла внутренняя ошибка сервера',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Patch(':id/read')
  async markAsReadRequest(@Param('id') id: number, @Req() req: ReqWithUser) {
    const { sub: currentUserId, roles: currentUserRoles } = req.user;

    return await this.requestsService.markAsReadRequest(
      id,
      currentUserId,
      currentUserRoles,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Принять заявку' })
  @ApiOkResponse({
    description:
      'Заявка успешно принята. Статус обновлён на ACCEPTED, и соответствующие навыки переданы владельцу',
    type: RequestEntity,
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  @ApiForbiddenResponse({
    description:
      'Только получатель заявки или администратор имеют право принять заявку',
  })
  @ApiNotFoundResponse({ description: 'Запрашиваемая заявка не найдена' })
  @ApiInternalServerErrorResponse({
    description: 'Возникла внутренняя ошибка сервера',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Patch(':id/accept')
  async acceptRequest(@Param('id') id: number, @Req() req: ReqWithUser) {
    const { sub: currentUserId, roles: currentUserRoles } = req.user;

    return await this.requestsService.acceptRequest(
      id,
      currentUserId,
      currentUserRoles,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отклонить заявку' })
  @ApiOkResponse({
    description: 'Заявка успешно отклонена. Cтатус обновлён на REJECTED',
    type: RequestEntity,
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  @ApiForbiddenResponse({
    description:
      'Только получатель заявки или администратор могут отклонить заявку',
  })
  @ApiNotFoundResponse({ description: 'Запрашиваемая заявка не найдена' })
  @ApiInternalServerErrorResponse({
    description: 'Возникла внутренняя ошибка сервера',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Patch(':id/reject')
  async rejectRequest(@Param('id') id: number, @Req() req: ReqWithUser) {
    const { sub: currentUserId, roles: currentUserRoles } = req.user;

    return await this.requestsService.rejectRequest(
      id,
      currentUserId,
      currentUserRoles,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить заявку' })
  @ApiNoContentResponse({
    description: 'Заявка успешно удалена из системы. Ресурс больше не доступен',
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  @ApiForbiddenResponse({
    description:
      'Только отправитель заявки или администратор могут удалить заявку',
  })
  @ApiNotFoundResponse({ description: 'Запрашиваемая заявка не найдена' })
  @ApiInternalServerErrorResponse({
    description: 'Возникла внутренняя ошибка сервера',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Delete(':id')
  async deleteRequest(@Param('id') id: number, @Req() req: ReqWithUser) {
    const { sub: currentUserId, roles: currentUserRoles } = req.user;

    return this.requestsService.deleteRequest(
      id,
      currentUserId,
      currentUserRoles,
    );
  }
}
