import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RecipientIdDto {
  @ApiProperty()
  @IsUUID('4', { message: 'Recipient id must be a valid UUID' })
  @IsString({ message: 'Recipient id must be a string' })
  @IsNotEmpty({ message: 'Recipient id is required' })
  recipientId: string;
}
