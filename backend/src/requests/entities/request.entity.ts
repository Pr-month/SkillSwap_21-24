import { RequestStatus } from "../../common/constants";
import { SkillEntity } from "../../skills/entities/skills.entity";
import { UserEntity } from "../../users/entities/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity('requests')
export class RequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.sentRequests)
  @JoinColumn({ name: 'sender_id' })
  sender: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.receivedRequests)
  @JoinColumn({ name: 'receiver_id' })
  receiver: UserEntity;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @ManyToOne(() => SkillEntity, (skill) => skill.offeredRequests)
  @JoinColumn({ name: 'offered_skill_id' })
  offeredSkill: SkillEntity;

  @ManyToOne(() => SkillEntity, (skill) => skill.requestedRequests)
  @JoinColumn({ name: 'requested_skill_id' })
  requestedSkill: SkillEntity;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;
}
