import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from 'src/database/generated/prisma/internal/prismaNamespace';
import { PrismaService } from 'src/database/prisma.service';

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
}
