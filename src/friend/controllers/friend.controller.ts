import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
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
}
