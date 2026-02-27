import { Controller, Delete, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { ResponseMessage } from 'src/common/decorators/message-response.decorator';
import { FriendService } from 'src/friend/services/friend.service';
import { UserWithoutPassword } from 'src/user/types/user.type';

@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get()
  async findFriends(
    @CurrentUser() user: JwtPayload
  ): Promise<UserWithoutPassword[]> {
    return this.friendService.findFriends(user.sub);
  }

  @ResponseMessage('Friend terminated')
  @Delete(':friendId')
  async unfriend(
    @CurrentUser() user: JwtPayload,
    @Param('friendId', ParseUUIDPipe) friendId: string
  ): Promise<void> {
    return await this.friendService.unfriend(user.sub, friendId);
  }
}
