import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { ResponseMessage } from 'src/common/decorators/message-response.decorator';
import { RecipientIdDto } from 'src/friend/dtos/recipient-id.dto';
import { FriendRequestService } from 'src/friend/services/friend-request.service';
import { UserWithoutPassword } from 'src/user/types/user.type';

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

  @ResponseMessage('The request has been cancelled')
  @Delete(':recipientId')
  async cancelRequest(
    @Param() recipientIdDto: RecipientIdDto,
    @CurrentUser() user: JwtPayload
  ): Promise<void> {
    await this.friendRequestService.cancelRequest(
      user.sub,
      recipientIdDto.recipientId
    );
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('The request has been accepted')
  @Post(':requesterId/accept')
  async acceptRequest(
    @Param('requesterId', ParseUUIDPipe) requesterId: string,
    @CurrentUser() user: JwtPayload
  ) {
    await this.friendRequestService.acceptRequest(requesterId, user.sub);
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Request rejected successfully')
  @Post(':requesterId/reject')
  async rejectRequest(
    @Param('requesterId', ParseUUIDPipe) requesterId: string,
    @CurrentUser() user: JwtPayload
  ) {
    await this.friendRequestService.rejectRequest(requesterId, user.sub);
  }

  @Get('incoming')
  async findIncomingRequest(
    @CurrentUser() user: JwtPayload
  ): Promise<UserWithoutPassword[]> {
    return this.friendRequestService.findIncomingRequest(user.sub);
  }

  @Get('outgoing')
  async findOutgoingRequest(
    @CurrentUser() user: JwtPayload
  ): Promise<UserWithoutPassword[]> {
    return this.friendRequestService.findOutgoingRequest(user.sub);
  }
}
