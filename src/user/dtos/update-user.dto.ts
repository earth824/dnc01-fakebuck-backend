import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email'])
) {}
