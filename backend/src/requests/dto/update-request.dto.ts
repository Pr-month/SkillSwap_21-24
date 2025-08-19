import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestDTO } from './create-request.dto';

export class UpdateRequestDto extends PartialType(CreateRequestDTO) {}
