import { Injectable } from '@nestjs/common';
import { User } from 'src/database/generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    // hash password
    const hashedPassword = 'xxx';
    return this.prisma.user.create({
      data: { ...createUserDto, password: hashedPassword }
    });
  }
}
