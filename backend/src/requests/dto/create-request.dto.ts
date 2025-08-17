import { IsNumber } from 'class-validator';

export class CreateRequestDTO {
  @IsNumber()
  offeredSkillId: number;

  @IsNumber()
  requestedSkillId: number;
}
