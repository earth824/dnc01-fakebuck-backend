import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from 'src/database/generated/prisma/internal/prismaNamespace';
import { PrismaService } from 'src/database/prisma.service';
import { UserWithoutPassword } from 'src/user/types/user.type';

@Injectable()
export class FriendRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async sendRequest(requesterId: string, recipientId: string): Promise<void> {
    if (requesterId === recipientId)
      throw new BadRequestException({
        message: 'You cannot send a friend request to yourself',
        code: 'CANNOT_REQUEST_SELF'
      });

    try {
      await this.prisma.friend.createMany({
        data: [
          { userAId: requesterId, userBId: recipientId, requesterId },
          { userAId: recipientId, userBId: requesterId, requesterId }
        ]
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            throw new ConflictException({
              message: 'These users already have relation',
              code: 'RELATION_ALREADY_EXISTS'
            });
          case 'P2003':
            throw new NotFoundException({
              message: 'The recipient user or requester user not found',
              code: 'USER_NOT_FOUND'
            });
        }
      }

      throw error;
    }
  }

  async cancelRequest(requesterId: string, recipientId: string): Promise<void> {
    const result = await this.prisma.friend.deleteMany({
      where: {
        status: 'PENDING',
        requesterId,
        OR: [
          {
            userAId: requesterId,
            userBId: recipientId
          },
          {
            userAId: recipientId,
            userBId: requesterId
          }
        ]
      }
    });
    if (result.count === 0)
      throw new NotFoundException({
        message: 'These user relation cannot be found',
        code: 'RELATION_NOT_FOUND'
      });
  }

  async acceptRequest(requesterId: string, recipientId: string): Promise<void> {
    const result = await this.prisma.friend.updateMany({
      data: { status: 'ACCEPTED' },
      where: {
        status: 'PENDING',
        requesterId,
        OR: [
          { userAId: requesterId, userBId: recipientId },
          { userAId: recipientId, userBId: requesterId }
        ]
      }
    });
    if (result.count === 0)
      throw new NotFoundException({
        message: 'These user relation cannot be found',
        code: 'RELATION_NOT_FOUND'
      });
  }

  async rejectRequest(requesterId: string, recipientId: string): Promise<void> {
    const result = await this.prisma.friend.deleteMany({
      where: {
        status: 'PENDING',
        requesterId,
        OR: [
          { userAId: requesterId, userBId: recipientId },
          { userAId: recipientId, userBId: requesterId }
        ]
      }
    });
    if (result.count === 0)
      throw new NotFoundException({
        message: 'These user relation cannot be found',
        code: 'RELATION_NOT_FOUND'
      });
  }

  async findIncomingRequest(
    currentUserId: string
  ): Promise<UserWithoutPassword[]> {
    const result = await this.prisma.friend.findMany({
      where: {
        status: 'PENDING',
        requesterId: {
          not: currentUserId
        },
        userAId: currentUserId
      },
      select: {
        requester: {
          omit: {
            password: true
          }
        }
      }
    });

    return result.map((el) => el.requester);
  }

  async findOutgoingRequest(
    currentUserId: string
  ): Promise<UserWithoutPassword[]> {
    const result = await this.prisma.friend.findMany({
      where: {
        status: 'PENDING',
        requesterId: currentUserId,
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
}
