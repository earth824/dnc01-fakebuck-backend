import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UserWithoutPassword } from 'src/user/types/user.type';

@Injectable()
export class FriendService {
  constructor(private readonly prisma: PrismaService) {}

  async findFriends(currentUserId: string): Promise<UserWithoutPassword[]> {
    const result = await this.prisma.friend.findMany({
      where: {
        status: 'ACCEPTED',
        userAId: currentUserId
      },
      select: {
        userB: {
          omit: {
            password: true
          }
        }
      }
    });

    return result.map((el) => el.userB);
  }

  async unfriend(currentUserId: string, friendId: string): Promise<void> {
    const result = await this.prisma.friend.deleteMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { userAId: currentUserId, userBId: friendId },
          { userAId: friendId, userBId: currentUserId }
        ]
      }
    });

    if (result.count === 0) {
      throw new NotFoundException({
        message: 'These user have not become friend together',
        code: 'NOT_FRIEND'
      });
    }
  }
}
