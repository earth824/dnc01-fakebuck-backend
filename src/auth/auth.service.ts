import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from 'src/auth/dtos/login.dto';
import { RegisterDto } from 'src/auth/dtos/register.dto';
import { User } from 'src/database/generated/prisma/client';
import { BcryptService } from 'src/shared/security/services/bcrypt.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly bcryptService: BcryptService
  ) {}

  async register(registerDto: RegisterDto): Promise<void> {
    await this.userService.create(registerDto);
  }

  async login(
    loginDto: LoginDto
  ): Promise<{ accessToken: string; user: User }> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user)
      throw new UnauthorizedException({
        message: 'The provided email or password is incorrect',
        code: 'INVALID_CREDENTIALS'
      });

    const isMatch = await this.bcryptService.compare(
      loginDto.password,
      user.password
    );
    if (!isMatch)
      throw new UnauthorizedException({
        message: 'The provided email or password is incorrect',
        code: 'INVALID_CREDENTIALS'
      });

    // 3. Gen access token
    const accessToken = 'xxx';
    return { accessToken, user };
  }
}
