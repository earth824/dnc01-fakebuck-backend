import { ConflictException, Injectable } from '@nestjs/common';
import { User } from 'src/database/generated/prisma/client';
import { PrismaClientKnownRequestError } from 'src/database/generated/prisma/internal/prismaNamespace';
import { PrismaService } from 'src/database/prisma.service';
import { BcryptService } from 'src/shared/security/services/bcrypt.service';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptService: BcryptService
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
}
