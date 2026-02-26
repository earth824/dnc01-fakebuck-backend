import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { ResponseMessage } from 'src/common/decorators/message-response.decorator';
import { RecipientIdDto } from 'src/friend/dtos/recipient-id.dto';
import { FriendRequestService } from 'src/friend/services/friend-request.service';

@Controller('friends/requests')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @ResponseMessage('Request has been sent')
  @Post()
  async sendRequest(
    @Body() recipientIdDto: RecipientIdDto,
    @CurrentUser() user: JwtPayload
  ): Promise<void> {
    await this.friendRequestService.sendRequest(
      user.sub,
      recipientIdDto.recipientId
    );
  }
}
