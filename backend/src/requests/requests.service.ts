import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateRequestDTO } from './dto/create-request.dto';
import { RequestEntity } from './entities/request.entity';
import { SkillEntity } from '../skills/entities/skills.entity';
import { UserEntity } from '../users/entities/user.entity';
import { RequestStatus } from '../common/constants';
import { UserRole } from '../users/enums';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(RequestEntity)
    private readonly requestRepository: Repository<RequestEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(SkillEntity)
    private readonly skillRepository: Repository<SkillEntity>,
  ) {}

  async createRequest(
    dto: CreateRequestDTO,
    currentUserId: number,
  ): Promise<RequestEntity> {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (!user) {
      throw new NotFoundException(
        `User with ID '${currentUserId}' does not exist`,
      );
    }

    const [offeredSkill, requestedSkill] = await Promise.all([
      this.skillRepository.findOneOrFail({
        where: { id: dto.offeredSkillId },
        relations: ['owner'],
      }),
      this.skillRepository.findOneOrFail({
        where: { id: dto.requestedSkillId },
        relations: ['owner'],
      }),
    ]);

    if (offeredSkill.owner.id !== currentUserId) {
      throw new ForbiddenException('You cannot offer someone else skill');
    }

    const existingRequest = await this.requestRepository.findOne({
      where: {
        sender: { id: currentUserId },
        receiver: requestedSkill.owner,
        offeredSkill: { id: dto.offeredSkillId },
        requestedSkill: { id: dto.requestedSkillId },
      },
    });

    if (existingRequest) {
      throw new ConflictException('A similar request already exists');
    }

    const newRequest = this.requestRepository.create({
      sender: user,
      receiver: requestedSkill.owner,
      offeredSkill,
      requestedSkill,
      status: RequestStatus.PENDING,
      isRead: false,
    });

    return await this.requestRepository.save(newRequest);
  }

  async getIncomingRequests(receiverId: number): Promise<RequestEntity[]> {
    return await this.requestRepository.find({
      where: {
        receiver: { id: receiverId },
        status: In([RequestStatus.PENDING, RequestStatus.IN_PROGRESS]),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getOutgoingRequests(senderId: number): Promise<RequestEntity[]> {
    return await this.requestRepository.find({
      where: {
        sender: { id: senderId },
        status: In([RequestStatus.PENDING, RequestStatus.IN_PROGRESS]),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async markAsReadRequest(
    id: number,
    currentUserId: number,
    currentUserRoles: UserRole[],
  ): Promise<RequestEntity> {
    const request = await this.requestRepository.findOne({ where: { id } });

    if (!request) {
      throw new NotFoundException(`Request ${id} not found`);
    }

    if (
      request.receiver.id !== currentUserId &&
      request.sender.id !== currentUserId &&
      !currentUserRoles.includes(UserRole.ADMIN)
    ) {
      throw new ForbiddenException('You are not allowed to read this request');
    }

    request.isRead = true;
    return await this.requestRepository.save(request);
  }

  async acceptRequest(
    id: number,
    currentUserId: number,
    currentUserRoles: UserRole[],
  ): Promise<RequestEntity> {
    const request = await this.requestRepository.findOne({ where: { id } });

    if (!request) {
      throw new NotFoundException(`Request ${id} not found`);
    }

    if (
      request.receiver.id !== currentUserId &&
      !currentUserRoles.includes(UserRole.ADMIN)
    ) {
      throw new ForbiddenException(
        'Only the receiver or an administrator can accept a request',
      );
    }

    return await this.requestRepository.manager.transaction(
      async (transactionalManager) => {
        const receiver = await transactionalManager.findOne(UserEntity, {
          where: { id: request.receiver.id },
          relations: ['skills'],
        });
        if (!receiver) {
          throw new NotFoundException(
            `Receiver user with ID ${request.receiver.id} not found`,
          );
        }

        const sender = await transactionalManager.findOne(UserEntity, {
          where: { id: request.sender.id },
          relations: ['skills'],
        });
        if (!sender) {
          throw new NotFoundException(
            `Sender user with ID ${request.sender.id} not found`,
          );
        }

        const requestedSkill = await transactionalManager.findOne(SkillEntity, {
          where: { id: request.requestedSkill.id },
        });
        if (!requestedSkill) {
          throw new NotFoundException(
            `Requested skill with ID ${request.requestedSkill.id} not found`,
          );
        }

        const offeredSkill = await transactionalManager.findOne(SkillEntity, {
          where: { id: request.offeredSkill.id },
        });
        if (!offeredSkill) {
          throw new NotFoundException(
            `Offered skill with ID ${request.offeredSkill.id} not found`,
          );
        }

        receiver.skills.push(requestedSkill);
        sender.skills.push(offeredSkill);

        await transactionalManager.save(receiver);
        await transactionalManager.save(sender);

        request.status = RequestStatus.ACCEPTED;
        await transactionalManager.save(request);

        return request;
      },
    );
  }

  async rejectRequest(
    id: number,
    currentUserId: number,
    currentUserRoles: UserRole[],
  ): Promise<RequestEntity> {
    const request = await this.requestRepository.findOne({ where: { id } });

    if (!request) {
      throw new NotFoundException(`Request ${id} not found`);
    }

    if (
      request.receiver.id !== currentUserId &&
      !currentUserRoles.includes(UserRole.ADMIN)
    ) {
      throw new ForbiddenException(
        'Only the receiver or an administrator can reject a request',
      );
    }

    request.status = RequestStatus.REJECTED;
    return await this.requestRepository.save(request);
  }

  async deleteRequest(
    id: number,
    currentUserId: number,
    currentUserRoles: UserRole[],
  ): Promise<void> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['sender'],
    });

    if (!request) {
      throw new NotFoundException(`Request ${id} not found`);
    }

    if (
      request.sender.id !== currentUserId &&
      !currentUserRoles.includes(UserRole.ADMIN)
    ) {
      throw new ForbiddenException(
        'Only admin or sender can delete this request',
      );
    }

    await this.requestRepository.remove(request);
  }
}
