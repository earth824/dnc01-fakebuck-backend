import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { User } from 'src/database/generated/prisma/client';
import { PrismaClientKnownRequestError } from 'src/database/generated/prisma/internal/prismaNamespace';
import { PrismaService } from 'src/database/prisma.service';
import { FriendService } from 'src/friend/services/friend.service';
import { RelationshipStatus } from 'src/friend/types/friend.type';
import { BcryptService } from 'src/shared/security/services/bcrypt.service';
import { CloudinaryService } from 'src/shared/upload/cloudinary.service';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';
import { UpdateUserDto } from 'src/user/dtos/update-user.dto';
import { UserWithoutPassword } from 'src/user/types/user.type';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptService: BcryptService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly friendService: FriendService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.bcryptService.hash(
      createUserDto.password
    );

    try {
      const user = await this.prisma.user.create({
        data: { ...createUserDto, password: hashedPassword }
      });
      return user;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          message: `Email: ${createUserDto.email} is already in use`,
          code: 'EMAIL_ALREADY_EXISTS'
        });
      }

      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: { password: true }
    });
    if (!user)
      throw new NotFoundException({
        message: 'User with provided id not found',
        code: 'USER_NOT_FOUND'
      });

    return user;
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File
  ): Promise<string> {
    const result = await this.cloudinaryService.upload(file);
    await this.update(userId, { avatarUrl: result.secure_url });

    return result.secure_url;
  }

  async uploadCover(
    userId: string,
    file: Express.Multer.File
  ): Promise<string> {
    const result = await this.cloudinaryService.upload(file);
    await this.update(userId, { coverUrl: result.secure_url });

    return result.secure_url;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<UserWithoutPassword> {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      omit: { password: true }
    });
  }

  async findByIdWithRelationToCurrentUser(
    userId: string,
    currentUserId: string
  ): Promise<{
    user: UserWithoutPassword & { friends: UserWithoutPassword[] };
    relationshipStatus: RelationshipStatus;
  }> {
    const result = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        usersA: {
          where: {
            status: 'ACCEPTED'
          },
          include: {
            userB: {
              omit: {
                password: true
              }
            }
          }
        }
      },
      omit: {
        password: true
      }
    });

    if (!result) {
      throw Error('');
    }

    const relationshipStatus =
      await this.friendService.findRelationshipBetweenTwoUser(
        userId,
        currentUserId
      );

    const { usersA, ...user } = result;

    return {
      user: { ...user, friends: usersA.map((el) => el.userB) },
      relationshipStatus
    };
  }

  async findAll(search: string = ''): Promise<UserWithoutPassword[]> {
    return this.prisma.user.findMany({
      where: {
        OR: [
          {
            firstName: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            lastName: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      },
      omit: {
        password: true
      }
    });
  }
}
