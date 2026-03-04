import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from 'src/user/dtos/user-reponse.dto';

export class LoginResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhOTcyYzNhZC0xMDE0LTQzYjQtODYzZi02ODQ2YTgzMDg4NDYiLCJlbWFpbCI6ImFAZ21haWwuY29tIiwiaWF0IjoxNzcyNjEzMjMyLCJleHAiOjE3NzI2MjQwMzJ9.k6xPykxFp8E_9M2pRgT8VEoPM1_CIaGt6ADCyro1g9k'
  })
  accessToken: string;

  @ApiProperty()
  user: UserResponseDto;
}
